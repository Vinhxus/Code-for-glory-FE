import { useEffect } from 'react';
import { useAiMentorStore } from '../store/aiMentorStore.ts';
import { MessageList } from './MessageList.tsx';
import { MessageInput } from './MessageInput.tsx';
import { AI_MENTOR_UI } from '../constants/aiMentor.constants.ts';
import type { CreateSessionDto } from '../types/aiMentor.types.ts';

interface AiMentorDrawerProps {
  context: CreateSessionDto;
  exerciseTitle?: string;
  isVi?: boolean;
}

export function AiMentorDrawer({
  context,
  exerciseTitle,
  isVi,
}: AiMentorDrawerProps) {
  const {
    isOpen,
    session,
    messages,
    isLoading,
    isSending,
    error,
    closeDrawer,
    startSession,
    sendMessage,
    closeSession,
    clearError,
  } = useAiMentorStore();

  // Auto-create session khi mở drawer lần đầu
  useEffect(() => {
    if (isOpen && !session) {
      void startSession(context);
    }
  }, [isOpen, session, context, startSession]);

  // Đóng drawer khi nhấn Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 right-4 z-[999] flex flex-col rounded-t-2xl border border-b-0 border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] shadow-[0_-10px_60px_rgba(0,0,0,0.4)] animate-slide-up md:right-8"
        style={{
          width: `${AI_MENTOR_UI.DRAWER_WIDTH}px`,
          height: 'min(75vh, 600px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--cg-border)] bg-[#0A0726]/60 px-4 py-3 rounded-t-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF7E5F]/15">
              <span className="material-symbols-outlined text-[18px] text-[#FF7E5F]">
                psychology
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">AI Mentor</h3>
              {exerciseTitle && (
                <p className="text-[10px] text-[color:var(--cg-text-muted)] truncate">
                  {exerciseTitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {session && !session.isClosed && (
              <button
                type="button"
                onClick={() => void closeSession()}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[color:var(--cg-text-muted)] transition hover:bg-[color:var(--cg-container-a16)] hover:text-red-400"
                title={isVi ? 'Đóng session' : 'Close session'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  stop_circle
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[color:var(--cg-text-muted)] transition hover:bg-[color:var(--cg-container-a16)] hover:text-[color:var(--cg-text)]"
            >
              <span className="material-symbols-outlined text-[16px]">
                close
              </span>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-3 mt-2 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <span className="material-symbols-outlined text-[14px]">error</span>
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="hover:text-red-200">
              <span className="material-symbols-outlined text-[14px]">
                close
              </span>
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-[#FF7E5F] animate-spin">
                progress_activity
              </span>
              <p className="text-xs text-[color:var(--cg-text-muted)]">
                {isVi ? 'Đang khởi tạo...' : 'Initializing...'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <MessageList
              messages={messages}
              isSending={isSending}
              isVi={isVi}
            />

            {/* Input */}
            <MessageInput
              onSend={(content) => void sendMessage(content)}
              disabled={isSending || !session || session.isClosed}
              isVi={isVi}
            />

            {/* Session closed banner */}
            {session?.isClosed && (
              <div className="border-t border-[color:var(--cg-border)] bg-[#0A0726]/60 px-4 py-2 text-center text-[11px] text-[color:var(--cg-text-muted)]">
                {isVi ? 'Session đã đóng.' : 'Session closed.'}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
