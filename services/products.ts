import api from './api';
import type { Product, ProductListParams } from '@/types';

interface ApiListResponse<T> {
  status: boolean;
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
}

interface ApiProductsPayload {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  items: Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    discount?: number;
    discount_price?: number;
    return_policy?: string;
    is_featured: boolean;
    category_id: number;
    category_name: string;
    images: Array<{
      id: number;
      image_url: string;
    }>;
    is_deleted: boolean;
    created_by: string | null;
    deleted_by: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

interface ApiProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  discount?: number;
  discount_price?: number;
  return_policy?: string;
  is_featured: boolean;
  category_id: number;
  category_name: string;
  images: Array<{
    id: number;
    image_url: string;
  }>;
  is_deleted: boolean;
  created_by: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProducts(params: ProductListParams = {}): Promise<{
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
}> {
  const response = await api.get<ApiListResponse<ApiProductsPayload>>('/products', {
    params: {
      search: params.query,
      page: params.page,
      limit: params.limit,
      min_price: params.min_price,
      max_price: params.max_price,
      sort_by: params.sort_by,
      order: params.order,
      category_id: params.category_id
    }
  });

  const payload = response.data.data ?? response.data;
  const items = (payload as ApiProductsPayload).items ?? [];

  return {
    products: items.map(mapProduct),
    total: (payload as ApiProductsPayload).total ?? 0,
    page: (payload as ApiProductsPayload).page ?? 1,
    limit: (payload as ApiProductsPayload).limit ?? 10,
    total_pages: (payload as ApiProductsPayload).total_pages ?? 1,
    is_previous: (payload as ApiProductsPayload).is_previous ?? false,
    is_next: (payload as ApiProductsPayload).is_next ?? false
  };
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<ApiListResponse<{ product: ApiProductResponse }>>(`/products/${id}`);
  const data = response.data.data ?? response.data;
  const product = (data as any).product ?? data;
  return mapProduct(product);
}

function mapProduct(item: ApiProductResponse): Product {
  return {
    id: String(item.id),
    name: item.name || '',
    description: item.description || '',
    price: item.price || 0,
    discount: item.discount,
    discount_price: item.discount_price,
    return_policy: item.return_policy,
    is_featured: item.is_featured || false,
    category_id: item.category_id,
    category_name: item.category_name || '',
    images: item.images || [],
    is_deleted: item.is_deleted || false,
    created_by: item.created_by,
    deleted_by: item.deleted_by,
    created_at: item.created_at,
    updated_at: item.updated_at
  };
}

export async function createProduct(payload: FormData): Promise<Product> {
  const response = await api.post<ApiListResponse<{ product: ApiProductResponse }>>('/products', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const data = response.data.data ?? response.data;
  const product = (data as any).product ?? data;
  return mapProduct(product);
}

export async function updateProduct(id: string, payload: FormData): Promise<Product> {
  const response = await api.patch<ApiListResponse<{ product: ApiProductResponse }>>(`/products/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const data = response.data.data ?? response.data;
  const product = (data as any).product ?? data;
  return mapProduct(product);
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

export async function deleteProductImage(imageId: string): Promise<void> {
  await api.delete(`/products/images/${imageId}`);
}

export type { ApiProductsPayload, ApiProductResponse };
