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

// Cấu trúc User đồng bộ với FE state
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Khớp hoàn toàn với thực tế Object trả về từ NestJS AuthController
interface LoginRawResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
    [key: string]: unknown; // Cho phép các trường mở rộng khác từ BE
  };
}

export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// BE bọc MỌI response trong envelope:
//  - thành công: { data: <payload>, meta }
//  - lỗi:        { data: null, error: { message: string | string[] }, meta }
// handleResponse bóc lớp envelope này ra để caller dùng trực tiếp payload,
// và gộp mảng message (vd lỗi validation) thành một chuỗi.
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

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(extractErrorMessage(payload) ?? `Lỗi ${res.status}`);
  }

  // Bóc envelope { data, meta } nếu có; ngược lại trả nguyên payload.
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

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const raw = await handleResponse<LoginRawResponse>(res);

  if (!raw || !raw.accessToken || !raw.refreshToken) {
    throw new Error('Login fail: Do not receive tokens from system.');
  }

  // Lưu cả 2 token vào localStorage để phục vụ cho việc Refresh tự động sau này
  localStorage.setItem('access_token', raw.accessToken);
  localStorage.setItem('refresh_token', raw.refreshToken);

  return {
    accessToken: raw.accessToken,
    refreshToken: raw.refreshToken,
    user: {
      id: raw.user?._id ?? '',
      email: raw.user?.email ?? '',
      name: raw.user?.username ?? '', // Map username của BE thành name hiển thị ở FE
      role: raw.user?.role ?? 'user',
    },
  };
}

export async function registerApi(data: RegisterRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // BE RegisterDto nhận vào chính xác cụm dữ liệu này
    body: JSON.stringify({
      username: data.username.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      confirmPassword: data.confirmPassword,
    }),
  });
  await handleResponse<unknown>(res);
}

export async function logoutApi(): Promise<void> {
  const refreshToken = localStorage.getItem('refresh_token');

  // Xóa token ở local trước để đảm bảo trải nghiệm người dùng nhanh chóng
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  if (!refreshToken) return;

  try {
    // BE route /auth/logout áp dụng @Public() nên không cần Bearer token ở Header,
    // nhưng cần truyền đúng RefreshTokenDto dạng { "refreshToken": "..." } trong Body.
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    await handleResponse<unknown>(res);
  } catch (err) {
    console.warn('Logout API error (ignored):', err);
  }
}

// ===== Password reset flow (forgot -> verify OTP -> reset) =====

export interface VerifyOtpResponse {
  resetToken: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

/** Bước 1: yêu cầu gửi mã OTP về email. BE luôn trả 200 dù email có tồn tại hay không. */
export async function forgotPasswordApi(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase().trim() }),
  });
  await handleResponse<unknown>(res);
}

/** Bước 2: xác thực mã OTP (6 số), nhận về resetToken dùng cho bước 3. */
export async function verifyOtpApi(
  email: string,
  code: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      code: code.trim(),
    }),
  });
  const data = await handleResponse<VerifyOtpResponse>(res);
  if (!data?.resetToken) {
    throw new Error('Verify fail: missing reset token from system.');
  }
  return data.resetToken;
}

/** Bước 3: đặt mật khẩu mới bằng resetToken vừa nhận. */
export async function resetPasswordApi(
  data: ResetPasswordRequest
): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email.toLowerCase().trim(),
      resetToken: data.resetToken,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    }),
  });
  await handleResponse<unknown>(res);
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export async function refreshApi(): Promise<RefreshResponse> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }), // Gửi kèm token cũ lên theo đúng DTO của BE
  });

  if (!res.ok) {
    // Nếu refresh thất bại (vớ phải token giả, hết hạn hoàn toàn...), xóa sạch và ném lỗi
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    throw new Error('Refresh token expired or invalid');
  }

  // BE bọc response trong { data, meta } -> bóc lớp envelope ra.
  const data = await handleResponse<RefreshResponse>(res);

  // Lưu token mới vào kho
  localStorage.setItem('access_token', data.accessToken);
  localStorage.setItem('refresh_token', data.refreshToken);

  return data;
}
