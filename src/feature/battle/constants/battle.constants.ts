import type { ResultType } from '../types/battle.types';

export const BATTLE_ROUTES = {
  FIELD: '/battle',
  MODE: '/battle/mode',
  ARENA: '/battle/arena',
  RESULT: '/battle/result',
  ANALYZE: '/battle/analyze',
};

interface ResultConfigItem {
  icon: string;
  label: string;
  subtitle: string;
  accentClass: string;
  statLabels: { left: string; right: string };
  statValues: { left: string; right: string };
  primaryLabel: string;
  primaryIcon: string;
}

export const RESULT_CONFIG: Record<ResultType, ResultConfigItem> = {
  victory: {
    icon: '🏆',
    label: 'VICTORY',
    subtitle: 'Algorithm Optimized Successfully.',
    accentClass: 'text-[#4ade80]',
    statLabels: { left: 'Runtime', right: 'Memory' },
    statValues: { left: '1.2s', right: '14MB' },
    primaryLabel: 'Next Challenge',
    primaryIcon: 'play_arrow',
  },
  defeat: {
    icon: '💀',
    label: 'DEFEAT',
    subtitle: 'Time Limit Exceeded. Better luck next time.',
    accentClass: 'text-[#ff7e5f]',
    statLabels: { left: 'Test Cases Passed', right: 'Memory' },
    statValues: { left: '4 / 10', right: '14MB' },
    primaryLabel: 'Retry',
    primaryIcon: 'refresh',
  },
  draw: {
    icon: '⏳',
    label: 'Draw',
    subtitle: 'Time Expired. Better luck next time.',
    accentClass: 'text-[#ff7e5f]',
    statLabels: { left: 'Test Cases Passed', right: 'Memory' },
    statValues: { left: '4 / 10', right: '14MB' },
    primaryLabel: 'Retry',
    primaryIcon: 'refresh',
  },
};
