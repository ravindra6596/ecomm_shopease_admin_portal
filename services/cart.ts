import api from './api';
import type { CartData, CartAdminListData } from '@/types';

interface ApiListResponse<T> {
  status: boolean;
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
}

interface CartAdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  min_total?: number;
  max_total?: number;
  sort_by?: 'id' | 'user_name' | 'user_email' | 'total_items' | 'grand_total' | 'created_at';
  order?: 'asc' | 'desc';
}

export async function getCartAdminList(params: CartAdminListParams = {}): Promise<CartAdminListData> {
  const response = await api.get<ApiListResponse<CartAdminListData>>('/cart/admin', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      min_total: params.min_total,
      max_total: params.max_total,
      sort_by: params.sort_by,
      order: params.order,
    }
  });
  return response.data.data ?? response.data;
}

export async function getCartById(id: string): Promise<CartData> {
  const response = await api.get<ApiListResponse<CartData>>(`/cart/${id}`);
  return response.data.data ?? response.data;
}
