import { useRef, useState, useCallback } from 'react';
import { useAiMentorStore } from '../store/aiMentorStore.ts';

interface AiMentorBubbleProps {
  isVi?: boolean;
}

export function AiMentorBubble({ isVi }: AiMentorBubbleProps) {
  const { isOpen, toggleDrawer, messages } = useAiMentorStore();
  const hasMessages = messages.length > 0;

  // Position state (bottom-right corner as default)
  const [pos, setPos] = useState({ x: 24, y: 24 }); // x = right, y = bottom
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    moved: false,
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        startPosX: pos.x,
        startPosY: pos.y,
        moved: false,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = d.startX - e.clientX;
    const dy = d.startY - e.clientY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
    setPos({
      x: Math.max(8, Math.min(window.innerWidth - 64, d.startPosX + dx)),
      y: Math.max(8, Math.min(window.innerHeight - 64, d.startPosY + dy)),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    const wasDrag = dragRef.current.moved;
    dragRef.current.active = false;
    if (!wasDrag) toggleDrawer();
  }, [toggleDrawer]);

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`fixed z-[997] flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_32px_rgba(255,126,95,0.35)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(255,126,95,0.45)] select-none touch-none cursor-grab active:cursor-grabbing ${
        isOpen
          ? 'bg-[color:var(--cg-container-a22)] border border-[color:var(--cg-border)]'
          : 'bg-[#FF7E5F]'
      }`}
      style={{ right: `${pos.x}px`, bottom: `${pos.y}px` }}
      title={isVi ? 'AI Mentor — kéo để di chuyển' : 'AI Mentor — drag to move'}
    >
      <span
        className={`material-symbols-outlined text-[26px] transition-transform duration-300 pointer-events-none ${
          isOpen ? 'rotate-180 text-[#FF7E5F]' : 'text-[#0F0B3C]'
        }`}
      >
        {isOpen ? 'close' : 'psychology'}
      </span>

      {hasMessages && !isOpen && (
        <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[color:var(--cg-bg)] bg-emerald-400 animate-pulse pointer-events-none" />
      )}
    </button>
  );
}
