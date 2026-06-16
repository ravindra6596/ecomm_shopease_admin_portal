'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Calendar, Hash, Image as ImageIcon, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shortDate } from '@/utils/format';
import { getCategoryById } from '@/services/categories';
import type { CategoryDetail, Product } from '@/types';
import { BASE_URL } from '@/constants/routes';

export default function CategoryDetails({ params }: any) {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const categoryId = id ?? '';
    const [category, setCategory] = useState<CategoryDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
      async function loadCategory() {
        if (!categoryId) {
          setError('Category ID is required');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError('');
        try {
          console.debug('Loading category', categoryId);
          const categoryData = await getCategoryById(categoryId);
          setCategory(categoryData);
        } catch (err) {
          console.error('Failed to load category', err);
          const message = err instanceof Error ? err.message : 'Unable to load category';
          setError(`Unable to load category. ${message}`);
        } finally {
          setLoading(false);
        }
      }
      
      loadCategory();
    }, [categoryId]);
 
  const getAvatarInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /> Back</Button>
            <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Category details</p>
                <h1 className="text-3xl font-semibold text-white dark:text-slate-950">{loading ? 'Loading...' : category?.name || categoryId}</h1>
            </div>
          </div>

          {error ? (
            <div className="rounded-[2rem] border border-rose-500/10 bg-rose-500/10 p-6 text-rose-100">
              <p className="font-semibold">Unable to load category</p>
              <p className="mt-2 text-sm text-rose-100/80">{error}</p>
            </div>
          ) : loading ? (
            <Card className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-slate-900/80" />
                <div className="h-8 w-48 rounded-lg bg-slate-900/80" />
              </div>
            </Card>
    ) : category ? (
        <Card className="p-6 space-y-6">
          {/* Category Header */}
          <div className="flex items-center gap-4">
            {category.images && category.images.length > 0 ? (
              <img
                src={category.images[0].image_url}
                alt={category.name}
                className="h-16 w-16 object-cover rounded-3xl border border-white/10"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-sky-500 text-xl font-semibold text-white">
                {getAvatarInitial(category.name)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-white dark:text-slate-950">{category.name}</h2>
              <p className="text-sm text-slate-400">{category.products_count} products</p>
            </div>
          </div>

          {/* Category Info */}
          <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-sm text-white">{category.is_deleted ? 'Deleted' : 'Active'}</p>
              </div>
              <Badge variant={category.is_deleted ? 'danger' : 'success'}>
                {category.is_deleted ? 'Deleted' : 'Active'}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">Category ID</p>
              <p className="text-sm text-white">{category.id}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">Created</p>
              <p className="text-sm text-white">{shortDate(category.created_at || new Date().toISOString())}</p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">Last Updated</p>
              <p className="text-sm text-white">{shortDate(category.updated_at || new Date().toISOString())}</p>
            </div>
          </div>

          {/* Products Grid */}
          {category.products.length > 0 ? (
            <>
              <h3 className="text-lg font-bold text-white mb-4">Products in Category ({category.products.length})</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.products.map((product) => (
                  <div key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push(`/products/${product.id}`)}>
                    <Card className="p-4 bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={`${BASE_URL}/${product.images[0].image_url}`}
                            alt={product.name}
                            className="h-16 w-16 object-cover rounded-lg border border-white/10"
                          />
                        ) : (
                          <div className="h-16 w-16 flex items-center justify-center rounded-lg bg-slate-900/80">
                            <ImageIcon className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white line-clamp-2">{product.name}</p>
                          <p className="text-sm text-slate-400">₹{product.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        <span>{product.images?.length || 0} images</span> ·
                        <span>{product.category_name || 'Uncategorized'}</span>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No products in this category yet</p>
              <Button variant="secondary" onClick={() => router.push(`/products?category_id=${category.id}`)}>
                Add Product to Category
              </Button>
            </div>
          )}
        </Card>
        ) : null}
    
      {/* {category && (
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white dark:text-slate-950">Products in this category</h2>
              <p className="text-sm text-slate-400">View and manage products belonging to this category.</p>
            </div>
            <Button variant="secondary" onClick={() => router.push(`/products?category_id=${category.id}`)}>
              View Products
            </Button>
          </div>
        </Card>
      )} */}
        </div>
      </PageShell>
    </AuthGuard>
  );
}