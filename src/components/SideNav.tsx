import { NavLink } from 'react-router-dom';
import { useT } from '../i18n/useT';
import type { I18nKey } from '../i18n/translations';

type NavItem = {
  to: string;
  end?: boolean;
  icon: string;
  labelKey: I18nKey;
  color: string;
  glow: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    end: true,
    icon: 'map',
    labelKey: 'nav.map',
    color: '#ff7e5f',
    glow: 'rgba(255,126,95,0.45)',
  },
  {
    to: '/battle',
    icon: 'swords',
    labelKey: 'nav.battle',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.45)',
  },
  {
    to: '/practice',
    icon: 'exercise',
    labelKey: 'nav.practice',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.45)',
  },
  {
    to: '/history',
    icon: 'history',
    labelKey: 'nav.history',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.45)',
  },
];

function SideNav() {
  const t = useT();

  return (
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
      }}
    >
      {/* Ambient sidebar glow */}
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

      {/* Top Divider */}
      <div
        className="w-full h-px mb-4"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--cg-border), transparent)',
        }}
      />

      {/* Nav items */}
      <nav className="flex w-full flex-1 flex-col gap-1 px-2">
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
                {/* Icon */}
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

                {/* Label — slides in when sidebar expands */}
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

                {/* Active dot when collapsed */}
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
      </nav>

      {/* Bottom Divider */}
      <div
        className="w-full h-px mt-2 mb-3"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--cg-border), transparent)',
        }}
      />

      {/* User Avatar at bottom */}
      <div className="w-full px-2">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-[color:var(--cg-container-a16)] cursor-pointer group">
          {/* Avatar with XP ring */}
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
              <span className="text-[9px] font-bold text-white">U</span>
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
            <div className="text-[12px] font-bold text-[color:var(--cg-text)] whitespace-nowrap">
              Player
            </div>
            <div className="text-[10px] text-[color:var(--cg-coral)] font-semibold whitespace-nowrap">
              Lv.1 Novice
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SideNav;
