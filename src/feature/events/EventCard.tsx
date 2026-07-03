import { useNavigate } from 'react-router-dom';
import type { Event } from './event.type';
import { useEventsStore } from './EventStore';
import CountdownTimer from './CountdownTimer';

const COLOR_MAP: Record<
  string,
  { badge: string; text: string; accent: string }
> = {
  coral: {
    badge: 'text-[#ff7e5f] bg-[#ff7e5f1a] border border-[#ff7e5f40]',
    text: 'text-[#ff7e5f]',
    accent: '#ff7e5f',
  },
  purple: {
    badge: 'text-[#a78bfa] bg-[#a78bfa1a] border border-[#a78bfa40]',
    text: 'text-[#a78bfa]',
    accent: '#a78bfa',
  },
  amber: {
    badge: 'text-[#fbbf24] bg-[#fbbf241a] border border-[#fbbf2440]',
    text: 'text-[#fbbf24]',
    accent: '#fbbf24',
  },
};

interface Props {
  event: Event;
  animationDelay?: number;
}

export default function EventCard({
  event,
  animationDelay = 0,
}: Props) {
  const navigate = useNavigate();
  const { toggleBookmark, isBookmarked } = useEventsStore();
  const saved = isBookmarked(event.id);
  const colors = COLOR_MAP[event.color];
  const isOngoing = event.status === 'Ongoing';

  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <div
      className="glass-card flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 card-hover gap-5 border-l-[3px] animate-fade-in-up"
      style={{
        borderLeftColor: colors.accent,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Left */}
      <div className="flex flex-col gap-2.5 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}
          >
            {event.type}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-[color:var(--cg-text-muted)]">
            <span className="material-symbols-outlined text-[15px]">
              calendar_today
            </span>
            {event.date}
          </span>
        </div>

        <h2 className="text-xl font-bold text-white">{event.title}</h2>

        <div
          className={`flex items-center gap-1.5 text-sm font-bold ${colors.text}`}
        >
          <span className="material-symbols-outlined text-[17px]">
            workspace_premium
          </span>
          Reward: {event.reward}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-start md:items-end gap-2.5 w-full md:w-auto flex-shrink-0">
        <div
          className={`flex items-center gap-1.5 text-xs font-bold ${isOngoing ? 'text-[#4ade80]' : 'text-[#60a5fa]'}`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${isOngoing ? 'bg-[#4ade80] animate-status-pulse' : 'bg-[#60a5fa]'}`}
          />
          {event.status}
        </div>

        <CountdownTimer target={event.target} status={event.status} />

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => toggleBookmark(event.id)}
            aria-label={saved ? 'Remove bookmark' : 'Bookmark event'}
            className={`w-[38px] h-[38px] flex items-center justify-center rounded-xl border transition-all text-sm ${saved
                ? 'text-[#fbbf24] border-[#fbbf2440] bg-[#fbbf241a]'
                : 'text-[color:var(--cg-text-muted)] border-[color:var(--cg-border)] hover:text-[#fbbf24] hover:border-[#fbbf2440]'
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {saved ? 'bookmark_added' : 'bookmark'}
            </span>
          </button>

          <button
            onClick={handleViewDetails}
            className="flex-1 md:flex-none rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-6 py-2.5 font-bold hover:bg-[color:var(--cg-container-a30)] transition-colors text-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}