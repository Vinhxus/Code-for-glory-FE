import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './useAuth';
import { registerApi } from './authService';
import StarBackground from '../../components/layout/starBackground';
import Logo from '../../components/layout/logo';
import './registerPage.css';

type FieldError = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccessMsg('');
  };

  const validate = (): boolean => {
    const newErrors: FieldError = {};

    const hasLetter = /[a-zA-Z]/.test(form.password);
    const hasNumber = /[0-9]/.test(form.password);
    if (!hasLetter || !hasNumber) {
      newErrors.password =
        'Password must contain at least 1 number and 1 letter';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword =
        'Confirm password must be similar to password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await registerApi({
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setForm({ username: '', email: '', password: '', confirmPassword: '' });
      setSuccessMsg('Create account successful, please sign in');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register';
      const lower = message.toLowerCase();

      if (lower.includes('email')) {
        setErrors({ email: 'Email has already existed!' });
      } else if (lower.includes('username') || lower.includes('name')) {
        setErrors({ username: 'Username has already existed!' });
      } else {
        console.error('Register error from BE:', message);
        setErrors({ general: message });
      }
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

          <h1 className="auth-title">Create an account</h1>

          {errors.general && <p className="auth-error">{errors.general}</p>}

          <form onSubmit={handleSubmit}>
            <label className="auth-label">Username:</label>
            <input
              name="username"
              className={`auth-input ${errors.username ? 'auth-input--error' : ''}`}
              placeholder="username"
              value={form.username}
              onChange={handleChange}
              required
            />
            {errors.username && <p className="auth-error">{errors.username}</p>}

            <label className="auth-label">Email:</label>
            <input
              name="email"
              type="email"
              className="auth-input"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label className="auth-label">Password:</label>
            <input
              name="password"
              type="password"
              className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
              placeholder="must contain at least 1 number and 1 letter"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className="auth-error">{errors.password}</p>}

            <label className="auth-label">Confirm password:</label>
            <input
              name="confirmPassword"
              type="password"
              className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <p className="auth-error">{errors.confirmPassword}</p>
            )}

            {successMsg && (
              <p
                className="auth-success"
                style={{
                  color: '#00e676',
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginTop: '12px',
                  marginBottom: '0',
                }}
              >
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isLoading}
              style={{ marginTop: '24px' }}
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        </div>

        <Logo />
      </div>
    </div>
  );
}
