import { useMemo } from 'react';
import { useSettingsStore } from '../store/settings';

function QuickSettings() {
  const language = useSettingsStore((s) => s.language);
  const theme = useSettingsStore((s) => s.theme);
  const toggleLanguage = useSettingsStore((s) => s.toggleLanguage);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);

  const langLabel = useMemo(() => (language === 'en' ? 'EN' : 'VI'), [language]);
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-1.5 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] p-1.5 shadow-lg backdrop-blur">
      {/* Language toggle */}
      <button
        type="button"
        onClick={toggleLanguage}
        className="group inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-2 text-xs font-bold tracking-widest text-[color:var(--cg-text)] transition-all duration-200 hover:bg-[color:var(--cg-container-a22)] hover:border-[#ff7e5f]/30 hover:shadow-[0_0_12px_rgba(255,126,95,0.15)]"
        title="Toggle language"
      >
        <span className="material-symbols-outlined text-[16px] text-[color:var(--cg-coral)] group-hover:scale-110 transition-transform">
          translate
        </span>
        {langLabel}
      </button>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="group inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-2 text-xs font-bold tracking-widest text-[color:var(--cg-text)] transition-all duration-200 hover:bg-[color:var(--cg-container-a22)] hover:border-[color:var(--cg-green)]/30 hover:shadow-[0_0_12px_rgba(74,222,128,0.15)]"
        title="Toggle theme"
      >
        <span
          className="material-symbols-outlined text-[16px] text-[color:var(--cg-green)] group-hover:scale-110 transition-transform"
          style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
        {isDark ? 'Dark' : 'Light'}
      </button>
    </div>
  );
}

export default QuickSettings;
