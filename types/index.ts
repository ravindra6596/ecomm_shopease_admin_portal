export type Role = 'admin' | 'manager' | 'staff' | 'customer' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  addresses?: OrderAddress[];
  orders?: Order[];
}

export interface DashboardStats {
  users: number;
  products: number;
  orders: number;
  revenue: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  todayOrders: number;
  todayDelivered: number;
  todayPending: number;

  monthOrders: number;
  monthDelivered: number;
  monthPending: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  products_count: number;
  images?: Array<{
    id: number;
    image_url: string;
  }>;
}

export interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  products_count: number;
  products: Product[];
  images?: Array<{
    id: number;
    image_url: string;
  }>;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
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

export interface ProductListParams {
  query?: string;
  page?: number;
  limit?: number;
  min_price?: number;
  max_price?: number;
  sort_by?: 'id' | 'name' | 'price' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
  category_id?: number;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category_id: number;
  category_name: string;
  category_image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BannerListParams {
  query?: string;
  page?: number;
  limit?: number;
  category_id?: number;
  is_active?: boolean;
}

export interface GetCategoriesParams {
  query?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  category_id: number;
  images?: File[];
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
  discount: number;
  discount_price: number;
}

export interface OrderAddress {
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
}

export interface Order {
  id: number;
  user_name: string;
  user_id: number;
  address_id: number;
  total_amount: number;
  total_discount_price: number;
  shipping: number;
  status: 'pending' | 'placed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'success' | 'failed';
  payment_method: 'online' | 'cod';
  created_at: string;
  items: OrderItem[];
  address: OrderAddress;
}

export interface GetOrdersResult {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  items: Order[];
}

export interface OrderListParams {
  query?: string;
  page?: number;
  limit?: number;
  sort_by?: 'id' | 'user_name' | 'total_amount' | 'status' | 'payment_status' | 'payment_method' | 'created_at';
  order?: 'asc' | 'desc';
  status?: 'pending' | 'placed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'pending' | 'success' | 'failed';
  payment_method?: 'online' | 'cod';
}

export interface CartItem {
  id: number;
  cart_id?: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartData {
  id?: number;
  user_id?: number;
  grand_total: number;
  total_items: number;
  items: CartItem[];
}

export interface CartAdminItem {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  total_items: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
}

export interface CartAdminListData {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  items: CartAdminItem[];
}

export interface WishlistItem {
  id: string;
  productName: string;
  category: string;
  price: number;
  image: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user?: {
    id: number;
    email: string;
    is_active: boolean;
    role: string;
    created_at: string;
    updated_at: string;
  };
}