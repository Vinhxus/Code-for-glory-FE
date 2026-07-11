import { useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext';
import {
  loginApi,
  registerApi,
  logoutApi,
  googleLoginApi,
  type LoginRequest,
  type RegisterRequest,
  type AuthUser,
} from './authService';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: (googleAccessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

function getInitialAuthState(): AuthState {
  const storedAccessToken = localStorage.getItem('access_token');
  const storedRefreshToken = localStorage.getItem('refresh_token');
  const storedUser = localStorage.getItem('user');

  if (storedAccessToken && storedRefreshToken && storedUser) {
    try {
      const parsedUser: AuthUser = JSON.parse(storedUser);
      return {
        user: parsedUser,
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken,
        isAuthenticated: true,
      };
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(getInitialAuthState);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await loginApi(data);

    // Lưu thông tin user để getInitialAuthState() có thể khôi phục khi nhấn F5
    localStorage.setItem('user', JSON.stringify(res.user));

    setState({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      isAuthenticated: true,
    });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    // Đăng ký tài khoản mới trên BE
    await registerApi(data);

    // Sau khi đăng ký thành công, tự động gọi login
    const res = await loginApi({ email: data.email, password: data.password });
    localStorage.setItem('user', JSON.stringify(res.user));

    setState({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      isAuthenticated: true,
    });
  }, []);

  const loginWithGoogle = useCallback(async (googleAccessToken: string) => {
    const res = await googleLoginApi(googleAccessToken);

    localStorage.setItem('user', JSON.stringify(res.user));

    setState({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      // Đảm bảo xóa sạch localStorage dữ liệu user
      localStorage.removeItem('user');

      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });

      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
