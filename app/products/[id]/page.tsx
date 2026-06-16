'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit3, Trash2, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { shortDateTime } from '@/utils/format';
import { getProductById, deleteProduct } from '@/services/products';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  async function loadProduct() {
    setLoading(true);
    setError('');
    try {
      const data = await getProductById(productId);
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0].image_url);
      }
    } catch (err) {
      console.error('Failed to load product', err);
      const message = err instanceof Error ? err.message : 'Unable to load product';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!product) return;

    setDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success('Product deleted successfully!');
      router.push('/products');
    } catch (err) {
      console.error('Failed to delete product', err);
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      toast.error(message);
    } finally {
      setDeleting(false);
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

            <div className="grid gap-6 md:grid-cols-2">
              {/* Image Gallery Skeleton */}
              <Card className="p-6">
                <Skeleton className="aspect-square rounded-lg mb-4" />
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              </Card>

              {/* Product Info Skeleton */}
              <Card className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-4 space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </Card>
            </div>
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
              <h3 className="text-xl font-bold text-white mb-2">Product Not Found</h3>
              <p className="text-slate-400 mb-6">{error || 'The product you are looking for does not exist or has been deleted.'}</p>
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
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => router.push(`/products/${product.id}/edit`)}>
                <Edit3 className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" /> {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Image Gallery */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Product Images</h3>

              {/* Main Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-slate-900 mb-4 border border-white/10">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-slate-600" />
                  </div>
                )}
              </div>

               {/* Thumbnail Grid */}
               {product.images && product.images.length > 0 && (
                 <div className="grid grid-cols-5 gap-2">
                   {product.images.map((imgObj, idx) => (
                     <button
                       key={idx}
                       onClick={() => setSelectedImage(imgObj.image_url)}
                       className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                         selectedImage === imgObj.image_url ? 'border-violet-500' : 'border-white/10 hover:border-violet-400'
                       }`}
                     >
                       <img
                         src={imgObj.image_url}
                         alt={`${product.name} - ${idx + 1}`}
                         className="w-full h-full object-cover"
                       />
                     </button>
                   ))}
                 </div>
               )}
            </Card>

            {/* Product Information */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm uppercase tracking-wider text-slate-400 mb-1">Product</p>
                  <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                </div>
                 <Badge variant={product.is_deleted ? 'danger' : 'success'} className="ml-2">
                   {product.is_deleted ? 'Deleted' : 'Active'}
                 </Badge>
              </div>

              <p className="text-slate-300 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || 'No description provided.' }} />

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Tag className="h-4 w-4" />
                    <span>Price</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">₹{product.price.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>Discount</span>
                  </div>
                  <span className="text-white">{product.discount != null ? `${product.discount}%` : 'None'}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>Discount Price</span>
                  </div>
                  <span className="text-emerald-400">{product.discount_price != null ? `₹${product.discount_price.toLocaleString()}` : '—'}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>Return Policy</span>
                  </div>
                  <span className="text-white">{product.return_policy || 'None'}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Category</span>
                  </div>
                   <Badge variant="default">{product.category_name || 'Uncategorized'}</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ImageIcon className="h-4 w-4" />
                    <span>Total Images</span>
                  </div>
                  <span className="text-white font-semibold">{product.images?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Created</span>
                  </div>
                  <span className="text-white">{shortDateTime(product.created_at)}</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Last Updated</span>
                  </div>
                  <span className="text-white">{shortDateTime(product.updated_at)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Info Card */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Product Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-900/50 p-4 border border-white/5">
                <p className="text-sm text-slate-400">Images</p>
                <p className="text-2xl font-bold text-white mt-1">{product.images?.length || 0}</p>
              </div>
              <div className="rounded-xl bg-slate-900/50 p-4 border border-white/5">
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-2xl font-bold text-white mt-1">{product.is_deleted ? 'Deleted' : 'Active'}</p>
              </div>
              <div className="rounded-xl bg-slate-900/50 p-4 border border-white/5">
                <p className="text-sm text-slate-400">Category ID</p>
                <p className="text-2xl font-bold text-white mt-1">{product.category_id}</p>
              </div>
              <div className="rounded-xl bg-slate-900/50 p-4 border border-white/5">
                <p className="text-sm text-slate-400">Product ID</p>
                <p className="text-2xl font-bold text-white mt-1">#{product.id}</p>
              </div>
            </div>
          </Card>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
