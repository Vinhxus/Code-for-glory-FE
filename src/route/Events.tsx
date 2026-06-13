import SideNav from '../components/SideNav';

const EVENTS = [
  {
    id: 1,
    title: 'Global Hackathon 2026',
    date: 'Oct 15 - Oct 17',
    type: 'Competition',
    reward: '100k XP',
    status: 'Registration Open',
    color: '#ff7e5f',
  },
  {
    id: 2,
    title: 'System Design Masterclass',
    date: 'Oct 22, 10:00 AM',
    type: 'Webinar',
    reward: 'Exclusive Badge',
    status: 'Upcoming',
    color: '#a78bfa',
  },
  {
    id: 3,
    title: 'Algorithm Weekly Challenge',
    date: 'Every Sunday',
    type: 'Challenge',
    reward: '5k XP',
    status: 'Ongoing',
    color: '#fbbf24',
  },
];

export default function Events() {
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
              Join the community in massive global hackathons, weekly
              challenges, and exclusive masterclasses.
            </p>
          </div>

          <div className="space-y-6">
            {EVENTS.map((ev, i) => (
              <div
                key={ev.id}
                className="glass-card flex flex-col md:flex-row items-start md:items-center justify-between p-8 card-hover"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="space-y-3 mb-6 md:mb-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="badge-purple"
                      style={{
                        color: ev.color,
                        borderColor: `${ev.color}50`,
                        background: `${ev.color}15`,
                      }}
                    >
                      {ev.type}
                    </span>
                    <span className="text-sm font-medium text-[color:var(--cg-text-muted)] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        calendar_today
                      </span>{' '}
                      {ev.date}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{ev.title}</h2>
                  <div
                    className="flex items-center gap-2 text-sm font-bold"
                    style={{ color: ev.color }}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      workspace_premium
                    </span>{' '}
                    Reward: {ev.reward}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  <div className="text-xs font-bold text-[#4ade80] flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#4ade80] animate-status-pulse" />{' '}
                    {ev.status}
                  </div>
                  <button className="w-full md:w-auto rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-8 py-3 font-bold hover:bg-[color:var(--cg-container-a30)] transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
