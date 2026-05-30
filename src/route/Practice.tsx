import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SideNav from '../components/SideNav';
import QuickSettings from '../components/QuickSettings';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

type DocTab = 'documentation' | 'video';

function Practice() {
  const logoSrc = '/component_2_2x.png';
  const [tab, setTab] = useState<DocTab>('documentation');

  const chapterLabel = useMemo(() => 'CHAPTER 4.2', []);

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(79,70,229,0.18),transparent_55%),radial-gradient(circle_at_78%_22%,rgba(255,126,95,0.14),transparent_58%),radial-gradient(circle_at_30%_88%,rgba(255,165,0,0.12),transparent_58%)]" />
        <div className="absolute top-[-25%] left-[-15%] h-[620px] w-[620px] rounded-full bg-[#FF7E5F]/10 blur-[140px]" />
        <div className="absolute top-[35%] right-[-18%] h-[520px] w-[520px] rounded-full bg-[#4F46E5]/12 blur-[140px]" />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        {/* Top App Bar */}
        <header className="px-8 py-5 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-md">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between">
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
                <span className="text-[#FF7E5F]">Code</span>ForGlory
              </span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-[color:var(--cg-text-muted)] md:flex">
              <a href="#quests" className="transition hover:text-[color:var(--cg-coral)]">
                Quests
              </a>
              <a href="#leaderboard" className="transition hover:text-[color:var(--cg-coral)]">
                Leaderboard
              </a>
              <a href="#shop" className="transition hover:text-[color:var(--cg-coral)]">
                Shop
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
              >
                👤 PROFILE
              </button>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <main className="mx-auto max-w-[1400px] px-8 py-10">
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr_360px]">
            {/* Left: Documentation & Video */}
            <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md overflow-hidden">
              {/* Tab Bar */}
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)]">
                <div className="flex items-center gap-5 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setTab('documentation')}
                    className={cx(
                      'inline-flex items-center gap-2 transition',
                      tab === 'documentation'
                        ? 'text-[color:var(--cg-text)]'
                        : 'text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                    )}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      description
                    </span>
                    Documentation
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('video')}
                    className={cx(
                      'inline-flex items-center gap-2 transition',
                      tab === 'video'
                        ? 'text-[color:var(--cg-text)]'
                        : 'text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
                    )}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      play_circle
                    </span>
                    Video lecture
                  </button>
                </div>

                <div className="text-[11px] font-bold tracking-widest text-[color:var(--cg-text-muted)]">
                  {chapterLabel}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Video mock (always visible like screenshot) */}
                <div className="relative overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,255,0.12),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(255,0,255,0.12),transparent_55%)]" />
                  <div className="relative h-[200px]">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.18),transparent_55%)]" />
                    <button
                      type="button"
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-[#FFB8A8]/90 text-[#0F0B3C] shadow-[0_18px_70px_rgba(255,126,95,0.22)] transition hover:scale-105"
                      title="Play"
                    >
                      <span className="material-symbols-outlined text-[28px] leading-none">
                        play_arrow
                      </span>
                    </button>

                    <div className="absolute inset-x-4 bottom-4">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[color:var(--cg-text)]">
                        <span>Lecture: Deep Dive into Async/Await Patterns</span>
                        <span className="text-[color:var(--cg-text-muted)]">
                          12:45 / 35:00
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-[color:var(--cg-container-a16)] overflow-hidden">
                        <div className="h-full w-[36%] rounded-full bg-[#FF7E5F]" />
                      </div>
                    </div>
                  </div>
                </div>

                {tab === 'documentation' ? (
                  <>
                    <div>
                      <h2 className="font-['Lexend'] text-2xl font-semibold text-[color:var(--cg-text)]">
                        Advanced Async: Promises & Await
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-[color:var(--cg-text-muted)]">
                        Async functions are an improvement on the syntax of
                        Promises, allowing you to write asynchronous code that
                        looks and behaves like synchronous code. However,
                        mastering the error handling and execution flow of
                        multiple concurrent requests requires a deeper
                        understanding of the event loop.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-5">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-300">
                        <span className="material-symbols-outlined text-[18px]">
                          lightbulb
                        </span>
                        Key Concept: Promise.all()
                      </div>
                      <p className="mt-3 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                        Use Promise.all() when you want to initiate multiple
                        asynchronous operations and wait for all of them to
                        complete. If any promise fails, the entire block
                        catches.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-['Lexend'] text-lg font-semibold text-[color:var(--cg-text)]">
                        The Task
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[color:var(--cg-text-muted)]">
                        Refactor the legacy callback function on the right to
                        use <span className="text-[#FF7E5F]">async/await</span>.
                        Ensure you properly handle potential rejection states
                        using a <span className="text-[#FF7E5F]">try/catch</span>{' '}
                        block.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-5 text-sm text-[color:var(--cg-text-muted)]">
                    Video mode: watch the lecture, then switch back to
                    Documentation for the task.
                  </div>
                )}
              </div>
            </div>

            {/* Center: Editor */}
            <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md overflow-hidden relative">
              {/* IDE Header / Status Bar */}
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)]">
                <div className="flex items-center gap-4 text-xs font-semibold text-[color:var(--cg-text-muted)]">
                  <span className="inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">
                      code
                    </span>
                    INDEX.JS
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">
                      lock
                    </span>
                    SYSTEM LOCKED
                  </span>
                </div>
                <div className="rounded-full bg-[#8B0000] px-4 py-1 text-[11px] font-extrabold tracking-widest text-white shadow-[0_10px_40px_rgba(139,0,0,0.22)]">
                  ATTEMPT 9/10
                </div>
              </div>

              {/* Editor body */}
              <div className="p-6">
                <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] overflow-hidden">
                  <pre className="p-6 overflow-x-auto text-[13px] leading-relaxed font-['JetBrains_Mono'] text-[color:var(--cg-text-muted)]">
                    <code>
                      <span className="text-[color:var(--cg-text-muted)]">
                        // Legacy callback style:
                      </span>
                      {'\n'}
                      <span className="text-purple-400">function</span>{' '}
                      <span className="text-blue-400">loadUser</span>(
                      <span className="text-orange-300">id</span>,{' '}
                      <span className="text-orange-300">cb</span>) {'{\n'}
                      {'  '}
                      API.<span className="text-blue-400">getUser</span>(
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
                      {'    '}
                      API.<span className="text-blue-400">getProfile</span>(
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
                      <span className="text-green-400">null</span>, {'{ '}
                      user, profile {' }'});{'\n'}
                      {'    '}{'});'}{'\n'}
                      {'  '}{'});'}{'\n'}
                      {'}'}{'\n\n'}
                      <span className="text-[color:var(--cg-text-muted)]">
                        // TODO: refactor to async/await + try/catch
                      </span>
                      {'\n'}
                      <span className="text-purple-400">async function</span>{' '}
                      <span className="text-blue-400">loadUserAsync</span>(
                      <span className="text-orange-300">id</span>) {'{\n'}
                      {'  '}
                      <span className="text-purple-400">try</span> {'{\n'}
                      {'    '}
                      <span className="text-[color:var(--cg-text-muted)]">
                        // your code…
                      </span>
                      {'\n'}
                      {'  } catch (e) {\n'}
                      {'    '}
                      <span className="text-purple-400">throw</span> e;{'\n'}
                      {'  '}{'}'}{'\n'}
                      {'}'}{'\n'}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="sticky bottom-0 border-t border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-5 text-xs font-semibold text-[color:var(--cg-text-muted)]">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        restart_alt
                      </span>
                      Reset Code
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        help
                      </span>
                      Hint (1/3)
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-6 py-2.5 text-xs font-bold text-[color:var(--cg-text)] transition hover:bg-[color:var(--cg-container-a22)]"
                    >
                      Run Tests
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-[#FFB8A8] px-6 py-2.5 text-xs font-extrabold tracking-widest text-[#0F0B3C] shadow-[0_12px_40px_rgba(255,184,168,0.22)] transition hover:brightness-105 active:scale-[0.99]"
                    >
                      SUBMIT ATTEMPT (9/10)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: AI Mentor Sidebar */}
            <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md overflow-hidden flex flex-col">
              <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)]">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#FFB8A8] text-[#0F0B3C] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">
                      psychology
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold tracking-wide">
                      AI MENTOR
                    </div>
                    <div className="text-[11px] font-bold tracking-widest text-[color:var(--cg-text-muted)]">
                      LOCKED
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition"
                  title="More"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    more_vert
                  </span>
                </button>
              </div>

              <div className="flex-1 p-6 text-sm text-[color:var(--cg-text-muted)]">
                AI Mentor will unlock after you complete the first practice
                quest.
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-3 text-xs text-[color:var(--cg-text-muted)]">
                  <span className="flex-1">Ask AI Mentor… (Disabled)</span>
                  <span className="material-symbols-outlined text-[18px]">
                    send
                  </span>
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
