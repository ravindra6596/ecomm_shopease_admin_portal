import api from './api';
import type { UserProfile } from '@/types';

interface ApiListResponse<T> {
  status: boolean;
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
}

interface ApiUsersPayload {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  users: Array<{
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    role: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface GetUsersParams {
  query?: string;
  role?: string;
  page?: number;
  sort_by?: 'id' | 'name' | 'email' | 'role' | 'created_at';
  order?: 'asc' | 'desc';
}

function mapUser(user: ApiUsersPayload['users'][number]): UserProfile {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role as unknown as UserProfile['role'],
    status: user.is_active ? 'active' : 'inactive',
    createdAt: user.created_at
  };
}

export async function getUsers(params: GetUsersParams = {}) {
  const response = await api.get<ApiListResponse<ApiUsersPayload>>('/users', {
    params: {
      search: params.query,
      role: params.role,
      page: params.page,
      sort_by: params.sort_by,
      order: params.order
    }
  });
 
  const payload = response.data.data ?? response.data;
  const users = (payload as ApiUsersPayload).users ?? [];
  return users.map(mapUser);
}

export async function getUserById(id: string) {
    const response = await api.get<ApiListResponse<{
      id: number;
      name: string;
      email: string;
      is_active: boolean;
      role: string;
      addresses: Array<{
        id: number;
        user_id: number;
        full_name: string;
        phone: string;
        address_line: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        is_default: boolean;
      }>;
      orders: Array<{
        id: number;
        user_name: string;
        user_id: number;
        address_id: number;
        total_amount: number;
        status: string;
        payment_status: string;
        payment_method: string;
        created_at: string;
        items: Array<{
          product_id: number;
          product_name: string;
          quantity: number;
          price: number;
          total_price: number;
        }>;
        address: {
          id: number;
          user_id: number;
          full_name: string;
          phone: string;
          address_line: string;
          city: string;
          state: string;
          country: string;
          pincode: string;
          is_default: boolean;
        };
      }>;
      created_at: string;
      updated_at: string;
    }>>(`/users/${id}`);
    
    const payload = response.data.data ?? response.data;
    const user = payload as any;
    
    return {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role as unknown as UserProfile['role'],
      status: (user.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
      createdAt: user.created_at,
      addresses: user.addresses || [],
      orders: user.orders || []
    };
  }

  export async function getCurrentUserProfile() {
    const response = await api.get<ApiListResponse<{
      id: number;
      name: string;
      email: string;
      is_active: boolean;
      role: string;
      created_at: string;
      updated_at: string;
    }>>('/users/profile');
    
    const payload = response.data.data ?? response.data;
    return mapUser(payload);
  }
