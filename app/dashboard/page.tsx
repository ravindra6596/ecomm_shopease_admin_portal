'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Package, ShoppingBag, Users, DollarSign, Clock, TrendingUp, BarChart3, HeartHandshake, IndianRupee, IndianRupeeIcon, PackageCheck } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageShell } from '@/components/layout/page-shell';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { OverviewChart } from '@/components/charts/overview-chart';
import { fetchDashboardStats, fetchOrders, fetchRevenueGrowthData, fetchTopCategories } from '@/services/dashboard';
import { formatCurrency, shortDate } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Order } from '@/types';

const orderStatusVariant = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'pending':
      return 'warning';
    case 'shipped':
      return 'primary';
    case 'placed':
      return 'warning'; // Treat placed as warning (similar to pending)
    default:
      return 'muted';
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0, products: 0, orders: 0, revenue: 0, todayRevenue: 0, monthRevenue: 0, pendingOrders: 0, deliveredOrders: 0,
    // ✅ added fields
    todayOrders: 0,
    todayDelivered: 0,
    todayPending: 0,
    monthOrders: 0,
    monthDelivered: 0,
    monthPending: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [topCategories, setTopCategories] = useState<{ name: string; percentage: number; rank: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch all data in parallel
        const [
          dashboardStats,
          ordersData,
          revenueGrowthData,
          categoriesData
        ] = await Promise.all([
          fetchDashboardStats(),
          fetchOrders(),
          fetchRevenueGrowthData(),
          fetchTopCategories()
        ]);

        setStats(dashboardStats);
        setOrders(ordersData);
        setRevenueData(revenueGrowthData);
        setTopCategories(categoriesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <AuthGuard>
      <PageShell>
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-panel backdrop-blur-xl dark:border-slate-800 dark:bg-white/95">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Welcome back</p>
                <h1 className="text-4xl font-semibold text-white dark:text-slate-950">Premium store dashboard</h1>
                <p className="max-w-2xl text-sm text-slate-400">Manage users, products, categories and orders from a polished admin experience with analytics, search, and role-based workflows.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:w-auto">
                <button className="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">Create report</button>
                <button className="rounded-3xl border border-white/10 bg-transparent px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300 hover:text-sky-300">Export CSV</button>
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-4">
            <SummaryCard title="Total Users" value={stats.users} subtitle="Active user growth" icon={<Users className="h-6 w-6" />} />
            <SummaryCard title="Products" value={stats.products} subtitle="Catalog inventory" icon={<Package className="h-6 w-6" />} highlight="success" />
            <SummaryCard title="Total Orders" value={stats.orders} subtitle="Order fulfillment rate" icon={<ShoppingBag className="h-6 w-6" />} highlight="warning" />
            <SummaryCard title="Revenue" value={stats.revenue} subtitle="Total earnings" icon={<IndianRupeeIcon className="h-6 w-6" />} />
          </div>
          <div className="grid gap-5 xl:grid-cols-4">
            <SummaryCard title="Today's Orders" value={stats.todayOrders} subtitle={`${stats.todayDelivered} delivered / ${stats.todayPending} pending`} icon={<ShoppingBag className="h-6 w-6" />} />
            <SummaryCard title="Delivered Today" value={stats.todayDelivered} subtitle="Successful order completions" icon={<PackageCheck className="h-6 w-6" />} highlight="success" />
            <SummaryCard title="Pending Today" value={stats.todayPending} subtitle="Orders awaiting processing" icon={<Clock className="h-6 w-6" />} highlight="warning" />
            <SummaryCard title="Today's Revenue" value={stats.todayRevenue} subtitle="Earnings generated today" icon={<IndianRupeeIcon className="h-6 w-6" />} />
          </div>

          <div className="grid gap-5 xl:grid-cols-4">
            <SummaryCard title="This Month Orders" value={stats.monthOrders} subtitle={`${stats.monthDelivered} delivered / ${stats.monthPending} pending`} icon={<ShoppingBag className="h-6 w-6" />} />
            <SummaryCard title="Delivered This Month" value={stats.monthDelivered} subtitle="Completed monthly orders" icon={<PackageCheck className="h-6 w-6" />} highlight="success" />
            <SummaryCard title="Pending This Month" value={stats.monthPending} subtitle="Orders still in progress" icon={<Clock className="h-6 w-6" />} highlight="warning" />
            <SummaryCard title="Monthly Revenue" value={stats.monthRevenue} subtitle="Total earnings this month" icon={<IndianRupeeIcon className="h-6 w-6" />} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
            <div className="grid gap-5">
              <Card className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Sales overview</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white dark:text-slate-950">Track revenue trends</h2>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-3 text-sky-300 dark:bg-slate-200/90 dark:text-sky-600">{<TrendingUp className="h-5 w-5" />}</div>
                </div>
                <OverviewChart
                  title="Revenue growth"
                  subtitle="Last 6 months"
                  icon={<ArrowUpRight className="h-5 w-5" />}
                  data={revenueData}
                />
              </Card>
              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Top categories</p>
                  <div className="mt-6 space-y-4">
                    {topCategories.map((category) => (
                      <div key={category.rank} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-100">
                        <div>
                          <p>{category.name}</p>
                          <p className="text-xs text-slate-500">{category.percentage}% of total sales</p>
                        </div>
                        {/* <div className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-300 grid place-items-center">{category.rank}</div> */}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Quick actions</p>
                  <div className="mt-6 grid gap-3">
                    {['Add product', 'Review orders', 'Manage users', 'Create category'].map((item) => (
                      <button key={item} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-left text-sm text-slate-100 transition hover:border-sky-300 hover:text-sky-300">{item}</button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Performance</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white dark:text-slate-950">Revenue analytics</h2>
                </div>
                <div className="rounded-3xl bg-sky-500/10 p-3 text-sky-300 dark:bg-sky-500/20"> <BarChart3 className="h-5 w-5" /> </div>
              </div>
              <div className="mt-8 space-y-4">
                {[{ label: 'Conversion rate', value: '4.8%' }, { label: 'Average order', value: formatCurrency(138) }, { label: 'Today earnings', value: formatCurrency(7_420) }].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-3xl bg-slate-900/80 px-5 py-4 text-sm text-slate-100">
                    <span>{item.label}</span>
                    <span className="font-semibold text-white dark:text-slate-950">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent orders</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white dark:text-slate-950">Latest transactions</h2>
                </div>
                <Badge variant="success">Live</Badge>
              </div>
              <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80">
                <table className="w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className="bg-slate-950/90 text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Order</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="h-12 bg-slate-900/80"></td>
                        <td className="h-12 bg-slate-900/80"></td>
                        <td className="h-12 bg-slate-900/80"></td>
                        <td className="h-12 bg-slate-900/80"></td>
                        <td className="h-12 bg-slate-900/80"></td>
                      </tr>
                    )) : orders.map((order) => (
                      <tr key={order.id} className="border-t border-white/10 text-slate-200">
                        <td className="px-5 py-4 font-medium text-white dark:text-slate-950">{order.id}</td>
                        <td className="px-5 py-4">{order.user_name}</td>
                        <td className="px-5 py-4">{formatCurrency(order.total_amount)}</td>
                        <td className="px-5 py-4"><Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge></td>
                        <td className="px-5 py-4">{shortDate(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Activity</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white dark:text-slate-950">Recent updates</h2>
                </div>
                <HeartHandshake className="h-6 w-6 text-sky-400" />
              </div>
              <div className="mt-8 space-y-5">
                {['New product launch', 'Order batch processed', 'User role updated'].map((item) => (
                  <div key={item} className="rounded-3xl bg-slate-900/80 p-4 text-slate-100">
                    <p className="font-semibold text-white">{item}</p>
                    <p className="mt-1 text-slate-400">{item === 'New product launch' ? 'Summer capsule added to catalog' : item === 'Order batch processed' ? '128 orders shipped today' : 'Manager privileges assigned'}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </PageShell>
    </AuthGuard>
  );
}
