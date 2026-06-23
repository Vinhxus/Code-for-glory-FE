export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface LoginRawResponse {
  // Backend trả token camelCase (accessToken/refreshToken).
  accessToken: string;
  refreshToken?: string;
  user: {
    _id: string;
    username: string;
    role: string;
    isFirstLogin: boolean;
    level: number;
  };
}

import {
  API_BASE_URL,
  api,
  setToken,
  clearToken,
} from '../../services/apiClient';

// Kept for backwards-compatibility with anything importing BASE_URL.
export const BASE_URL = API_BASE_URL;

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const raw = await api.post<LoginRawResponse>('/auth/login', data, {
    auth: false,
  });

  // Lưu token để các API khác (Shop, v.v.) có thể dùng Authorization header
  setToken(raw.accessToken);

  return {
    token: raw.accessToken,
    user: {
      id: raw.user._id,
      email: data.email,
      name: raw.user.username,
    },
  };
}

export async function registerApi(data: RegisterRequest): Promise<void> {
  await api.post<unknown>('/auth/register', data, { auth: false });
}

export async function logoutApi(): Promise<void> {
  // Xóa token trước để dù API lỗi vẫn logout được
  clearToken();

  try {
    await api.post<unknown>('/auth/logout');
  } catch (err) {
    console.warn('Logout API error (ignored):', err);
  }
}
