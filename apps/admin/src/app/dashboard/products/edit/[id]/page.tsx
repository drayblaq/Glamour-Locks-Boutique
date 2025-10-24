"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFirestoreProductStore } from "@/lib/store/firestoreProductStore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Upload, Package, DollarSign, Loader2, Plus, Trash2, Palette } from "lucide-react";
import Link from "next/link";
import * as firestoreProductService from '@/lib/firestore/products';

const CLOUD_NAME = 'dl1ntqlyk';
const UPLOAD_PRESET = 'cth7aun8';

function CloudinaryImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          onUpload(data.secure_url);
        } else {
          throw new Error('Upload failed');
        }
      }
    } catch (err: any) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    await handleFiles(event.dataTransfer.files);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(event.target.files);
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-primary rounded-lg p-4 text-center cursor-pointer mb-2"
        style={{ minHeight: 120 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <span className="cursor-pointer block">
          Drag & drop images here, or <span className="underline text-primary">browse</span>
        </span>
        {uploading && (
          <div className="flex items-center justify-center mt-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
            <span>Uploading...</span>
          </div>
        )}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    </div>
  );
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  variants: Array<{
    color: string;
    quantity: number | string;
    images: string[];
  }>;
}

interface ProductFormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  images?: string;
  variants?: string;
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  images: [],
  variants: [],
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { products, loading, error, updateProduct, getProduct } = useFirestoreProductStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<ProductFormErrors>({});

  useEffect(() => {
    async function loadProduct() {
      let product = getProduct(productId) || undefined;
      if (!product) {
        const fetched = await firestoreProductService.getProduct(productId);
        product = fetched || undefined;
      }
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: Number(product.price) || 0,
          stock: Number(product.stock) || 0,
          images: Array.isArray(product.images) ? product.images : [],
          variants: Array.isArray(product.variants) ? product.variants : [],
        });
      } else {
        toast({
          title: "Error",
          description: "Product not found.",
          variant: "destructive",
        });
        router.push("/dashboard/products");
      }
      setIsLoading(false);
    }
    loadProduct();
  }, [productId, products, router, toast, getProduct]);

  const validateForm = (): boolean => {
    const newErrors: ProductFormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (typeof formData.price === 'number' && formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (formData.stock < 0) newErrors.stock = "Stock cannot be negative";
    if (formData.images.length === 0 && formData.variants.length === 0) newErrors.images = "At least one image is required";
    
    // Validate variants
    if (formData.variants.length > 0) {
      const hasInvalidVariant = formData.variants.some(variant => {
        const quantity = typeof variant.quantity === 'string' ? parseInt(variant.quantity) : variant.quantity;
        return !variant.color.trim() || isNaN(quantity) || quantity < 1 || quantity > 5000;
      });
      if (hasInvalidVariant) {
        newErrors.variants = "All variants must have a color name and quantity between 1-5000";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Calculate total stock from variants if they exist, otherwise use manual stock
      const totalStock = formData.variants.length > 0 
        ? formData.variants.reduce((sum, variant) => {
            const quantity = typeof variant.quantity === 'string' ? parseInt(variant.quantity) || 0 : variant.quantity;
            return sum + quantity;
          }, 0)
        : formData.stock;

      await updateProduct(productId, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: totalStock,
        images: formData.images,
        variants: formData.variants.length > 0 ? formData.variants.map(variant => ({
          ...variant,
          quantity: typeof variant.quantity === 'string' ? parseInt(variant.quantity) || 0 : variant.quantity
        })) : undefined,
      });
      toast({
        title: "Product Updated",
        description: "Product has been successfully updated.",
        variant: "default",
      });
      router.push("/dashboard/products");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: "", quantity: 1, images: [] }]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: keyof ProductFormData['variants'][0], value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const addVariantImage = (variantIndex: number, imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? { ...variant, images: [...variant.images, imageUrl] }
          : variant
      )
    }));
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? { ...variant, images: variant.images.filter((_, imgI) => imgI !== imageIndex) }
          : variant
      )
    }));
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Edit Product</h1>
            <p className="text-muted-foreground">Update product information</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Product</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/dashboard/products">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Essential product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter product name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-semibold">£</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`pl-10 ${errors.price ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your product..."
                rows={4}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
            </div>
            <div>
              <Label htmlFor="stock">Stock Quantity {formData.variants.length > 0 ? "(Auto-calculated from variants)" : "*"}</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                max="5000"
                value={formData.variants.length > 0 
                  ? formData.variants.reduce((sum, variant) => {
                      const quantity = typeof variant.quantity === 'string' ? parseInt(variant.quantity) || 0 : variant.quantity;
                      return sum + quantity;
                    }, 0)
                  : formData.stock
                }
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value <= 5000) {
                    handleInputChange("stock", value);
                  }
                }}
                placeholder="0"
                className={errors.stock ? "border-destructive" : ""}
                disabled={formData.variants.length > 0}
              />
              {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock}</p>}
              {formData.variants.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Stock is automatically calculated from color variants
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Color Variants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Variants
            </CardTitle>
            <CardDescription>
              Add different colors and their quantities. Leave empty to use single stock quantity above.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {formData.variants.length === 0 
                  ? "No color variants added. Using single stock quantity." 
                  : `${formData.variants.length} color variant(s) added.`
                }
              </p>
              <Button type="button" onClick={addVariant} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Color Variant
              </Button>
            </div>
            
            {formData.variants.map((variant, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Color Variant {index + 1}</h4>
                  <Button 
                    type="button" 
                    onClick={() => removeVariant(index)} 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`variant-color-${index}`}>Color Name *</Label>
                    <Input
                      id={`variant-color-${index}`}
                      value={variant.color}
                      onChange={(e) => updateVariant(index, "color", e.target.value)}
                      placeholder="e.g., Black, Brown, Blonde"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`variant-quantity-${index}`}>Quantity *</Label>
                    <Input
                      id={`variant-quantity-${index}`}
                      type="number"
                      min="1"
                      max="5000"
                      step="1"
                      value={variant.quantity || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          updateVariant(index, "quantity", '');
                          return;
                        }
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue) && numValue >= 1 && numValue <= 5000) {
                          updateVariant(index, "quantity", numValue);
                        }
                      }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value);
                        if (e.target.value === '' || value < 1) {
                          updateVariant(index, "quantity", 1);
                        } else if (value > 5000) {
                          updateVariant(index, "quantity", 5000);
                        }
                      }}
                      placeholder="Enter quantity (1-5000)"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Color-Specific Images (Optional)</Label>
                  <div className="mt-2">
                    <CloudinaryImageUpload onUpload={(url) => addVariantImage(index, url)} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {variant.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative w-20 h-20">
                          <img src={img} alt={`${variant.color} variant`} className="object-cover w-full h-full rounded" />
                          <button 
                            type="button" 
                            onClick={() => removeVariantImage(index, imgIdx)} 
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {errors.variants && <p className="text-sm text-destructive mt-1">{errors.variants}</p>}
          </CardContent>
        </Card>
        
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Product Images
            </CardTitle>
            <CardDescription>
              Upload general product images. {formData.variants.length > 0 ? "These will be used as fallback images." : "At least one image is required."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CloudinaryImageUpload onUpload={url => setFormData(prev => ({ ...prev, images: [...prev.images, url] }))} />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img src={img} alt="Product" className="object-cover w-full h-full rounded" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">&times;</button>
                </div>
              ))}
            </div>
            {errors.images && <p className="text-sm text-destructive mt-1">{errors.images}</p>}
          </CardContent>
        </Card>
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
