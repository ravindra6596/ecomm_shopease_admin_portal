import api from './api';
import { BASE_URL } from '@/constants/routes';
import type { Banner, BannerListParams } from '@/types';

interface ApiListResponse<T> {
  status: boolean;
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
}

interface ApiBannerResponse {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category_id: number;
  category_name: string;
  category_image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiBannersPayload {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  items: ApiBannerResponse[];
}

export async function getBanners(params: BannerListParams = {}): Promise<{
  banners: Banner[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
}> {
  const response = await api.get<ApiListResponse<ApiBannersPayload>>('/banners', {
    params: {
      search: params.query,
      page: params.page,
      limit: params.limit,
      category_id: params.category_id,
      is_active: params.is_active
    }
  });

  const payload = response.data.data ?? response.data;
  const items = (payload as ApiBannersPayload).items ?? (payload as unknown as ApiBannerResponse[]);

  return {
    banners: Array.isArray(items) ? items.map(mapBanner) : [],
    total: (payload as ApiBannersPayload).total ?? 0,
    page: (payload as ApiBannersPayload).page ?? params.page ?? 1,
    limit: (payload as ApiBannersPayload).limit ?? params.limit ?? 10,
    total_pages: (payload as ApiBannersPayload).total_pages ?? 1,
    is_previous: (payload as ApiBannersPayload).is_previous ?? false,
    is_next: (payload as ApiBannersPayload).is_next ?? false
  };
}

export async function getBannerById(id: string): Promise<Banner> {
  const response = await api.get<ApiListResponse<{ banner: ApiBannerResponse }>>(`/banners/${id}`);
  const data = response.data.data ?? response.data;
  const banner = (data as any).banner ?? data;
  return mapBanner(banner as ApiBannerResponse);
}

export async function createBanner(payload: FormData): Promise<Banner> {
  const response = await api.post<ApiListResponse<{ banner: ApiBannerResponse }>>('/banners', payload, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  const data = response.data.data ?? response.data;
  const banner = (data as any).banner ?? data;
  return mapBanner(banner as ApiBannerResponse);
}

export async function updateBanner(id: string, payload: FormData): Promise<Banner> {
  const response = await api.patch<ApiListResponse<{ banner: ApiBannerResponse }>>(`/banners/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  const data = response.data.data ?? response.data;
  const banner = (data as any).banner ?? data;
  return mapBanner(banner as ApiBannerResponse);
}

export async function deleteBanner(id: string): Promise<void> {
  await api.delete(`/banners/${id}`);
}

function mapBanner(item: ApiBannerResponse): Banner {
  return {
    id: String(item.id),
    title: item.title || '',
    description: item.description || '',
    image_url: normalizeImageUrl(item.image_url),
    category_id: item.category_id,
    category_name: item.category_name || '',
    category_image_url: normalizeImageUrl(item.category_image_url),
    is_active: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  };
}

function normalizeImageUrl(url: string) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\/+/, '')}`;
}
