import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type ExperienceLevelId = 'novice' | 'apprentice' | 'journeyman' | 'master';
type PrimaryGoalId =
  | 'job'
  | 'projects'
  | 'competitive'
  | 'fundamentals'
  | 'fun';
type TrackId =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'data'
  | 'devops'
  | 'mobile';
type WeeklyTimeId = '2-4' | '5-7' | '8-12' | '13+';
type LearningStyleId = 'project-first' | 'theory-first' | 'balanced' | 'drill';
type LanguageId = 'ts' | 'py' | 'java' | 'cpp' | 'sql';
type DifficultyId = 'chill' | 'normal' | 'hardcore';
type BlockerId =
  | 'start'
  | 'consistency'
  | 'confusing'
  | 'projects'
  | 'interview';

type SurveyState = {
  experienceLevel: ExperienceLevelId;
  primaryGoal: PrimaryGoalId | null;
  tracks: TrackId[];
  weeklyTime: WeeklyTimeId | null;
  learningStyle: LearningStyleId | null;
  languages: LanguageId[];
  difficulty: DifficultyId | null;
  blocker: BlockerId | null;
  checkpoint: string;
};

type QuizResult = {
  version: 'v1';
  completedAt: string;
  score: number;
  total: number;
  answers: Record<string, number>;
};

const SURVEY_STORAGE_KEY = 'cg_survey_v1';
const QUIZ_STORAGE_KEY = 'cg_quiz_v1';

function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function niceTrack(track: TrackId) {
  const map: Record<TrackId, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    fullstack: 'Fullstack',
    data: 'Data',
    devops: 'DevOps',
    mobile: 'Mobile',
  };
  return map[track];
}

function difficultyLabel(d: DifficultyId | null, scorePct: number | null) {
  if (!d) {
    if (scorePct == null) return 'Normal';
    if (scorePct >= 80) return 'Hardcore';
    if (scorePct >= 50) return 'Normal';
    return 'Chill';
  }
  if (d === 'chill') return 'Chill';
  if (d === 'hardcore') return 'Hardcore';
  return 'Normal';
}

function planFor(track: TrackId, style: LearningStyleId | null) {
  const projectFirst = style === 'project-first';
  const drill = style === 'drill';

  if (track === 'frontend') {
    return [
      {
        day: 'Day 1',
        title: projectFirst ? 'Ship UI Skeleton' : 'React Mental Model',
        body: projectFirst
          ? 'Build a component layout + basic state. Keep it ugly but working.'
          : 'JSX, render cycle, state, props. Then a mini exercise.',
      },
      {
        day: 'Day 2',
        title: drill ? 'Hooks Drills' : 'Async UI + Fetch',
        body: drill
          ? 'Short exercises: useState/useEffect patterns, dependency pitfalls.'
          : 'Load data, handle loading/errors, and keep UI responsive.',
      },
      {
        day: 'Day 3',
        title: 'Polish + Deploy',
        body: 'Refactor, add small animations, then push to a hosted preview.',
      },
    ];
  }

  if (track === 'backend') {
    return [
      {
        day: 'Day 1',
        title: projectFirst ? 'API Skeleton' : 'HTTP & REST Basics',
        body: projectFirst
          ? 'Create endpoints + simple in-memory storage. Focus on correctness.'
          : 'Methods, status codes, JSON contracts, validation. Then mini tasks.',
      },
      {
        day: 'Day 2',
        title: 'Persistence',
        body: 'Add database schema + queries. Think in data flows.',
      },
      {
        day: 'Day 3',
        title: drill ? 'Error Handling Drills' : 'Auth + Security Basics',
        body: drill
          ? 'Small exercises: edge cases, retries, timeouts.'
          : 'Tokens, middleware, and basic access control patterns.',
      },
    ];
  }

  if (track === 'fullstack') {
    return [
      {
        day: 'Day 1',
        title: 'End-to-end Slice',
        body: 'Build one feature through UI → API → data. Keep it small.',
      },
      {
        day: 'Day 2',
        title: projectFirst ? 'Ship Feature 2' : 'Data Flow & State',
        body: projectFirst
          ? 'Add a second feature + error/loading states.'
          : 'Learn client/server contracts and app state boundaries.',
      },
      {
        day: 'Day 3',
        title: 'Refactor & Tests',
        body: 'Clean up + add minimal tests and a checklist.',
      },
    ];
  }

  // fallback
  return [
    {
      day: 'Day 1',
      title: 'Foundations',
      body: 'Set up environment + first small quest.',
    },
    { day: 'Day 2', title: 'Practice', body: 'Drills + feedback loop.' },
    { day: 'Day 3', title: 'Ship', body: 'Apply knowledge to a small output.' },
  ];
}

