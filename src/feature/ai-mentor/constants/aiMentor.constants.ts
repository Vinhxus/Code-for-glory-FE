import { AIMentorStyle, AIMentorTone } from '../types/aiMentor.types.ts';

// API paths — matching BE controller routes
export const AI_MENTOR_API = {
  SESSIONS: '/ai-mentor/sessions',
  SESSION_DETAIL: (sessionId: string) => `/ai-mentor/sessions/${sessionId}`,
  CLOSE_SESSION: (sessionId: string) =>
    `/ai-mentor/sessions/${sessionId}/close`,
  SEND_MESSAGE: (sessionId: string) =>
    `/ai-mentor/sessions/${sessionId}/messages`,
} as const;

// Defaults
export const AI_MENTOR_DEFAULTS = {
  STYLE: AIMentorStyle.INDIRECT,
  TONE: AIMentorTone.FRIENDLY,
  PAGE_SIZE: 10,
} as const;

// UI config
export const AI_MENTOR_UI = {
  MAX_INPUT_LENGTH: 2000,
  DRAWER_WIDTH: 420,
} as const;
