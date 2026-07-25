export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('karsenz_access_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('karsenz_user');
  return raw ? JSON.parse(raw) : null;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set('content-type', 'application/json');
  const token = getToken();
  if (token) headers.set('authorization', `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const body = await res.json();
  return body.data as T;
}

export async function login(email: string, password: string) {
  const data = await api<{ accessToken: string; refreshToken: string; user: unknown }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('karsenz_access_token', data.accessToken);
  localStorage.setItem('karsenz_refresh_token', data.refreshToken);
  localStorage.setItem('karsenz_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('karsenz_access_token');
  localStorage.removeItem('karsenz_refresh_token');
  localStorage.removeItem('karsenz_user');
  location.href = '/login';
}
