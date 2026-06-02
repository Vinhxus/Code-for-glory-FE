import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
import QuickSettings from '../components/QuickSettings';
import { useT } from '../i18n/useT';
import Header from '../components/layout/Header';

const RANK_STYLES = [
  {
    ring: '#FFD700',
    bg: 'rgba(255,215,0,0.12)',
    border: 'rgba(255,215,0,0.3)',
    medal: '🥇',
  },
  {
    ring: '#C0C0C0',
    bg: 'rgba(192,192,192,0.12)',
    border: 'rgba(192,192,192,0.3)',
    medal: '🥈',
  },
  {
    ring: '#CD7F32',
    bg: 'rgba(205,127,50,0.12)',
    border: 'rgba(205,127,50,0.3)',
    medal: '🥉',
  },
];

function Homepage() {
  const navigate = useNavigate();
  const t = useT();

  const stats = useMemo(
    () => [
      {
        label: t('home.stats.solved'),
        value: '10',
        icon: 'target',
        color: '#ff7e5f',
        cls: 'stat-card-coral',
      },
      {
        label: t('home.stats.participants'),
        value: '1B+',
        icon: 'groups',
        color: '#a78bfa',
        cls: 'stat-card-purple',
      },
      {
        label: t('home.stats.gold'),
        value: '1,250',
        icon: 'star',
        color: '#fbbf24',
        cls: 'stat-card-amber',
      },
    ],
    [t]
  );

  const topUsers = useMemo(
    () => [
      { name: 'User Alpha', class: 'WARRIOR CLASS', xp: 123, rank: 1 },
      { name: 'User Beta', class: 'ARCHMAGE CLASS', xp: 98, rank: 2 },
      { name: 'User Gamma', class: 'ROGUE CLASS', xp: 87, rank: 3 },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      {/* Background */}
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
        <div
          className="absolute bottom-[5%] left-[30%] h-[400px] w-[400px] rounded-full"
          style={{
            background: 'rgba(167,139,250,0.08)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        {/* Header */}
        <Header />

        <main className="max-w-7xl mx-auto px-8 py-12 space-y-10">
          {/* Hero */}
          <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-7 animate-fade-in-up">
              <div className="badge-coral w-fit">
                <span className="material-symbols-outlined text-[14px]">
                  bolt
                </span>
                {t('home.hero.tag')}
              </div>
              <h1 className="font-['Lexend'] text-5xl font-bold tracking-tight leading-[1.15] md:text-6xl">
                {t('home.hero.titleA')}
                <br />
                <span className="gradient-text">
                  {t('home.hero.titleB')}
                </span>{' '}
                <span className="text-[color:var(--cg-text)]">
                  {t('home.nav.quests')}
                </span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-[color:var(--cg-text-muted)]">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  className="neon-btn px-7 py-3.5 text-sm font-extrabold"
                  onClick={() => navigate('/survey')}
                >
                  {t('home.hero.start')} →
                </button>
                <Link
                  to="/learning-path"
                  className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-6 py-3.5 text-sm font-semibold backdrop-blur-md transition hover:bg-[color:var(--cg-container-a22)] hover:border-[#a78bfa]/40"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#a78bfa]">
                    route
                  </span>
                  {t('home.hero.roadmap')}
                </Link>
              </div>

              {/* Mini XP bar */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] font-bold text-[color:var(--cg-text-muted)] tracking-widest">
                  XP
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[color:var(--cg-container-a30)] max-w-[180px]">
                  <div
                    className="xp-bar-fill delay-500"
                    style={
                      { '--progress-target': '60%' } as React.CSSProperties
                    }
                  />
                </div>
                <span className="text-[11px] font-semibold text-[#ff7e5f]">
                  240 / 400
                </span>
              </div>
            </div>

            {/* Terminal mockup */}
            <div className="relative animate-fade-in-up delay-200">
              <div
                className="absolute -inset-6 rounded-[2.5rem] blur-2xl opacity-60"
                style={{
                  background:
                    'radial-gradient(ellipse, rgba(255,126,95,0.18) 0%, rgba(79,70,229,0.14) 60%, transparent 100%)',
                }}
              />
              <div className="relative overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-xl shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] px-5 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-3 font-['JetBrains_Mono'] text-xs text-[color:var(--cg-text-muted)]">
                    start_quest.js
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#4ade80] animate-status-pulse" />
                    <span className="text-[10px] text-[#4ade80] font-semibold">
                      RUNNING
                    </span>
                  </div>
                </div>
                <pre className="overflow-x-auto p-6 font-['JetBrains_Mono'] text-[13px] leading-7 bg-[color:var(--cg-bg-a55)]">
                  <code>
                    <span className="text-purple-400">async function</span>{' '}
                    <span className="text-blue-400">start_quest</span>(
                    <span className="text-orange-300">id</span>) {'{\n'}
                    {'  '}
                    <span className="text-purple-400">const</span> session ={' '}
                    <span className="text-purple-400">await</span> API.
                    <span className="text-blue-400">init</span>(id);{'\n\n'}
                    {'  '}
                    <span className="text-slate-500">
                      // Load mission assets
                    </span>
                    {'\n'}
                    {'  '}session.<span className="text-blue-400">equip</span>(
                    {'{\n'}
                    {'    '}engine: <span className="text-green-400">'V8'</span>
                    ,{'\n'}
                    {'    '}compiler:{' '}
                    <span className="text-green-400">'Glory_v1'</span>
                    {'\n'}
                    {'  '}
                    {'});'}
                    {'\n\n'}
                    {'  '}
                    <span className="text-purple-400">return</span> session.
                    <span className="text-blue-400">execute</span>();{'\n'}
                    {'}'}
                  </code>
                </pre>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`group relative overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-6 py-6 backdrop-blur-md card-hover animate-fade-in-up ${s.cls}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
                  style={{ background: s.color, filter: 'blur(40px)' }}
                />
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold tracking-widest text-[color:var(--cg-text-muted)] uppercase">
                      {s.label}
                    </div>
                    <div
                      className="font-['Lexend'] text-4xl font-extrabold tracking-tight animate-count-up"
                      style={{
                        animationDelay: `${i * 120 + 200}ms`,
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] group-hover:scale-110 transition-transform">
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ color: s.color }}
                    >
                      {s.icon}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Roadmap Preview */}
          <Link
            to="/learning-path"
            id="roadmap"
            className="group block overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md p-8 relative transition-all duration-300 hover:border-[#FF7E5F]/40 hover:shadow-[0_0_60px_rgba(255,126,95,0.12)] cursor-pointer animate-fade-in-up"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#FF7E5F]/5 via-transparent to-[#a78bfa]/5" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-['Lexend'] text-2xl font-semibold">
                    {t('home.path.title')}
                  </h2>
                  <p className="mt-1 max-w-xl text-sm text-[color:var(--cg-text-muted)]">
                    {t('home.path.subtitle')}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 rounded-xl border border-[#FF7E5F]/40 bg-[#FF7E5F]/10 px-4 py-2 text-xs font-bold text-[#FF7E5F] transition-all group-hover:bg-[#FF7E5F]/20">
                  Frontend & Backend
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
                    arrow_outward
                  </span>
                </div>
              </div>

              <div className="mt-12 mb-4 relative flex flex-col justify-between items-center gap-12 md:flex-row md:px-8">
                <div
                  className="absolute top-1/2 left-0 right-0 h-px hidden md:block"
                  style={{
                    background:
                      'repeating-linear-gradient(90deg,rgba(255,126,95,0.3) 0,rgba(255,126,95,0.3) 6px,transparent 6px,transparent 14px)',
                  }}
                />
                {[
                  {
                    id: 'JS',
                    label: 'Foundations',
                    active: true,
                    color: '#ff7e5f',
                  },
                  {
                    id: '⚙️',
                    label: 'Advanced',
                    active: false,
                    color: '#a78bfa',
                  },
                  {
                    id: '👑',
                    label: 'Mastery',
                    active: false,
                    color: '#fbbf24',
                  },
                ].map((node, i) => (
                  <div
                    key={node.id}
                    className="relative flex flex-col items-center z-10 animate-bounce-in"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <div
                      className={`w-20 h-20 rounded-[20px] flex items-center justify-center border-2 transition-all duration-300 bg-[color:var(--cg-bg)] ${node.active ? 'scale-110' : 'group-hover:scale-105'}`}
                      style={
                        node.active
                          ? {
                              borderColor: node.color,
                              boxShadow: `0 0 30px ${node.color}40`,
                            }
                          : { borderColor: 'var(--cg-border)' }
                      }
                    >
                      <span
                        className="font-['Lexend'] text-xl font-bold"
                        style={{
                          color: node.active
                            ? node.color
                            : 'var(--cg-text-muted)',
                        }}
                      >
                        {node.id}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-1">
                      <span className="text-[11px] font-bold text-[color:var(--cg-text-muted)]">
                        {node.label}
                      </span>
                      <div
                        className="h-1 w-8 rounded-full"
                        style={{
                          background: node.active
                            ? '#4ade80'
                            : 'rgba(100,100,120,0.3)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-center text-[11px] text-[color:var(--cg-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Click để xem Frontend & Backend Roadmap đầy đủ →
              </p>
            </div>
          </Link>

          {/* Arena + Leaderboard */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3 animate-fade-in-up delay-300">
            {/* Arena */}
            <div
              id="quests"
              className="relative overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-8 flex flex-col justify-between backdrop-blur-md md:col-span-2 card-hover"
            >
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    'radial-gradient(ellipse at 0% 0%, rgba(255,126,95,0.18) 0%, transparent 60%), radial-gradient(ellipse at 100% 100%, rgba(167,139,250,0.12) 0%, transparent 60%)',
                }}
              />
              <div className="relative z-10 space-y-4">
                <div className="badge-coral w-fit">
                  <span className="material-symbols-outlined text-[14px]">
                    whatshot
                  </span>
                  {t('home.arena.tag')}
                </div>
                <h2 className="font-['Lexend'] text-3xl font-bold">
                  {t('home.arena.title')}
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-[color:var(--cg-text-muted)]">
                  {t('home.arena.subtitle')}
                </p>
              </div>
              <div className="relative z-10 pt-8">
                <button
                  type="button"
                  className="neon-btn px-6 py-3 text-sm"
                  onClick={() => navigate('/survey')}
                >
                  {t('home.arena.cta')}
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            <div
              id="leaderboard"
              className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md flex flex-col overflow-hidden card-hover"
            >
              <div className="border-b border-[color:var(--cg-border)] px-6 py-4 bg-[color:var(--cg-bg-a55)] flex items-center justify-between">
                <h3 className="font-['Lexend'] text-base font-semibold">
                  {t('home.top.title')}
                </h3>
                <span className="badge-amber">LIVE</span>
              </div>
              <div className="p-4 space-y-2 flex-1">
                {topUsers.map((user, i) => {
                  const rs = RANK_STYLES[i];
                  return (
                    <div
                      key={user.rank}
                      className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:scale-[1.01]"
                      style={{ background: rs.bg, borderColor: rs.border }}
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold flex-shrink-0"
                        style={{
                          background: rs.bg,
                          border: `1px solid ${rs.border}`,
                          color: rs.ring,
                        }}
                      >
                        {rs.medal}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[color:var(--cg-text)] truncate">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-[color:var(--cg-text-muted)] font-medium tracking-wide">
                          {user.class}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-xs font-extrabold"
                          style={{ color: rs.ring }}
                        >
                          {user.xp}k
                        </div>
                        <div className="text-[9px] text-[color:var(--cg-text-muted)] font-bold">
                          XP
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 pt-0">
                <button
                  type="button"
                  className="w-full rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] py-2.5 text-xs font-semibold transition hover:bg-[color:var(--cg-container-a22)]"
                  onClick={() => navigate('/survey')}
                >
                  {t('home.top.viewAll')}
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer
            id="shop"
            className="border-t border-[color:var(--cg-border)] pt-12 text-[color:var(--cg-text-muted)]"
          >
            <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/component_2_2x.png"
                    alt="Logo"
                    className="h-7 w-7 object-contain"
                  />
                  <span className="font-['Lexend'] text-base font-bold text-[color:var(--cg-text)]">
                    <span className="text-[#ff7e5f]">Code</span>ForGlory
                  </span>
                </div>
                <p className="max-w-sm text-sm leading-relaxed">
                  Gamifying the future of software engineering. Orchestrate your
                  digital universe through mastery and conquest.
                </p>
                <div className="flex gap-3 pt-2">
                  {['language', 'chat', 'flutter'].map((icon) => (
                    <button
                      key={icon}
                      className="h-9 w-9 flex items-center justify-center rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] transition hover:border-[#ff7e5f]/40 hover:text-[#ff7e5f]"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {[
                [t('home.footer.platform'), ['Courses', 'Arena', 'Pricing']],
                [t('home.footer.community'), ['Discord', 'Events', 'Guilds']],
              ].map(([title, items]) => (
                <div key={title as string}>
                  <div className="text-xs font-bold tracking-widest text-[color:var(--cg-text)] uppercase mb-4">
                    {title}
                  </div>
                  <div className="space-y-3 text-sm">
                    {(items as string[]).map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="block text-left hover:text-[#ff7e5f] transition-colors"
                        onClick={() => navigate('/survey')}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[color:var(--cg-border)] py-6 text-xs md:flex-row md:items-center">
              <div>
                © {new Date().getFullYear()} CodeForGlory. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                {[
                  t('home.footer.terms'),
                  t('home.footer.privacy'),
                  t('home.footer.support'),
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="hover:text-[color:var(--cg-text)] transition"
                    onClick={() => navigate('/survey')}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Homepage;
