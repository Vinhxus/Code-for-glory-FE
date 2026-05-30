import { create } from 'zustand';

export type AppLanguage = 'en' | 'vi';
export type AppTheme = 'dark' | 'light';

type SettingsState = {
  language: AppLanguage;
  theme: AppTheme;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'cg_settings_v1';

function safeReadStorage(): Partial<Pick<SettingsState, 'language' | 'theme'>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Pick<SettingsState, 'language' | 'theme'>>;
  } catch {
    return {};
  }
}

function safeWriteStorage(next: { language: AppLanguage; theme: AppTheme }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function applyThemeToDom(theme: AppTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const stored = typeof window !== 'undefined' ? safeReadStorage() : {};

  const initialTheme: AppTheme =
    stored.theme === 'light' || stored.theme === 'dark' ? stored.theme : 'dark';

  const initialLanguage: AppLanguage =
    stored.language === 'vi' || stored.language === 'en' ? stored.language : 'en';

  // Apply immediately on first import (client-side)
  if (typeof window !== 'undefined') {
    applyThemeToDom(initialTheme);
  }

  return {
    language: initialLanguage,
    theme: initialTheme,
    setLanguage: (language) => {
      const { theme } = get();
      safeWriteStorage({ language, theme });
      set({ language });
    },
    toggleLanguage: () => {
      const { language, theme } = get();
      const next: AppLanguage = language === 'en' ? 'vi' : 'en';
      safeWriteStorage({ language: next, theme });
      set({ language: next });
    },
    setTheme: (theme) => {
      const { language } = get();
      safeWriteStorage({ language, theme });
      applyThemeToDom(theme);
      set({ theme });
    },
    toggleTheme: () => {
      const { theme, language } = get();
      const next: AppTheme = theme === 'dark' ? 'light' : 'dark';
      safeWriteStorage({ language, theme: next });
      applyThemeToDom(next);
      set({ theme: next });
    },
  };
});

