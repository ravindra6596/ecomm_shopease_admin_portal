'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TextEditor } from '@/components/ui/text-editor';
import { getProductById, updateProduct, deleteProductImage } from '@/services/products';
import { getCategories } from '@/services/categories';
import type { Product, Category } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    return_policy: '',
    is_featured: false,
    category_id: ''
  });

  const discountPrice = useMemo(() => {
    const price = Number(formData.price);
    const discount = Number(formData.discount);
    if (!price || !discount || discount <= 0) {
      return null;
    }
    return Math.round(price - (price * discount) / 100);
  }, [formData.price, formData.discount]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadCategories();
    }
  }, [productId]);

  async function loadProduct() {
    try {
      const data = await getProductById(productId);
      setProduct(data);
      setFormData({
        name: data.name,
        description: data.description,
        price: String(data.price),
        discount: data.discount != null ? String(data.discount) : '',
        return_policy: data.return_policy || '',
        is_featured: data.is_featured || false,
        category_id: String(data.category_id)
      });
      setExistingImages(data.images?.map(img => img.image_url) || []);
    } catch (err) {
      console.error('Failed to load product', err);
      const message = err instanceof Error ? err.message : 'Unable to load product';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const result = await getCategories({ page: 1, limit: 100 });
      setCategories(result.categories);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  }

  function removeNewImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  async function handleDeleteImage(url: string) {
    // Find the image object in the product's images array
    const image = product?.images.find(img => img.image_url === url);
    if (!image) {
      toast.error('Image not found');
      return;
    }

    setDeletingImage(image.id.toString());
    try {
      await deleteProductImage(image.id.toString());
      toast.success('Image deleted successfully');
      setExistingImages(existingImages.filter(imgUrl => imgUrl !== url));
    } catch (err) {
      console.error('Failed to delete image', err);
      const message = err instanceof Error ? err.message : 'Failed to delete image';
      toast.error(message);
    } finally {
      setDeletingImage(null);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name.trim());
      formDataObj.append('description', formData.description.trim());
      formDataObj.append('price', formData.price);
      formDataObj.append('discount', formData.discount);
      formDataObj.append('return_policy', formData.return_policy);
      formDataObj.append('is_featured', String(formData.is_featured));
      formDataObj.append('category_id', formData.category_id);
      images.forEach(img => formDataObj.append('images', img));
      removedImages.forEach(url => formDataObj.append('removed_images', url));

      await updateProduct(productId, formDataObj);
      toast.success('Product updated successfully!');
      router.push(`/products/${productId}`);
    } catch (err) {
      console.error('Failed to update product', err);
      const message = err instanceof Error ? err.message : 'Failed to update product';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <PageShell>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-800 rounded"></div>
                    <div className="h-10 bg-slate-800 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-800 rounded"></div>
                    <div className="h-10 bg-slate-800 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-800 rounded"></div>
                  <div className="h-24 bg-slate-800 rounded-2xl"></div>
                </div>
              </div>
            </Card>
          </div>
        </PageShell>
      </AuthGuard>
    );
  }

  if (error || !product) {
    return (
      <AuthGuard>
        <PageShell>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </div>
            <Card className="p-12 text-center">
              <div className="text-red-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Unable to Edit Product</h3>
              <p className="text-slate-400 mb-6">{error || 'The product you are trying to edit does not exist.'}</p>
              <Button onClick={() => router.push('/products')}>
                Back to Products
              </Button>
            </Card>
          </div>
        </PageShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Edit Product</h1>
                <p className="text-sm text-slate-400">Update product details and images</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <Card className="p-6">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Product Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Price (₹) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Discount (%)
                  </label>

                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    placeholder="0"
                  />

                  {discountPrice !== null && (
                    <p className="mt-2 text-sm text-emerald-300">
                      Discount price: ₹{discountPrice.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Return Policy */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Return Policy
                  </label>

                  <Input
                    value={formData.return_policy}
                    onChange={(e) =>
                      setFormData({ ...formData, return_policy: e.target.value })
                    }
                    placeholder="Short return policy"
                  />
                </div>

                {/* Is Featured (NEW) */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Is Featured
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!formData.is_featured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_featured: e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-emerald-500"
                    />

                    <span className="text-sm text-slate-300">
                      Mark as featured product
                    </span>
                  </div>
                </div>

              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
                <TextEditor
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Enter product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                  className="w-full h-10 rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 focus:border-violet-400 focus:outline-none dark:bg-slate-200/80 dark:text-slate-950"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Current Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Current Images</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {existingImages.map((url, idx) => {
                      const imageId = product?.images.find(img => img.image_url === url)?.id.toString();
                      return (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Product ${idx + 1}`}
                            className="h-100 w-full object-cover rounded-lg border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(url)}
                            disabled={deletingImage === imageId}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingImage === imageId ? (
                              <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">New Images ({images.length})</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="h-24 w-full object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Add More Images (optional)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-slate-900/30 hover:bg-slate-900/50 hover:border-violet-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-sm text-slate-400">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (MAX. 5MB each)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Product'}
                </Button>
                <Button variant="secondary" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
