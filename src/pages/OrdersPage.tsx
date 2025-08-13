import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Eye, Package, ShoppingBag } from 'lucide-react';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  finalPrice: number;
  name?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Handle different response formats
        const ordersData = response.data?.orders || response.data || [];
        const orders = Array.isArray(ordersData) ? ordersData : [];
        setOrders(orders);
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch orders');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-xl">Loading your orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold text-destructive mb-2">Error Loading Orders</h2>
            <p className="mb-4">{error}</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>

        {!Array.isArray(orders) || orders.length === 0 ? (
          <Card className="p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">You have not placed any orders yet</h2>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here!
            </p>
            <Button asChild>
              <Link to="/categories">Browse Products</Link>
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                 <tbody className="divide-y divide-border">
                   {Array.isArray(orders) && orders.map((order) => (
                    <tr key={order._id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-mono">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details #{order._id.slice(-8)}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedOrder && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold mb-2">Order Information</h3>
                                    <p><span className="font-medium">Date:</span> {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                                    <p><span className="font-medium">Status:</span> 
                                      <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                      </Badge>
                                    </p>
                                    <p><span className="font-medium">Payment:</span> {selectedOrder.paymentMethod}</p>
                                  </div>
                                  
                                  <div>
                                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                                    <div className="text-sm space-y-1">
                                      <p>{selectedOrder.shippingAddress.fullName}</p>
                                      <p>{selectedOrder.shippingAddress.address}</p>
                                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                                      <p>{selectedOrder.shippingAddress.zipCode}</p>
                                      <p>{selectedOrder.shippingAddress.country}</p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-semibold mb-3">Order Items</h3>
                                  <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead className="bg-muted">
                                        <tr>
                                          <th className="px-4 py-2 text-left">Item</th>
                                          <th className="px-4 py-2 text-left">Quantity</th>
                                          <th className="px-4 py-2 text-left">Price</th>
                                          <th className="px-4 py-2 text-left">Subtotal</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border">
                                        {selectedOrder.items.map((item, index) => (
                                          <tr key={index}>
                                            <td className="px-4 py-2">{item.name || `Product ${item.productId.slice(-8)}`}</td>
                                            <td className="px-4 py-2">{item.quantity}</td>
                                            <td className="px-4 py-2">${item.finalPrice.toFixed(2)}</td>
                                            <td className="px-4 py-2">${(item.finalPrice * item.quantity).toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot className="bg-muted font-semibold">
                                        <tr>
                                          <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                                          <td className="px-4 py-2">${selectedOrder.totalAmount.toFixed(2)}</td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default OrdersPage;