import api from './api';
import { GetOrdersResult, OrderListParams, Order } from '@/types';

export async function getOrders(params: OrderListParams = {}): Promise<GetOrdersResult> {
  const response = await api.get('/orders', {
    params: {
      search: params.query,
      page: params.page,
      limit: params.limit,
      sort_by: params.sort_by,
      order: params.order,
      order_status: params.status,
      payment_status: params.payment_status,
      payment_method: params.payment_method
    }
  });
  return response.data.data ?? response.data;
}

export async function getOrderById(id: number): Promise<Order> {
  const response = await api.get(`/orders/${id}`);
  return response.data.data ?? response.data;
}

export async function updateOrderStatus(id: number, status: Order['status']): Promise<Order> {
  const response = await api.patch(`/orders/${id}/status`, { status });
  const data = response.data.data ?? response.data;

  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return getOrderById(id);
  }

  return data;
}

export async function updateOrderPaymentStatus(id: number, payment_status: Order['payment_status']): Promise<Order> {
  const response = await api.patch(`/orders/${id}/payment`, { payment_status });
  const data = response.data.data ?? response.data;

  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return getOrderById(id);
  }

  return data;
}