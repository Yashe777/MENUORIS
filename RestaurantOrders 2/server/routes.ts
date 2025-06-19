import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);

        // Handle different message types
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast message to all connected clients
  const broadcast = (message: any) => {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  };

  // Menu Items API
  app.get("/api/menu-items", async (req, res) => {
    try {
      const category = req.query.category as string;
      const items = category 
        ? await storage.getMenuItemsByCategory(category)
        : await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getMenuItem(id);
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  // Orders API
  app.get("/api/orders", async (req, res) => {
    try {
      const status = req.query.status as string;
      const orders = status 
        ? await storage.getOrdersByStatus(status)
        : await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderWithItems(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const createOrderSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    items: z.array(z.object({
      id: z.number(),
      quantity: z.number().min(1),
      price: z.number().min(0)
    })).min(1, "At least one item is required")
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      
      // Calculate total
      const total = validatedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create order
      const order = await storage.createOrder({
        customerName: validatedData.customerName,
        items: JSON.stringify(validatedData.items),
        total,
        status: "pending"
      });

      // Create order items
      for (const item of validatedData.items) {
        await storage.createOrderItem({
          orderId: order.id,
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price
        });
      }

      // Get the complete order with items
      const completeOrder = await storage.getOrderWithItems(order.id);
      
      // Broadcast new order to all connected clients (dashboard)
      broadcast({
        type: 'new_order',
        order: completeOrder
      });

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error creating order:', error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "preparing", "ready", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Broadcast status update to all connected clients
      broadcast({
        type: 'order_status_update',
        orderId: id,
        status,
        order
      });

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Dashboard stats API
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const allOrders = await storage.getOrders();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayOrders = allOrders.filter(order => 
        new Date(order.createdAt) >= today
      );

      const stats = {
        totalOrders: todayOrders.length,
        pendingOrders: todayOrders.filter(o => o.status === 'pending').length,
        completedOrders: todayOrders.filter(o => o.status === 'completed').length,
        revenue: todayOrders.reduce((sum, order) => sum + order.total, 0)
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  return httpServer;
}
