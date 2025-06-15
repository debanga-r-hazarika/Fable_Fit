import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Order {
  id: string;
  total_amount: number;
  payment_status: string;
  shipping_status: string;
  shipping_address: any;
  order_items: any[];
  created_at: string;
}

const statusIcons = {
  processing: Clock,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: AlertCircle,
};

const statusColors = {
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByStatus = (status: string) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.shipping_status === status);
  };

  if (authLoading || loading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (selectedOrder) {
    const StatusIcon = statusIcons[selectedOrder.shipping_status as keyof typeof statusIcons] || Clock;
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedOrder(null)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-playfair font-bold text-gray-900">
                    Order #{selectedOrder.id.slice(0, 8)}
                  </h1>
                  <p className="text-gray-600">
                    Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={statusColors[selectedOrder.shipping_status as keyof typeof statusColors]}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {selectedOrder.shipping_status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.order_items?.map((item: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                          <img
                            src={item.images?.[0] || '/placeholder.jpg'}
                            alt={item.title}
                            className="h-16 w-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-600">
                              Size: {item.size || 'One Size'} • Qty: {item.quantity}
                            </p>
                            <p className="font-semibold text-primary-600">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order Confirmed</p>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedOrder.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {selectedOrder.shipping_status !== 'processing' && (
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Truck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Shipped</p>
                            <p className="text-sm text-gray-600">In transit</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.shipping_status === 'delivered' && (
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Delivered</p>
                            <p className="text-sm text-gray-600">Package delivered</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-lg">₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Badge className={paymentStatusColors[selectedOrder.payment_status as keyof typeof paymentStatusColors]}>
                        <CreditCard className="h-3 w-3 mr-1" />
                        Payment {selectedOrder.payment_status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">{selectedOrder.shipping_address.name}</p>
                        <p className="text-gray-600">{selectedOrder.shipping_address.street}</p>
                        <p className="text-gray-600">
                          {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.pincode}
                        </p>
                        <p className="text-gray-600">{selectedOrder.shipping_address.phone}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  
                  {selectedOrder.shipping_status === 'delivered' && (
                    <Button variant="outline" className="w-full">
                      Write a Review
                    </Button>
                  )}
                  
                  {selectedOrder.shipping_status === 'processing' && (
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">
              My Orders
            </h1>
            <p className="text-gray-600">
              Track and manage your orders
            </p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({filterOrdersByStatus('processing').length})</TabsTrigger>
              <TabsTrigger value="shipped">Shipped ({filterOrdersByStatus('shipped').length})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({filterOrdersByStatus('delivered').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <OrdersList orders={orders} onSelectOrder={setSelectedOrder} />
            </TabsContent>
            <TabsContent value="processing">
              <OrdersList orders={filterOrdersByStatus('processing')} onSelectOrder={setSelectedOrder} />
            </TabsContent>
            <TabsContent value="shipped">
              <OrdersList orders={filterOrdersByStatus('shipped')} onSelectOrder={setSelectedOrder} />
            </TabsContent>
            <TabsContent value="delivered">
              <OrdersList orders={filterOrdersByStatus('delivered')} onSelectOrder={setSelectedOrder} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function OrdersList({ orders, onSelectOrder }: { orders: Order[], onSelectOrder: (order: Order) => void }) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Button asChild>
            <Link to="/products">
              Continue Shopping
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => {
        const StatusIcon = statusIcons[order.shipping_status as keyof typeof statusIcons] || Clock;
        
        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <StatusIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{Number(order.total_amount).toLocaleString()}
                      </p>
                      <Badge className={statusColors[order.shipping_status as keyof typeof statusColors]}>
                        {order.shipping_status}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
                
                {order.order_items && order.order_items.length > 0 && (
                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                    <div className="flex -space-x-2">
                      {order.order_items.slice(0, 3).map((item: any, idx: number) => (
                        <img
                          key={idx}
                          src={item.images?.[0] || '/placeholder.jpg'}
                          alt={item.title}
                          className="h-10 w-10 object-cover rounded border-2 border-white"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}