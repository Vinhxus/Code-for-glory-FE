import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT';
import type { I18nKey } from '../i18n/translations';
import { useAuth } from '../feature/auth/useAuth';

type NavItem = {
  to: string;
  end?: boolean;
  icon: string;
  labelKey: I18nKey;
  // Hỗ trợ kiểu text cứng nếu hệ thống đa ngôn ngữ i18n chưa dịch kịp chuỗi admin
  fallbackLabel?: string;
  color: string;
  glow: string;
};

// ================= MENU CHO NGƯỜI CHƠI THÔNG THƯỜNG =================
const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    end: true,
    icon: 'map', // Khớp với MAP
    labelKey: 'nav.map',
    color: '#ff7e5f',
    glow: 'rgba(255,126,95,0.45)',
  },
  {
    to: '/battle',
    icon: 'swords', // Khớp với BATTLE
    labelKey: 'nav.battle',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.45)',
  },
  {
    to: '/practice',
    icon: 'exercise', // Khớp với PRACTICE
    labelKey: 'nav.practice',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.45)',
  },
  {
    to: '/history',
    icon: 'history', // Khớp với HISTORY
    labelKey: 'nav.history',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.45)',
  },
];

// ================= MENU DÀNH RIÊNG CHO TÀI KHOẢN ADMIN =================
const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    to: '/admin/quest-node',
    icon: 'shield_person',
    labelKey: 'nav.map',
    fallbackLabel: 'Admin Map',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.45)',
  },
  {
    to: '/admin/battle',
    icon: 'gavel',
    labelKey: 'nav.battle',
    fallbackLabel: 'Admin Battle',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.45)',
  },
  {
    to: '/admin/enforcement',
    icon: 'policy',
    labelKey: 'nav.enforcement',
    fallbackLabel: 'Enforcement',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.45)',
  },
];

const STREAK_COLOR = '#fbbf24';
const STREAK_GLOW = 'rgba(251,191,36,0.45)';

