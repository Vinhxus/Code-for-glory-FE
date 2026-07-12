import { create } from 'zustand';
import type {
  AiChatMessage,
  AiChatSession,
  CreateSessionDto,
} from '../types/aiMentor.types.ts';
import * as aiMentorService from '../services/aiMentorService.ts';

interface AiMentorState {
  // Data
  session: AiChatSession | null;
  messages: AiChatMessage[];

  // UI
  isOpen: boolean;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions — UI
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  clearError: () => void;

  // Actions — Data
  startSession: (dto: CreateSessionDto) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  closeSession: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  session: null,
  messages: [],
  isOpen: false,
  isLoading: false,
  isSending: false,
  error: null,
};

export const useAiMentorStore = create<AiMentorState>((set, get) => ({
  ...initialState,

  // ===== UI Actions =====
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen })),
  clearError: () => set({ error: null }),

  // ===== Data Actions =====

  startSession: async (dto: CreateSessionDto) => {
    const { session } = get();
    if (session && !session.isClosed) return;

    set({ isLoading: true, error: null });
    try {
      const newSession = await aiMentorService.createSession(dto);
      set({ session: newSession, messages: [], isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to create session',
        isLoading: false,
      });
    }
  },

  loadSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { session, messages } =
        await aiMentorService.getSessionDetail(sessionId);
      set({ session, messages, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load session',
        isLoading: false,
      });
    }
  },

  sendMessage: async (content: string) => {
    const { session } = get();
    if (!session || session.isClosed) return;

    set({ isSending: true, error: null });
    try {
      const { userMessage, assistantMessage } =
        await aiMentorService.sendMessage(session._id, { content });
      set((s) => ({
        messages: [...s.messages, userMessage, assistantMessage],
        isSending: false,
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to send message',
        isSending: false,
      });
    }
  },

  closeSession: async () => {
    const { session } = get();
    if (!session) return;

    try {
      await aiMentorService.closeSession(session._id);
      set({ ...initialState }); // Reset toàn bộ: đóng drawer, xoá messages, xoá session
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to close session',
      });
    }
  },

  reset: () => set(initialState),
}));
