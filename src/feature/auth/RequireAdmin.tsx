import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

interface RequireAdminProps {
  children: ReactNode;
  /** Trang để redirect khi đăng nhập rồi nhưng không phải admin. */
  redirectTo?: string;
}

export default function RequireAdmin({
  children,
  redirectTo = '/',
}: RequireAdminProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Chưa đăng nhập -> về /login, nhớ trang muốn vào để quay lại sau khi login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
