// 'use client';

// import { useEffect, useState } from 'react';
// import { ArrowUpRight, Package, ShoppingBag, Users, DollarSign, Clock, TrendingUp, BarChart3, HeartHandshake, IndianRupee, IndianRupeeIcon } from 'lucide-react';
// import { AuthGuard } from '@/components/auth/AuthGuard';
// import { PageShell } from '@/components/layout/page-shell';
// import { SummaryCard } from '@/components/dashboard/summary-card';
// import { OverviewChart } from '@/components/charts/overview-chart';
// import { fetchDashboardStats, fetchOrders } from '@/services/dashboard';
// import { formatCurrency, shortDate } from '@/utils/format';
// import { Badge } from '@/components/ui/badge';
// import { Card } from '@/components/ui/card';

// interface OrderRow {
//   id: string;
//   customer: string;
//   total: number;
//   orderStatus: string;
//   paymentStatus: string;
//   createdAt: string;
// }

// export default function HomePage() {
//   const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0, pendingOrders: 0, deliveredOrders: 0 });
//   const [orders, setOrders] = useState<OrderRow[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function load() {
//       const [dashboardStats, ordersData] = await Promise.all([fetchDashboardStats(), fetchOrders()]);
//       setStats(dashboardStats);
//       setOrders(ordersData);
//       setLoading(false);
//     }
//     load();
//   }, []);

//   const orderStatusVariant = (status: string) => {
//     switch (status) {
//       case 'delivered':
//         return 'success';
//       case 'pending':
//         return 'warning';
//       case 'shipped':
//         return 'primary';
//       default:
//         return 'muted';
//     }
//   };

//   return (
//     <AuthGuard>
//       <PageShell>
//         <div className="space-y-6">
//           <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-panel backdrop-blur-xl dark:border-slate-800 dark:bg-white/95">
//             <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//               <div className="space-y-3">
//                 <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Welcome back</p>
//                 <h1 className="text-4xl font-semibold text-white dark:text-slate-950">Premium store dashboard</h1>
//                 <p className="max-w-2xl text-sm text-slate-400">Manage users, products, categories and orders from a polished admin experience with analytics, search, and role-based workflows.</p>
//               </div>

//             </div>
//           </section>

//           <div className="grid gap-5 xl:grid-cols-4">
//             <SummaryCard title="Total Users" value={stats.users} subtitle="Active user growth" icon={<Users className="h-6 w-6" />} />
//             <SummaryCard title="Products" value={stats.products} subtitle="Catalog inventory" icon={<Package className="h-6 w-6" />} highlight="success" />
//             <SummaryCard title="Total Orders" value={stats.orders} subtitle="Order fulfillment rate" icon={<ShoppingBag className="h-6 w-6" />} highlight="warning" />
//             <SummaryCard title="Revenue" value={stats.revenue} subtitle="Monthly earnings" icon={<IndianRupeeIcon className="h-6 w-6" />} />
//           </div>

//           <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
//             <div className="grid gap-5">
//               {/* <Card className="p-6">
//                 <div className="flex items-center justify-between gap-4">
//                   <div>
//                     <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Sales overview</p>
//                     <h2 className="mt-2 text-2xl font-semibold text-white dark:text-slate-950">Track revenue trends</h2>
//                   </div>
//                   <div className="rounded-3xl bg-slate-900/90 p-3 text-sky-300 dark:bg-slate-200/90 dark:text-sky-600">
//                     <TrendingUp className="h-5 w-5" />
//                   </div>
//                 </div>
//                 <OverviewChart title="Revenue growth" subtitle="Last 6 months" icon={<ArrowUpRight className="h-5 w-5" />} />
//               </Card> */}
//               <div className="grid gap-5 lg:grid-cols-1">
//                 {/* <Card className="p-6">
//                   <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Top categories</p>
//                   <div className="mt-6 space-y-4">
//                     {['Fashion', 'Electronics', 'Home', 'Health'].map((category, index) => (
//                       <div key={category} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-100">
//                         <div>
//                           <p>{category}</p>
//                           <p className="text-xs text-slate-500">{50 - index * 8}% of total sales</p>
//                         </div>
//                         <div className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-300 grid place-items-center">{index + 1}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </Card> */}
//                 <div className="grid gap-5 xl:grid-cols-[ .7fr_0.1fr]">
//                   <Card className="p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent orders</p>
//                         <h2 className="mt-2 text-2xl font-semibold text-white dark:text-slate-950">Latest transactions</h2>
//                       </div>
//                       <Badge variant="success">Live</Badge>
//                     </div>
//                     <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80">
//                       <table className="w-full border-separate border-spacing-0 text-left text-sm">
//                         <thead className="bg-slate-950/90 text-slate-500">
//                           <tr>
//                             <th className="px-5 py-4">Order</th>
//                             <th className="px-5 py-4">Customer</th>
//                             <th className="px-5 py-4">Total</th>
//                             <th className="px-5 py-4">Status</th>
//                             <th className="px-5 py-4">Date</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {loading ? (
//                             Array.from({ length: 4 }).map((_, index) => (
//                               <tr key={index} className="animate-pulse">
//                                 <td className="px-5 py-4 h-12 bg-slate-900/80" />
//                                 <td className="px-5 py-4 h-12 bg-slate-900/80" />
//                                 <td className="px-5 py-4 h-12 bg-slate-900/80" />
//                                 <td className="px-5 py-4 h-12 bg-slate-900/80" />
//                                 <td className="px-5 py-4 h-12 bg-slate-900/80" />
//                               </tr>
//                             ))
//                           ) : (
//                             orders.map((order) => (
//                               <tr key={order.id} className="border-t border-white/10 text-slate-200">
//                                 <td className="px-5 py-4 font-medium text-white dark:text-slate-950">{order.id}</td>
//                                 <td className="px-5 py-4">{order.customer}</td>
//                                 <td className="px-5 py-4">{formatCurrency(order.total)}</td>
//                                 <td className="px-5 py-4"><Badge variant={orderStatusVariant(order.orderStatus)}>{order.orderStatus}</Badge></td>
//                                 <td className="px-5 py-4">{shortDate(order.createdAt)}</td>
//                               </tr>
//                             ))
//                           )}
//                         </tbody>
//                       </table>
//                     </div>
//                   </Card>

//                   {/* <Card className="p-6">
//               <div className="flex items-center justify-between gap-4">
//                 <div>
//                   <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Activity</p>
//                   <h2 className="mt-2 text-2xl font-semibold text-white dark:text-slate-950">Recent updates</h2>
//                 </div>
//                 <HeartHandshake className="h-6 w-6 text-sky-400" />
//               </div>
//               <div className="mt-8 space-y-5">
//                 {[
//                   { title: 'New product launch', detail: 'Summer capsule added to catalog' },
//                   { title: 'Order batch processed', detail: '128 orders shipped today' },
//                   { title: 'User role updated', detail: 'Manager privileges assigned' }
//                 ].map((item) => (
//                   <div key={item.title} className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-100">
//                     <p className="font-semibold text-white dark:text-slate-950">{item.title}</p>
//                     <p className="mt-1 text-slate-400">{item.detail}</p>
//                   </div>
//                 ))}
//               </div>
//             </Card> */}
//                 </div>
//               </div>
//             </div>


//           </div>


//         </div>
//       </PageShell>
//     </AuthGuard>
//   );
// }
