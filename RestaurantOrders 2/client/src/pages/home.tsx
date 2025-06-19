import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Settings, Users, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bella Vista Restaurant
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Authentic Italian Cuisine - Digital Ordering System
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Customer Interface */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Digital Menu</CardTitle>
              <p className="text-gray-600">Browse our menu and place your order</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-primary" />
                  <span>For Customers</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Browse menu by categories</li>
                  <li>• Add items to cart</li>
                  <li>• Place orders instantly</li>
                  <li>• Real-time order tracking</li>
                </ul>
              </div>
              <Button 
                asChild
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 text-lg font-semibold"
              >
                <a href="/menu">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  View Menu & Order
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Owner Interface */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-secondary">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Owner Dashboard</CardTitle>
              <p className="text-gray-600">Manage orders and restaurant operations</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 mr-2 text-secondary" />
                  <span>For Restaurant Owner</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Receive orders in real-time</li>
                  <li>• Update order status</li>
                  <li>• View daily statistics</li>
                  <li>• Manage restaurant operations</li>
                </ul>
              </div>
              <Button 
                asChild
                className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 text-lg font-semibold"
              >
                <a href="/dashboard">
                  <Settings className="w-5 h-5 mr-2" />
                  Access Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Ordering</h3>
              <p className="text-sm text-gray-600">Simple and intuitive ordering process for customers</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-600">Live order notifications and status updates</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Management</h3>
              <p className="text-sm text-gray-600">Streamlined dashboard for order management</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Built with modern web technologies for seamless restaurant operations
          </p>
        </div>
      </div>
    </div>
  );
}