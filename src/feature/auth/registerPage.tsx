import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './useAuth';
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
  const EMPTY_FORM = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldError>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Đảm bảo form luôn trống khi vào trang, kể cả khi browser phục hồi
  // trang từ back-forward cache (bfcache) sau khi bấm nút Back/Forward.
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setForm(EMPTY_FORM);
        setErrors({});
        setSuccessMsg('');
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    // Dọn dẹp listener khi component unmount nhé bạn
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []); // Mảng dependency rỗng để chỉ lắng nghe sự kiện khi vào trang

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccessMsg('');
  };

  const validate = (): boolean => {
    const newErrors: FieldError = {};

    if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (form.password.length < 8) {
      // Khớp với @MinLength(8) của Backend
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      const hasLetter = /[a-zA-Z]/.test(form.password);
      const hasNumber = /[0-9]/.test(form.password);
      if (!hasLetter || !hasNumber) {
        newErrors.password =
          'Password must contain at least 1 number and 1 letter';
      }
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password must match';
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

      setForm(EMPTY_FORM);
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

          <form onSubmit={handleSubmit} autoComplete="off">
            <label className="auth-label">Username:</label>
            <input
              name="username"
              className={`auth-input ${errors.username ? 'auth-input--error' : ''}`}
              placeholder="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="new-password"
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
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && (
              <p className="auth-error">{errors.confirmPassword}</p>
            )}

            {successMsg && (
              <p
                className="auth-success-text"
                style={{ marginTop: '12px', color: '#10b981' }}
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

        <div className="auth-logo-section">
          <Logo />
        </div>
      </div>
    </div>
  );
}
