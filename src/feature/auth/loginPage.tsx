import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import StarBackground from '../../components/layout/starBackground';
import Logo from '../../components/layout/logo';
import './loginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <StarBackground count={60} />

      <div className="auth-card">
        <div className="auth-form-section">
          <h1 className="auth-title">Sign in</h1>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label className="auth-label">Email:</label>
            <input
              type="email"
              className="auth-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="auth-label">Password:</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="auth-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button className="auth-btn-google">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Sign in with Google
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up.</Link>
          </p>
        </div>

        <div className="auth-logo-section">
          <Logo />
        </div>
      </div>
    </div>
  );
}
