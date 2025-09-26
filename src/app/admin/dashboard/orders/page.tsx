"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Package, 
  DollarSign, 
  Users, 
  Calendar,
  Clock,
  Activity,
  Truck,
  CheckCircle,
  X,
  RefreshCw,
  Download,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Plus
} from "lucide-react";
import Link from "next/link";

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
    specialInstructions: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    description: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
  paymentId?: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    message: "",
    customerName: ""
  });
  const [recentlyDeletedOrder, setRecentlyDeletedOrder] = useState<Order | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Helper functions for date filtering
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  const isThisWeek = (date: Date) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return date >= startOfWeek && date <= endOfWeek;
  };
  const isThisMonth = (date: Date) => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setOrderStats(data.stats || {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      const matchesDate = dateFilter === "all" || 
        (dateFilter === "today" && isToday(new Date(order.createdAt))) ||
        (dateFilter === "week" && isThisWeek(new Date(order.createdAt))) ||
        (dateFilter === "month" && isThisMonth(new Date(order.createdAt)));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

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
        toast({
          title: "Success",
          description: "Order status updated successfully!",
          variant: "default",
        });
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

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
        toast({
          title: "Success",
          description: "Email sent successfully!",
          variant: "default",
        });
        setEmailForm({ to: "", subject: "", message: "", customerName: "" });
        setEmailDialogOpen(false);
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    const orderToDelete = orders.find(order => order.id === orderId);
    if (!orderToDelete) return;
    setRecentlyDeletedOrder(orderToDelete);
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchOrders();
        toast({
          title: 'Order Deleted',
          description: (
            <span>
              Order has been deleted successfully. <button onClick={undoDelete} style={{color: '#0070f3', textDecoration: 'underline'}}>Undo</button>
            </span>
          ),
          variant: 'default',
          duration: 5000,
        });
        if (undoTimeout) clearTimeout(undoTimeout);
        setUndoTimeout(setTimeout(() => {
          setRecentlyDeletedOrder(null);
        }, 5000));
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.',
        variant: 'destructive',
      });
      setRecentlyDeletedOrder(null);
    }
  };

  const undoDelete = async () => {
    if (!recentlyDeletedOrder) return;
    try {
      // Remove id, createdAt, updatedAt so backend treats as new order
      const { id, createdAt, updatedAt, ...orderData } = recentlyDeletedOrder;
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      await fetchOrders();
      toast({
        title: 'Undo Successful',
        description: 'Order has been restored.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Undo Failed',
        description: 'Could not restore the order.',
        variant: 'destructive',
      });
    } finally {
      setRecentlyDeletedOrder(null);
      if (undoTimeout) clearTimeout(undoTimeout);
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Order Management</h1>
          <p className="text-muted-foreground">Manage customer orders and track fulfillment</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
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
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
            <p className="text-xs text-muted-foreground">Successful orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all" 
                  ? "Try adjusting your filters or search terms."
                  : "Orders will appear here when customers make purchases."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.firstName} {order.customer.lastName} • {order.customer.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">£{order.total.toFixed(2)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status || "pending")}
                          {(order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Pending")}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    {order.items.length} item(s) • {order.items.reduce((sum, item) => sum + item.quantity, 0)} total quantity
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
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteOrder(order.id)}
                      className="ml-2"
                    >
                      Delete
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
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
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
                {selectedOrder.customer.specialInstructions && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <strong>Special Instructions:</strong> {selectedOrder.customer.specialInstructions}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.jpg";
                        }}
                      />
                      <div className="flex-1">
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
                  {selectedOrder.paymentId && (
                    <div className="flex justify-between">
                      <span>Payment ID:</span>
                      <span className="font-mono text-xs">{selectedOrder.paymentId}</span>
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

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Email to Customer</DialogTitle>
            <DialogDescription>
              Send a personalized email to your customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Customer Name</label>
              <Input
                value={emailForm.customerName}
                onChange={(e) => setEmailForm(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-sm font-medium">To Email Address *</label>
              <Input
                type="email"
                value={emailForm.to}
                onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                placeholder="customer@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject *</label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Your order update"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message *</label>
              <textarea
                rows={6}
                value={emailForm.message}
                onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Hi there! I wanted to update you about your order..."
                className="w-full p-3 border rounded-md resize-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 