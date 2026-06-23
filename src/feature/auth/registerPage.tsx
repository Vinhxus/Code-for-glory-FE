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

  const { register } = useAuth(); // Lấy hàm register từ useAuth
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

    // 1. Validate Username (Từ 3-32 ký tự, không chứa ký tự lạ)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (form.username.length < 3 || form.username.length > 32) {
      newErrors.username = 'Username must be between 3 and 32 characters';
    } else if (!usernameRegex.test(form.username)) {
      newErrors.username =
        'Username can only contain letters, numbers and underscore';
    }

    // 2. Validate Password length (Tối thiểu 8 ký tự)
    if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      // 3. Validate chữ và số trong Password
      const hasLetter = /[a-zA-Z]/.test(form.password);
      const hasNumber = /[0-9]/.test(form.password);
      if (!hasLetter || !hasNumber) {
        newErrors.password =
          'Password must contain at least 1 number and 1 letter';
      }
    }

    // 4. Validate Confirm Password trùng khớp
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
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setForm({ username: '', email: '', password: '', confirmPassword: '' });
      setSuccessMsg('Success! Navigate to login...');

      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register';
      setErrors({ general: message });
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
