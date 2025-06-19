import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type CartItem } from "@shared/schema";
import { Check, X } from "lucide-react";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onOrderSuccess: () => void;
}

export default function OrderModal({
  isOpen,
  onClose,
  cart,
  total,
  onOrderSuccess
}: OrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: { customerName: string; items: { id: number; quantity: number; price: number }[] }) => {
      return apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: () => {
      setIsSuccess(true);
      onOrderSuccess();
      // Reset form
      setCustomerName("");
      
      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been sent to the restaurant.",
      });
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to place the order.",
        variant: "destructive"
      });
      return;
    }

    const orderData = {
      customerName: customerName.trim(),
      items: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    createOrderMutation.mutate(orderData);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Complete Your Order</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="customerName">Your Name</Label>
                <Input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                  required
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={createOrderMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-dark text-white"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your order has been sent to the restaurant. You'll receive updates on the preparation status.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleClose}
                className="w-full bg-primary hover:bg-primary-dark text-white"
              >
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClose}
              >
                Track Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
