import { useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext';
import {
  loginApi,
  registerApi,
  logoutApi,
  type LoginRequest,
  type RegisterRequest,
} from './authService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

function getInitialAuthState(): AuthState {
  const storedToken = localStorage.getItem('access_token');
  const storedUser = localStorage.getItem('user');

  if (storedToken && storedUser) {
    try {
      const parsedUser: User = JSON.parse(storedUser);
      return { user: parsedUser, token: storedToken, isAuthenticated: true };
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }

  return { user: null, token: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(getInitialAuthState);

  const login = useCallback(async (data: LoginRequest) => {
    // Giả lập delay mạng 500ms cho giống thật
    await new Promise((resolve) => setTimeout(resolve, 500));

    let mockUser: User;
    const mockToken = 'mock-jwt-token-xyz-123';

    // Kiểm tra tài khoản để trả về đúng Role
    if (data.email === 'admin@gmail.com') {
      mockUser = {
        id: 'mock-admin-id-999',
        email: 'admin@gmail.com',
        name: 'Quốc Vinh (Admin)',
        role: 'admin', // Trả về quyền admin để pass qua RequireAdmin.tsx
      };
    } else {
      // Mặc định bất kỳ email nào khác nhập vào sẽ là User thường
      mockUser = {
        id: 'mock-user-id-001',
        email: data.email || 'user@gmail.com',
        name: 'Hoàng Vinh (User)',
        role: 'user',
      };
    }

    // Lưu thông tin vào localStorage y hệt như logic cũ của bạn
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Cập nhật State cho toàn hệ thống Frontend sử dụng
    setState({ user: mockUser, token: mockToken, isAuthenticated: true });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    // Giả lập delay mạng khi bấm đăng ký
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Khi đăng ký xong, tự động đăng nhập luôn với quyền user thường
    const mockUser: User = {
      id: 'mock-new-user-id',
      name: data.username,
      email: data.email,
      role: 'user',
    };
    const mockToken = 'mock-jwt-token-after-register';

    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setState({ user: mockUser, token: mockToken, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi().catch((err) =>
        console.error('Backend logout error:', err)
      );
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

      // Cập nhật lại state về null để các Route nhận biết
      setState({ user: null, token: null, isAuthenticated: false });

      // về trang login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
