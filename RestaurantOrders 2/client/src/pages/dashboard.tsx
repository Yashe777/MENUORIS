import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Order, type OrderWithItems } from "@shared/schema";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Bell,
  Settings,
  Pause,
  Download,
  BarChart3
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, lastMessage } = useWebSocket();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: pendingOrders = [] } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders', 'pending'],
    queryFn: async () => {
      const response = await fetch('/api/orders?status=pending');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const orders = await response.json();
      
      // Get order details for each order
      const detailedOrders = await Promise.all(
        orders.map(async (order: Order) => {
          const detailResponse = await fetch(`/api/orders/${order.id}`);
          return detailResponse.json();
        })
      );
      
      return detailedOrders;
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    }
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'new_order':
          toast({
            title: "New Order Received!",
            description: `Order #${lastMessage.order.id} from ${lastMessage.order.customerName}`,
          });
          queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
          queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
          break;
        
        case 'order_status_update':
          toast({
            title: "Order Status Updated",
            description: `Order #${lastMessage.orderId} is now ${lastMessage.status}`,
          });
          break;
      }
    }
  }, [lastMessage, toast, queryClient]);

  const handleStatusUpdate = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const orderTime = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} hours ago`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
              <div className="ml-4 flex items-center">
                <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-secondary-light animate-pulse' : 'bg-red-500'}`} />
                <span className="ml-2 text-sm text-gray-600">
                  {isConnected ? 'Live Orders' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-gray-700">
                  Today: ${stats?.revenue.toFixed(2) || '0.00'}
                </span>
              </div>
              <Button className="bg-primary hover:bg-primary-dark text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-pending" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingOrders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-ready" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.completedOrders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats?.revenue.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Orders Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 text-pending mr-2" />
                  Pending Orders
                  <span className="ml-2 bg-pending text-white text-xs px-2 py-1 rounded-full">
                    {pendingOrders.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending orders</p>
                  </div>
                ) : (
                  pendingOrders.map(order => (
                    <div key={order.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                          <p className="text-sm text-gray-500">{formatTime(order.createdAt.toString())}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</span>
                          <div className="flex space-x-2 mt-2">
                            <Button
                              size="sm"
                              className="bg-ready hover:bg-green-600 text-white"
                              onClick={() => handleStatusUpdate(order.id, 'preparing')}
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {order.orderItems.map(item => (
                            <li key={item.id}>
                              {item.quantity}x {item.menuItem.name} - ${(item.price * item.quantity).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Real-time Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 text-primary mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Show recent WebSocket messages */}
                  {lastMessage && (
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {lastMessage.type === 'new_order' && `New order #${lastMessage.order.id} received`}
                          {lastMessage.type === 'order_status_update' && `Order #${lastMessage.orderId} ${lastMessage.status}`}
                        </p>
                        <p className="text-xs text-gray-500">Just now</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Real-time activity will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Orders
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Today's Orders
                </Button>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
