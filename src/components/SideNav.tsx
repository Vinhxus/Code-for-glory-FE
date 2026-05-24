import { NavLink } from 'react-router-dom';

function SideNav() {
  return (
    <aside className="fixed left-0 top-0 z-[60] flex h-full w-20 flex-col items-center gap-8 border-r border-white/5 bg-[color:var(--cg-sidebar)] py-6">
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
                : 'flex flex-col items-center gap-1 text-white/40 transition-colors hover:text-white',
            ].join(' ')
          }
        >
          <span className="material-symbols-outlined text-xl">map</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            Map
          </span>
        </NavLink>

        <NavLink
          to="/battle"
          className={({ isActive }) =>
            [
              'w-full py-3',
              isActive
                ? 'sidebar-active flex flex-col items-center gap-1'
                : 'flex flex-col items-center gap-1 text-white/40 transition-colors hover:text-white',
            ].join(' ')
          }
        >
          <span className="material-symbols-outlined text-xl">swords</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            Battle
          </span>
        </NavLink>

        <NavLink
          to="/practice"
          className={({ isActive }) =>
            [
              'w-full py-3',
              isActive
                ? 'sidebar-active flex flex-col items-center gap-1'
                : 'flex flex-col items-center gap-1 text-white/40 transition-colors hover:text-white',
            ].join(' ')
          }
        >
          <span className="material-symbols-outlined text-xl">exercise</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            Practice
          </span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            [
              'w-full py-3',
              isActive
                ? 'sidebar-active flex flex-col items-center gap-1'
                : 'flex flex-col items-center gap-1 text-white/40 transition-colors hover:text-white',
            ].join(' ')
          }
        >
          <span className="material-symbols-outlined text-xl">history</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            History
          </span>
        </NavLink>
      </div>
    </aside>
  );
}

export default SideNav;
