import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QuickSettings from '../components/QuickSettings';

type ExperienceLevelId = 'novice' | 'apprentice' | 'journeyman' | 'master';
type PrimaryGoalId =
  | 'job'
  | 'projects'
  | 'competitive'
  | 'fundamentals'
  | 'fun';
type TrackId = 'frontend' | 'backend' | 'fullstack' | 'data' | 'devops' | 'mobile';
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

type Option = {
  id: string;
  title: string;
  subtitle?: string;
  flavor?: string;
  icon?: string;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const STORAGE_KEY = 'cg_survey_v1';

function OptionCard({
  option,
  selected,
  onClick,
}: {
  option: Option;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cx(
        'group relative overflow-hidden rounded-2xl border px-5 py-6 text-left shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-md transition',
        'bg-[color:var(--cg-container-a22)]',
        selected
          ? 'border-[rgba(255,165,0,0.65)] ring-1 ring-[rgba(255,165,0,0.25)]'
          : 'border-[color:var(--cg-border)] hover:border-[rgba(255,255,255,0.18)]'
      )}
      onClick={onClick}
    >
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,var(--cg-coral-a18),transparent_60%)] blur-xl" />
      </div>
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--cg-bg-a55)] ring-1 ring-[rgba(255,255,255,0.10)]">
            <span className="text-xs font-semibold tracking-wide text-[color:var(--cg-text-muted)]">
              {option.icon ?? option.title.slice(0, 1)}
            </span>
          </div>
          <div
            className={cx(
              'h-4 w-4 rounded-full border',
              selected
                ? 'border-[rgba(255,165,0,0.70)] bg-[rgba(255,165,0,0.25)]'
                : 'border-[rgba(255,255,255,0.16)] bg-[color:var(--cg-container-a22)]'
            )}
          />
        </div>

        <h2 className="mt-4 text-sm font-semibold tracking-wide">
          {option.title}
        </h2>
        {option.subtitle ? (
          <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[color:var(--cg-text-muted)]">
            {option.subtitle}
          </p>
        ) : null}

        {option.flavor ? (
          <div className="mt-5 rounded-xl bg-[color:var(--cg-bg-a55)] px-3 py-2 font-mono text-[11px] leading-4 text-[rgba(199,201,255,0.65)] ring-1 ring-[rgba(255,255,255,0.10)]">
            {option.flavor}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition',
        selected
          ? 'border-[rgba(255,165,0,0.55)] bg-[rgba(255,165,0,0.16)] text-[color:var(--cg-text)]'
          : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] hover:border-[rgba(255,255,255,0.18)] hover:text-[color:var(--cg-text)]'
      )}
    >
      {label}
    </button>
  );
}

