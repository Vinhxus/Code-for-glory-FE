import { useEffect, useRef } from 'react';
import { AIMessageRole } from '../types/aiMentor.types.ts';
import type { AiChatMessage } from '../types/aiMentor.types.ts';

interface MessageListProps {
  messages: AiChatMessage[];
  isSending?: boolean;
  isVi?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-[#FF7E5F] animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-[#FF7E5F] animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-[#FF7E5F] animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function MessageList({ messages, isSending, isVi }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll khi có message mới hoặc đang typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isSending]);

  // Filter bỏ SYSTEM messages (không hiện cho user)
  const visibleMessages = messages.filter(
    (m) => m.role !== AIMessageRole.SYSTEM
  );

  if (visibleMessages.length === 0 && !isSending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 opacity-60">
        <span className="material-symbols-outlined text-[40px] text-[#FF7E5F]">
          psychology
        </span>
        <p className="text-center text-sm text-[color:var(--cg-text-muted)]">
          {isVi
            ? 'Hỏi bất cứ điều gì về bài tập này!'
            : 'Ask anything about this exercise!'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
      {visibleMessages.map((msg) => {
        const isUser = msg.role === AIMessageRole.USER;
        return (
          <div
            key={msg._id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isUser
                  ? 'rounded-br-sm bg-[#FF7E5F] text-[#0F0B3C]'
                  : 'rounded-bl-sm bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] text-[color:var(--cg-text)]'
              }`}
            >
              {!isUser && (
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-[#FF7E5F]">
                  <span className="material-symbols-outlined text-[12px]">
                    psychology
                  </span>
                  AI Mentor
                </div>
              )}
              <div className="whitespace-pre-wrap break-words">
                {msg.content}
              </div>
              <div
                className={`mt-1.5 text-[10px] ${
                  isUser
                    ? 'text-[#0F0B3C]/50'
                    : 'text-[color:var(--cg-text-muted)]'
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString(
                  isVi ? 'vi-VN' : 'en-US',
                  { hour: '2-digit', minute: '2-digit' }
                )}
              </div>
            </div>
          </div>
        );
      })}

      {isSending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
