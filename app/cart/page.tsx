'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, shortDateTime } from '@/utils/format';
import { getCartAdminList } from '../../services/cart';
import type { CartAdminItem } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartAdminItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'user_name' | 'user_email' | 'total_items' | 'grand_total' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCartItems({ 
      page, 
      limit, 
      search: query, 
      min_total: minTotal ? Number(minTotal) : undefined, 
      max_total: maxTotal ? Number(maxTotal) : undefined,
      sort_by: sortBy,
      order: sortOrder
    });
  }, [page, limit, query, minTotal, maxTotal, sortBy, sortOrder]);

  async function loadCartItems(params: {
    page: number;
    limit: number;
    search?: string;
    min_total?: number;
    max_total?: number;
    sort_by?: typeof sortBy;
    order?: 'asc' | 'desc';
  }) {
    setLoading(true);
    setError('');

    try {
      const cartList = await getCartAdminList(params);
      setItems(cartList.items);
      setTotal(cartList.total);
      setPage(cartList.page);
      setLimit(cartList.limit);
      setTotalPages(cartList.total_pages);
    } catch (err) {
      console.error('Failed to load cart items', err);
      const message = err instanceof Error ? err.message : 'Unable to load cart items';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-panel backdrop-blur-xl dark:border-slate-800 dark:bg-white/95 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Cart</p>
              <h1 className="mt-2 text-3xl font-semibold text-white dark:text-slate-950">Cart management</h1>
              <p className="mt-2 text-sm text-slate-400">View active cart items and inspect carts by ID.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => loadCartItems({ 
                page, 
                limit, 
                search: query, 
                min_total: minTotal ? Number(minTotal) : undefined, 
                max_total: maxTotal ? Number(maxTotal) : undefined,
                sort_by: sortBy,
                order: sortOrder
              })} disabled={loading}>
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Total carts</p>
              <p className="mt-3 text-3xl font-semibold text-white">{loading ? '—' : total}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Page</p>
              <p className="mt-3 text-3xl font-semibold text-white">{loading ? '—' : page}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Total pages</p>
              <p className="mt-3 text-3xl font-semibold text-white">{loading ? '—' : totalPages}</p>
            </Card>
          </div>

          <Card className="overflow-hidden p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white dark:text-slate-950">Cart item list</h2>
                <p className="text-sm text-slate-400">Each row shows one cart summary from the admin API.</p>
              </div>
              <Badge variant="default">{loading ? 'Loading...' : `${items.length} carts`}</Badge>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search by user name or email..."
                className="h-10 w-full rounded-full border border-white/10 bg-slate-900/80 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-400 focus:outline-none"
              />
                
            </div>

            {(query || minTotal || maxTotal) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span>Filters active</span>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setMinTotal('');
                    setMaxTotal('');
                    setPage(1);
                  }}
                  className="text-violet-300 hover:text-violet-200"
                >
                  Clear filters
                </button>
              </div>
            )}

            {loading ? (
              <div className="mt-6 grid gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100">
                <p className="font-semibold">Unable to load cart items</p>
                <p className="mt-2 text-sm text-rose-100/80">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-slate-900/80 p-10 text-center text-slate-400">
                <p className="text-lg font-semibold text-white">No cart items found</p>
                <p className="mt-2">The backend returned an empty cart dataset.</p>
              </div>
            ) : (
              <div className="mt-6 overflow-auto">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                  <thead className="bg-gradient-to-r from-slate-950/90 to-slate-900/90 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold ">  
                        
                          #
                       
                      </th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('id')}>  
                        <div className="flex items-center gap-2">
                          Cart ID
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('user_name')}>
                        <div className="flex items-center gap-2">
                          User Name
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('user_email')}>
                        <div className="flex items-center gap-2">
                          Email
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('total_items')}>
                        <div className="flex items-center gap-2">
                          Total Items
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('grand_total')}>
                        <div className="flex items-center gap-2">
                          Grand Total
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold cursor-pointer" onClick={() => handleSort('created_at')}>
                        <div className="flex items-center gap-2">
                          Created At
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-5 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item,index) => (
                      <tr key={item.id} className="bg-slate-900/50 hover:bg-slate-900/70 transition-colors">
                        <td className="px-5 py-4 text-slate-300">{(page - 1) * limit + index + 1}</td>
                        <td className="px-5 py-4 text-white">{item.id}</td>
                        <td className="px-5 py-4 text-white">{item.user_name}</td>
                        <td className="px-5 py-4 text-slate-300">{item.user_email}</td>
                        <td className="px-5 py-4 text-slate-300">{item.total_items}</td>
                        <td className="px-5 py-4 text-emerald-400">{formatCurrency(item.grand_total)}</td>
                        <td className="px-5 py-4 text-slate-300">{shortDateTime(item.created_at)}</td>
                        <td className="px-5 py-4">
                          <Button variant="secondary" onClick={() => router.push(`/cart/${item.id}`)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-slate-400">
                <p>Showing {items.length} of {total} carts</p>
                <div className="inline-flex items-center gap-2">
                  <Button
                    variant="secondary"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 rounded-full bg-slate-900/50 border border-white/5">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </PageShell>
    </AuthGuard>
  );
}