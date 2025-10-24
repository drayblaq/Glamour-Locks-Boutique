'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Edit, Trash2, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isActive: boolean;
  sortOrder: number;
}

export default function ShippingManagementPage() {
  const { toast } = useToast();
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<ShippingOption | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    estimatedDays: '',
    isActive: true,
    sortOrder: 1
  });

  useEffect(() => {
    loadShippingOptions();
  }, []);

  const loadShippingOptions = async () => {
    try {
      // Since we're in admin, we need to call the main-site API
      const response = await fetch('http://localhost:3000/api/shipping-options');
      const data = await response.json();
      
      if (data.success) {
        setShippingOptions(data.shippingOptions);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load shipping options',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading shipping options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipping options',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingOption 
        ? 'http://localhost:3000/api/shipping-options'
        : 'http://localhost:3000/api/shipping-options';
      
      const method = editingOption ? 'PUT' : 'POST';
      const payload = editingOption 
        ? { id: editingOption.id, ...formData, price: parseFloat(formData.price) }
        : { ...formData, price: parseFloat(formData.price) };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: `Shipping option ${editingOption ? 'updated' : 'created'} successfully`,
        });
        
        resetForm();
        loadShippingOptions();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save shipping option',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving shipping option:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shipping option',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (option: ShippingOption) => {
    setEditingOption(option);
    setFormData({
      name: option.name,
      description: option.description,
      price: option.price.toString(),
      estimatedDays: option.estimatedDays,
      isActive: option.isActive,
      sortOrder: option.sortOrder
    });
    setShowForm(true);
  };

  const handleDelete = async (optionId: string) => {
    if (!confirm('Are you sure you want to delete this shipping option?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/shipping-options?id=${optionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Shipping option deleted successfully',
        });
        loadShippingOptions();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete shipping option',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting shipping option:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shipping option',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      estimatedDays: '',
      isActive: true,
      sortOrder: shippingOptions.length + 1
    });
    setEditingOption(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Shipping Management
        </h1>
        <p className="text-gray-600">Manage shipping options and pricing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Options List */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Shipping Options</CardTitle>
                  <CardDescription>Current shipping methods available to customers</CardDescription>
                </div>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {shippingOptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No shipping options configured
                </div>
              ) : (
                <div className="space-y-4">
                  {shippingOptions.map((option) => (
                    <div key={option.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {option.name}
                            <Badge variant={option.isActive ? 'default' : 'secondary'}>
                              {option.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                          <div className="text-sm text-gray-500">
                            Estimated: {option.estimatedDays} days
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">£{option.price.toFixed(2)}</div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(option)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(option.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingOption ? 'Edit Shipping Option' : 'Add New Shipping Option'}
                </CardTitle>
                <CardDescription>
                  Configure shipping method details and pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Standard Shipping"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., 3-5 working days"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Price (£)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="4.99"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="estimatedDays">Estimated Days</Label>
                    <Input
                      id="estimatedDays"
                      value={formData.estimatedDays}
                      onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                      placeholder="3-5"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      min="1"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingOption ? 'Update' : 'Create'} Option
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Shipping Rules Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Shipping Rules & Pricing</CardTitle>
          <CardDescription>Current automatic pricing rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Free Shipping Thresholds</h4>
              <ul className="text-sm space-y-1">
                <li>• Free standard shipping on orders over £50</li>
                <li>• 50% off express shipping on orders over £75</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Location Multipliers</h4>
              <ul className="text-sm space-y-1">
                <li>• UK: 1.0x - 1.2x base rate</li>
                <li>• US: 1.5x - 1.8x base rate</li>
                <li>• Other countries: 2.0x base rate</li>
              </ul>
            </div>
          </div>
          <Alert className="mt-4">
            <AlertDescription>
              Location-based pricing and weight surcharges are automatically calculated at checkout.
              Heavy items (over 5kg) incur an additional £2.50 per 2kg surcharge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}