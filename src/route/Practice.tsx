import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideNav from '../components/SideNav';
import QuickSettings from '../components/QuickSettings';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

type DocTab = 'documentation' | 'video';

const STORAGE_KEY = 'cg_survey_v2';

function Practice() {
  const [tab, setTab] = useState<DocTab>('documentation');
  const chapterLabel = useMemo(() => 'CHAPTER 4.2', []);
  
  // State for logic
  const [attempts, setAttempts] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  // Get config from Survey
  const surveyData = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);
  
  const maxAttempts = surveyData?.penaltyAcceptance === 'strict' ? 5 : 10;
  
  useEffect(() => {
    if (isCooldown && cooldownTime > 0) {
      const timer = setInterval(() => setCooldownTime(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (isCooldown && cooldownTime <= 0) {
      setIsCooldown(false);
    }
  }, [isCooldown, cooldownTime]);

  const handleSubmit = () => {
    if (isLocked || isCooldown) return;
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= maxAttempts) {
      setIsLocked(true);
    } else if (newAttempts >= 4) {
      setIsCooldown(true);
      setCooldownTime(30);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 10%,rgba(79,70,229,0.18),transparent 55%),radial-gradient(circle at 78% 22%,rgba(255,126,95,0.14),transparent 58%),radial-gradient(circle at 30% 88%,rgba(255,165,0,0.12),transparent 58%)' }} />
        <div className="absolute -top-1/4 -left-[15%] h-[620px] w-[620px] rounded-full bg-[#FF7E5F]/8 blur-[160px]" />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        {/* Header */}
        <header className="sticky top-0 z-40 px-8 py-4 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-[#ff7e5f]/20 blur-md group-hover:bg-[#ff7e5f]/35 transition-all" />
                <img src="/component_2_2x.png" alt="CodeForGlory" className="relative h-8 w-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <span className="font-['Lexend'] text-lg font-bold tracking-tight">
                <span className="text-[#FF7E5F]">Code</span>ForGlory
              </span>
            </Link>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-xs text-[color:var(--cg-text-muted)]">
              <span className="badge-purple">{chapterLabel}</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="font-semibold text-[color:var(--cg-text)]">Async / Await</span>
            </div>

            <div className="flex items-center gap-3">
              <QuickSettings />
              <button className="relative p-2 text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition rounded-xl hover:bg-[color:var(--cg-container-a16)]">
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF7E5F] rounded-full animate-status-pulse" />
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <button type="button" className="flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-xs font-semibold backdrop-blur-md transition hover:bg-[color:var(--cg-container-a22)]">
                <span className="material-symbols-outlined text-[16px] text-[#ff7e5f]">person</span>
                PROFILE
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-8 py-8">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[400px_1fr_340px]">

            {/* LEFT: Docs / Video */}
            <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md overflow-hidden flex flex-col animate-slide-left">
              {/* Tab Bar */}
              <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)]">
                <div className="flex items-center gap-1 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] p-1">
                  {(['documentation', 'video'] as DocTab[]).map((t2) => (
                    <button key={t2} type="button" onClick={() => setTab(t2)}
                      className={cx('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                        tab === t2
                          ? 'bg-[#ff7e5f]/90 text-[#0f0b3c] shadow-sm'
                          : 'text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                      )}>
                      <span className="material-symbols-outlined text-[14px]">{t2 === 'documentation' ? 'description' : 'play_circle'}</span>
                      {t2 === 'documentation' ? 'Docs' : 'Video'}
                    </button>
                  ))}
                </div>
                <span className="badge-purple text-[10px]">{chapterLabel}</span>
              </div>

              <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                {/* Video player mockup */}
                <div className="relative overflow-hidden rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)]" style={{ minHeight: 180 }}>
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 20%,rgba(0,255,255,0.08),transparent 55%),radial-gradient(circle at 80% 70%,rgba(255,126,95,0.1),transparent 55%)' }} />
                  <div className="relative h-[180px] flex items-center justify-center">
                    <button type="button" className="h-14 w-14 rounded-full neon-btn flex items-center justify-center" title="Play">
                      <span className="material-symbols-outlined text-[28px] text-[#0f0b3c] pl-0.5">play_arrow</span>
                    </button>
                    <div className="absolute inset-x-4 bottom-3">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-[color:var(--cg-text)] mb-1.5">
                        <span>Deep Dive: Async/Await Patterns</span>
                        <span className="text-[color:var(--cg-text-muted)]">12:45 / 35:00</span>
                      </div>
                      <div className="h-1 rounded-full bg-[color:var(--cg-container-a30)] overflow-hidden">
                        <div className="h-full w-[36%] rounded-full progress-shimmer" />
                      </div>
                    </div>
                  </div>
                </div>

                {tab === 'documentation' ? (
                  <>
                    <div>
                      <h2 className="font-['Lexend'] text-xl font-bold">Advanced Async: Promises & Await</h2>
                      <p className="mt-2 text-sm leading-relaxed text-[color:var(--cg-text-muted)]">
                        Async functions improve the syntax of Promises, letting you write asynchronous code that reads synchronously. Mastering concurrent requests requires understanding the event loop.
                      </p>
                    </div>

                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-300 mb-2">
                        <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                        KEY CONCEPT: Promise.all()
                      </div>
                      <p className="text-xs leading-5 text-[color:var(--cg-text-muted)]">
                        Use <code className="text-cyan-300 bg-cyan-400/10 px-1 py-0.5 rounded text-[11px]">Promise.all()</code> when you want to initiate multiple async operations and wait for all of them. If any promise fails, the entire block rejects.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-['Lexend'] text-base font-semibold mb-2">🎯 The Task</h3>
                      <p className="text-sm leading-relaxed text-[color:var(--cg-text-muted)]">
                        Refactor the legacy callback function on the right to use{' '}
                        <span className="text-[#FF7E5F] font-semibold">async/await</span>. Handle potential rejection with a{' '}
                        <span className="text-[#FF7E5F] font-semibold">try/catch</span> block.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4 text-sm text-[color:var(--cg-text-muted)]">
                    Watch the lecture above, then switch back to <span className="text-[#ff7e5f]">Documentation</span> for your task.
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: Editor */}
            <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md overflow-hidden flex flex-col animate-fade-in">
              {/* IDE header */}
              <div className="flex items-center justify-between gap-4 px-6 py-3.5 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)]">
                <div className="flex items-center gap-3 text-xs font-semibold text-[color:var(--cg-text-muted)]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="h-4 w-px bg-[color:var(--cg-border)]" />
                  <span className="flex items-center gap-1.5 text-[color:var(--cg-text)]">
                    <span className="material-symbols-outlined text-[14px] text-[#fbbf24]">code</span>
                    index.js
                  </span>
                  {isLocked && (
                    <span className="flex items-center gap-1.5 text-red-400">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      SYSTEM LOCKED
                    </span>
                  )}
                  {isCooldown && (
                    <span className="flex items-center gap-1.5 text-orange-400">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      COOLDOWN: {cooldownTime}s
                    </span>
                  )}
                </div>
                <div className={cx("rounded-full px-4 py-1 text-[10px] font-extrabold tracking-widest border", attempts >= maxAttempts ? "bg-red-900/60 border-red-500/30 text-red-300" : attempts >= 4 ? "bg-orange-900/60 border-orange-500/30 text-orange-300" : "bg-[color:var(--cg-container-a16)] border-[color:var(--cg-border)] text-[color:var(--cg-text-muted)]")}>
                  ⚠ ATTEMPT {attempts}/{maxAttempts}
                </div>
              </div>

              {/* Code area */}
              <div className="flex-1 overflow-hidden p-5">
                <div className="h-full rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] overflow-auto">
                  <pre className="p-6 font-['JetBrains_Mono'] text-[12.5px] leading-7 text-[color:var(--cg-text-muted)]">
                    <code>
                      <span className="text-[color:var(--cg-text-muted)]">// Legacy callback style:</span>{'\n'}
                      <span className="text-purple-400">function</span>{' '}
                      <span className="text-blue-400">loadUser</span>(
                      <span className="text-orange-300">id</span>,{' '}
                      <span className="text-orange-300">cb</span>) {'{\n'}
                      {'  '}API.<span className="text-blue-400">getUser</span>(
                      <span className="text-orange-300">id</span>,{' '}
                      <span className="text-purple-400">function</span>(
                      <span className="text-orange-300">err</span>,{' '}
                      <span className="text-orange-300">user</span>) {'{\n'}
                      {'    '}
                      <span className="text-purple-400">if</span> (
                      <span className="text-orange-300">err</span>){' '}
                      <span className="text-purple-400">return</span>{' '}
                      <span className="text-blue-400">cb</span>(
                      <span className="text-orange-300">err</span>);{'\n'}
                      {'    '}API.<span className="text-blue-400">getProfile</span>(
                      <span className="text-orange-300">user</span>.profileId,{' '}
                      <span className="text-purple-400">function</span>(
                      <span className="text-orange-300">err2</span>,{' '}
                      <span className="text-orange-300">profile</span>) {'{\n'}
                      {'      '}
                      <span className="text-purple-400">if</span> (
                      <span className="text-orange-300">err2</span>){' '}
                      <span className="text-purple-400">return</span>{' '}
                      <span className="text-blue-400">cb</span>(
                      <span className="text-orange-300">err2</span>);{'\n'}
                      {'      '}
                      <span className="text-blue-400">cb</span>(
                      <span className="text-green-400">null</span>, {'{ '}user, profile{' }'});{'\n'}
                      {'    '}{'});'}{'\n'}
                      {'  '}{'});'}{'\n'}
                      {'}'}{'\n\n'}
                      <span className="text-[color:var(--cg-text-muted)]">// TODO: refactor to async/await + try/catch</span>{'\n'}
                      <span className="text-purple-400">async function</span>{' '}
                      <span className="text-blue-400">loadUserAsync</span>(
                      <span className="text-orange-300">id</span>) {'{\n'}
                      {'  '}
                      <span className="text-purple-400">try</span> {'{\n'}
                      {'    '}
                      <span className="text-slate-500">// your code…</span>{'\n'}
                      {'  '}{`} catch (e) {`}{'\n'}
                      {'    '}
                      <span className="text-purple-400">throw</span> e;{'\n'}
                      {'  '}{'}'}{'\n'}
                      {'}'}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Bottom action bar */}
              <div className="border-t border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur px-6 py-3.5">
                {/* XP progress */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold text-[color:var(--cg-text-muted)] tracking-widest">PROGRESS</span>
                  <div className="flex-1 h-1 rounded-full overflow-hidden bg-[color:var(--cg-container-a30)]">
                    <div className="xp-bar-fill delay-300" style={{ '--progress-target': '45%' } as React.CSSProperties} />
                  </div>
                  <span className="text-[10px] font-semibold text-[#ff7e5f]">45%</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs font-semibold text-[color:var(--cg-text-muted)]">
                    <button type="button" className="inline-flex items-center gap-1.5 hover:text-[color:var(--cg-text)] transition">
                      <span className="material-symbols-outlined text-[16px]">restart_alt</span>Reset
                    </button>
                    <button type="button" className="inline-flex items-center gap-1.5 hover:text-[#fbbf24] transition">
                      <span className="material-symbols-outlined text-[16px]">help</span>Hint (1/3)
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-5 py-2 text-xs font-bold transition hover:bg-[color:var(--cg-container-a22)]">
                      Run Tests
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSubmit}
                      className={cx("px-5 py-2 text-xs font-bold rounded-xl transition", 
                        isLocked ? "bg-red-500/20 text-red-300 cursor-not-allowed border border-red-500/30" : 
                        isCooldown ? "bg-orange-500/20 text-orange-300 cursor-not-allowed border border-orange-500/30" : 
                        "neon-btn")}
                    >
                      {isLocked ? 'LOCKED' : isCooldown ? `WAIT ${cooldownTime}s` : `SUBMIT (${attempts}/${maxAttempts})`}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: AI Mentor */}
            <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md overflow-hidden flex flex-col animate-slide-right">
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)]">
                <div className="flex items-start gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl animate-pulse-glow bg-[#FFB8A8]/20" />
                    <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[#FFB8A8] to-[#ff7e5f] text-[#0F0B3C] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">psychology</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold tracking-wide">AI MENTOR</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-status-pulse" />
                      <span className="text-[10px] font-bold tracking-widest text-[color:var(--cg-text-muted)]">LOCKED</span>
                    </div>
                  </div>
                </div>
                <button type="button" className="text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </div>

              <div className="flex-1 p-5 flex flex-col items-center justify-center text-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[color:var(--cg-border)] animate-spin-slow" />
                  <div className="absolute inset-2 rounded-full bg-[color:var(--cg-container-a16)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px] text-[color:var(--cg-text-muted)]">lock</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--cg-text)]">Unlock AI Mentor</p>
                  <p className="text-xs text-[color:var(--cg-text-muted)] mt-1 leading-relaxed">Complete your first practice quest to activate the AI Mentor.</p>
                </div>
                <div className="w-full rounded-xl border border-[#ff7e5f]/20 bg-[#ff7e5f]/5 px-4 py-3 text-xs text-[color:var(--cg-text-muted)]">
                  <span className="text-[#ff7e5f] font-bold">1 quest</span> away from unlocking!
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-3 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3 text-xs text-[color:var(--cg-text-muted)] opacity-50">
                  <span className="flex-1">Ask AI Mentor… (Disabled)</span>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Practice;
