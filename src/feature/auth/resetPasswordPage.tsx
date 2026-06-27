import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import './forgotPasswordPage.css';
import StarBackground from '../../components/layout/starBackground';
import Logo from '../../components/layout/logo';
import { resetPasswordApi } from './authService';

export default function ResetPasswordPage() {
  const location = useLocation();
  const state = location.state as {
    email?: string;
    resetToken?: string;
  } | null;
  const email = state?.email ?? '';
  const resetToken = state?.resetToken ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Thiếu email/resetToken (vd vào thẳng URL) -> quay lại bước đầu.
  if (!email || !resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Khớp ràng buộc của BE ResetPasswordDto: >= 8 ký tự, có chữ và số.
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must contain both letters and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Confirm password must match.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordApi({
        email,
        resetToken,
        newPassword,
        confirmPassword,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <StarBackground count={60} />

      <div className="auth-card">
        <div className="auth-form-section">
          <h1 className="auth-title">Set New Password</h1>

          {!done ? (
            <>
              <p className="auth-desc">
                Create a new password for <strong>{email}</strong>.
              </p>

              {error && <p className="auth-error">{error}</p>}

              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ marginTop: '8px' }}
                />
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ marginTop: '12px' }}
                />
                <button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={isLoading}
                  style={{ marginTop: '20px' }}
                >
                  {isLoading ? 'Saving...' : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="auth-success">
              <p>✅ Your password has been reset successfully.</p>
              <Link
                to="/login"
                className="auth-btn-primary"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '20px',
                  textDecoration: 'none',
                }}
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>

        <div className="auth-logo-section">
          <Logo />
        </div>
      </div>
    </div>
  );
}
