import { NavLink } from 'react-router-dom';
import QuickSettings from '../QuickSettings';
import './Header.css';

const NAV_ITEMS = [
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/shop', label: 'Shop' },
];

export default function Header() {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `header-nav-link${isActive ? ' active' : ''}`;
  return (
    <>
      <header className="header">
        <NavLink to="/" className="header-logo">
          CodeForGlory
        </NavLink>

        <nav className="header-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <QuickSettings />
          <button className="header-icon-btn" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <button className="header-profile-btn" aria-label="Profile">
            <span className="material-symbols-outlined">account_circle</span>
            Profile
          </button>
        </div>
      </header>
    </>
  );
}
