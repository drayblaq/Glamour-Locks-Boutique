'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingBag, 
  Users, 
  Activity, 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Package,
  Truck,
  Clock,
  Eye,
  MessageSquare,
  X,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useFirestoreProductStore } from '@/lib/store/firestoreProductStore';

interface EmailFormData {
  to: string;
  subject: string;
  message: string;
  customerName: string;
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [emailForm, setEmailForm] = useState<EmailFormData>({
    to: '',
    subject: '',
    message: '',
    customerName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [emailServiceStatus, setEmailServiceStatus] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    totalRevenue: 0
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const { products } = useFirestoreProductStore();

  // Check email service status and fetch orders on component mount
  useEffect(() => {
    checkEmailService();
    fetchOrders();
  }, []);

  const checkEmailService = async () => {
    try {
      const response = await fetch('/api/send-email');
      const data = await response.json();
      setEmailServiceStatus(data);
    } catch (error) {
      console.error('Error checking email service:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setOrderStats(data.stats || {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (response.ok) {
        await fetchOrders(); // Refresh orders
        setAlert({ type: 'success', message: 'Order status updated successfully!' });
        setTimeout(() => setAlert(null), 3000);
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to update order status' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleInputChange = (field: keyof EmailFormData, value: string) => {
    setEmailForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      setAlert({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailForm),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Email sent successfully!' });
        setEmailForm({ to: '', subject: '', message: '', customerName: '' });
        setEmailDialogOpen(false);
      } else {
        setAlert({ type: 'error', message: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Activity className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const totalProducts = products.length; 

  return (
    <div className="space-y-8 p-8">
      <header>
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin!</p>
      </header>

      {alert && (
        <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Currently listed products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {orderStats.pending} pending • {orderStats.processing} processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{orderStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.pending}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your store efficiently.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/admin/dashboard/products">Manage Products</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard/products/add">Add New Product</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard/orders">Manage Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/" target="_blank">View Store</Link>
          </Button>
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Send Email to Customer</DialogTitle>
                <DialogDescription>
                  Send a personalized email to your customer.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    value={emailForm.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="to">To Email Address *</Label>
                  <Input
                    id="to"
                    type="email"
                    value={emailForm.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    placeholder="customer@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={emailForm.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Your order update"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={emailForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Hi there! I wanted to update you about your order..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendEmail} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Recent Orders Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders and their status.</CardDescription>
            </div>
            <Button variant="outline" onClick={fetchOrders} disabled={ordersLoading}>
              {ordersLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet. Orders will appear here when customers make purchases.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...new Map(orders.slice(0, 10).map(order => [order.id, order])).values()].map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.firstName} {order.customer.lastName} • {order.customer.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">£{order.total.toFixed(2)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status || "pending")}
                          {(order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Pending")}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                      >
                        Mark Processing
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                      >
                        Mark Shipped
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        Mark Completed
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setEmailForm({
                          to: order.customer.email,
                          subject: `Update on your order #${order.orderNumber}`,
                          message: `Hi ${order.customer.firstName},\n\nI wanted to give you an update on your recent order...\n\nBest regards,\nGlamour Locks Boutique Team`,
                          customerName: `${order.customer.firstName} ${order.customer.lastName}`
                        });
                        setEmailDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Email Customer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details #{selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription>
                Complete order information and customer details.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Order Status and Actions */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedOrder.status)}>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(selectedOrder.status || "pending")}
                    {(selectedOrder.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : "Pending")}
                  </span>
                </Badge>
                
                <div className="flex gap-2">
                  <Select onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {selectedOrder.customer.email}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedOrder.customer.phone}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Shipping Address
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {selectedOrder.customer.address}<br />
                      {selectedOrder.customer.city}, {selectedOrder.customer.state} {selectedOrder.customer.zipCode}<br />
                      {selectedOrder.customer.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>£{(selectedOrder.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>£{(selectedOrder.shipping ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>£{(selectedOrder.total ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Order Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order Placed:</span>
                    <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedOrder.updatedAt && (
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{new Date(selectedOrder.updatedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setEmailForm({
                      to: selectedOrder.customer.email,
                      subject: `Update on your order #${selectedOrder.orderNumber}`,
                      message: `Hi ${selectedOrder.customer.firstName},\n\nI wanted to give you an update on your recent order #${selectedOrder.orderNumber}.\n\nCurrent Status: ${selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nGlamour Locks Boutique Team`,
                      customerName: `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`
                    });
                    setSelectedOrder(null);
                    setEmailDialogOpen(true);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Email Customer
                </Button>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}