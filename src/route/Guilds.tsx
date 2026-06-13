import SideNav from '../components/SideNav';

const GUILDS = [
  {
    id: '1',
    name: 'The Void Walkers',
    members: '1,240',
    level: 42,
    type: 'Backend',
    color: '#a78bfa',
  },
  {
    id: '2',
    name: 'Pixel Pioneers',
    members: '890',
    level: 35,
    type: 'Frontend',
    color: '#ff7e5f',
  },
  {
    id: '3',
    name: 'Data Dragons',
    members: '560',
    level: 28,
    type: 'Data Science',
    color: '#4ade80',
  },
];

export default function Guilds() {
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-8 py-16 space-y-12 animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[color:var(--cg-border)] pb-8">
            <div className="space-y-4">
              <h1 className="font-['Lexend'] text-5xl font-bold tracking-tight">
                Guild <span className="gradient-text-amber">Factions</span>
              </h1>
              <p className="text-[color:var(--cg-text-muted)] max-w-xl">
                Unite with fellow developers. Complete guild quests, share
                knowledge, and dominate the global leaderboards together.
              </p>
            </div>
            <button className="neon-btn-amber px-6 py-3 font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">add</span> Create
              Guild
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {GUILDS.map((guild) => (
              <div
                key={guild.id}
                className="glass-card relative overflow-hidden card-hover group cursor-pointer"
              >
                <div
                  className="absolute top-0 left-0 w-full h-24 opacity-30 transition-opacity group-hover:opacity-50"
                  style={{
                    background: `linear-gradient(to bottom, ${guild.color}, transparent)`,
                  }}
                />
                <div className="p-6 pt-12 space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div
                        className="badge-purple mb-3"
                        style={{
                          color: guild.color,
                          borderColor: `${guild.color}50`,
                          background: `${guild.color}15`,
                        }}
                      >
                        {guild.type}
                      </div>
                      <h2 className="text-2xl font-bold font-['Lexend']">
                        {guild.name}
                      </h2>
                    </div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border-2"
                      style={{
                        borderColor: guild.color,
                        color: guild.color,
                        background: `${guild.color}20`,
                      }}
                    >
                      {guild.level}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[color:var(--cg-text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">
                        group
                      </span>{' '}
                      {guild.members} Members
                    </span>
                  </div>
                  <button
                    className="w-full rounded-xl py-3 font-bold transition-colors hover:opacity-80"
                    style={{ background: guild.color, color: '#0f0b3c' }}
                  >
                    Join Guild
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
