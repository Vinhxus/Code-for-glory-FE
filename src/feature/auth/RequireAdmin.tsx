import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth'; // Thay đổi đường dẫn cho đúng nếu cần

interface RequireAdminProps {
  children?: ReactNode; // Đổi thành dấu '?' để children trở thành OPTIONAL (không bắt buộc)
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { user, isAuthenticated } = useAuth();

  // 1. Nếu chưa đăng nhập hoặc không phải admin, về trang chủ hoặc trang login
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
