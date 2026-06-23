export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Cấu trúc map chính xác theo dữ liệu từ NestJS Backend
interface LoginRawResponse {
  message: string;
  accessToken: string; // NestJS trả về accessToken thay vì access_token
  refreshToken: string;
  accessExpiresIn: number;
  user: {
    _id: string;
    email: string;
    name: string;
    role: string;
    is_first_login: boolean;
    level: string;
  };
}

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message ?? `Lỗi ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const raw = await handleResponse<LoginRawResponse>(res);

  // Lưu đúng trường accessToken từ NestJS
  localStorage.setItem('access_token', raw.accessToken);

  return {
    token: raw.accessToken,
    user: {
      id: raw.user._id,
      email: raw.user.email,
      name: raw.user.name,
      role: raw.user.role,
    },
  };
}

export async function registerApi(data: RegisterRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await handleResponse<unknown>(res);
}

export async function logoutApi(): Promise<void> {
  const token = localStorage.getItem('access_token');
  localStorage.removeItem('access_token');

  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    await handleResponse<unknown>(res);
  } catch (err) {
    console.warn('Logout API error (ignored):', err);
  }
}
