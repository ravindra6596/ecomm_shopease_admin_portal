'use client';

import { useEffect, useState } from 'react';
import { Search, ArrowRight, ShoppingBag, CreditCard, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, ArrowUpDown, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, shortDate } from '@/utils/format';
import { getOrders } from '@/services/orders';
import { Order, OrderListParams } from '@/types';
import { on } from 'events';

const paymentBadge = {
  pending: 'warning',
  success: 'success',
  failed: 'danger'
} as const;

const orderBadge = {
  pending: 'warning',
  placed: 'primary',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger'
} as const;
 
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'id'|'user_name'|'created_at' | 'total_amount' | 'status' | 'payment_status'|'payment_method'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');


  const loadOrders = async () => {
    try {
      setLoading(true);
       const params: OrderListParams = {
         page,
         limit,
         sort_by: sortBy,
         order: sortOrder,
       };

      if (search.trim()) params.query = search.trim();
      if (statusFilter) params.status = statusFilter as any;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter as any;
      if (paymentMethodFilter) params.payment_method = paymentMethodFilter as any;

      const result = await getOrders(params);

      // If backend reports no pages (no items), clear the list and keep UI on page 1
      if (result.total_pages === 0) {
        setOrders([]);
        setTotal(0);
        setTotalPages(0);
        setHasNextPage(false);
        setHasPrevPage(false);
        return;
      }

      // Clamp page if API returns page > total_pages (ensure page >= 1)
      if (result.page > result.total_pages) {
        const newPage = result.total_pages >= 1 ? result.total_pages : 1;
        setPage(newPage);
        return; // This will trigger another load with correct page
      }

       setOrders(result.items);
       setTotal(result.total);
       setPage(result.page);
       setLimit(result.limit);
       setTotalPages(result.total_pages);
       setHasNextPage(result.is_next);
       setHasPrevPage(result.is_previous);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, sortBy, sortOrder, statusFilter, paymentStatusFilter, paymentMethodFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (page === 1) {
        loadOrders();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const summary = {
    pending: orders.filter((order) => order.status === 'pending').length,
    shipped: orders.filter((order) => order.status === 'shipped').length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
  };

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-panel backdrop-blur-xl dark:border-slate-800 dark:bg-white/95 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Orders</p>
              <h1 className="mt-2 text-3xl font-semibold text-white dark:text-slate-950">Order management</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="inline-flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> New order</Button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-4">
            {[
              { title: 'Total orders', value: orders.length, icon: Clock },
              { title: 'Pending orders', value: summary.pending, icon: Clock },
              { title: 'Shipped', value: summary.shipped, icon: ArrowRight },
              { title: 'Delivered', value: summary.delivered, icon: CheckCircle2 }
            ].map((item) => (
              <Card key={item.title} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{item.title}</p>
                    <h3 className="mt-3 text-3xl font-semibold text-white">{item.value}</h3>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-3 text-sky-300 dark:bg-slate-200/90 dark:text-sky-600"><item.icon className="h-5 w-5" /></div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white dark:text-slate-950">Order table</h2>
                <p className="text-sm text-slate-400">Search orders, inspect statuses and go to details instantly.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders" className="pl-11" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="placed">Placed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-900/90 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="">Payment Method</option>
                  <option value="online">Online</option>
                  <option value="cod">COD</option>
                </select>
              </div>
            </div>
            <div className="mt-6 overflow-auto">
               <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
                 <thead className="bg-slate-950/90 text-slate-500">
                   <tr>
                     <th className="px-5 py-4 ">#</th>
                     <th className="px-5 py-4 cursor-pointer" onClick={() => handleSort('id')}><div className="flex items-center gap-2">
                          Order Id
                          <ArrowUpDown className="h-4 w-4" />
                        </div></th>
                     <th className="px-5 py-4 cursor-pointer" onClick={() => handleSort('user_name')}><div className="flex items-center gap-2">
                          Customer Name
                          <ArrowUpDown className="h-4 w-4" />
                        </div></th>
                     <th className="px-5 py-4 cursor-pointer" onClick={() => handleSort('total_amount')}><div className="flex items-center gap-2">
                          Total
                          <ArrowUpDown className="h-4 w-4" />
                        </div></th>
                      <th className="px-5 py-4 cursor-pointer" onClick={() => handleSort('payment_status')}>
                        <div className="flex items-center gap-2">
                          Payment Status
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                     <th className="px-5 py-4 cursor-pointer" onClick={() => handleSort('status')}>
                       <div className="flex items-center gap-2">
                        Order Status
                         <ArrowUpDown className="h-4 w-4" />
                       </div>
                     </th>
                      <th className="px-5 py-4 cursor-pointer" onClick={() => handleSort('payment_method')}>
                        <div className="flex items-center gap-2">
                          Payment Method
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                     <th className="px-5 py-4 cursor-pointer" onClick={() => handleSort('created_at')}>
                       <div className="flex items-center gap-2">
                         Date
                         <ArrowUpDown className="h-4 w-4" />
                       </div>
                     </th>
                     
                     <th className="px-5 py-4">Action</th>
                   </tr>
                 </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                        Loading orders...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, index) => (
                      <tr key={order.id} className="bg-slate-900/80">
                        <td className="px-5 py-4 text-slate-300">{(page - 1) * 10 + index + 1}</td>
                        <td className="px-5 py-4 text-slate-300">{order.id}</td>
                        <td className="px-5 py-4 font-medium text-white">{order.user_name}</td>
                        <td className="px-5 py-4 text-slate-200">{formatCurrency(order.total_discount_price+order.shipping)}</td>
                        <td className="px-5 py-4"><Badge variant={paymentBadge[order.payment_status]}>{order.payment_status}</Badge></td>
                        <td className="px-5 py-4"><Badge variant={orderBadge[order.status] ?? 'muted'}>{order.status}</Badge></td>
                        <td className="px-5 py-4">{order.payment_method.toLocaleUpperCase()}</td>
                        <td className="px-5 py-4 text-slate-400">{shortDate(order.created_at)}</td>
                        <td className="px-5 py-4">
                        <Link
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center justify-center rounded-full bg-sky-500/10 px-4 py-2 text-xs text-sky-300 hover:bg-sky-500/20 transition-colors"
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </Link>
                        </td>
                       </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Showing {orders.length} of {total} orders
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={!hasPrevPage}
                  >
                    {/* <ChevronLeft className="h-4 w-4" /> */}
                    Previous
                  </Button>
                  <span className="text-sm text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!hasNextPage}
                  >
                    Next
                    {/* <ChevronRight className="h-4 w-4" /> */}
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
