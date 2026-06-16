import api from './api';
import type { Category, CategoryDetail, Product } from '@/types';

interface ApiListResponse<T> {
  status: boolean;
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
}

interface ApiCategoriesPayload {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  items: Array<{
    id: number;
    name: string;
    images: Array<{
      id: number;
      image_url: string;
    }>;
    products_count: number;
    is_deleted: boolean;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

interface ApiCategoryDetailResponse {
  id: number;
  name: string;
  products_count: number;
  images: Array<{
    id: number;
    image_url: string;
  }>;
  products: Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    category_name: string | null;
    images: Array<{
      id: number;
      image_url: string;
    }>;
    is_deleted: boolean;
    created_by: number | null;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
  }>;
  is_deleted: boolean;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetCategoriesParams {
  query?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
}

export interface CreateCategoryPayload {
  name: string;
  images?: File;
}

export interface UpdateCategoryPayload {
  name: string;
  images?: File;
}

function mapCategory(item: ApiCategoriesPayload['items'][number]): Category {

   return {
     id: String(item.id),
     name: item.name || 'Unnamed Category',
     slug: (item.name || 'unnamed-category').toLowerCase().replace(/\s+/g, '-'),
     products_count: item.products_count || 0,
     images: item.images || []
   };
 }

function mapCategoryDetail(item: ApiCategoryDetailResponse): CategoryDetail {
   return {
     id: String(item.id),
     name: item.name || 'Unnamed Category',
     slug: (item.name || 'unnamed-category').toLowerCase().replace(/\s+/g, '-'),
     products_count: item.products_count || 0,
     products: item.products.map(mapProductFromCategory),
     images: item.images || [],
     is_deleted: item.is_deleted || false,
     created_at: item.created_at,
     updated_at: item.updated_at
   };
}

function mapProductFromCategory(item: any): Product {
   return {
     id: String(item.id),
     name: item.name || '',
     description: item.description || '',
     price: item.price || 0,
     category_id: item.category_id,
     category_name: item.category_name || '',
     images: item.images?.map((img: any) => ({
       id: img.id,
       image_url: img.image_url
     })) || [],
     is_deleted: item.is_deleted || false,
     created_by: item.created_by?.toString() || null,
     deleted_by: item.deleted_by || null,
     created_at: item.created_at || new Date().toISOString(),
     updated_at: item.updated_at || new Date().toISOString()
   };
}

export interface GetCategoriesResult {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
}

export async function getCategories(params: GetCategoriesParams = {}): Promise<GetCategoriesResult> {
  const response = await api.get<ApiListResponse<ApiCategoriesPayload>>('/categories', {
    params: {
      search: params.query,
      page: params.page,
      limit: params.limit,
      sort_by: params.sort_by,
      order: params.order
    }
  });

  const payload = response.data.data ?? response.data;
  const items = (payload as ApiCategoriesPayload).items ?? [];
  
  return {
    categories: items.map(mapCategory),
    total: (payload as ApiCategoriesPayload).total ?? 0,
    page: (payload as ApiCategoriesPayload).page ?? params.page ?? 1,
    limit: (payload as ApiCategoriesPayload).limit ?? params.limit ?? 10,
    total_pages: (payload as ApiCategoriesPayload).total_pages ?? 1,
    is_previous: (payload as ApiCategoriesPayload).is_previous ?? false,
    is_next: (payload as ApiCategoriesPayload).is_next ?? false
  };
}

export async function createCategory(payload: CreateCategoryPayload) {
  const formData = new FormData();
  formData.append('name', payload.name);
  if (payload.images) {
    formData.append('images', payload.images);
  }

  const response = await api.post<ApiListResponse<{ category: ApiCategoriesPayload['items'][number] }>>('/categories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const data = response.data.data ?? response.data;
  const category = (data as any).category ?? data;
  return mapCategory(category);
}

export async function updateCategory(id: string, payload: UpdateCategoryPayload) {
  const formData = new FormData();
  formData.append('name', payload.name);
  if (payload.images) {
    formData.append('images', payload.images);
  }

  const response = await api.patch<ApiListResponse<{ category: ApiCategoriesPayload['items'][number] }>>(`/categories/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const data = response.data.data ?? response.data;
  const category = (data as any).category ?? data;
  return mapCategory(category);
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
}

export async function getCategoryById(id: string) {
   const response = await api.get<ApiListResponse<{ category: ApiCategoryDetailResponse }>>(`/categories/${id}`);
   const data = response.data.data ?? response.data;
   const category = (data as any).category ?? data;
   return mapCategoryDetail(category);
 }