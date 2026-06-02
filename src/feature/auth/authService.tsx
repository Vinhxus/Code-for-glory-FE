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
  };
}

// Raw response shape từ BE login
interface LoginRawResponse {
  access_token: string;
  user: {
    _id: string;
    name: string;
    role: string;
    is_first_login: boolean;
    level: string;
  };
}

export const BASE_URL = ''; // TODO: điền URL backend vào đây

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
  return {
    token: raw.access_token,
    user: {
      id: raw.user._id,
      email: data.email,
      name: raw.user.name,
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
  await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}
