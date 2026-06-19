'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, shortDate } from '@/utils/format';
import { getWishlistItem, WishlistItem } from '@/services/wishlist';

export default function WishlistItemPage() {
  const params = useParams();
  const id = Number(params.id);
  const [item, setItem] = useState<WishlistItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await getWishlistItem(id);
      setItem(data);
    } catch (err) {
      console.error('Failed to load wishlist item', err);
      toast.error(err instanceof Error ? err.message : 'Failed to load wishlist item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Wishlist item</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Item #{id}</h1>
            </div>
            <Button variant="ghost" onClick={() => history.back()}><ArrowLeft className="h-4 w-4" /> Back</Button>
          </div>

          <Card className="p-6">
            {loading ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : !item ? (
              <p className="text-sm text-slate-400">Item not found.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Product</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{item.product_name}</h2>
                  <p className="mt-2 text-sm text-slate-400">Added: {shortDate(item.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Price</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{formatCurrency(item.product_price)}</h2>
                  <p className="mt-2 text-sm text-emerald-300">Discount {item.discount}% — {formatCurrency(item.discount_price)}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
