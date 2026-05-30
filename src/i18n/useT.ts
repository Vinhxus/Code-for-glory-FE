import { useMemo } from 'react';
import { useSettingsStore } from '../store/settings';
import { translations, type I18nKey } from './translations';

export function useT() {
  const language = useSettingsStore((s) => s.language);

  return useMemo(() => {
    return (key: I18nKey) => {
      const entry = translations[key];
      if (!entry) return key;
      return language === 'vi' ? entry.vi : entry.en;
    };
  }, [language]);
}

