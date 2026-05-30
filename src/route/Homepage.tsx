import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
import QuickSettings from '../components/QuickSettings';
import { useT } from '../i18n/useT';

type Stat = {
  label: string;
  value: string;
  icon: string;
};
type TopUser = { name: string; class: string; xp: string; rank: number };

function Homepage() {
  const navigate = useNavigate();
  const logoSrc = '/component_2_2x.png';
  const t = useT();

  const stats = useMemo<Stat[]>(
    () => [
      { label: t('home.stats.solved'), value: '10', icon: '🎯' },
      { label: t('home.stats.participants'), value: '1B+', icon: '👥' },
      { label: t('home.stats.gold'), value: '1,250 Daily', icon: '🪙' },
    ],
    [t]
  );

  const topUsers = useMemo<TopUser[]>(
    () => [
      { name: 'User Alpha', class: 'WARRIOR CLASS', xp: '123k XP', rank: 1 },
      { name: 'User Beta', class: 'ARCHMAGE CLASS', xp: '12.8k XP', rank: 2 },
      { name: 'User Gamma', class: 'ROGUE CLASS', xp: '11.5k XP', rank: 3 },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] font-['Plus_Jakarta_Sans'] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      {/* Background Grid & Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[color:var(--cg-coral-a18)] blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[color:var(--cg-green-a14)] blur-[120px]" />
      </div>

      {/* Side Navigation Bar */}
      <SideNav />

      {/* Main Container Layout */}
      <div className="relative z-10 md:pl-[96px]">
        {/* Top Navbar Header */}
        <header className="px-8 py-6 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="CodeForGlory"
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-['Lexend'] text-lg font-bold tracking-tight text-[color:var(--cg-text)]">
                CodeForGlory
              </span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-[color:var(--cg-text-muted)] md:flex">
              <a
                href="#quests"
                className="transition hover:text-[color:var(--cg-coral)]"
              >
                {t('home.nav.quests')}
              </a>
              <a
                href="#leaderboard"
                className="transition hover:text-[color:var(--cg-coral)]"
              >
                {t('home.nav.leaderboard')}
              </a>
              <a
                href="#shop"
                className="transition hover:text-[color:var(--cg-coral)]"
              >
                {t('home.nav.shop')}
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <QuickSettings />
              <button className="text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition relative p-1.5">
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF7E5F] rounded-full animate-pulse" />
                🔔
              </button>
              <button
                type="button"
                className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-xs font-semibold text-[color:var(--cg-text)] backdrop-blur-md transition hover:bg-[color:var(--cg-container-a22)]"
                onClick={() => navigate('/survey')}
              >
                👤 {t('common.profile')}
              </button>
            </div>
          </div>
        </header>

        {/* Core Content View Dashboard */}
        <main className="max-w-7xl mx-auto px-8 py-12 space-y-10">
          {/* Hero Segment Section */}
          <section className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7E5F]/30 bg-[#FF7E5F]/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-[#FF7E5F]">
                {t('home.hero.tag')}
              </div>
              <h1 className="font-['Lexend'] text-4xl font-bold tracking-tight text-[color:var(--cg-text)] leading-[1.2] md:text-5xl">
                {t('home.hero.titleA')} <br />
                <span className="text-[#FF7E5F] drop-shadow-[0_0_25px_rgba(255,126,95,0.35)]">
                  {t('home.hero.titleB')}
                </span>{' '}
                {t('home.nav.quests')}
              </h1>
              <p className="max-w-xl font-['Plus_Jakarta_Sans'] text-base leading-relaxed text-[color:var(--cg-text-muted)]">
                {t('home.hero.subtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-[#FF7E5F] px-6 py-3.5 text-xs font-bold text-[#0F0B3C] shadow-[0_12px_40px_rgba(255,126,95,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => navigate('/survey')}
                >
                  {t('home.hero.start')}
                </button>
                <Link
                   to="/learning-path"
                   className="inline-flex items-center justify-center rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-6 py-3.5 text-xs font-semibold text-[color:var(--cg-text)] backdrop-blur-md transition hover:bg-[color:var(--cg-container-a22)]"
                 >
                   {t('home.hero.roadmap')}
                 </Link>
              </div>
            </div>

            {/* Simulated Terminal Mockup Code Display */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-[#FF7E5F]/10 to-[#4F46E5]/20 blur-xl opacity-70" />
              <div className="relative overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-2 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] px-5 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF7E5F]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FFD700]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#7ED957]" />
                  <span className="ml-2 font-['JetBrains_Mono'] text-xs text-[color:var(--cg-text-muted)]">
                    start_quest.js
                  </span>
                </div>
                <pre className="overflow-x-auto p-6 font-['JetBrains_Mono'] text-[13px] leading-relaxed text-[color:var(--cg-text-muted)] bg-[color:var(--cg-bg-a55)]">
                  <code>
                    <span className="text-purple-400">async function</span>{' '}
                    <span className="text-blue-400">start_quest</span>(
                    <span className="text-orange-300">id</span>) {'{\n'}
                    {'  '}
                    <span className="text-purple-400">const</span> session ={' '}
                    <span className="text-purple-400">await</span> API.
                    <span className="text-blue-400">init</span>(id);{'\n\n'}
                    {'  '}
                    <span className="text-[color:var(--cg-text-muted)]">
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

          {/* Quick Platform Metrics Grid */}
          <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-6 py-5 backdrop-blur-md transition-all duration-300 hover:bg-[color:var(--cg-container-a22)]"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold tracking-wider text-[color:var(--cg-text-muted)] uppercase">
                      {stat.label}
                    </div>
                    <div className="font-['Lexend'] text-3xl font-bold tracking-tight text-[color:var(--cg-text)]">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-2xl bg-[color:var(--cg-bg-a55)] w-12 h-12 rounded-xl flex items-center justify-center border border-[color:var(--cg-border)] group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Map Progress / Main Learning Path Panel */}
          <Link
            to="/learning-path"
            id="roadmap"
            className="group block overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md p-8 relative transition-all duration-300 hover:border-[#FF7E5F]/40 hover:shadow-[0_0_40px_rgba(255,126,95,0.10)] cursor-pointer"
          >
            {/* Hover glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#FF7E5F]/5 to-transparent" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-['Lexend'] text-2xl font-semibold text-[color:var(--cg-text)]">
                    {t('home.path.title')}
                  </h2>
                  <p className="mt-1 max-w-xl text-sm text-[color:var(--cg-text-muted)]">
                    {t('home.path.subtitle')}
                  </p>
                </div>
                {/* CTA pill */}
                <div className="shrink-0 flex items-center gap-2 rounded-xl border border-[#FF7E5F]/40 bg-[#FF7E5F]/10 px-4 py-2 text-xs font-bold text-[#FF7E5F] transition-all group-hover:bg-[#FF7E5F]/20">
                  Frontend &amp; Backend
                  <span className="transition-transform group-hover:translate-x-1">↗</span>
                </div>
              </div>

              {/* Graphical Roadmap Visual Layer */}
              <div className="mt-14 mb-4 relative flex flex-col justify-between items-center gap-12 md:flex-row md:px-12">
                {/* Horizontal dotted path line connector */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[color:var(--cg-border)] to-transparent -translate-y-1/2 hidden md:block" />

                {[
                  { step: 'A', id: 'JS', active: true },
                  { step: 'B', id: '⚙️', active: false },
                  { step: 'C', id: '👑', active: false },
                ].map((node) => (
                  <div
                    key={node.step}
                    className="relative flex flex-col items-center group/node z-10"
                  >
                    <div
                      className={`w-20 h-20 rounded-[24px] flex items-center justify-center border-2 transition-all duration-300 bg-[color:var(--cg-bg)] ${
                        node.active
                          ? 'border-[#FF7E5F] shadow-[0_0_30px_rgba(255,126,95,0.25)] scale-105'
                          : 'border-[color:var(--cg-border)]'
                      }`}
                    >
                      <span
                        className={`font-['Lexend'] text-xl font-bold ${node.active ? 'text-[#FF7E5F]' : 'text-[color:var(--cg-text-muted)]'}`}
                      >
                        {node.id}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-col items-center">
                      <span className="text-xs font-bold text-[color:var(--cg-text-muted)]">
                        {node.step}
                      </span>
                      <div
                        className={`mt-1.5 h-1 w-6 rounded-full ${node.active ? 'bg-[#7ED957]' : 'bg-slate-700'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom hint */}
              <p className="mt-2 text-center text-[11px] text-[color:var(--cg-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Click để xem Frontend &amp; Backend Roadmap đầy đủ →
              </p>
            </div>
          </Link>


          {/* Battle Arena Challenge and Leaderboard Grid */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Arena Promo Highlight Card */}
            <div
              id="quests"
              className="relative overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-8 flex flex-col justify-between backdrop-blur-md md:col-span-2"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#FF7E5F]">
                  {t('home.arena.tag')}
                </div>
                <h2 className="font-['Lexend'] text-2xl font-semibold text-[color:var(--cg-text)]">
                  {t('home.arena.title')}
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-[color:var(--cg-text-muted)]">
                  {t('home.arena.subtitle')}
                </p>
              </div>
              <div className="pt-8">
                <button
                  type="button"
                  className="rounded-xl bg-[#FF7E5F] px-6 py-3.5 text-xs font-bold text-[#0F0B3C] shadow-[0_12px_40px_rgba(255,126,95,0.20)] transition-all hover:scale-[1.02]"
                  onClick={() => navigate('/survey')}
                >
                  {t('home.arena.cta')}
                </button>
              </div>
            </div>

            {/* Mini Ranking Leaderboard Component */}
            <div
              id="leaderboard"
              className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md flex flex-col justify-between overflow-hidden"
            >
              <div className="border-b border-[color:var(--cg-border)] px-6 py-5 bg-[color:var(--cg-bg-a55)]">
                <h3 className="font-['Lexend'] text-base font-semibold text-[color:var(--cg-text)]">
                  {t('home.top.title')}
                </h3>
              </div>

              <div className="p-5 space-y-3 flex-1">
                {topUsers.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] px-4 py-3.5"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                          user.rank === 1
                            ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20'
                            : 'bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text)] border border-[color:var(--cg-border)]'
                        }`}
                      >
                        {user.rank}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[color:var(--cg-text)]">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-[color:var(--cg-text-muted)] font-medium tracking-wide mt-0.5">
                          {user.class}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#FF7E5F]">
                        {user.xp.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-[color:var(--cg-text-muted)] font-semibold ml-1">
                        XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  className="w-full rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] py-3 text-xs font-semibold text-[color:var(--cg-text)] transition hover:bg-[color:var(--cg-container-a22)]"
                  onClick={() => navigate('/survey')}
                >
                  {t('home.top.viewAll')}
                </button>
              </div>
            </div>
          </section>

          {/* Standard Page Footer Layout Area */}
          <footer
            id="shop"
            className="border-t border-[color:var(--cg-border)] pt-12 text-[color:var(--cg-text-muted)]"
          >
            <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="h-7 w-7 object-contain"
                  />
                  <span className="font-['Lexend'] text-base font-bold text-[color:var(--cg-text)]">
                    CodeForGlory
                  </span>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-[color:var(--cg-text-muted)]">
                  Gamifying the future of software engineering. Orchestrate your
                  digital universe through mastery and conquest.
                </p>
                <div className="flex gap-4 pt-2 text-[color:var(--cg-text-muted)]">
                  <span className="hover:text-[color:var(--cg-text)] cursor-pointer transition">
                    🌐
                  </span>
                  <span className="hover:text-[color:var(--cg-text)] cursor-pointer transition">
                    💬
                  </span>
                  <span className="hover:text-[color:var(--cg-text)] cursor-pointer transition">
                    🐦
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold tracking-widest text-[color:var(--cg-text)] uppercase">
                  {t('home.footer.platform')}
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  {['Courses', 'Arena', 'Pricing'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="block text-left text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition"
                      onClick={() => navigate('/survey')}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold tracking-widest text-[color:var(--cg-text)] uppercase">
                  {t('home.footer.community')}
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  {['Discord', 'Events', 'Guilds'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="block text-left text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition"
                      onClick={() => navigate('/survey')}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[color:var(--cg-border)] py-6 text-xs text-[color:var(--cg-text-muted)] md:flex-row md:items-center">
              <div>
                &copy; {new Date().getFullYear()} CodeForGlory. All rights
                reserved.
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
