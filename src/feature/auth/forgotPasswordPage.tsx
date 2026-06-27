import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './forgotPasswordPage.css';
import StarBackground from '../../components/layout/starBackground';
import Logo from '../../components/layout/logo';
import { forgotPasswordApi } from './authService';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await forgotPasswordApi(email);
      // Chuyển sang bước nhập OTP, mang theo email để các bước sau dùng lại.
      navigate('/verify-otp', { state: { email: email.toLowerCase().trim() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <StarBackground count={60} />

      <div className="auth-card">
        <div className="auth-form-section">
          <Link to="/login" className="auth-back">
            ← Back
          </Link>

          <h1 className="auth-title">Password Reset</h1>

          <p className="auth-desc">
            Forgot your password? Enter your email address, and we'll send you a
            verification code to reset it.
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ marginTop: '8px' }}
            />
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isLoading}
              style={{ marginTop: '20px' }}
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </button>
          </form>
        </div>

        <div className="auth-logo-section">
          <Logo />
        </div>
      </div>
    </div>
  );
}
