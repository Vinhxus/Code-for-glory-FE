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

type QuizQuestion = {
  id: string;
  title: string;
  prompt: string;
  code?: string;
  options: string[];
  correctIndex: number;
  tag: string;
};

type QuizResult = {
  version: 'v1';
  completedAt: string;
  score: number;
  total: number;
  answers: Record<string, number>;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const SURVEY_STORAGE_KEY = 'cg_survey_v1';
const QUIZ_STORAGE_KEY = 'cg_quiz_v1';

function loadSurvey(): SurveyState | null {
  try {
    const raw = localStorage.getItem(SURVEY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SurveyState;
  } catch {
    return null;
  }
}

function tagColor(tag: string) {
  if (tag === 'async') return 'text-[#FF7E5F] border-[#FF7E5F]/30 bg-[#FF7E5F]/10';
  if (tag === 'types') return 'text-[#FFA500] border-[#FFA500]/30 bg-[#FFA500]/10';
  if (tag === 'react') return 'text-[#4F46E5] border-[#4F46E5]/30 bg-[#4F46E5]/10';
  return 'text-[color:var(--cg-text-muted)] border-white/10 bg-white/5';
}

function buildQuiz(tracks: TrackId[]): QuizQuestion[] {
  const prefersFrontend = tracks.includes('frontend') || tracks.includes('fullstack');
  const prefersBackend = tracks.includes('backend') || tracks.includes('fullstack');

  const base: QuizQuestion[] = [
    {
      id: 'q_async_await',
      tag: 'async',
      title: 'Async/Await',
      prompt: 'What does the await keyword do?',
      options: [
        'It blocks the entire JavaScript runtime until the promise resolves',
        'It pauses the async function execution until the promise resolves or rejects',
        'It converts a callback into a promise automatically',
        'It makes a function run on a separate thread',
      ],
      correctIndex: 1,
    },
    {
      id: 'q_promise_all',
      tag: 'async',
      title: 'Promise.all',
      prompt: 'If one promise rejects inside Promise.all([...]), what happens?',
      options: [
        'Promise.all resolves with the successful results only',
        'Promise.all waits for all promises and then returns partial results',
        'Promise.all rejects immediately with that rejection reason',
        'Promise.all retries the rejected promise automatically',
      ],
      correctIndex: 2,
    },
    {
      id: 'q_typescript_narrow',
      tag: 'types',
      title: 'TypeScript Narrowing',
      prompt: 'In TypeScript, what is a common way to narrow a union type?',
      options: [
        'Use console.log() to inspect the runtime type',
        'Use typeof / in checks, or discriminated unions',
        'Put types in comments for the compiler',
        'Use JSON.stringify() before using the value',
      ],
      correctIndex: 1,
    },
  ];

  const reactSet: QuizQuestion[] = [
    {
      id: 'q_react_state',
      tag: 'react',
      title: 'React State',
      prompt: 'Which statement about React state updates is true?',
      options: [
        'State updates are always synchronous',
        'You should mutate state objects directly for performance',
        'React may batch state updates within the same event loop tick',
        'setState returns the new state immediately',
      ],
      correctIndex: 2,
      code: `// Imagine this runs inside an onClick handler\nsetCount(count + 1)\nsetCount(count + 1)\n\n// What can happen?`,
    },
    {
      id: 'q_react_effect',
      tag: 'react',
      title: 'useEffect',
      prompt: 'When does useEffect run (with empty dependency array)?',
      options: [
        'On every render',
        'Only on initial mount (and cleanup on unmount)',
        'Only when props change',
        'Before the component renders',
      ],
      correctIndex: 1,
    },
  ];

  const backendSet: QuizQuestion[] = [
    {
      id: 'q_http_methods',
      tag: 'types',
      title: 'HTTP Basics',
      prompt: 'Which HTTP method is typically used to update a resource?',
      options: ['GET', 'PUT/PATCH', 'TRACE', 'CONNECT'],
      correctIndex: 1,
    },
    {
      id: 'q_sql_index',
      tag: 'types',
      title: 'Database',
      prompt: 'What is a common benefit of using an index in a database table?',
      options: [
        'It encrypts the table automatically',
        'It improves read/query performance for indexed columns',
        'It reduces the size of the table to zero',
        'It guarantees no duplicates in all columns',
      ],
      correctIndex: 1,
    },
  ];

  const adaptive: QuizQuestion[] = [
    ...(prefersFrontend ? reactSet : []),
    ...(prefersBackend ? backendSet : []),
  ];

  const merged = [...base, ...adaptive];

  // Keep it concise (6 questions max for onboarding v1)
  return merged.slice(0, 6);
}

function OnboardingQuiz() {
  const navigate = useNavigate();
  const logoSrc = '/component_2_2x.png';

  const survey = useMemo(() => loadSurvey(), []);
  const questions = useMemo(() => buildQuiz(survey?.tracks ?? []), [survey]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const current = questions[index];
  const selected = current ? answers[current.id] : undefined;
  const progressPct =
    questions.length === 0 ? 0 : ((index + 1) / questions.length) * 100;

  const canNext = current ? typeof selected === 'number' : false;

  function submit() {
    const total = questions.length;
    const score = questions.reduce((acc, q) => {
      const a = answers[q.id];
      return acc + (a === q.correctIndex ? 1 : 0);
    }, 0);

    const result: QuizResult = {
      version: 'v1',
      completedAt: new Date().toISOString(),
      score,
      total,
      answers,
    };

    try {
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(result));
    } catch {
      // ignore
    }

    navigate('/onboarding/assessment');
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
              <span>CALIBRATION QUIZ</span>
              <span>
                Q{index + 1}/{questions.length}
              </span>
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
            Skill Calibration
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--cg-text-muted)]">
            A quick check so we can place you into the right difficulty curve.
          </p>
        </div>

        {survey ? (
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-5 py-4 text-xs text-[color:var(--cg-text-muted)] backdrop-blur">
            Profile loaded:{' '}
            <span className="font-semibold text-[color:var(--cg-text)]">
              {survey.experienceLevel}
            </span>{' '}
            · tracks:{' '}
            <span className="font-semibold text-[color:var(--cg-text)]">
              {survey.tracks.length ? survey.tracks.join(', ') : '—'}
            </span>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[rgba(255,126,95,0.35)] bg-[rgba(255,126,95,0.12)] px-5 py-4 text-xs text-[rgba(255,255,255,0.80)] backdrop-blur">
            No survey found. You can still take the quiz, but personalization may
            be limited.
          </div>
        )}

        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] shadow-[0_40px_160px_rgba(0,0,0,0.36)] backdrop-blur">
            <div className="p-7">
              {current ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                      QUESTION {index + 1} / {questions.length}
                    </div>
                    <div
                      className={cx(
                        'rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide',
                        tagColor(current.tag)
                      )}
                    >
                      {current.title}
                    </div>
                  </div>

                  <h2 className="mt-4 text-xl font-semibold tracking-tight">
                    {current.prompt}
                  </h2>

                  <div className="mt-5 space-y-3">
                    {current.options.map((opt, i) => {
                      const isActive = selected === i;
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={cx(
                            'group flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition',
                            isActive
                              ? 'border-[rgba(255,165,0,0.55)] bg-[rgba(255,165,0,0.14)]'
                              : 'border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a55)] hover:border-[rgba(255,255,255,0.18)]'
                          )}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [current.id]: i }))
                          }
                        >
                          <div
                            className={cx(
                              'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold',
                              isActive
                                ? 'border-[rgba(255,165,0,0.65)] bg-[rgba(255,165,0,0.22)] text-[color:var(--cg-text)]'
                                : 'border-white/10 bg-white/5 text-[color:var(--cg-text-muted)]'
                            )}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                          <div className="text-sm leading-6 text-[color:var(--cg-text)]">
                            {opt}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-8 text-sm text-[color:var(--cg-text-muted)]">
                  No questions available.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] shadow-[0_40px_160px_rgba(0,0,0,0.30)] backdrop-blur">
              <div className="relative p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_12%,var(--cg-container-a30),transparent_58%),radial-gradient(circle_at_80%_18%,var(--cg-coral-a18),transparent_62%),radial-gradient(circle_at_50%_90%,var(--cg-amber-a14),transparent_62%)]" />
                <div className="relative">
                  <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                    CODE CONTEXT
                  </div>
                  <div className="mt-4 rounded-2xl bg-[color:var(--cg-bg-a55)] p-4 font-mono text-[12px] leading-5 text-[rgba(199,201,255,0.75)] ring-1 ring-[rgba(255,255,255,0.10)]">
                    <pre className="whitespace-pre-wrap">
                      {current?.code ??
                        `// Tip\n// Choose the answer that best matches runtime behavior.\n\nconst quest = await Promise.resolve("glory");\nconsole.log(quest);`}
                    </pre>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                    This onboarding quiz is lightweight — we’ll refine your path
                    with real practice quests next.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-6 backdrop-blur">
              <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
                OBJECTIVE
              </div>
              <p className="mt-3 text-xs leading-5 text-[color:var(--cg-text-muted)]">
                We’ll use your quiz score to choose:
              </p>
              <ul className="mt-3 space-y-2 text-xs text-[color:var(--cg-text-muted)]">
                <li className="flex gap-2">
                  <span className="text-[color:var(--cg-green)]">✓</span>
                  Starting difficulty
                </li>
                <li className="flex gap-2">
                  <span className="text-[color:var(--cg-green)]">✓</span>
                  First quest pack
                </li>
                <li className="flex gap-2">
                  <span className="text-[color:var(--cg-green)]">✓</span>
                  Suggested learning rhythm
                </li>
              </ul>
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
              index === 0
                ? 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] opacity-60'
                : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[color:var(--cg-container-a22)]'
            )}
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            ← Back
          </button>

          <div className="text-[11px] font-semibold tracking-[0.28em] text-[rgba(199,201,255,0.55)]">
            CALIBRATING() · ANSWER_REQUIRED={String(!canNext).toUpperCase()}
          </div>

          <button
            type="button"
            className={cx(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition active:brightness-95',
              canNext
                ? 'bg-[color:var(--cg-green)] text-[#0f0b3c] shadow-[0_16px_60px_rgba(74,222,128,0.18)] hover:bg-[color:var(--cg-green-hover)]'
                : 'cursor-not-allowed bg-[rgba(74,222,128,0.20)] text-[rgba(15,11,60,0.55)] shadow-none'
            )}
            onClick={() => {
              if (!canNext) return;
              if (index === questions.length - 1) {
                submit();
                return;
              }
              setIndex((i) => Math.min(questions.length - 1, i + 1));
            }}
          >
            {index === questions.length - 1 ? 'Finish Quiz' : 'Next'}{' '}
            <span className="text-[14px] leading-none">↯</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingQuiz;
