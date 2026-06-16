import { getUsers } from './users';
import { getProducts } from './products';
import { getOrders } from './orders';
import { getCategories } from './categories';
import api from './api';
import type { DashboardStats, GetOrdersResult } from '@/types';
import { log } from 'console';

type RevenuePoint = { month: string; revenue: number };
type TopCategoryPoint = { name: string; percentage: number; rank: number };

interface TopCategoryRaw {
  category_id: number;
  category_name: string;
  total_quantity: number;
  total_sales: number;
  sales_percentage: number;
}

interface ApiListResponseTopCategories {
  status: boolean;
  statusCode: number;
  error: string | null;
  message: string;
  data: TopCategoryRaw[];
}

function monthKey(d: Date) {
  // YYYY-MM
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabel(yyyyMm: string) {
  const [y, m] = yyyyMm.split('-').map(Number);
  const d = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  return d.toLocaleString('default', { month: 'short' });
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const [usersResult, productsResult, ordersResult] = await Promise.all([
      getUsers({}),
      getProducts({ limit: 1 }),
      getOrders({ order: 'desc', sort_by: 'created_at' })
    ]);

    const usersList = Array.isArray(usersResult) ? usersResult : [];

    const productsPayload: any = productsResult;
    const totalProducts = Number(productsPayload?.total ?? 0);

    const ordersPayload: any = ordersResult;

    const ordersList = Array.isArray(
      ordersPayload?.items
    )
      ? ordersPayload.items
      : [];

    const totalOrders = Number(
      ordersPayload?.total ?? 0
    );

    const totalUsers = usersList.length;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // const deliveredOrders = ordersList.filter(
    //   (o: any) => o?.status === 'delivered'
    // ).length;

    // const pendingOrders = ordersList.filter(
    //   (o: any) =>
    //     o?.status === 'pending' ||
    //     o?.status === 'placed'
    // ).length;

    const todayOrders = ordersList.filter((o: any) => {
      const orderDate = new Date(o?.created_at);
      return orderDate >= startOfToday;
    });

    const todayDelivered = todayOrders.filter(
      (o: any) => o?.status === 'delivered'
    ).length;

    const todayPending = todayOrders.filter(
      (o: any) => o?.status === 'pending' || o?.status === 'placed'
    ).length;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthOrders = ordersList.filter((o: any) => {
      const orderDate = new Date(o?.created_at);
      return orderDate >= startOfMonth;
    });

    const monthDelivered = monthOrders.filter(
      (o: any) => o?.status === 'delivered'
    ).length;

    const monthPending = monthOrders.filter(
      (o: any) => o?.status === 'pending' || o?.status === 'placed'
    ).length;

    const deliveredOrders = todayDelivered + monthDelivered;
    const pendingOrders = todayPending + monthPending;

        // ✅ TOTAL REVENUE
    const revenue = ordersList.reduce(
      (sum: number, o: any) =>
        sum + Number(o?.total_amount || 0),
      0
    );

    // ✅ TODAY REVENUE
    const todayRevenue = ordersList
      .filter((o: any) => new Date(o.created_at) >= startOfToday)
      .reduce(
        (sum: number, o: any) =>
          sum + Number(o?.total_amount || 0),
        0
      );

    // ✅ MONTH REVENUE
    const monthRevenue = ordersList
      .filter((o: any) => new Date(o.created_at) >= startOfMonth)
      .reduce(
        (sum: number, o: any) =>
          sum + Number(o?.total_amount || 0),
        0
      );

    return {
      users: totalUsers,
      products: totalProducts,
      orders: totalOrders,
      revenue: Math.round(revenue),
      todayRevenue: Math.round(todayRevenue),
      monthRevenue: Math.round(monthRevenue),
      pendingOrders,
      deliveredOrders,
      todayOrders: todayOrders.length,
      todayDelivered,
      todayPending,
      monthOrders: monthOrders.length,
      monthDelivered,
      monthPending
      
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      users: 0,
      products: 0,
      orders: 0,
      revenue: 0,
      todayRevenue: 0,
      monthRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      todayOrders: 0,
      todayDelivered: 0,
      todayPending: 0,
      monthOrders: 0,
      monthDelivered: 0,
      monthPending: 0
      
    };
  }
}

export async function fetchOrders(): Promise<any[]> {
  try {
    const result = await getOrders({
      limit: 5,
      order: 'desc',
      sort_by: 'created_at'
    });

    console.log('orders result:', result);

    return Array.isArray(result?.items)
      ? result.items
      : [];
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
}

export async function fetchRevenueGrowthData(): Promise<RevenuePoint[]> {
  try {
    const result = await getOrders({   order: 'asc', sort_by: 'created_at', /* status: 'delivered' as any */ });

    const payload: any = result as any;
    const ordersList = Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : [];

    const totalsByMonth = new Map<string, number>();

    for (const order of ordersList) {
      const createdAt = order?.created_at;
      if (!createdAt) continue;
      const d = new Date(createdAt);
      const key = monthKey(d);
      const prev = totalsByMonth.get(key) ?? 0;
      totalsByMonth.set(key, prev + Number(order?.total_amount ?? 0));
    }

    // Build last 6 months labels in chronological order
    const now = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      months.push(monthKey(d));
    }

    return months.map((k) => ({
      month: monthLabel(k),
      revenue: Math.round(totalsByMonth.get(k) ?? 0)
    }));
  } catch (error) {
    console.error('Error fetching revenue growth data:', error);
    return [
      { month: 'Jan', revenue: 0 },
      { month: 'Feb', revenue: 0 },
      { month: 'Mar', revenue: 0 },
      { month: 'Apr', revenue: 0 },
      { month: 'May', revenue: 0 },
      { month: 'Jun', revenue: 0 },
      { month: 'Jul', revenue: 0 },
      { month: 'Aug', revenue: 0 },
      { month: 'Sep', revenue: 0 },
      { month: 'Oct', revenue: 0 },
      { month: 'Nov', revenue: 0 },
      { month: 'Dec', revenue: 0 }
    ];
  }
}


export async function fetchTopCategories(): Promise<TopCategoryPoint[]> {
  try {
    const response = await api.get<ApiListResponseTopCategories>('/categories/top');
    const topCategoriesRaw = response.data.data;
    
    return topCategoriesRaw.map((cat: TopCategoryRaw, idx: number) => {
      return {
        name: String(cat.category_name ?? `Category ${cat.category_id ?? idx + 1}`),
        percentage: Math.round(cat.sales_percentage ?? 0),
        rank: idx + 1
      };
    });
  } catch (error) {
    console.error('Error fetching top categories:', error);
    return [];
  }
}

