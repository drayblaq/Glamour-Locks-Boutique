'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Package, LogOut } from 'lucide-react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useAuthenticatedFetch } from '@/hooks/useCustomerAuth';

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
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { logout, isAuthenticated, loading } = useCustomerAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600">Manage your information and view your orders</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <div className="grid grid-cols-2 gap-4">
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
                    {profile.phone && (
                      <div>
                        <Label>Phone</Label>
                        <Input value={profile.phone} disabled />
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Member since {formatDate(profile.createdAt)}
                    </div>
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
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.total)}</p>
                            <p className="text-sm text-gray-500">{order.status}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
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
                    No orders found
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