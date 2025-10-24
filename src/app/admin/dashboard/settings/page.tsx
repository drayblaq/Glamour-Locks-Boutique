'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Truck, Package, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShippingOption } from '@/lib/types/shipping';

export default function AdminSettingsPage() {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<ShippingOption | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    minDays: '',
    maxDays: '',
    isActive: true,
  });

  useEffect(() => {
    fetchShippingOptions();
  }, []);

  const fetchShippingOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shipping/options');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setShippingOptions(data.options || []);
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipping options',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      minDays: '',
      maxDays: '',
      isActive: true,
    });
    setEditingOption(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.minDays || !formData.maxDays) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      estimatedDays: {
        min: parseInt(formData.minDays),
        max: parseInt(formData.maxDays),
      },
      isActive: formData.isActive,
    };

    try {
      let response;
      if (editingOption) {
        response = await fetch('/api/shipping/options', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingOption.id, ...payload }),
        });
      } else {
        response = await fetch('/api/shipping/options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Failed to save');

      toast({
        title: 'Success',
        description: `Shipping option ${editingOption ? 'updated' : 'created'} successfully`,
      });

      resetForm();
      fetchShippingOptions();
    } catch (error) {
      console.error('Error saving shipping option:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shipping option',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (option: ShippingOption) => {
    setFormData({
      name: option.name,
      description: option.description,
      price: option.price.toString(),
      minDays: option.estimatedDays.min.toString(),
      maxDays: option.estimatedDays.max.toString(),
      isActive: option.isActive,
    });
    setEditingOption(option);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping option?')) return;

    try {
      const response = await fetch(`/api/shipping/options?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast({
        title: 'Success',
        description: 'Shipping option deleted successfully',
      });

      fetchShippingOptions();
    } catch (error) {
      console.error('Error deleting shipping option:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shipping option',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (option: ShippingOption) => {
    try {
      const response = await fetch('/api/shipping/options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: option.id, 
          isActive: !option.isActive 
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast({
        title: 'Success',
        description: `Shipping option ${!option.isActive ? 'activated' : 'deactivated'}`,
      });

      fetchShippingOptions();
    } catch (error) {
      console.error('Error updating shipping option:', error);
      toast({
        title: 'Error',
        description: 'Failed to update shipping option',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your store settings and shipping options</p>
        </div>
      </div>

      <Tabs defaultValue="shipping" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shipping">Shipping Options</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="shipping" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Shipping Options</h2>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Shipping Option
            </Button>
          </div>

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingOption ? 'Edit Shipping Option' : 'Add New Shipping Option'}
                </CardTitle>
                <CardDescription>
                  Configure delivery options for your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Standard Shipping"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (£) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe this shipping option..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minDays">Minimum Days *</Label>
                      <Input
                        id="minDays"
                        type="number"
                        min="1"
                        value={formData.minDays}
                        onChange={(e) => setFormData({ ...formData, minDays: e.target.value })}
                        placeholder="3"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDays">Maximum Days *</Label>
                      <Input
                        id="maxDays"
                        type="number"
                        min="1"
                        value={formData.maxDays}
                        onChange={(e) => setFormData({ ...formData, maxDays: e.target.value })}
                        placeholder="5"
                        required
                      />
                    </div>
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
                      {editingOption ? 'Update' : 'Create'} Shipping Option
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">Loading shipping options...</div>
            ) : shippingOptions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Truck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No shipping options configured yet.</p>
                  <p className="text-sm text-gray-400">Add your first shipping option to get started.</p>
                </CardContent>
              </Card>
            ) : (
              shippingOptions.map((option) => (
                <Card key={option.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {option.name.toLowerCase().includes('express') ? (
                            <Package className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Truck className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{option.name}</h3>
                            <Badge variant={option.isActive ? 'default' : 'secondary'}>
                              {option.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{option.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {option.estimatedDays.min === option.estimatedDays.max
                                  ? `${option.estimatedDays.min} ${option.estimatedDays.min === 1 ? 'day' : 'days'}`
                                  : `${option.estimatedDays.min}-${option.estimatedDays.max} days`
                                }
                              </span>
                            </div>
                            <div className="font-semibold text-lg text-gray-900">
                              {option.price === 0 ? 'FREE' : `£${option.price.toFixed(2)}`}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(option)}
                        >
                          {option.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(option)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(option.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general store settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">General settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}