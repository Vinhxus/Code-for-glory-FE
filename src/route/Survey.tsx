import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type CareerPathId = 'frontend' | 'backend' | 'fullstack';
type PurposeId = 'job' | 'project';
type SelfAssessmentId = 'beginner' | 'junior';
type PenaltyId = 'light' | 'strict';

type SurveyState = {
  careerPath: CareerPathId | null;
  purpose: PurposeId | null;
  selfAssessment: SelfAssessmentId | null;
  testScore: number;
  testCompleted: boolean;
  hoursPerDay: number;
  focusTime: string;
  penaltyAcceptance: PenaltyId | null;
};

type Option = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
};

type Question = {
  id: string;
  text: string;
  options: string[];
  correct: number;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const STORAGE_KEY = 'cg_survey_v2';

const FE_QUESTIONS: Question[] = [
  {
    id: 'fe1',
    text: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'Home Tool Markup Language',
      'Hyperlinks and Text Markup Language',
      'Hyper Tool Markup Language',
    ],
    correct: 0,
  },
  {
    id: 'fe2',
    text: 'Which CSS property controls the text size?',
    options: ['font-style', 'text-size', 'font-size', 'text-style'],
    correct: 2,
  },
  {
    id: 'fe3',
    text: 'How to write an IF statement in JavaScript?',
    options: ['if i = 5 then', 'if i == 5 then', 'if (i == 5)', 'if i = 5'],
    correct: 2,
  },
  {
    id: 'fe4',
    text: 'What is the Virtual DOM in React?',
    options: [
      'A direct copy of the real DOM',
      'A lightweight JavaScript representation of the DOM',
      'A plugin for faster rendering',
      'A database for React components',
    ],
    correct: 1,
  },
  {
    id: 'fe5',
    text: 'Which hook is used for side effects in React?',
    options: ['useState', 'useContext', 'useReducer', 'useEffect'],
    correct: 3,
  },
];

const BE_QUESTIONS: Question[] = [
  {
    id: 'be1',
    text: 'What does SQL stand for?',
    options: [
      'Strong Question Language',
      'Structured Query Language',
      'Structured Question Language',
      'Standard Query Language',
    ],
    correct: 1,
  },
  {
    id: 'be2',
    text: 'What is an API?',
    options: [
      'Application Programming Interface',
      'Applied Programming Interface',
      'Application Program Interface',
      'Application Process Interface',
    ],
    correct: 0,
  },
  {
    id: 'be3',
    text: 'Which of these is a NoSQL DB?',
    options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
    correct: 2,
  },
  {
    id: 'be4',
    text: 'What does CRUD mean?',
    options: [
      'Create, Read, Update, Delete',
      'Create, Remove, Update, Delete',
      'Copy, Read, Update, Delete',
      'Create, Read, Upload, Delete',
    ],
    correct: 0,
  },
  {
    id: 'be5',
    text: 'Which HTTP method is used to create a new resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    correct: 1,
  },
];

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--cg-bg-a55)] ring-1 ring-[rgba(255,255,255,0.10)] text-lg">
            {option.icon ?? option.title.slice(0, 1)}
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
        {option.subtitle && (
          <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[color:var(--cg-text-muted)]">
            {option.subtitle}
          </p>
        )}
      </div>
    </button>
  );
}

