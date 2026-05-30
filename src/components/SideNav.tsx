import { NavLink } from 'react-router-dom';
import { useT } from '../i18n/useT';

function SideNav() {
  const t = useT();
  return (
    <aside className="fixed left-0 top-0 z-[60] flex h-full w-20 flex-col items-center gap-8 border-r border-[color:var(--cg-border)] bg-[color:var(--cg-sidebar)] py-6">
      <div className="mb-4">
        <img
          alt="Logo"
          className="h-8 w-8 opacity-70"
          src="/component_2_2x.png"
        />
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            [
              'w-full py-3',
              isActive
                ? 'sidebar-active flex flex-col items-center gap-1'
                : 'flex flex-col items-center gap-1 text-[color:var(--cg-text-muted)] transition-colors hover:text-[color:var(--cg-text)]',
            ].join(' ')
          }
        >
          <span className="material-symbols-outlined text-xl">map</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            {t('nav.map')}
          </span>
        </NavLink>

        <NavLink
          to="/battle"
          className={({ isActive }) =>
            [
              'w-full py-3',
              isActive
                ? 'sidebar-active flex flex-col items-center gap-1'
                : 'flex flex-col items-center gap-1 text-[color:var(--cg-text-muted)] transition-colors hover:text-[color:var(--cg-text)]',
            ].join(' ')
          }
        >
          <span className="material-symbols-outlined text-xl">swords</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            {t('nav.battle')}
          </span>
        </NavLink>

        <NavLink
          to="/practice"
          className={({ isActive }) =>
            [
              'w-full py-3',
              isActive
                ? 'sidebar-active flex flex-col items-center gap-1'
                : 'flex flex-col items-center gap-1 text-[color:var(--cg-text-muted)] transition-colors hover:text-[color:var(--cg-text)]',
            ].join(' ')
          }
        >
          <span className="material-symbols-outlined text-xl">exercise</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            {t('nav.practice')}
          </span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            [
              'w-full py-3',
              isActive
                ? 'sidebar-active flex flex-col items-center gap-1'
                : 'flex flex-col items-center gap-1 text-[color:var(--cg-text-muted)] transition-colors hover:text-[color:var(--cg-text)]',
            ].join(' ')
          }
        >
          <span className="material-symbols-outlined text-xl">history</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            {t('nav.history')}
          </span>
        </NavLink>
      </div>
    </aside>
  );
}

export default SideNav;
