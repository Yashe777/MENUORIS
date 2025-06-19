import { 
  menuItems, 
  orders, 
  orderItems,
  type MenuItem, 
  type InsertMenuItem,
  type Order, 
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderWithItems(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Order Items
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<(OrderItem & { menuItem: MenuItem })[]>;
}

export class MemStorage implements IStorage {
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentMenuItemId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;

  constructor() {
    this.menuItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentMenuItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    
    // Initialize with sample menu items
    this.initializeMenuItems();
  }

  private initializeMenuItems() {
    const sampleItems: Omit<MenuItem, 'id'>[] = [
      {
        name: "Bruschetta Italiana",
        description: "Fresh tomatoes, basil, and garlic on toasted bread with olive oil",
        price: 8.99,
        category: "appetizers",
        image: "https://images.unsplash.com/photo-1572441713132-51c75654db73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      },
      {
        name: "Antipasto Platter",
        description: "Selection of cured meats, cheeses, olives, and vegetables",
        price: 14.99,
        category: "appetizers",
        image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      },
      {
        name: "Fettuccine Alfredo",
        description: "Rich and creamy pasta with parmesan cheese and butter",
        price: 16.99,
        category: "pasta",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      },
      {
        name: "Spaghetti Carbonara",
        description: "Traditional Roman pasta with eggs, pancetta, and pecorino cheese",
        price: 18.99,
        category: "pasta",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      },
      {
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella, tomatoes, and basil",
        price: 15.99,
        category: "pizza",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      },
      {
        name: "Pepperoni Pizza",
        description: "Classic pepperoni with mozzarella cheese on crispy crust",
        price: 17.99,
        category: "pizza",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      },
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
        price: 7.99,
        category: "desserts",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      },
      {
        name: "Cannoli",
        description: "Crispy pastry shells filled with sweet ricotta and chocolate chips",
        price: 6.99,
        category: "desserts",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      }
    ];

    sampleItems.forEach(item => {
      const menuItem: MenuItem = { ...item, id: this.currentMenuItemId++ };
      this.menuItems.set(menuItem.id, menuItem);
    });
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.category === category);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentMenuItemId++;
    const item: MenuItem = { ...insertItem, id };
    this.menuItems.set(id, item);
    return item;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderWithItems(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = await this.getOrderItems(id);
    return {
      ...order,
      orderItems: items
    };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status || "pending",
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const item: OrderItem = { ...insertItem, id };
    this.orderItems.set(id, item);
    return item;
  }

  async getOrderItems(orderId: number): Promise<(OrderItem & { menuItem: MenuItem })[]> {
    const items = Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
    
    return items.map(item => {
      const menuItem = this.menuItems.get(item.menuItemId);
      if (!menuItem) throw new Error(`Menu item not found: ${item.menuItemId}`);
      
      return {
        ...item,
        menuItem
      };
    });
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems);
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.category, category));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item || undefined;
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const [item] = await db
      .insert(menuItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderWithItems(id: number): Promise<OrderWithItems | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;

    const items = await this.getOrderItems(id);
    return {
      ...order,
      orderItems: items
    };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values({
        ...insertOrder,
        status: insertOrder.status || "pending"
      })
      .returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async getOrderItems(orderId: number): Promise<(OrderItem & { menuItem: MenuItem })[]> {
    const result = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        menuItemId: orderItems.menuItemId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        menuItem: menuItems
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, orderId));

    return result;
  }
}

// Initialize database with sample data
async function initializeDatabase() {
  try {
    // Check if menu items already exist
    const existingItems = await db.select().from(menuItems).limit(1);
    
    if (existingItems.length === 0) {
      console.log("Initializing database with sample menu items...");
      
      const sampleItems: InsertMenuItem[] = [
        {
          name: "Bruschetta Italiana",
          description: "Fresh tomatoes, basil, and garlic on toasted bread with olive oil",
          price: 8.99,
          category: "appetizers",
          image: "https://images.unsplash.com/photo-1572441713132-51c75654db73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        },
        {
          name: "Antipasto Platter",
          description: "Selection of cured meats, cheeses, olives, and vegetables",
          price: 14.99,
          category: "appetizers",
          image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        },
        {
          name: "Fettuccine Alfredo",
          description: "Rich and creamy pasta with parmesan cheese and butter",
          price: 16.99,
          category: "pasta",
          image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        },
        {
          name: "Spaghetti Carbonara",
          description: "Traditional Roman pasta with eggs, pancetta, and pecorino cheese",
          price: 18.99,
          category: "pasta",
          image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        },
        {
          name: "Margherita Pizza",
          description: "Classic pizza with fresh mozzarella, tomatoes, and basil",
          price: 15.99,
          category: "pizza",
          image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        },
        {
          name: "Pepperoni Pizza",
          description: "Classic pepperoni with mozzarella cheese on crispy crust",
          price: 17.99,
          category: "pizza",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        },
        {
          name: "Tiramisu",
          description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
          price: 7.99,
          category: "desserts",
          image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        },
        {
          name: "Cannoli",
          description: "Crispy pastry shells filled with sweet ricotta and chocolate chips",
          price: 6.99,
          category: "desserts",
          image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        }
      ];

      await db.insert(menuItems).values(sampleItems);
      console.log("Database initialized with sample menu items");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export const storage = new DatabaseStorage();

// Initialize the database when the module is loaded
initializeDatabase();
