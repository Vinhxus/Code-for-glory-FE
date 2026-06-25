import { useState } from 'react';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import EventCard from '../feature/events/EventCard';
import EventModal from '../feature/events/EventModal';
import { EVENTS } from '../feature/events/events.data';
import type { Event } from '../feature/events/event.type';

export default function Events() {
  const [selected, setSelected] = useState<Event | null>(null);
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const text = {
    titleA: isVi ? 'Sự' : 'Epic',
    titleB: isVi ? 'kiện' : 'Events',
    subtitle: isVi
      ? 'Tham gia hackathon toàn cầu, thử thách hằng tuần và các masterclass độc quyền cùng cộng đồng.'
      : 'Join the community in massive global hackathons, weekly challenges, and exclusive masterclasses.',
    searchPlaceholder: isVi ? 'Tìm sự kiện...' : 'Search events...',
    noResults: isVi ? 'Không tìm thấy sự kiện nào.' : 'No events found.',
  };

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-5xl mx-auto px-8 py-16 space-y-12 animate-fade-in-up">
          <div className="text-center space-y-4 mb-12">
            <h1 className="font-['Lexend'] text-5xl font-bold tracking-tight">
              Epic <span className="gradient-text">Events</span>
            </h1>
            <p className="text-[color:var(--cg-text-muted)] max-w-xl mx-auto">
              Join the community in massive global hackathons, weekly challenges, and exclusive masterclasses.
            </p>
          </div>

          <div className="space-y-6">
            {EVENTS.map((ev, i) => (
              <EventCard
                key={ev.id}
                event={ev}
                onViewDetails={setSelected}
                animationDelay={i * 100}
              />
            ))}
          </div>
        </main>
      </div>

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
