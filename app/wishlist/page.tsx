'use client';

import { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';

const initialWishlist = [
  { id: 'WL-01', name: 'Premium Backpack', price: 129, image: 'https://images.unsplash.com/photo-1512207853690-a1c67117be6d?auto=format&fit=crop&w=180&q=80' },
  { id: 'WL-02', name: 'Smart Desk Lamp', price: 89, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=180&q=80' }
];

export default function WishlistPage() {
  const [items, setItems] = useState(initialWishlist);

  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  const clearWishlist = () => setItems([]);

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-panel backdrop-blur-xl dark:border-slate-800 dark:bg-white/95 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Wishlist</p>
              <h1 className="mt-2 text-3xl font-semibold text-white dark:text-slate-950">Saved favorites</h1>
            </div>
            <Button variant="danger" onClick={clearWishlist}>Clear wishlist</Button>
          </div>

          {items.length === 0 ? (
            <Card className="text-center p-16">
              <Heart className="mx-auto mb-5 h-12 w-12 text-sky-300" />
              <h2 className="text-2xl font-semibold text-white">No items here yet</h2>
              <p className="mt-3 text-sm text-slate-400">Browse products and save favorites for later.</p>
            </Card>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {items.map((item) => (
                <Card key={item.id} className="p-5">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="h-24 w-24 rounded-3xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-sm text-slate-400">{formatCurrency(item.price)}</p>
                        </div>
                        <Badge variant="primary">Saved</Badge>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <Button variant="secondary">Move to cart</Button>
                        <button onClick={() => removeItem(item.id)} className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300 hover:bg-rose-500/20">
                          <Trash2 className="inline-block h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageShell>
    </AuthGuard>
  );
}