function OnboardingSummary() {
  const navigate = useNavigate();
  const logoSrc = '/component_2_2x.png';

  const survey = useMemo(() => loadJson<SurveyState>(SURVEY_STORAGE_KEY), []);
  const quiz = useMemo(() => loadJson<QuizResult>(QUIZ_STORAGE_KEY), []);

  const scorePct = quiz ? Math.round((quiz.score / quiz.total) * 100) : null;
  const primaryTrack: TrackId = (survey?.tracks?.[0] ?? 'frontend') as TrackId;

  const plan = useMemo(
    () => planFor(primaryTrack, survey?.learningStyle ?? null),
    [primaryTrack, survey?.learningStyle]
  );

  const targetDifficulty = useMemo(
    () => difficultyLabel(survey?.difficulty ?? null, scorePct),
    [survey?.difficulty, scorePct]
  );

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--cg-container-a30),transparent_55%),radial-gradient(circle_at_78%_22%,var(--cg-coral-a18),transparent_58%),radial-gradient(circle_at_30%_88%,var(--cg-amber-a14),transparent_58%)]" />
        <div className="absolute -top-56 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--cg-container-a30),transparent_62%)] blur-2xl" />
      </div>

      <header className="relative z-10 border-b border-[color:var(--cg-border)] bg-transparent px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
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
            Quest Map Ready
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              className="text-xs font-semibold text-[color:var(--cg-text-muted)] transition hover:text-[color:var(--cg-text)]"
              onClick={() => navigate('/')}
            >
              Back to Map
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-24 pt-12">
        <section className="relative overflow-hidden rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-10 shadow-[0_40px_160px_rgba(0,0,0,0.36)] backdrop-blur">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(255,126,95,0.18),transparent_60%),radial-gradient(circle_at_75%_65%,rgba(74,222,128,0.12),transparent_55%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7E5F]/30 bg-[#FF7E5F]/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-[#FF7E5F]">
              ⚡ PERSONALIZED ONBOARDING COMPLETE
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
              Your Quest Map is Ready
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
              We’ll start you on a focused route, then refine as you complete
              real practice quests.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] p-5 ring-1 ring-[rgba(255,255,255,0.06)]">
                <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                  PRIMARY TRACK
                </div>
                <div className="mt-3 text-xl font-semibold">
                  {niceTrack(primaryTrack)}
                </div>
                <p className="mt-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                  Based on your goals and picks, this track will unlock the most
                  relevant quests first.
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] p-5 ring-1 ring-[rgba(255,255,255,0.06)]">
                <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                  STARTING DIFFICULTY
                </div>
                <div className="mt-3 text-xl font-semibold">
                  {targetDifficulty}
                </div>
                <p className="mt-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                  Difficulty is adaptive — it will shift as your performance
                  changes.
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] p-5 ring-1 ring-[rgba(255,255,255,0.06)]">
                <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                  CALIBRATION SCORE
                </div>
                <div className="mt-3 text-xl font-semibold">
                  {scorePct != null ? `${scorePct}%` : '—'}
                </div>
                <p className="mt-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                  A quick snapshot — the real signal is how you solve practice
                  quests.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--cg-green)] px-5 py-3 text-xs font-bold text-[#0f0b3c] shadow-[0_16px_60px_rgba(74,222,128,0.18)] transition hover:bg-[color:var(--cg-green-hover)] active:scale-[0.98]"
                onClick={() => navigate('/practice')}
              >
                Enter Practice Workspace <span className="text-sm">↯</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-5 py-3 text-xs font-semibold text-[color:var(--cg-text)] backdrop-blur-md transition hover:bg-[color:var(--cg-container-a22)]"
                onClick={() => navigate('/')}
              >
                Back to Map
              </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-8 shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                  WEEK 1 — STARTER PACK
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  Your first 3 quests
                </h2>
                <p className="mt-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                  This is a starter path. We’ll adapt after your first attempt.
                </p>
              </div>
              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--cg-bg-a55)] ring-1 ring-[rgba(255,255,255,0.10)] md:flex">
                <span className="text-lg">🗺️</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {plan.map((item) => (
                <div
                  key={item.day}
                  className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
                        {item.day.toUpperCase()}
                      </div>
                      <div className="mt-2 text-sm font-semibold">
                        {item.title}
                      </div>
                      <div className="mt-2 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                        {item.body}
                      </div>
                    </div>
                    <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[color:var(--cg-green)] shadow-[0_0_0_6px_rgba(74,222,128,0.10)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-8 shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
            <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
              YOUR SIGNALS
            </div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              What we understood about you
            </h2>

            <div className="mt-6 space-y-4 text-xs text-[color:var(--cg-text-muted)]">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] px-5 py-4">
                <span>Experience level</span>
                <span className="font-semibold text-[color:var(--cg-text)]">
                  {survey?.experienceLevel ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] px-5 py-4">
                <span>Primary goal</span>
                <span className="font-semibold text-[color:var(--cg-text)]">
                  {survey?.primaryGoal ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] px-5 py-4">
                <span>Weekly time</span>
                <span className="font-semibold text-[color:var(--cg-text)]">
                  {survey?.weeklyTime ?? '—'}
                </span>
              </div>
              <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span>Checkpoint</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {survey?.checkpoint?.trim() ? 'Set' : '—'}
                  </span>
                </div>
                {survey?.checkpoint?.trim() ? (
                  <p className="mt-3 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                    “{survey.checkpoint.trim()}”
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#FFA500]/25 bg-[#FFA500]/10 p-5 text-xs text-[color:var(--cg-text)]">
              Tip: if you want to re-run onboarding, clear{' '}
              <span className="font-mono">localStorage</span> keys{' '}
              <span className="font-mono">cg_survey_v1</span> and{' '}
              <span className="font-mono">cg_quiz_v1</span>.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OnboardingSummary;
