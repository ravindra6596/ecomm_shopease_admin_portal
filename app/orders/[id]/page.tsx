'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, CreditCard, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, shortDate } from '@/utils/format';
import { getOrderById, updateOrderStatus, updateOrderPaymentStatus } from '@/services/orders';
import { Order } from '@/types';

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

export default function OrderDetails({ params }: any) {
  const router = useRouter();
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<Order['status']>('pending');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<Order['payment_status']>('pending');
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);

  useEffect(() => {
     const loadOrder = async () => {
       try {
         setLoading(true);
         const orderData = await getOrderById(Number(id));
         setOrder(orderData);
         setOrderStatus(orderData.status);
         setPaymentStatus(orderData.payment_status);
       } catch (error) {
         console.error('Failed to load order:', error);
         toast.error(error instanceof Error ? error.message : 'Failed to load order');
       } finally {
         setLoading(false);
       }
     };

    if (id) {
      loadOrder();
    }
  }, [id]);

   const handleUpdateStatus = async () => {
     if (!order) return;
     if (order.status === orderStatus) {
       toast.error('Please select a different status before updating.');
       return;
     }

     try {
       setUpdatingStatus(true);
       const updatedOrder = await updateOrderStatus(Number(id), orderStatus);
       setOrder(updatedOrder);
       toast.success('Order status updated successfully.');
     } catch (error) {
       console.error('Failed to update status:', error);
       toast.error(error instanceof Error ? error.message : 'Failed to update order status');
     } finally {
       setUpdatingStatus(false);
     }
   };

   const handleUpdatePaymentStatus = async () => {
     if (!order) return;
     if (order.payment_status === paymentStatus) {
       toast.error('Please select a different payment status before updating.');
       return;
     }

     try {
       setUpdatingPaymentStatus(true);
       const updatedOrder = await updateOrderPaymentStatus(Number(id), paymentStatus);
       setOrder(updatedOrder);
       toast.success('Payment status updated successfully.');
     } catch (error) {
       console.error('Failed to update payment status:', error);
       toast.error(error instanceof Error ? error.message : 'Failed to update payment status');
     } finally {
       setUpdatingPaymentStatus(false);
     }
   };

  if (loading) {
    return (
      <AuthGuard>
        <PageShell>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        </PageShell>
      </AuthGuard>
    );
  }

  if (!order) {
    return (
      <AuthGuard>
        <PageShell>
          <div className="text-center py-12">
            <p className="text-slate-400">Order not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go back
            </Button>
          </div>
        </PageShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /> Back</Button>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Order details</p>
              <h1 className="text-3xl font-semibold text-white dark:text-slate-950">#{order.id}</h1>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.85fr_0.45fr]">
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Customer</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{order.user_name}</h2>
                </div>
                <div className="space-y-2">
                  <Badge variant={orderBadge[order.status] ?? 'muted'}>{order.status}</Badge>
                  <p className="text-sm text-slate-400">{shortDate(order.created_at)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
               <div className="rounded-3xl bg-slate-900/80 p-5">
                 <p className="text-sm text-slate-400">Payment status</p>
                 <div className="mt-2 flex items-center gap-2 text-white">
                   <CreditCard className="h-4 w-4 text-sky-300" />
                   <Badge variant={paymentBadge[order.payment_status]}>{order.payment_status}</Badge>
                 </div>
               </div>
                <div className="rounded-3xl bg-slate-900/80 p-5">
                  <p className="text-sm text-slate-400">Total amount</p>
                  <div className="mt-2 flex items-center gap-2 text-white">
                    <Package className="h-4 w-4 text-emerald-300" />
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mt-6 space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <p className="text-sm text-slate-400">Shipping Address</p>
                <div className="rounded-3xl bg-slate-950/80 p-4">
                  <p className="font-medium text-white">{order.address.full_name}</p>
                  <p className="text-sm text-slate-300">{order.address.address_line}</p>
                  <p className="text-sm text-slate-300">
                    {order.address.city}, {order.address.state} {order.address.pincode}
                  </p>
                  <p className="text-sm text-slate-300">{order.address.country}</p>
                  <p className="text-sm text-slate-400 mt-2">{order.address.phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6 space-y-4 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">Items</p>
                  <p className="text-sm text-white">{order.items.length} product{order.items.length !== 1 ? 's' : ''}</p>
                </div>
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-3xl bg-slate-950/80 p-4">
                    <div>
                      <p className="font-medium text-white">{item.product_name}</p>
                      <p className="text-xs text-slate-500">Qty {item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <p className="font-semibold text-white">{formatCurrency(item.total_price)}</p>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 rounded-[2rem] bg-slate-950/90 p-6">
                <div className="flex items-center justify-between text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </Card>

            <Card className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Order status</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Current status</h2>
                </div>
                {order.status === 'delivered' ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <Clock className="h-6 w-6 text-sky-400" />
                )}
              </div>

              <div className="space-y-4">
                {[
                  { status: 'pending', label: 'Order placed', completed: ['placed', 'shipped', 'delivered'].includes(order.status) },
                  { status: 'placed', label: 'Order confirmed', completed: ['shipped', 'delivered'].includes(order.status) },
                  { status: 'shipped', label: 'Shipped', completed: ['delivered'].includes(order.status) },
                  { status: 'delivered', label: 'Delivered', completed: order.status === 'delivered' }
                ].map((step) => (
                  <div key={step.status} className="flex items-center gap-4 rounded-3xl bg-slate-900/80 p-4">
                    <div className={`grid h-10 w-10 place-items-center rounded-3xl ${
                      step.completed
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : step.status === order.status
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-slate-700/80 text-slate-400'
                    }`}>
                      {step.completed ? '✓' : step.status === order.status ? '●' : '○'}
                    </div>
                    <div>
                      <p className={`font-semibold ${step.status === order.status ? 'text-sky-300' : step.completed ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      {step.status === order.status && (
                        <p className="text-xs text-slate-500">Current status</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

               <div className="space-y-4">
                 <label className="block text-sm font-medium text-slate-300">Update order status</label>
                 <select
                   value={orderStatus}
                   onChange={(event) => setOrderStatus(event.target.value as Order['status'])}
                   className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
                 >
                   <option value="pending">Pending</option>
                   <option value="placed">Placed</option>
                   <option value="shipped">Shipped</option>
                   <option value="delivered">Delivered</option>
                   <option value="cancelled">Cancelled</option>
                 </select>
                 <Button className="w-full" onClick={handleUpdateStatus} disabled={updatingStatus || order.status === orderStatus}>
                   {updatingStatus ? 'Updating...' : 'Update status'}
                 </Button>
               </div>

               <div className="space-y-4">
                 <label className="block text-sm font-medium text-slate-300">Update payment status</label>
                 <select
                   value={paymentStatus}
                   onChange={(event) => setPaymentStatus(event.target.value as Order['payment_status'])}
                   className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
                 >
                   <option value="pending">Pending</option>
                   <option value="success">Success</option>
                   <option value="failed">Failed</option>
                 </select>
                 <Button className="w-full" onClick={handleUpdatePaymentStatus} disabled={updatingPaymentStatus || order.payment_status === paymentStatus}>
                   {updatingPaymentStatus ? 'Updating...' : 'Update payment status'}
                 </Button>
               </div>
            </Card>
          </div>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
