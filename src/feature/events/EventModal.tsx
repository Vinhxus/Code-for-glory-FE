import { useEffect, useRef } from 'react';
import type { Event } from './event.type';
import { useEventsStore } from './EventStore';
import CountdownTimer from './CountdownTimer';

interface Props {
  event: Event | null;
  onClose: () => void;
}

const COLOR_MAP: Record<string, { badge: string; bar: string }> = {
  coral: { badge: 'text-[#ff7e5f] bg-[#ff7e5f1a] border border-[#ff7e5f40]', bar: '#ff7e5f' },
  purple: { badge: 'text-[#a78bfa] bg-[#a78bfa1a] border border-[#a78bfa40]', bar: '#a78bfa' },
  amber: { badge: 'text-[#fbbf24] bg-[#fbbf241a] border border-[#fbbf2440]', bar: '#fbbf24' },
};

export default function EventModal({ event, onClose }: Props) {
  const { toggleRegistration, isRegistered } = useEventsStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [event, onClose]);

  if (!event) return null;

  const colors = COLOR_MAP[event.color];
  const registered = isRegistered(event.id);
  const pct = event.maxParticipants
    ? Math.round((event.participants / event.maxParticipants) * 100)
    : null;
  const remaining = event.maxParticipants
    ? event.maxParticipants - event.participants
    : null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-event-title"
    >
      <div className="relative bg-[color:var(--cg-bg)] border border-[color:var(--cg-border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 shadow-2xl animate-fade-in-up">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
            {event.type}
          </span>
          <span className="flex items-center gap-1 text-xs text-[color:var(--cg-text-muted)]">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {event.date}
          </span>
        </div>

        <h2 id="modal-event-title" className="font-['Lexend'] text-2xl font-bold text-white mb-3">
          {event.title}
        </h2>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-4">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[color:var(--cg-text-muted)] border border-[color:var(--cg-border)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-sm text-[color:var(--cg-text-muted)] leading-relaxed mb-6">
          {event.desc}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { val: event.participants.toLocaleString(), lbl: 'Registered' },
            { val: event.maxParticipants?.toLocaleString() ?? '∞', lbl: 'Capacity' },
            { val: event.duration, lbl: 'Duration' },
          ].map(({ val, lbl }) => (
            <div
              key={lbl}
              className="flex flex-col items-center bg-[color:var(--cg-container-a16)] rounded-xl px-3 py-3 border border-[color:var(--cg-border)]"
            >
              <span className="text-lg font-bold text-white leading-none mb-1">{val}</span>
              <span className="text-[10px] text-[color:var(--cg-text-muted)] uppercase tracking-widest">{lbl}</span>
            </div>
          ))}
        </div>

        {/* Progress */}
        {pct !== null && (
          <div className="mb-5">
            <p className="text-xs font-bold text-[color:var(--cg-text-muted)] uppercase tracking-widest mb-2">
              Registration Progress
            </p>
            <div className="h-2 bg-[color:var(--cg-container-a16)] rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: colors.bar }}
              />
            </div>
            <p className="text-xs text-[color:var(--cg-text-muted)]">
              {pct}% filled —{' '}
              <span className="text-white font-semibold">
                {remaining?.toLocaleString()} spots remaining
              </span>
            </p>
          </div>
        )}

        {/* Countdown */}
        {event.status !== 'Ongoing' && (
          <div className="mb-5">
            <p className="text-xs font-bold text-[color:var(--cg-text-muted)] uppercase tracking-widest mb-2">
              Starts In
            </p>
            <CountdownTimer target={event.target} status={event.status} />
          </div>
        )}

        {/* Prizes */}
        <div className="mb-6">
          <p className="text-xs font-bold text-[color:var(--cg-text-muted)] uppercase tracking-widest mb-3">
            Prizes & Rewards
          </p>
          <div className="flex flex-col gap-2">
            {event.prizes.map((prize) => (
              <div
                key={prize.name}
                className="flex items-center gap-3 bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] rounded-xl px-4 py-3"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ color: prize.color }}>
                  {prize.icon}
                </span>
                <span className="flex-1 text-sm font-medium text-white">{prize.name}</span>
                <span className="text-sm font-bold" style={{ color: prize.color }}>{prize.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => toggleRegistration(event.id)}
          className={`w-full py-4 rounded-xl font-bold text-sm transition-opacity hover:opacity-85 ${registered
            ? 'bg-gradient-to-r from-[#1a6b3c] to-[#15803d] text-white'
            : 'bg-gradient-to-r from-[#6c5dd3] to-[#9c5dd3] text-white'
            }`}
        >
          {registered ? '✓ Registered — Click to cancel' : 'Register Now'}
        </button>
      </div>
    </div>
  );
}
