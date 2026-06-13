import SideNav from '../components/SideNav';

const COURSES = [
  {
    id: 1,
    title: 'Frontend Foundation',
    xp: '1.2k',
    lessons: 24,
    difficulty: 'Beginner',
    color: '#4ade80',
    progress: 65,
  },
  {
    id: 2,
    title: 'Advanced React Patterns',
    xp: '3.5k',
    lessons: 42,
    difficulty: 'Advanced',
    color: '#a78bfa',
    progress: 0,
  },
  {
    id: 3,
    title: 'Node.js Microservices',
    xp: '4.8k',
    lessons: 38,
    difficulty: 'Master',
    color: '#ff7e5f',
    progress: 0,
  },
  {
    id: 4,
    title: 'Web3 & Smart Contracts',
    xp: '5.0k',
    lessons: 15,
    difficulty: 'Master',
    color: '#fbbf24',
    progress: 10,
  },
];

export default function Courses() {
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#a78bfa 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-[20%] -left-[10%] h-[700px] w-[700px] rounded-full bg-[color:var(--cg-coral-a18)] blur-[160px]" />
        <div className="absolute top-[40%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[color:var(--cg-green-a14)] blur-[140px]" />
      </div>
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-8 py-12 space-y-12">
          {/* Hero */}
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-xs font-semibold backdrop-blur-md">
              <span className="material-symbols-outlined text-[16px] text-[#a78bfa]">
                school
              </span>
              Arcane Library
            </div>
            <h1 className="font-['Lexend'] text-5xl font-bold tracking-tight md:text-6xl">
              Master the <span className="gradient-text-cool">Arcane Arts</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base text-[color:var(--cg-text-muted)]">
              Embark on epic learning quests. Gain XP, unlock new abilities, and
              conquer the realms of software engineering.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto animate-fade-in-up delay-100">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[20px] text-[color:var(--cg-text-muted)]">
                search
              </span>
            </div>
            <input
              type="text"
              placeholder="Search for quests..."
              className="w-full rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] py-4 pl-12 pr-4 text-sm text-[color:var(--cg-text)] placeholder-[color:var(--cg-text-muted)] backdrop-blur-xl focus:border-[#a78bfa] focus:outline-none focus:ring-1 focus:ring-[#a78bfa] transition-all"
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-fade-in-up delay-200">
            {COURSES.map((course) => (
              <div
                key={course.id}
                className="glass-card p-6 card-hover group relative overflow-hidden"
              >
                <div
                  className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  style={{ background: course.color }}
                />
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div
                    className="badge-purple"
                    style={{
                      color: course.color,
                      borderColor: `${course.color}50`,
                      background: `${course.color}15`,
                    }}
                  >
                    {course.difficulty}
                  </div>
                  <div
                    className="flex items-center gap-1.5 font-bold"
                    style={{ color: course.color }}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      stars
                    </span>
                    {course.xp} XP
                  </div>
                </div>
                <h3 className="font-['Lexend'] text-2xl font-bold mb-2 relative z-10">
                  {course.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-[color:var(--cg-text-muted)] mb-8 relative z-10">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      menu_book
                    </span>{' '}
                    {course.lessons} Lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      schedule
                    </span>{' '}
                    Self-paced
                  </span>
                </div>
                {course.progress > 0 ? (
                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-xs font-bold text-[color:var(--cg-text-muted)]">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[color:var(--cg-container-a30)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${course.progress}%`,
                          background: course.color,
                        }}
                      />
                    </div>
                    <button className="w-full mt-4 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] py-3 text-sm font-bold transition-all hover:bg-[color:var(--cg-container-a30)]">
                      Continue Quest →
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full rounded-xl py-3 text-sm font-bold transition-all hover:scale-[1.02] relative z-10"
                    style={{
                      background: `${course.color}20`,
                      color: course.color,
                      border: `1px solid ${course.color}40`,
                    }}
                  >
                    Start Quest
                  </button>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
