import { NavLink } from 'react-router-dom';
import QuickSettings from '../QuickSettings';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/settings';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language);
  const text =
    language === 'vi'
      ? {
          leaderboard: 'Bảng xếp hạng',
          shop: 'Cửa hàng',
          notifications: 'Thông báo',
          profile: 'Hồ sơ',
        }
      : {
          leaderboard: 'Leaderboard',
          shop: 'Shop',
          notifications: 'Notifications',
          profile: 'Profile',
        };
  const navItems = [
    { to: '/leaderboard', label: text.leaderboard },
    { to: '/shop', label: text.shop },
  ];
  const handleProfileClick = () => {
    navigate('/profile');
  };
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `header-nav-link${isActive ? ' active' : ''}`;
  return (
    <>
      <header className="header">
        <NavLink to="/" className="header-logo">
          CodeForGlory
        </NavLink>

        <nav className="header-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <QuickSettings />
          <button className="header-icon-btn" aria-label={text.notifications}>
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <button
            className="header-profile-btn"
            aria-label={text.profile}
            onClick={handleProfileClick}
          >
            <span className="material-symbols-outlined">account_circle</span>
            {text.profile}
          </button>
        </div>
      </header>
    </>
  );
}
