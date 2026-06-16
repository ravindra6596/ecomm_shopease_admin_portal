import api from './api';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/constants/routes';
import type { AuthResponse, UserProfile } from '@/types';

interface AuthApiWrapper {
  status: boolean;
  statusCode: number;
  error: string | null;
  message: string;
  data: AuthResponse & { user?: UserProfile };
}

export async function loginUser(payload: { email: string; password: string }) {
  const response = await api.post<AuthApiWrapper>('/auth/login', payload);
  return response.data.data ?? response.data;
}

export async function registerUser(payload: { name: string; email: string; password: string }) {
  const response = await api.post<AuthApiWrapper>('/auth/register', payload);
  return response.data.data ?? response.data;
}

export function saveAuthSession(token: string, user?: UserProfile) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
