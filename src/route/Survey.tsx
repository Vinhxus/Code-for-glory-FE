import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type ExperienceLevelId = 'novice' | 'apprentice' | 'journeyman' | 'master';

type ExperienceLevel = {
  id: ExperienceLevelId;
  title: string;
  subtitle: string;
  flavor: string;
};

function Survey() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ExperienceLevelId>('apprentice');
  const logoSrc = '/component_2_2x.png';

  const levels = useMemo<ExperienceLevel[]>(
    () => [
      {
        id: 'novice',
        title: 'Novice',
        subtitle: 'Just starting your journey into\nthe digital realm.',
        flavor: 'print("hello world")',
      },
      {
        id: 'apprentice',
        title: 'Apprentice',
        subtitle: 'Basics down. Ready to\nhandle small scripts and\ncomponents.',
        flavor: 'function init() { ... }',
      },
      {
        id: 'journeyman',
        title: 'Journeyman',
        subtitle: 'Building systems and\nmanaging complex data\nflows.',
        flavor: 'service.on("event", ...)',
      },
      {
        id: 'master',
        title: 'Master',
        subtitle: 'Architect. Orchestrating\ndigital universes from\nscratch.',
        flavor: 'design("platform")',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--cg-container-a30),transparent_55%),radial-gradient(circle_at_78%_22%,var(--cg-coral-a18),transparent_58%),radial-gradient(circle_at_30%_88%,var(--cg-amber-a14),transparent_58%)]" />
        <div className="absolute -top-56 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--cg-container-a30),transparent_62%)] blur-2xl" />
      </div>

      <header className="relative z-10 border-b border-[color:var(--cg-border)] bg-transparent px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="Logo"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm font-semibold tracking-wide">
              <span className="bg-gradient-to-r from-[color:var(--cg-coral)] to-[color:var(--cg-amber)] bg-clip-text text-transparent">
                CodeForGlory
              </span>
            </span>
          </Link>

          <div className="text-xs font-semibold tracking-[0.2em] text-[color:var(--cg-text-muted)]">
            Quest Initiation
          </div>

          <button
            type="button"
            className="text-xs font-semibold text-[color:var(--cg-text-muted)] transition hover:text-[color:var(--cg-text)]"
            onClick={() => navigate('/')}
          >
            Skip
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col px-6 pb-28 pt-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Forge Your Path
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
            Answer a few questions so we can craft your personalized quest map.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-4">
          {levels.map((level) => {
            const isSelected = selected === level.id;
            return (
              <button
                key={level.id}
                type="button"
                className={[
                  'group relative overflow-hidden rounded-2xl border bg-[color:var(--cg-container-a22)] px-5 py-6 text-left shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md transition',
                  isSelected
                    ? 'border-[rgba(255,165,0,0.65)] ring-1 ring-[rgba(255,165,0,0.25)]'
                    : 'border-[color:var(--cg-border)] hover:border-[rgba(255,255,255,0.18)]',
                ].join(' ')}
                onClick={() => setSelected(level.id)}
              >
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,var(--cg-coral-a18),transparent_60%)] blur-xl" />
                </div>
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--cg-bg-a55)] ring-1 ring-[rgba(255,255,255,0.10)]">
                      <span className="text-xs font-semibold tracking-wide text-[color:var(--cg-text-muted)]">
                        {level.title.slice(0, 1)}
                      </span>
                    </div>
                    <div
                      className={[
                        'h-4 w-4 rounded-full border',
                        isSelected
                          ? 'border-[rgba(255,165,0,0.70)] bg-[rgba(255,165,0,0.25)]'
                          : 'border-[rgba(255,255,255,0.16)] bg-[color:var(--cg-container-a22)]',
                      ].join(' ')}
                    />
                  </div>

                  <h2 className="mt-4 text-sm font-semibold tracking-wide">
                    {level.title}
                  </h2>
                  <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[color:var(--cg-text-muted)]">
                    {level.subtitle}
                  </p>

                  <div className="mt-5 rounded-xl bg-[color:var(--cg-bg-a55)] px-3 py-2 font-mono text-[11px] leading-4 text-[rgba(199,201,255,0.65)] ring-1 ring-[rgba(255,255,255,0.10)]">
                    {level.flavor}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <section className="mt-7 overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] shadow-[0_40px_140px_rgba(0,0,0,0.30)] backdrop-blur-md">
          <div className="relative px-6 py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,var(--cg-container-a30),transparent_58%),radial-gradient(circle_at_75%_55%,var(--cg-coral-a18),transparent_62%),radial-gradient(circle_at_50%_20%,var(--cg-amber-a14),transparent_62%)]" />
            <div className="relative flex items-center justify-center">
              <div className="max-w-xl text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--cg-bg-a55)] ring-1 ring-[rgba(255,255,255,0.10)]">
                  <span className="text-sm font-semibold text-[color:var(--cg-text)]">
                    ⌁
                  </span>
                </div>
                <p className="mt-4 text-sm text-[color:var(--cg-text-muted)]">
                  The path you choose will define the nodes visible on your
                  learning constellation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-xs font-semibold text-[color:var(--cg-text-muted)] opacity-60"
            disabled
          >
            ← Back
          </button>

          <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
            STEP 01 / 04 · EXPERIENCE_SELECTION_INITIALIZED()
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cg-green)] px-4 py-2 text-xs font-semibold text-[#0f0b3c] shadow-[0_16px_60px_rgba(74,222,128,0.18)] transition hover:bg-[color:var(--cg-green-hover)] active:brightness-95"
            onClick={() => navigate('/')}
          >
            Next Step <span className="text-[14px] leading-none">↯</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Survey;
