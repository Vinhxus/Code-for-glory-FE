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
  return {
    user: {
      id: 'mock-admin-id-123',
      name: 'Hoàng Quốc Vinh (Admin Mock)',
      email: 'admin@codeforglory.com',
      role: 'admin', // Ép quyền admin ở đây để vượt qua RequireAdmin
    },
    token: 'mock-token-xyz',
    isAuthenticated: true, // Ép trạng thái đã đăng nhập
  };

  // const storedToken = localStorage.getItem('access_token');
  // const storedUser = localStorage.getItem('user');

  // if (storedToken && storedUser) {
  //   try {
  //     const parsedUser: User = JSON.parse(storedUser);
  //     return { user: parsedUser, token: storedToken, isAuthenticated: true };
  //   } catch {
  //     localStorage.removeItem('access_token');
  //     localStorage.removeItem('user');
  //   }
  // }

  // return { user: null, token: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(getInitialAuthState);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await loginApi(data);
    // loginApi đã set access_token, chỉ cần set user
    localStorage.setItem('user', JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isAuthenticated: true });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await registerApi(data);
    const res = await loginApi({ email: data.email, password: data.password });
    localStorage.setItem('user', JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isAuthenticated: true });
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
