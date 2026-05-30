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

const BASE_URL = ""; // TODO: điền URL backend thật vào đây
const USE_MOCK = true; // đổi thành false khi có backend thật

// MOCK DATA - xoá khi có backend thật
const MOCK_USERS: (RegisterRequest & { id: string })[] = [
  { id: "1", name: "Test User", email: "test@gmail.com", password: "123456" },
];

function mockDelay(ms = 800) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message ?? `Lỗi ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  if (USE_MOCK) {
    await mockDelay();
    const found = MOCK_USERS.find(
      (u) => u.email === data.email && u.password === data.password
    );
    if (!found) throw new Error("Email hoặc mật khẩu không đúng");
    return {
      token: "mock-token-" + found.id,
      user: { id: found.id, email: found.email, name: found.name },
    };
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}

export async function registerApi(
  data: RegisterRequest
): Promise<AuthResponse> {
  if (USE_MOCK) {
    await mockDelay();
    const exists = MOCK_USERS.find((u) => u.email === data.email);
    if (exists) throw new Error("Email này đã được đăng ký");

    const newUser = { ...data, id: String(MOCK_USERS.length + 1) };
    MOCK_USERS.push(newUser);
    return {
      token: "mock-token-" + newUser.id,
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    };
  }

  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}

export async function logoutApi(): Promise<void> {
  if (USE_MOCK) {
    await mockDelay(300);
    return;
  }

  const token = localStorage.getItem("access_token");
  await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}