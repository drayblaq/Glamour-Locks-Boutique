'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Package, LogOut, Edit, Save, X, ShoppingCart, MapPin, Phone, Mail } from 'lucide-react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useAuthenticatedFetch } from '@/hooks/useCustomerAuth';
import { useCart } from '@/app/contexts/CartContext';

interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  total: number;
  status: string;
  shippingAddress?: any;
  billingAddress?: any;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { logout, isAuthenticated, loading } = useCustomerAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Load profile data
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
      loadOrders();
    }
  }, [isAuthenticated]);

  // Initialize edit form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zipCode: profile.address?.zipCode || '',
          country: profile.address?.country || 'UK'
        }
      });
    }
  }, [profile]);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await authenticatedFetch('/api/auth/customer/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.customer);
      } else {
        setError(data.error || 'Failed to load profile');
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await authenticatedFetch('/api/auth/customer/orders');
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Failed to load orders');
      }
    } catch (error) {
      setError('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    try {
      const response = await authenticatedFetch('/api/auth/customer/profile', {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.customer);
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Failed to update profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      // Add all items from the order to cart
      order.items.forEach(item => {
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image || '/placeholder-product.jpg',
          description: `Reordered from Order #${order.orderNumber}`
        });
      });
      
      toast({
        title: "Items Added to Cart",
        description: `${order.items.length} items from Order #${order.orderNumber} have been added to your cart.`,
      });
      
      // Optionally redirect to cart
      router.push('/cart');
    } catch (error) {
      toast({
        title: "Reorder Failed",
        description: "Failed to add items to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your information and view your orders</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : profile ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Member since {formatDate(profile.createdAt)}
                      </div>
                      {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>First Name</Label>
                            <Input 
                              value={editForm.firstName}
                              onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <Input 
                              value={editForm.lastName}
                              onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input value={profile.email} disabled />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input 
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Input 
                            value={editForm.address.street}
                            onChange={(e) => setEditForm({...editForm, address: {...editForm.address, street: e.target.value}})}
                            placeholder="Street address"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input 
                              value={editForm.address.city}
                              onChange={(e) => setEditForm({...editForm, address: {...editForm.address, city: e.target.value}})}
                              placeholder="City"
                            />
                            <Input 
                              value={editForm.address.zipCode}
                              onChange={(e) => setEditForm({...editForm, address: {...editForm.address, zipCode: e.target.value}})}
                              placeholder="Postal code"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button onClick={handleUpdateProfile} disabled={updateLoading} className="flex-1">
                            {updateLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>First Name</Label>
                            <Input value={profile.firstName} disabled />
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <Input value={profile.lastName} disabled />
                          </div>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input value={profile.email} disabled />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input value={profile.phone || 'Not provided'} disabled />
                        </div>
                        {profile.address && (
                          <div>
                            <Label>Address</Label>
                            <div className="text-sm text-gray-600 mt-1">
                              {profile.address.street && <div>{profile.address.street}</div>}
                              {(profile.address.city || profile.address.zipCode) && (
                                <div>{profile.address.city} {profile.address.zipCode}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Unable to load profile information
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  My Orders
                </CardTitle>
                <CardDescription>
                  Your order history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm sm:text-base">Order #{order.orderNumber}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex justify-between sm:block sm:text-right">
                            <p className="font-medium text-sm sm:text-base">£{order.total.toFixed(2)}</p>
                            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReorder(order)}
                            className="flex-1 text-xs sm:text-sm"
                          >
                            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            Reorder
                          </Button>
                        </div>
                      </div>
                    ))}
                    {orders.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        And {orders.length - 5} more order{orders.length - 5 > 1 ? 's' : ''}...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No orders found</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/products')}>
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}