import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import './forgotPasswordPage.css';
import StarBackground from '../../components/layout/starBackground';
import Logo from '../../components/layout/logo';
import { forgotPasswordApi, verifyOtpApi } from './authService';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Nếu vào thẳng trang này mà chưa qua bước nhập email -> quay lại bước đầu.
  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsLoading(true);
    try {
      const resetToken = await verifyOtpApi(email, code);
      // Mang email + resetToken sang bước đặt mật khẩu mới.
      navigate('/reset-password', { state: { email, resetToken } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setResending(true);
    try {
      await forgotPasswordApi(email);
      setInfo('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <StarBackground count={60} />

      <div className="auth-card">
        <div className="auth-form-section">
          <Link to="/forgot-password" className="auth-back">
            ← Back
          </Link>

          <h1 className="auth-title">Enter Code</h1>

          <p className="auth-desc">
            We sent a 6-digit verification code to <strong>{email}</strong>.
            Enter it below to continue.
          </p>

          {error && <p className="auth-error">{error}</p>}
          {info && (
            <p
              className="auth-desc"
              style={{ color: '#81dc5a', marginTop: '8px' }}
            >
              {info}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="auth-input"
              placeholder="6-digit code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              required
              style={{ marginTop: '8px', letterSpacing: '0.3em' }}
            />
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isLoading || code.length !== 6}
              style={{ marginTop: '20px' }}
            >
              {isLoading ? 'Verifying...' : 'Continue'}
            </button>
          </form>

          <p className="auth-desc" style={{ marginTop: '16px' }}>
            Didn't get the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: '#93c5fd',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit',
              }}
            >
              {resending ? 'Resending...' : 'Resend'}
            </button>
          </p>
        </div>

        <div className="auth-logo-section">
          <Logo />
        </div>
      </div>
    </div>
  );
}
