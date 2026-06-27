import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import QuickSettings from '../QuickSettings';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/settings';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language); //
  const theme = useSettingsStore((s) => s.theme); //[cite: 7]
  const toggleLanguage = useSettingsStore((s) => s.toggleLanguage); //[cite: 7]
  const toggleTheme = useSettingsStore((s) => s.toggleTheme); //[cite: 7]
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  const isDark = theme === 'dark'; //[cite: 7]

  const text =
    language === 'vi'
      ? {
          leaderboard: 'Bảng xếp hạng',
          shop: 'Cửa hàng',
          notifications: 'Thông báo',
          profile: 'Hồ sơ',
          languages: 'Ngôn ngữ',
          darkMode: 'Chế độ tối',
        }
      : {
          leaderboard: 'Leaderboard',
          shop: 'Shop',
          notifications: 'Notifications',
          profile: 'Profile',
          languages: 'Languages',
          darkMode: 'DarkMode',
        };

  const handleProfileClick = () => {
    setIsHeaderMenuOpen(false);
    navigate('/profile');
  };

  return (
    <header className="header">
      {/* LOGO GỐC BÊN TRÁI */}
      <NavLink
        to="/"
        className="header-logo"
        onClick={() => setIsHeaderMenuOpen(false)}
      >
        CodeForGlory
      </NavLink>

      {/* GIAO DIỆN MẶC ĐỊNH TRÊN DESKTOP */}
      <div className="header-desktop-layout">
        <nav className="header-nav">
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `header-nav-link${isActive ? ' active' : ''}`
            }
          >
            {text.leaderboard}
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `header-nav-link${isActive ? ' active' : ''}`
            }
          >
            {text.shop}
          </NavLink>
        </nav>

        <div className="header-actions">
          <QuickSettings />
          <button className="header-icon-btn" aria-label={text.notifications}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            className="header-profile-btn"
            onClick={() => navigate('/profile')}
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span>{text.profile}</span>
          </button>
        </div>
      </div>

      {/* NÚT HAMBURGER VÀNG CAM TRÊN MOBILE */}
      <button
        className="header-hamburger-toggle"
        onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
        aria-label="Toggle Navigation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* OVERLAY PHỦ MÀN HÌNH VÀ LÀM MỜ */}
      {isHeaderMenuOpen && (
        <div
          className="mobile-full-blur-overlay"
          onClick={() => setIsHeaderMenuOpen(false)}
        >
          <div
            className="mobile-clean-menu-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Profile */}
            <button
              className="mobile-clean-item font-bold"
              onClick={handleProfileClick}
            >
              <span>{text.profile}</span>
              <span className="material-symbols-outlined">account_circle</span>
            </button>

            {/* 2. Notification */}
            <button
              className="mobile-clean-item"
              onClick={() => setIsHeaderMenuOpen(false)}
            >
              <span>{text.notifications}</span>
              <span className="material-symbols-outlined">notifications</span>
            </button>

            {/* 3. Leaderboard */}
            <NavLink
              to="/leaderboard"
              className="mobile-clean-item"
              onClick={() => setIsHeaderMenuOpen(false)}
            >
              <span>{text.leaderboard}</span>
            </NavLink>

            {/* 4. Shop */}
            <NavLink
              to="/shop"
              className="mobile-clean-item"
              onClick={() => setIsHeaderMenuOpen(false)}
            >
              <span>{text.shop}</span>
            </NavLink>

            {/* 5. Languages (Bấm vào đổi thẳng chữ EN / VI luôn) */}
            <button className="mobile-clean-item" onClick={toggleLanguage}>
              <span>{text.languages}</span>
              <span className="mobile-lang-badge">
                {language === 'en' ? 'EN' : 'VI'}
              </span>
            </button>

            {/* 6. DarkMode kèm công tắc nút ON / OFF */}
            <div className="mobile-clean-item" onClick={toggleTheme}>
              <span>{text.darkMode}</span>
              <div
                className={`mobile-switch-toggle ${isDark ? 'switch-on' : ''}`}
              >
                <div className="switch-handle" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