function loadInitialState(): SurveyState {
  const fallback: SurveyState = {
    experienceLevel: 'apprentice',
    primaryGoal: null,
    tracks: [],
    weeklyTime: null,
    learningStyle: null,
    languages: [],
    difficulty: null,
    blocker: null,
    checkpoint: '',
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<SurveyState>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function Survey() {
  const navigate = useNavigate();
  const logoSrc = '/component_2_2x.png';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SurveyState>(() => loadInitialState());

  const levels = useMemo<Option[]>(
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

  const goals = useMemo<Option[]>(
    () => [
      {
        id: 'job',
        title: 'Land a job',
        subtitle: 'Portfolio + interview ready\nwith practical milestones.',
        icon: '⚔️',
      },
      {
        id: 'projects',
        title: 'Build real projects',
        subtitle: 'Ship something useful.\nLearn by doing.',
        icon: '🧩',
      },
      {
        id: 'competitive',
        title: 'Competitive programming',
        subtitle: 'DSA-heavy drills.\nSpeed + correctness.',
        icon: '⏱',
      },
      {
        id: 'fundamentals',
        title: 'Academic fundamentals',
        subtitle: 'CS basics.\nDeeper understanding.',
        icon: '📚',
      },
      {
        id: 'fun',
        title: 'Just for fun',
        subtitle: 'Explore & experiment.\nNo pressure.',
        icon: '✨',
      },
    ],
    []
  );

  const tracks = useMemo<Array<{ id: TrackId; label: string }>>(
    () => [
      { id: 'frontend', label: 'Frontend' },
      { id: 'backend', label: 'Backend' },
      { id: 'fullstack', label: 'Fullstack' },
      { id: 'data', label: 'Data' },
      { id: 'devops', label: 'DevOps' },
      { id: 'mobile', label: 'Mobile' },
    ],
    []
  );

  const weeklyTimes = useMemo<Option[]>(
    () => [
      { id: '2-4', title: '2–4h / week', subtitle: 'Light pace.\nSmall wins.' },
      { id: '5-7', title: '5–7h / week', subtitle: 'Steady.\nRecommended.' },
      { id: '8-12', title: '8–12h / week', subtitle: 'Focused.\nFast progress.' },
      { id: '13+', title: '13h+ / week', subtitle: 'Intense.\nHigh output.' },
    ],
    []
  );

  const learningStyles = useMemo<Option[]>(
    () => [
      {
        id: 'project-first',
        title: 'Project-first',
        subtitle: 'Build → learn.\nShip early.',
        icon: '🛠',
      },
      {
        id: 'theory-first',
        title: 'Theory-first',
        subtitle: 'Concept → practice.\nStructured.',
        icon: '🧠',
      },
      {
        id: 'balanced',
        title: 'Balanced',
        subtitle: 'A bit of both.\nSmooth curve.',
        icon: '⚖️',
      },
      {
        id: 'drill',
        title: 'Drill mode',
        subtitle: 'Many small exercises.\nRepetition.',
        icon: '🎯',
      },
    ],
    []
  );

  const languages = useMemo<Array<{ id: LanguageId; label: string }>>(
    () => [
      { id: 'ts', label: 'JavaScript / TypeScript' },
      { id: 'py', label: 'Python' },
      { id: 'java', label: 'Java' },
      { id: 'cpp', label: 'C / C++' },
      { id: 'sql', label: 'SQL' },
    ],
    []
  );

  const difficulties = useMemo<Option[]>(
    () => [
      {
        id: 'chill',
        title: 'Chill',
        subtitle: 'Safe & steady.\nNo rush.',
        icon: '🌿',
      },
      {
        id: 'normal',
        title: 'Normal',
        subtitle: 'Recommended.\nBest balance.',
        icon: '⚡',
      },
      {
        id: 'hardcore',
        title: 'Hardcore',
        subtitle: 'Push me.\nFast & hard.',
        icon: '🔥',
      },
    ],
    []
  );

  const blockers = useMemo<Option[]>(
    () => [
      {
        id: 'start',
        title: 'Don’t know where to start',
        subtitle: 'Need a clear path\nand first quests.',
        icon: '🧭',
      },
      {
        id: 'consistency',
        title: 'Lack of consistency',
        subtitle: 'Hard to keep\nmomentum.',
        icon: '🧱',
      },
      {
        id: 'confusing',
        title: 'Concepts feel confusing',
        subtitle: 'Need better\nexplanations.',
        icon: '🌀',
      },
      {
        id: 'projects',
        title: 'Not enough real projects',
        subtitle: 'Want portfolio\npieces.',
        icon: '🧩',
      },
      {
        id: 'interview',
        title: 'Interview anxiety',
        subtitle: 'Need practice\nand confidence.',
        icon: '🎭',
      },
    ],
    []
  );

  const missionBrief = useMemo(() => {
    if (step === 1) {
      return {
        title: 'Baseline Calibration',
        body: 'We’ll tune difficulty and pacing based on your experience level.',
        hint: 'Pick the one that feels closest today — not your dream form.',
      };
    }
    if (step === 2) {
      return {
        title: 'Quest Map Selection',
        body: 'Choose what you want to achieve and which tracks should light up on your constellation.',
        hint: 'Try to pick 1–3 tracks so we can stay focused.',
      };
    }
    if (step === 3) {
      return {
        title: 'Runes & Rituals',
        body: 'Your weekly time and learning style decide how quests are shaped (projects vs drills).',
        hint: 'No wrong answer — just pick what you’ll actually do.',
      };
    }
    return {
      title: 'Final Tuning',
      body: 'We’ll adjust pressure, remove blockers, and lock your first checkpoint.',
      hint: 'This helps us build a plan that you can finish.',
    };
  }, [step]);

  const stepTitle = useMemo(() => {
    if (step === 1) return 'Experience';
    if (step === 2) return 'Goals & Track';
    if (step === 3) return 'Preferences';
    return 'Constraints';
  }, [step]);

  const canProceed = useMemo(() => {
    if (step === 1) return Boolean(form.experienceLevel);
    if (step === 2) return Boolean(form.primaryGoal) && form.tracks.length > 0;
    if (step === 3) return Boolean(form.weeklyTime) && Boolean(form.learningStyle);
    return Boolean(form.difficulty) && Boolean(form.blocker);
  }, [form, step]);

  const metaStatus = useMemo(() => {
    if (step === 1) return 'EXPERIENCE_SELECTION_INITIALIZED()';
    if (step === 2) return 'QUEST_MAP_LOCKING_IN()';
    if (step === 3) return 'PREFERENCES_SYNCHRONIZED()';
    return 'FINAL_CALIBRATION_READY()';
  }, [step]);

  const progressPct = (step / 4) * 100;

  function toggleInArray<T extends string>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];
  }

  function handleNext() {
    if (!canProceed) return;
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ignore
    }
    // After completing survey, jump to Learning Path
    navigate('/learning-path');
  }

  function handleBack() {
    if (step === 1) return;
    setStep((s) => Math.max(1, s - 1));
  }

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

          <div className="flex w-full max-w-sm flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
              <span>STEP {String(step).padStart(2, '0')} / 04</span>
              <span>{stepTitle.toUpperCase()}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--cg-container-a16)] ring-1 ring-[rgba(255,255,255,0.08)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[color:var(--cg-coral)] via-[color:var(--cg-amber)] to-[color:var(--cg-green)] transition-[width] duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <QuickSettings />
            <button
              type="button"
              className="text-xs font-semibold text-[color:var(--cg-text-muted)] transition hover:text-[color:var(--cg-text)]"
              onClick={() => navigate('/')}
            >
              Skip
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-28 pt-10">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Forge Your Path
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
            Answer a few questions and we’ll craft your personalized quest map.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {step === 1 ? (
              <div>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                      STEP 01 — EXPERIENCE
                    </div>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight">
                      Choose your experience level
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                  {levels.map((level) => (
                    <OptionCard
                      key={level.id}
                      option={level}
                      selected={form.experienceLevel === level.id}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          experienceLevel: level.id as ExperienceLevelId,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                    STEP 02 — GOALS & TRACK
                  </div>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">
                    What’s your primary goal?
                  </h2>
                  <p className="mt-1 text-xs text-[color:var(--cg-text-muted)]">
                    We’ll optimize quests and milestones around this.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {goals.map((goal) => (
                    <OptionCard
                      key={goal.id}
                      option={goal}
                      selected={form.primaryGoal === (goal.id as PrimaryGoalId)}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          primaryGoal: goal.id as PrimaryGoalId,
                        }))
                      }
                    />
                  ))}
                </div>

                <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-md">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold tracking-wide">
                      Interested tracks
                    </h3>
                    <p className="text-xs text-[color:var(--cg-text-muted)]">
                      Pick 1–3 for the best personalization.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tracks.map((t) => (
                      <Pill
                        key={t.id}
                        label={t.label}
                        selected={form.tracks.includes(t.id)}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            tracks: toggleInArray(prev.tracks, t.id),
                          }))
                        }
                      />
                    ))}
                  </div>
                  {form.tracks.length > 3 ? (
                    <p className="mt-3 text-xs font-semibold text-[rgba(255,126,95,0.9)]">
                      Tip: try keeping it to 3 tracks so we stay focused.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                    STEP 03 — PREFERENCES
                  </div>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">
                    How do you want to learn?
                  </h2>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide">
                    Weekly time commitment
                  </h3>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                    {weeklyTimes.map((opt) => (
                      <OptionCard
                        key={opt.id}
                        option={opt}
                        selected={form.weeklyTime === (opt.id as WeeklyTimeId)}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            weeklyTime: opt.id as WeeklyTimeId,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide">
                    Learning style
                  </h3>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {learningStyles.map((opt) => (
                      <OptionCard
                        key={opt.id}
                        option={opt}
                        selected={
                          form.learningStyle === (opt.id as LearningStyleId)
                        }
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            learningStyle: opt.id as LearningStyleId,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-md">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold tracking-wide">
                      Preferred languages/tools{' '}
                      <span className="text-xs font-semibold text-[color:var(--cg-text-muted)]">
                        (optional)
                      </span>
                    </h3>
                    <p className="text-xs text-[color:var(--cg-text-muted)]">
                      We’ll prioritize examples and projects using your picks.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <Pill
                        key={lang.id}
                        label={lang.label}
                        selected={form.languages.includes(lang.id)}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            languages: toggleInArray(prev.languages, lang.id),
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-6">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                    STEP 04 — CONSTRAINTS
                  </div>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">
                    Final tuning
                  </h2>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide">
                    Difficulty appetite
                  </h3>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {difficulties.map((opt) => (
                      <OptionCard
                        key={opt.id}
                        option={opt}
                        selected={form.difficulty === (opt.id as DifficultyId)}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            difficulty: opt.id as DifficultyId,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide">
                    Biggest blocker right now
                  </h3>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {blockers.map((opt) => (
                      <OptionCard
                        key={opt.id}
                        option={opt}
                        selected={form.blocker === (opt.id as BlockerId)}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            blocker: opt.id as BlockerId,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-md">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold tracking-wide">
                      Goal checkpoint{' '}
                      <span className="text-xs font-semibold text-[color:var(--cg-text-muted)]">
                        (optional)
                      </span>
                    </h3>
                    <p className="text-xs text-[color:var(--cg-text-muted)]">
                      Example: “In 30 days I want to build a habit tracker app.”
                    </p>
                  </div>
                  <textarea
                    value={form.checkpoint}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, checkpoint: e.target.value }))
                    }
                    rows={4}
                    placeholder="In 30 days I want to…"
                    className={cx(
                      'mt-4 w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition',
                      'border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] text-[color:var(--cg-text)]',
                      'placeholder:text-[rgba(199,201,255,0.40)] focus:border-[rgba(255,165,0,0.45)] focus:ring-2 focus:ring-[rgba(255,165,0,0.18)]'
                    )}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] shadow-[0_40px_140px_rgba(0,0,0,0.30)] backdrop-blur-md">
              <div className="relative p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_12%,var(--cg-container-a30),transparent_58%),radial-gradient(circle_at_80%_18%,var(--cg-coral-a18),transparent_62%),radial-gradient(circle_at_50%_90%,var(--cg-amber-a14),transparent_62%)]" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                        MISSION BRIEF
                      </div>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight">
                        {missionBrief.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                        {missionBrief.body}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--cg-bg-a55)] ring-1 ring-[rgba(255,255,255,0.10)]">
                      <span className="text-sm font-semibold text-[color:var(--cg-text)]">
                        ⌁
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl bg-[color:var(--cg-bg-a55)] px-4 py-3 text-xs leading-5 text-[rgba(199,201,255,0.70)] ring-1 ring-[rgba(255,255,255,0.10)]">
                    {missionBrief.hint}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.20)] backdrop-blur-md">
              <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                PREVIEW
              </div>
              <div className="mt-4 space-y-3 text-xs text-[color:var(--cg-text-muted)]">
                <div className="flex items-center justify-between gap-3">
                  <span>Experience</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {form.experienceLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Goal</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {form.primaryGoal ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Tracks</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {form.tracks.length ? form.tracks.join(', ') : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Weekly time</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {form.weeklyTime ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Style</span>
                  <span className="font-semibold text-[color:var(--cg-text)]">
                    {form.learningStyle ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            type="button"
            className={cx(
              'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition',
              step === 1
                ? 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] opacity-60'
                : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[color:var(--cg-container-a22)]'
            )}
            disabled={step === 1}
            onClick={handleBack}
          >
            ← Back
          </button>

          <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
            STEP {String(step).padStart(2, '0')} / 04 · {metaStatus}
          </div>

          <button
            type="button"
            className={cx(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-[0_16px_60px_rgba(74,222,128,0.18)] transition active:brightness-95',
              canProceed
                ? 'bg-[color:var(--cg-green)] text-[#0f0b3c] hover:bg-[color:var(--cg-green-hover)]'
                : 'cursor-not-allowed bg-[rgba(74,222,128,0.20)] text-[rgba(15,11,60,0.55)] shadow-none'
            )}
            onClick={handleNext}
          >
            {step === 4 ? 'Finish' : 'Next Step'}{' '}
            <span className="text-[14px] leading-none">↯</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Survey;
