import { useState, useRef } from 'react';
import { AI_MENTOR_UI } from '../constants/aiMentor.constants.ts';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  isVi?: boolean;
}

export function MessageInput({ onSend, disabled, isVi }: MessageInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t border-[color:var(--cg-border)] bg-[#0A0726]/60 p-3">
      <div className="flex items-end gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          maxLength={AI_MENTOR_UI.MAX_INPUT_LENGTH}
          disabled={disabled}
          placeholder={isVi ? 'Hỏi AI Mentor...' : 'Ask AI Mentor...'}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-[color:var(--cg-text)] outline-none placeholder:text-[color:var(--cg-text-muted)] disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF7E5F] text-[#0F0B3C] transition hover:bg-[#ff8f75] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </div>
      {value.length > AI_MENTOR_UI.MAX_INPUT_LENGTH * 0.9 && (
        <p className="mt-1 text-right text-[10px] text-[color:var(--cg-text-muted)]">
          {value.length}/{AI_MENTOR_UI.MAX_INPUT_LENGTH}
        </p>
      )}
    </div>
  );
}
