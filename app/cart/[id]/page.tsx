'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, shortDateTime } from '@/utils/format';
import { getCartById } from '@/services/cart';
import type { CartData } from '@/types';

export default function CartDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cartId = params.id as string;
  const [page, setPage] = useState(1);  
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cartId) {
      loadCart();
    }
  }, [cartId]);

  async function loadCart() {
    setLoading(true);
    setError('');

    try {
      const data = await getCartById(cartId);
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart', err);
      const message = err instanceof Error ? err.message : 'Unable to load cart details';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => router.push('/cart')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to carts
              </Button>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Cart #{cartId}</p>
                <h1 className="mt-2 text-3xl font-semibold text-white dark:text-slate-950">Cart details</h1>
                {cart?.user_id && (
                  <p className="text-sm text-slate-400">User ID: {cart.user_id}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="default">{loading ? 'Loading' : cart?.total_items ?? 0} items</Badge>
              <Badge variant="default">{loading ? 'Loading' : formatCurrency(cart?.grand_total ?? 0)}</Badge>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-14 rounded-3xl md:col-span-2" />
              <Skeleton className="h-48 rounded-3xl md:col-span-2" />
            </div>
          ) : error || !cart ? (
            <Card className="p-10 text-center">
              <p className="text-red-400 mb-4">Unable to load cart</p>
              <p className="text-slate-400 mb-6">{error || 'Cart not found or the cart has no items.'}</p>
              <Button onClick={() => router.push('/cart')}>Back to cart list</Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Cart ID</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{cartId}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Total items</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{cart.total_items}</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Grand total</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(cart.grand_total)}</p>
                </Card>
              </div>

              <Card className="overflow-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Cart items</h2>
                    <p className="text-sm text-slate-400">Detailed item listing for this cart.</p>
                  </div>
                  <Badge variant="default">{cart.items.length} rows</Badge>
                </div>

                {cart.items.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
                    <p className="text-lg font-semibold text-white">No items in this cart yet.</p>
                  </div>
                ) : (
                  <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                    <thead className="bg-gradient-to-r from-slate-950/90 to-slate-900/90 text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-semibold">#</th>
                        <th className="px-5 py-4 font-semibold">Product Id</th>
                        <th className="px-5 py-4 font-semibold">Product</th>
                        <th className="px-5 py-4 font-semibold">Quantity</th>
                        <th className="px-5 py-4 font-semibold">Unit price</th>
                        <th className="px-5 py-4 font-semibold">Total price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {cart.items.map((item, index) => (
                        <tr key={item.id} className="bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
                          <td className="px-5 py-4 text-slate-300">{(page - 1) * 10 + index + 1}</td>
                          <td className="px-5 py-4 text-slate-300">{item.id}</td>
                          <td className="px-5 py-4 text-white">{item.product_name}</td>
                          <td className="px-5 py-4 text-slate-300">{item.quantity}</td>
                          <td className="px-5 py-4 text-emerald-400">{formatCurrency(item.product_price)}</td>
                          <td className="px-5 py-4 text-emerald-400">{formatCurrency(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>
          )}
        </div>
      </PageShell>
    </AuthGuard>
  );
}
