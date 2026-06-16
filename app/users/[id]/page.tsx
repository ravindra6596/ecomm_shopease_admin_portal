'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, ShieldCheck, MapPin, Package, ShoppingBag } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { shortDate, formatCurrency } from '@/utils/format';
import { getUserById } from '@/services/users';
import type { UserProfile, OrderAddress, Order, OrderItem } from '@/types';

export default function UserDetails({ params }: any) {
  const router = useRouter();
  const { id } = use(params) as { id: string };
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      setError('');
      try {
        const userData = await getUserById(id);
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user', err);
        const message = err instanceof Error ? err.message : 'Unable to load user';
        setError(`Unable to load user. ${message}`);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id]);

  const getRoleBadgeVariant = (role: string): 'success' | 'primary' | 'muted' => {
    if (role === 'admin') return 'success';
    if (role === 'manager') return 'primary';
    return 'muted';
  };

  const getAvatarInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const getOrderBadgeVariant = (status: string): 'success' | 'primary' | 'warning' | 'danger' | 'muted' => {
    if (status === 'delivered') return 'success';
    if (status === 'shipped') return 'primary';
    if (status === 'placed') return 'primary';
    if (status === 'cancelled') return 'danger';
    if (status === 'pending') return 'warning';
    return 'muted';
  };

  const getPaymentBadgeVariant = (status: string): 'success' | 'danger' | 'warning' | 'muted' => {
    if (status === 'success') return 'success';
    if (status === 'failed') return 'danger';
    if (status === 'pending') return 'warning';
    return 'muted';
  };

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /> Back</Button>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-400 font-semibold">User profile</p>
                <h1 className="text-3xl font-bold text-white dark:text-slate-950">{loading ? 'Loading...' : user?.name || id}</h1>
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100 backdrop-blur-sm">
              <p className="font-semibold">Unable to load user</p>
              <p className="mt-2 text-sm text-rose-100/80">{error}</p>
            </div>
          ) : loading ? (
            <Card className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-20 w-20 rounded-2xl bg-slate-900/50" />
                <div className="h-8 w-48 rounded-lg bg-slate-900/50" />
              </div>
            </Card>
          ) : user ? (
            <div className="space-y-6">
              <Card className="grid gap-6 lg:grid-cols-[0.8fr_0.6fr] p-6">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-sky-500/25">{getAvatarInitial(user.name)}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white dark:text-slate-950">{user.name}</h2>
                      <p className="text-sm text-slate-400">{user.role} account</p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-5">
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="mt-2 font-medium text-white">{user.email}</p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/5 p-5">
                      <p className="text-sm text-slate-400">Role</p>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">Account Info</p>
                  <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">Status</p>
                        <p className="text-sm text-white">{user.status}</p>
                      </div>
                      <Badge variant={user.status === 'active' ? 'success' : 'muted'}>{user.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-400">Joined</p>
                      <p className="text-sm text-white">{shortDate(user.createdAt)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-400">User ID</p>
                      <p className="text-sm text-white">{user.id}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Addresses Section */}
              {user.addresses && user.addresses.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-semibold">Addresses</p>
                      <h2 className="text-xl font-bold text-white dark:text-slate-950">{user.addresses.length} saved address{user.addresses.length > 1 ? 'es' : ''}</h2>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {user.addresses.map((address) => (
                      <div key={address.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{address.full_name}</p>
                            <p className="text-sm text-slate-400 mt-1">{address.phone}</p>
                            <p className="text-sm text-slate-300 mt-2">{address.address_line}</p>
                            <p className="text-sm text-slate-300">{address.city}, {address.state}</p>
                            <p className="text-sm text-slate-300">{address.country} - {address.pincode}</p>
                          </div>
                          {address.is_default && (
                            <Badge variant="success">Default</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Orders Section */}
              {user.orders && user.orders.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                      <ShoppingBag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-violet-400 font-semibold">Orders</p>
                      <h2 className="text-xl font-bold text-white dark:text-slate-950">{user.orders.length} order{user.orders.length > 1 ? 's' : ''}</h2>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {user.orders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-white">Order #{order.id}</p>
                              <Badge variant={getOrderBadgeVariant(order.status)}>{order.status}</Badge>
                              <Badge variant={getPaymentBadgeVariant(order.payment_status)}>{order.payment_status}</Badge>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{shortDate(order.created_at)}</p>
                          </div>
                          <p className="text-xl font-bold text-emerald-400">{formatCurrency(order.total_amount)}</p>
                        </div>

                        {/* Order Items */}
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Package className="h-4 w-4" />
                            <span>Items ({order.items.length})</span>
                          </div>
                          <div className="space-y-2 pl-6">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div>
                                  <p className="text-white">{item.product_name}</p>
                                  <p className="text-slate-400">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                </div>
                                <p className="font-semibold text-white">{formatCurrency(item.total_price)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>Delivery Address</span>
                          </div>
                          <div className="pl-6 text-sm text-slate-300">
                            <p className="font-medium text-white">{order.address.full_name}</p>
                            <p>{order.address.phone}</p>
                            <p>{order.address.address_line}</p>
                            <p>{order.address.city}, {order.address.state}</p>
                            <p>{order.address.country} - {order.address.pincode}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </PageShell>
    </AuthGuard>
  );
}
