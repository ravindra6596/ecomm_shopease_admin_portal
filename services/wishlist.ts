import api from './api';

export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  discount_price: number;
  discount: number;
  created_at: string;
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const response = await api.get('/wishlist');
  return response.data.data ?? response.data;
}

export async function getWishlistItem(id: number): Promise<WishlistItem> {
  const response = await api.get(`/wishlist/${id}`);
  return response.data.data ?? response.data;
}
