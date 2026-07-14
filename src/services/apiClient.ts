// Centralized API client for talking to the backend.
// Base URL is read from VITE_API_URL (see .env), falling back to localhost:3000.

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  'http://localhost:3000/api';

export const TOKEN_KEY = 'access_token';
const GUEST_USER_KEY = 'cg_guest_user_id_v1';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Guest mode (no login):
 * - Generate a stable pseudo Mongo ObjectId (24 hex chars) and store in localStorage.
 * - Backend will use this id as "userId" for learning-path progress so progress isn't shared
 *   across all anonymous users (demo user).
 */
export function getOrCreateGuestUserId(): string {
  try {
    const existing = localStorage.getItem(GUEST_USER_KEY);
    if (existing && /^[0-9a-f]{24}$/i.test(existing)) return existing;

    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    const id = toHex(bytes); // 24 hex chars
    localStorage.setItem(GUEST_USER_KEY, id);
    return id;
  } catch {
    // Fallback: still return something deterministic per-tab session
    const id = '000000000000000000000001';
    return id;
  }
}

function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function guestHeader(): Record<string, string> {
  // Only attach guest id when user is not logged in
  const token = getToken();
  if (token) return {};
  return { 'x-guest-user-id': getOrCreateGuestUserId() };
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  /** Set to true to skip attaching the Authorization header. */
  auth?: false;
}

// Backend bọc lỗi trong envelope { data: null, error: { message }, meta }.
// Một số lỗi (vd validation) trả message dạng mảng -> gộp lại thành chuỗi.
function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const err = (payload as { error?: { message?: unknown } }).error;
  const raw =
    err && typeof err === 'object' && 'message' in err
      ? (err as { message?: unknown }).message
      : (payload as { message?: unknown }).message;
  if (Array.isArray(raw)) return raw.join(', ');
  return raw != null ? String(raw) : null;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(auth === false ? {} : { ...authHeader(), ...guestHeader() }),
    ...((headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: finalHeaders,
    ...rest,
  });

  // 204 No Content / empty body
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // Token expired or invalid: clear it so the app can redirect to login.
    if (response.status === 401) {
      clearToken();
    }
    const message =
      extractErrorMessage(payload) ?? `API request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  // Backend bọc mọi response thành công trong envelope { data, meta }.
  // Trả thẳng phần `data` để các service dùng trực tiếp.
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    'meta' in payload
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
