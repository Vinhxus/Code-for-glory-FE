import { useMemo } from 'react';
import { useSettingsStore } from '../store/settings';

function QuickSettings() {
  const language = useSettingsStore((s) => s.language);
  const theme = useSettingsStore((s) => s.theme);
  const toggleLanguage = useSettingsStore((s) => s.toggleLanguage);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);

  const langLabel = useMemo(() => (language === 'en' ? 'EN' : 'VI'), [language]);
  const themeLabel = useMemo(() => (theme === 'dark' ? 'Dark' : 'Light'), [theme]);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] p-2 shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur">
      <button
        type="button"
        onClick={toggleLanguage}
        className="group inline-flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-2 text-xs font-bold tracking-widest text-[color:var(--cg-text)] transition hover:bg-[color:var(--cg-container-a22)]"
        title="Toggle language"
      >
        <span className="material-symbols-outlined text-[18px] text-[color:var(--cg-coral)]">
          translate
        </span>
        {langLabel}
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className="group inline-flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-2 text-xs font-bold tracking-widest text-[color:var(--cg-text)] transition hover:bg-[color:var(--cg-container-a22)]"
        title="Toggle theme"
      >
        <span className="material-symbols-outlined text-[18px] text-[color:var(--cg-green)]">
          {theme === 'dark' ? 'dark_mode' : 'light_mode'}
        </span>
        {themeLabel}
      </button>
    </div>
  );
}

export default QuickSettings;
