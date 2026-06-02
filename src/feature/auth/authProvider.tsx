import { useState, useCallback, type ReactNode } from 'react';
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
  const [state, setState] = useState<AuthState>(getInitialAuthState);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await loginApi(data);
    localStorage.setItem('access_token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isAuthenticated: true });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await registerApi(data);
    const res = await loginApi({ email: data.email, password: data.password });
    localStorage.setItem('access_token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setState({ user: null, token: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