function SideNav() {
  const t = useT();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  // ===== Responsive: phát hiện mobile =====
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lấy thông tin user hiện tại từ useAuth để check quyền
  const { user, logout } = useAuth();

  const isVi = t('nav.map') === 'Bản đồ';
  const text = isVi
    ? {
        logout: 'Đăng xuất',
        player: 'Người chơi',
        novice: 'Tân binh',
        streak: 'Streak',
        adminSection: 'Quản trị hệ thống',
      }
    : {
        logout: 'Log out',
        player: 'Player',
        novice: 'Novice',
        streak: 'Streak',
        adminSection: 'Admin Panel',
      };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  // Chọn danh sách menu dựa theo quyền admin hoặc user thông thường
  const currentNavItems = user?.role === 'admin' ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. GIAO DIỆN MOBILE: BOTTOM NAVIGATION BAR (Hiển thị khi màn hình < 768px)  */}
      {/* ========================================================================= */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#090814] border-t border-white/5 px-2 pb-safe-bottom">
          <div className="flex justify-around items-center h-20 max-w-md mx-auto relative">
            {currentNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="flex flex-col items-center justify-center w-20 h-full relative group"
              >
                {({ isActive }) => (
                  <>
                    {/* Hộp nền bo cong mờ bọc xung quanh Icon khi được Active giống ảnh mẫu */}
                    <div
                      className={`absolute w-16 h-10 rounded-2xl transition-all duration-300 -translate-y-2 ${
                        isActive
                          ? 'bg-white/10 opacity-100 scale-100'
                          : 'bg-transparent opacity-0 scale-75 group-hover:opacity-50'
                      }`}
                      style={{
                        boxShadow: isActive
                          ? `0 0 15px -2px ${item.glow}`
                          : 'none',
                      }}
                    />

                    {/* Icon hiển thị bằng Material Symbols */}
                    <span
                      className="material-symbols-outlined z-10 text-[26px] transition-all duration-200 -translate-y-2"
                      style={{
                        color: isActive ? item.color : '#64748b',
                        filter: isActive
                          ? `drop-shadow(0 0 10px ${item.glow})`
                          : 'none',
                        fontVariationSettings: isActive
                          ? "'FILL' 1, 'wght' 500"
                          : "'FILL' 0, 'wght' 400",
                      }}
                    >
                      {item.icon}
                    </span>

                    {/* Nhãn chữ chữ in hoa (MAP, BATTLE,...) đặt tuyệt đối sát đáy */}
                    <span
                      className="absolute bottom-2 text-[11px] font-bold tracking-wider uppercase transition-colors duration-200"
                      style={{
                        color: isActive ? '#e2e8f0' : '#475569',
                      }}
                    >
                      {item.fallbackLabel || t(item.labelKey)}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GIAO DIỆN DESKTOP: SIDEBAR TRƯỢT TRÁI (Hiển thị khi màn hình >= 768px)   */}
      {/* ========================================================================= */}
      {!isMobile && (
        <aside
          className="fixed left-0 top-0 z-[60] flex h-full flex-col items-start border-r border-[color:var(--cg-border)] bg-[color:var(--cg-sidebar)] py-5"
          style={{
            width: 72,
            transition:
              'width 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s ease',
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.width = '200px';
            (e.currentTarget as HTMLElement).style.boxShadow =
              '0 0 60px rgba(0,0,0,0.45), 4px 0 32px rgba(255,126,95,0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.width = '72px';
            (e.currentTarget as HTMLElement).style.boxShadow =
              '0 0 40px rgba(0,0,0,0.3)';
            setShowMenu(false);
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(255,126,95,0.12) 0%, transparent 70%)',
            }}
          />

          {/* Logo */}
          <div className="mb-6 flex w-full items-center px-4">
            <div className="relative flex items-center justify-center flex-shrink-0 w-10 h-10">
              <div className="absolute inset-0 rounded-xl bg-[#ff7e5f]/20 blur-md animate-pulse-glow" />
              <img
                alt="Logo"
                className="relative h-8 w-12 object-contain drop-shadow-[0_0_8px_rgba(255,126,95,0.6)]"
                src="/component_2_2x.png"
              />
            </div>
            <span
              className="ml-3 font-['Lexend'] text-sm font-bold tracking-tight text-[color:var(--cg-text)] whitespace-nowrap"
              style={{
                opacity: 0,
                transition: 'opacity 0.2s ease 0.1s',
                minWidth: 0,
              }}
              ref={(el) => {
                if (!el) return;
                const parent = el.closest('aside');
                if (!parent) return;
                const obs = new ResizeObserver(() => {
                  const w = (parent as HTMLElement).offsetWidth;
                  el.style.opacity = w > 100 ? '1' : '0';
                });
                obs.observe(parent);
              }}
            >
              CodeForGlory
            </span>
          </div>

          <div
            className="w-full h-px mb-4"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--cg-border), transparent)',
            }}
          />

          {/* Nav items cho Học viên */}
          <nav className="flex w-full flex-col gap-1 px-2 flex-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'group relative flex w-full items-center gap-3 rounded-xl py-3 px-3 transition-all duration-200',
                    isActive
                      ? 'text-[color:var(--cg-coral)]'
                      : 'text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]',
                  ].join(' ')
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background:
                          'linear-gradient(90deg, rgba(255,126,95,0.15) 0%, transparent 100%)',
                        boxShadow: 'inset 3px 0 0 ' + item.color,
                      }
                    : {}
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="material-symbols-outlined flex-shrink-0 text-[22px] transition-all duration-200"
                      style={{
                        color: isActive ? item.color : undefined,
                        filter: isActive
                          ? `drop-shadow(0 0 8px ${item.glow})`
                          : undefined,
                        transform: isActive ? 'scale(1.12)' : undefined,
                      }}
                    >
                      {item.icon}
                    </span>

                    <span
                      className="text-[13px] font-semibold whitespace-nowrap overflow-hidden"
                      style={{
                        maxWidth: 120,
                        opacity: 0,
                        transform: 'translateX(-6px)',
                        transition:
                          'opacity 0.18s ease 0.08s, transform 0.18s ease 0.08s',
                      }}
                      ref={(el) => {
                        if (!el) return;
                        const parent = el.closest('aside');
                        if (!parent) return;
                        const obs = new ResizeObserver(() => {
                          const w = (parent as HTMLElement).offsetWidth;
                          if (w > 100) {
                            el.style.opacity = '1';
                            el.style.transform = 'translateX(0)';
                          } else {
                            el.style.opacity = '0';
                            el.style.transform = 'translateX(-6px)';
                          }
                        });
                        obs.observe(parent);
                      }}
                    >
                      {t(item.labelKey)}
                    </span>

                    {isActive && (
                      <span
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: item.color,
                          boxShadow: `0 0 6px ${item.glow}`,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* ================= KHU VỰC ADMIN PANEL ================= */}
            {user?.role === 'admin' && (
              <>
                <div
                  className="w-full h-px my-3"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--cg-border), transparent)',
                  }}
                />

                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-3 mb-1 block select-none whitespace-nowrap transition-opacity duration-200"
                  style={{ color: 'var(--cg-coral)', opacity: 0 }}
                  ref={(el) => {
                    if (!el) return;
                    const parent = el.closest('aside');
                    if (!parent) return;
                    const obs = new ResizeObserver(() => {
                      el.style.opacity =
                        (parent as HTMLElement).offsetWidth > 100 ? '0.6' : '0';
                    });
                    obs.observe(parent);
                  }}
                >
                  {text.adminSection}
                </span>

                {ADMIN_NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'group relative flex w-full items-center gap-3 rounded-xl py-3 px-3 transition-all duration-200',
                        isActive
                          ? 'text-white'
                          : 'text-[color:var(--cg-text-muted)] hover:text-white',
                      ].join(' ')
                    }
                    style={({ isActive }) =>
                      isActive
                        ? {
                            background: `linear-gradient(90deg, ${item.glow} 0%, transparent 100%)`,
                            boxShadow: 'inset 3px 0 0 ' + item.color,
                          }
                        : {}
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className="material-symbols-outlined flex-shrink-0 text-[22px] transition-all duration-200"
                          style={{
                            color: isActive ? item.color : undefined,
                            filter: isActive
                              ? `drop-shadow(0 0 8px ${item.glow})`
                              : undefined,
                            transform: isActive ? 'scale(1.12)' : undefined,
                          }}
                        >
                          {item.icon}
                        </span>

                        <span
                          className="text-[13px] font-semibold whitespace-nowrap overflow-hidden"
                          style={{
                            maxWidth: 120,
                            opacity: 0,
                            transform: 'translateX(-6px)',
                            transition:
                              'opacity 0.18s ease 0.08s, transform 0.18s ease 0.08s',
                          }}
                          ref={(el) => {
                            if (!el) return;
                            const parent = el.closest('aside');
                            if (!parent) return;
                            const obs = new ResizeObserver(() => {
                              const w = (parent as HTMLElement).offsetWidth;
                              if (w > 100) {
                                el.style.opacity = '1';
                                el.style.transform = 'translateX(0)';
                              } else {
                                el.style.opacity = '0';
                                el.style.transform = 'translateX(-6px)';
                              }
                            });
                            obs.observe(parent);
                          }}
                        >
                          {item.fallbackLabel}
                        </span>

                        {isActive && (
                          <span
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                            style={{
                              background: item.color,
                              boxShadow: `0 0 6px ${item.glow}`,
                            }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <div
            className="w-full h-px mt-2 mb-3"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--cg-border), transparent)',
            }}
          />

          {/* Nút Streak */}
          <div className="w-full px-2 mb-2">
            <NavLink
              to="/streak"
              className={({ isActive }) =>
                [
                  'group relative flex w-full items-center gap-3 rounded-xl py-3 px-3 transition-all duration-200',
                  isActive
                    ? 'text-[#fbbf24]'
                    : 'text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]',
                ].join(' ')
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background:
                        'linear-gradient(90deg, rgba(251,191,36,0.15) 0%, transparent 100%)',
                      boxShadow: 'inset 3px 0 0 ' + STREAK_COLOR,
                    }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined flex-shrink-0 text-[22px] transition-all duration-200"
                    style={{
                      color: isActive ? STREAK_COLOR : undefined,
                      filter: isActive
                        ? `drop-shadow(0 0 8px ${STREAK_GLOW})`
                        : undefined,
                      transform: isActive ? 'scale(1.12)' : undefined,
                    }}
                  >
                    local_fire_department
                  </span>

                  <span
                    className="text-[13px] font-semibold whitespace-nowrap overflow-hidden"
                    style={{
                      maxWidth: 120,
                      opacity: 0,
                      transform: 'translateX(-6px)',
                      transition:
                        'opacity 0.18s ease 0.08s, transform 0.18s ease 0.08s',
                    }}
                    ref={(el) => {
                      if (!el) return;
                      const parent = el.closest('aside');
                      if (!parent) return;
                      const obs = new ResizeObserver(() => {
                        const w = (parent as HTMLElement).offsetWidth;
                        if (w > 100) {
                          el.style.opacity = '1';
                          el.style.transform = 'translateX(0)';
                        } else {
                          el.style.opacity = '0';
                          el.style.transform = 'translateX(-6px)';
                        }
                      });
                      obs.observe(parent);
                    }}
                  >
                    {text.streak}
                  </span>

                  {isActive && (
                    <span
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: STREAK_COLOR,
                        boxShadow: `0 0 6px ${STREAK_GLOW}`,
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </div>

          {/* Avatar & Logout */}
          <div className="w-full px-2 relative">
            {showMenu && (
              <div className="absolute bottom-full left-2 right-2 mb-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-sidebar)] p-1.5 shadow-lg backdrop-blur-xl z-50">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--cg-text)] transition-colors hover:bg-[#ff7e5f]/10 hover:text-[#ff7e5f]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    logout
                  </span>
                  <span className="whitespace-nowrap">{text.logout}</span>
                </button>
              </div>
            )}

            <div
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-[color:var(--cg-container-a16)] cursor-pointer group"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="relative flex-shrink-0 w-8 h-8">
                <svg
                  className="absolute inset-0 animate-spin-slow"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="rgba(255,126,95,0.15)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="#ff7e5f"
                    strokeWidth="2"
                    strokeDasharray="62"
                    strokeDashoffset="20"
                    strokeLinecap="round"
                    style={{ opacity: 0.7 }}
                  />
                </svg>
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#ff7e5f] to-[#a78bfa] flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </div>

              <div
                className="overflow-hidden"
                style={{
                  opacity: 0,
                  transform: 'translateX(-6px)',
                  transition:
                    'opacity 0.18s ease 0.08s, transform 0.18s ease 0.08s',
                }}
                ref={(el) => {
                  if (!el) return;
                  const parent = el.closest('aside');
                  if (!parent) return;
                  const obs = new ResizeObserver(() => {
                    const w = (parent as HTMLElement).offsetWidth;
                    if (w > 100) {
                      el.style.opacity = '1';
                      el.style.transform = 'translateX(0)';
                    } else {
                      el.style.opacity = '0';
                      el.style.transform = 'translateX(-6px)';
                    }
                  });
                  obs.observe(parent);
                }}
              >
                <div className="text-[12px] font-bold text-[color:var(--cg-text)] whitespace-nowrap truncate max-w-[100px]">
                  {user?.name ?? text.player}
                </div>
                <div className="text-[10px] text-[color:var(--cg-coral)] font-semibold whitespace-nowrap">
                  {user?.role === 'admin'
                    ? 'Administrator'
                    : `Lv.1 ${text.novice}`}
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

export default SideNav;