function loadInitialState(): SurveyState {
  const fallback: SurveyState = {
    careerPath: null,
    purpose: null,
    selfAssessment: null,
    testScore: 0,
    testCompleted: false,
    hoursPerDay: 2,
    focusTime: 'Evening',
    penaltyAcceptance: null,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export default function Survey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SurveyState>(() => loadInitialState());

  // Quick Test State
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTesting, setIsTesting] = useState(false);

  const questions = form.careerPath === 'backend' ? BE_QUESTIONS : FE_QUESTIONS;

  const handleAnswer = useCallback(
    (optIndex: number) => {
      if (optIndex === questions[qIndex].correct) {
        setForm((prev) => ({ ...prev, testScore: prev.testScore + 1 }));
      }
      if (qIndex < questions.length - 1) {
        setQIndex((q) => q + 1);
        setTimeLeft(30);
      } else {
        setIsTesting(false);
        setForm((prev) => ({ ...prev, testCompleted: true }));
      }
    },
    [qIndex, questions]
  );

  useEffect(() => {
    if (!isTesting) return;
    if (timeLeft <= 0) {
      // Defer to avoid synchronous setState during effect
      setTimeout(() => handleAnswer(-1), 0);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isTesting, timeLeft, handleAnswer]);

  const startTest = () => {
    setQIndex(0);
    setTimeLeft(30);
    setForm((prev) => ({ ...prev, testScore: 0, testCompleted: false }));
    setIsTesting(true);
  };

  const careerPaths: Option[] = [
    {
      id: 'frontend',
      title: 'Frontend Developer',
      subtitle: 'UI, Web, React',
      icon: '🎨',
    },
    {
      id: 'backend',
      title: 'Backend Developer',
      subtitle: 'API, Database, Logic',
      icon: '⚙️',
    },
    {
      id: 'fullstack',
      title: 'Fullstack Developer',
      subtitle: 'End-to-End mastery',
      icon: '🌐',
    },
  ];
  const purposes: Option[] = [
    {
      id: 'job',
      title: 'Land a Job',
      subtitle: 'Professional career',
      icon: '💼',
    },
    {
      id: 'project',
      title: 'Personal Projects',
      subtitle: 'Build my ideas',
      icon: '🚀',
    },
  ];
  const assessments: Option[] = [
    {
      id: 'beginner',
      title: 'Beginner',
      subtitle: 'New to coding or just basic syntax.',
      icon: '🌱',
    },
    {
      id: 'junior',
      title: 'Junior',
      subtitle: 'Can build small apps, know basics.',
      icon: '⭐',
    },
  ];
  const penalties: Option[] = [
    {
      id: 'light',
      title: 'Light (Reminder)',
      subtitle: 'Just remind me gently.',
      icon: '🌿',
    },
    {
      id: 'strict',
      title: 'Strict (Locked)',
      subtitle: 'Lock lessons on failure, force recall tests.',
      icon: '🔥',
    },
  ];

  const canProceed = useMemo(() => {
    if (step === 1) return Boolean(form.careerPath) && Boolean(form.purpose);
    if (step === 2) return Boolean(form.selfAssessment) && form.testCompleted;
    if (step === 3) return Boolean(form.penaltyAcceptance);
    return true; // Confirmation step
  }, [form, step]);

  const handleNext = () => {
    if (!canProceed) return;
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      navigate('/learning-path');
    }
  };

  const userLevel =
    form.testScore === 5
      ? 'Advanced'
      : form.testScore >= 3
        ? 'Intermediate'
        : 'Beginner';

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] flex flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--cg-container-a30),transparent_55%),radial-gradient(circle_at_78%_22%,var(--cg-coral-a18),transparent_58%),radial-gradient(circle_at_30%_88%,var(--cg-amber-a14),transparent_58%)]" />
        <div className="absolute -top-56 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--cg-container-a30),transparent_62%)] blur-2xl" />
      </div>

      <header className="relative z-10 border-b border-[color:var(--cg-border)] bg-transparent px-6 py-4 flex-shrink-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/component_2_2x.png"
              alt="Logo"
              className="h-8 w-8 object-contain"
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
              <span>
                {step === 1
                  ? 'CAREER'
                  : step === 2
                    ? 'SKILL'
                    : step === 3
                      ? 'DISCIPLINE'
                      : 'CONFIRM'}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--cg-container-a16)] ring-1 ring-[rgba(255,255,255,0.08)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[color:var(--cg-coral)] via-[color:var(--cg-amber)] to-[color:var(--cg-green)] transition-[width] duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              className="text-xs font-semibold text-[color:var(--cg-text-muted)] transition hover:text-[color:var(--cg-text)]"
              onClick={() => navigate('/')}
            >
              Skip
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex-1 w-full max-w-6xl flex-col gap-6 px-6 pb-28 pt-10">
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-semibold tracking-tight text-center mb-8">
              Career Path & Goals
            </h1>
            <div className="space-y-8 max-w-3xl mx-auto">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-[#ff7e5f]">
                  1. Target Field
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {careerPaths.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      selected={form.careerPath === opt.id}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          careerPath: opt.id as CareerPathId,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4 text-[#fbbf24]">
                  2. Purpose
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {purposes.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      selected={form.purpose === opt.id}
                      onClick={() =>
                        setForm((p) => ({ ...p, purpose: opt.id as PurposeId }))
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-semibold tracking-tight text-center mb-8">
              Skill Assessment
            </h1>
            <div className="space-y-8 max-w-3xl mx-auto">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-[#ff7e5f]">
                  1. Self Assessment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessments.map((opt) => (
                    <OptionCard
                      key={opt.id}
                      option={opt}
                      selected={form.selfAssessment === opt.id}
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          selfAssessment: opt.id as SelfAssessmentId,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-6 backdrop-blur-md">
                <h2 className="text-lg font-semibold mb-2">
                  2. Quick Technical Test
                </h2>
                <p className="text-sm text-[color:var(--cg-text-muted)] mb-4">
                  5 quick questions (30s each) to calibrate your starting point.
                </p>

                {!isTesting && !form.testCompleted && (
                  <button
                    onClick={startTest}
                    className="neon-btn px-6 py-2 w-full md:w-auto"
                  >
                    Start Quick Test
                  </button>
                )}

                {isTesting && (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-[#fbbf24]">
                        Question {qIndex + 1} of 5
                      </span>
                      <span
                        className={cx(
                          'text-sm font-bold',
                          timeLeft <= 10
                            ? 'text-red-400 animate-pulse'
                            : 'text-[#4ade80]'
                        )}
                      >
                        ⏱ {timeLeft}s
                      </span>
                    </div>
                    <h3 className="text-xl font-medium mb-6">
                      {questions[qIndex].text}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {questions[qIndex].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4 text-sm text-left hover:bg-[color:var(--cg-bg-a55)] hover:border-[#ff7e5f]/50 transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {form.testCompleted && (
                  <div className="flex items-center gap-4 text-[#4ade80] animate-bounce-in">
                    <span className="material-symbols-outlined text-3xl">
                      check_circle
                    </span>
                    <div>
                      <div className="font-bold">Test Completed!</div>
                      <div className="text-sm text-[color:var(--cg-text-muted)]">
                        Score: {form.testScore}/5. Evaluated Level:{' '}
                        <span className="text-white">{userLevel}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-semibold tracking-tight text-center mb-8">
              Discipline Setup
            </h1>
            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a22)] p-6 backdrop-blur-md">
                  <h2 className="text-sm font-semibold mb-4 text-[#ff7e5f]">
                    Time Commitment
                  </h2>
                  <label className="block text-xs text-[color:var(--cg-text-muted)] mb-2">
                    Hours per day ({form.hoursPerDay}h)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={form.hoursPerDay}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        hoursPerDay: parseInt(e.target.value),
                      }))
                    }
                    className="w-full accent-[#ff7e5f]"
                  />
                  <label className="block text-xs text-[color:var(--cg-text-muted)] mt-4 mb-2">
                    Best Focus Time
                  </label>
                  <select
                    value={form.focusTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, focusTime: e.target.value }))
                    }
                    className="w-full bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] rounded-lg p-2 text-sm outline-none"
                  >
                    <option className="text-black">Morning (6AM - 11AM)</option>
                    <option className="text-black">
                      Afternoon (1PM - 5PM)
                    </option>
                    <option className="text-black">Evening (7PM - 11PM)</option>
                    <option className="text-black">Night Owl (11PM+)</option>
                  </select>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-[#4ade80]">
                    Penalty Acceptance
                  </h2>
                  <div className="flex flex-col gap-4">
                    {penalties.map((opt) => (
                      <OptionCard
                        key={opt.id}
                        option={opt}
                        selected={form.penaltyAcceptance === opt.id}
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            penaltyAcceptance: opt.id as PenaltyId,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up flex flex-col items-center justify-center flex-1">
            <div className="relative p-[1px] rounded-3xl overflow-hidden max-w-lg w-full mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff7e5f] via-[#fbbf24] to-[#4ade80] opacity-50 animate-pulse-glow" />
              <div className="relative bg-[color:var(--cg-bg-a72)] backdrop-blur-xl rounded-3xl p-8 text-center border border-white/10">
                <div className="h-16 w-16 mx-auto bg-gradient-to-br from-[#ff7e5f] to-[#fbbf24] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#ff7e5f]/20">
                  <span className="material-symbols-outlined text-3xl text-[#0f0b3c]">
                    military_tech
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-4">
                  Your Profile is Ready
                </h1>
                <p className="text-sm leading-relaxed text-[color:var(--cg-text-muted)] mb-6">
                  Chúng tôi nhận thấy bạn là một{' '}
                  <strong className="text-white">
                    Potential{' '}
                    {form.selfAssessment === 'junior' ? 'Junior' : 'Beginner'}{' '}
                    {form.careerPath?.toUpperCase()}
                  </strong>{' '}
                  ({userLevel} level), sẵn sàng học{' '}
                  <strong className="text-[#ff7e5f]">
                    {form.hoursPerDay}h
                  </strong>{' '}
                  mỗi {form.focusTime.split(' ')[0]}. Chúng tôi sẽ áp dụng chế
                  độ Kỷ luật mức{' '}
                  <strong className="text-[#fbbf24]">
                    {form.penaltyAcceptance === 'strict'
                      ? 'B (Nghiêm khắc)'
                      : 'A (Nhẹ nhàng)'}
                  </strong>{' '}
                  cho bạn.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={handleNext}
                    className="neon-btn px-8 py-3 text-sm font-bold flex items-center gap-2"
                  >
                    Bắt đầu hành trình{' '}
                    <span className="material-symbols-outlined text-[18px]">
                      rocket_launch
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {step < 4 && (
        <div className="sticky bottom-0 z-20 border-t border-[color:var(--cg-border)] bg-[color:var(--cg-bg-a72)] backdrop-blur-xl flex-shrink-0">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <button
              className={cx(
                'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition',
                step === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text)] hover:bg-[color:var(--cg-container-a22)]'
              )}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              ← Back
            </button>
            <button
              className={cx(
                'inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition',
                canProceed
                  ? 'bg-gradient-to-r from-[#ff7e5f] to-[#fbbf24] text-[#0f0b3c] hover:opacity-90 shadow-[0_0_20px_rgba(255,126,95,0.4)]'
                  : 'bg-[color:var(--cg-container-a22)] text-[color:var(--cg-text-muted)] cursor-not-allowed'
              )}
              onClick={handleNext}
            >
              Next Step <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
