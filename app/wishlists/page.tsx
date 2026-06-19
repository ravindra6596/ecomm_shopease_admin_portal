'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, shortDate } from '@/utils/format';
import { getWishlist, WishlistItem } from '@/services/wishlist';

export default function AdminWishlistsPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const data = await getWishlist();
      setItems(data);
    } catch (err) {
      console.error('Failed to load wishlist', err);
      toast.error(err instanceof Error ? err.message : 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-slate-950/90 p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admin Wishlist</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Wishlist items</h1>
            </div>
            <Button onClick={load}>Refresh</Button>
          </div>

          <Card className="p-6">
            {loading ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-slate-400">No wishlist items found.</p>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full text-sm text-left text-slate-200">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Discount</th>
                      <th className="px-4 py-2">Discount Price</th>
                      <th className="px-4 py-2">Added</th>
                      {/* <th className="px-4 py-2">Action</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((it, idx) => (
                      <tr key={it.id} className="bg-slate-900/50 hover:bg-slate-900/70">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3 max-w-[500px]">{it.product_name}</td>
                        <td className="px-4 py-3">{formatCurrency(it.product_price)}</td>
                        <td className="px-4 py-3">{it.discount}%</td>
                        <td className="px-4 py-3 text-emerald-400">{formatCurrency(it.discount_price)}</td>
                        <td className="px-4 py-3 text-slate-400">{shortDate(it.created_at)}</td>
                        {/* <td className="px-4 py-3">
                          <Link href={`/wishlists/${it.id}`} className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-2 text-xs text-sky-300 hover:bg-sky-500/20">
                            <Eye className="h-4 w-4" /> View
                          </Link>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
