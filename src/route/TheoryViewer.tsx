// TheoryViewer.tsx
// Full theory viewer for CodeForGlory Practice page
// Shows: overview, structured sections with code examples, callouts, mini-quiz

import { useState, useCallback, useMemo } from 'react';
import {
  THEORY_CONTENT,
  type TopicTheory,
  type TheorySection,
} from './theoryContent';

/* ─── helpers ──────────────────────────────────────────────────── */
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

function EstimatedBadge({
  text,
  difficulty,
}: {
  text: string;
  difficulty: TopicTheory['difficulty'];
}) {
  const diffColor =
    difficulty === 'Foundational'
      ? 'text-emerald-300 border-emerald-400/25 bg-emerald-500/10'
      : difficulty === 'Intermediate'
        ? 'text-amber-300 border-amber-400/25 bg-amber-500/10'
        : 'text-rose-300 border-rose-400/25 bg-rose-500/10';
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--cg-text-muted)]">
        <span className="material-symbols-outlined text-[14px]">schedule</span>
        {text} read
      </span>
      <span
        className={cx(
          'rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
          diffColor
        )}
      >
        {difficulty}
      </span>
    </div>
  );
}

/* ─── Callout ───────────────────────────────────────────────────── */
function Callout({
  type,
  text,
}: {
  type: 'tip' | 'warning' | 'info' | 'danger';
  text: string;
}) {
  const styles = {
    tip: {
      icon: 'lightbulb',
      cls: 'border-emerald-400/25 bg-emerald-500/8 text-emerald-200',
    },
    warning: {
      icon: 'warning',
      cls: 'border-amber-400/25 bg-amber-500/8 text-amber-200',
    },
    info: { icon: 'info', cls: 'border-sky-400/25 bg-sky-500/8 text-sky-200' },
    danger: {
      icon: 'report',
      cls: 'border-rose-400/25 bg-rose-500/8 text-rose-200',
    },
  }[type];

  return (
    <div
      className={cx(
        'mt-4 rounded-xl border px-4 py-3 flex gap-3 items-start',
        styles.cls
      )}
    >
      <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
        {styles.icon}
      </span>
      <p className="text-sm leading-6">{text}</p>
    </div>
  );
}

/* ─── Code Block ────────────────────────────────────────────────── */
function CodeBlock({
  code,
  label,
  lang,
}: {
  code: string;
  label: string;
  lang: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }, [code]);

  return (
    <div className="mt-4 rounded-xl border border-[color:var(--cg-border)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0A0726]/65 border-b border-[color:var(--cg-border)]">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
          <span className="ml-2 text-[11px] font-semibold text-[color:var(--cg-text-muted)]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--cg-text-muted)] opacity-60">
            {lang}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] hover:bg-[color:var(--cg-container-a16)] transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-[1.7] text-[#c8d3f5] bg-[#080618]/60 custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ─── Section Card ──────────────────────────────────────────────── */
function SectionCard({
  section,
  index,
}: {
  section: TheorySection;
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div
      className={cx(
        'rounded-2xl border transition-all duration-200',
        expanded
          ? 'border-[color:var(--cg-border)] bg-[#0A0726]/50'
          : 'border-[color:var(--cg-border)]/60 bg-[#0A0726]/25 hover:bg-[#0A0726]/40'
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <div
          className={cx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors',
            expanded
              ? 'border-[#FF7E5F]/30 bg-[#FF7E5F]/10 text-[#FF7E5F]'
              : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)]'
          )}
        >
          <span className="material-symbols-outlined text-[18px]">
            {section.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[color:var(--cg-text)]">
            {section.title}
          </h3>
        </div>
        <span
          className={cx(
            'material-symbols-outlined text-[20px] shrink-0 text-[color:var(--cg-text-muted)] transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 animate-fade-in">
          <div className="border-t border-[color:var(--cg-border)] pt-4">
            <p className="text-sm leading-7 text-[color:var(--cg-text-muted)] whitespace-pre-line">
              {section.body}
            </p>

            {section.callout && (
              <Callout
                type={section.callout.type}
                text={section.callout.text}
              />
            )}

            {section.examples?.map((example) => (
              <CodeBlock
                key={example.id}
                code={example.code}
                label={example.label}
                lang={example.lang}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mini Quiz ─────────────────────────────────────────────────── */
function MiniQuiz({
  quiz,
  isVi,
}: {
  quiz: TopicTheory['quiz'];
  isVi: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [quizComplete, setQuizComplete] = useState(false);

  const score = useMemo(() => {
    const answered = quiz.filter((q) => answers[q.id] !== undefined);
    const correct = answered.filter((q) => answers[q.id] === q.correct);
    return {
      answered: answered.length,
      correct: correct.length,
      total: quiz.length,
    };
  }, [answers, quiz]);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (answers[questionId] !== undefined) return; // locked after first answer
    setAnswers((a) => ({ ...a, [questionId]: optionIndex }));
    setRevealed((r) => ({ ...r, [questionId]: true }));
    if (
      Object.keys({ ...answers, [questionId]: optionIndex }).length ===
      quiz.length
    ) {
      setQuizComplete(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setRevealed({});
    setQuizComplete(false);
  };

  return (
    <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[#0A0726]/40 overflow-hidden">
      {/* Quiz Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--cg-border)] bg-[#080618]/40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#FF7E5F]">
            quiz
          </span>
          <span className="text-sm font-bold">
            {isVi ? 'Kiểm tra nhanh' : 'Quick Check'}
          </span>
          <span className="rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--cg-text-muted)]">
            {score.answered}/{score.total}
          </span>
        </div>
        {quizComplete && (
          <div className="flex items-center gap-3">
            <span
              className={cx(
                'text-sm font-bold',
                score.correct === score.total
                  ? 'text-emerald-400'
                  : score.correct >= score.total * 0.6
                    ? 'text-amber-400'
                    : 'text-rose-400'
              )}
            >
              {score.correct}/{score.total} {isVi ? 'đúng' : 'correct'}
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-3 py-1.5 text-xs font-semibold text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                restart_alt
              </span>
              {isVi ? 'Thử lại' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="divide-y divide-[color:var(--cg-border)]">
        {quiz.map((question, qIndex) => {
          const selected = answers[question.id];
          const isAnswered = selected !== undefined;
          const isCorrect = selected === question.correct;
          const isRevealed = revealed[question.id];

          return (
            <div key={question.id} className="px-5 py-5">
              <p className="text-sm font-semibold text-[color:var(--cg-text)] mb-4 leading-6">
                <span className="text-[color:var(--cg-text-muted)] font-bold mr-2">
                  Q{qIndex + 1}.
                </span>
                {question.question}
              </p>

              <div className="flex flex-col gap-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = selected === oIndex;
                  const isCorrectOption = oIndex === question.correct;
                  let optionStyle =
                    'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a22)] hover:text-[color:var(--cg-text)]';

                  if (isAnswered) {
                    if (isCorrectOption) {
                      optionStyle =
                        'border-emerald-400/40 bg-emerald-500/10 text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        'border-rose-400/40 bg-rose-500/10 text-rose-200';
                    } else {
                      optionStyle =
                        'border-[color:var(--cg-border)]/50 bg-transparent text-[color:var(--cg-text-muted)] opacity-50';
                    }
                  }

                  return (
                    <button
                      key={oIndex}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelect(question.id, oIndex)}
                      className={cx(
                        'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all',
                        optionStyle,
                        !isAnswered && 'cursor-pointer'
                      )}
                    >
                      <span
                        className={cx(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
                          isAnswered && isCorrectOption
                            ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                            : isAnswered && isSelected && !isCorrect
                              ? 'border-rose-400/50 bg-rose-500/20 text-rose-300'
                              : 'border-current'
                        )}
                      >
                        {isAnswered && isCorrectOption ? (
                          <span className="material-symbols-outlined text-[14px]">
                            check
                          </span>
                        ) : isAnswered && isSelected && !isCorrect ? (
                          <span className="material-symbols-outlined text-[14px]">
                            close
                          </span>
                        ) : (
                          String.fromCharCode(65 + oIndex)
                        )}
                      </span>
                      <span className="leading-5">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isRevealed && (
                <div
                  className={cx(
                    'mt-3 rounded-xl border px-4 py-3 text-xs leading-6 animate-fade-in',
                    isCorrect
                      ? 'border-emerald-400/25 bg-emerald-500/8 text-emerald-200'
                      : 'border-amber-400/25 bg-amber-500/8 text-amber-200'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">
                      {isCorrect ? 'check_circle' : 'info'}
                    </span>
                    <div>
                      <span className="font-bold mr-1">
                        {isCorrect
                          ? isVi
                            ? 'Chính xác!'
                            : 'Correct!'
                          : isVi
                            ? 'Giải thích:'
                            : 'Explanation:'}
                      </span>
                      {question.explanation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score Banner */}
      {quizComplete && (
        <div
          className={cx(
            'px-5 py-4 border-t border-[color:var(--cg-border)] text-center animate-fade-in',
            score.correct === score.total
              ? 'bg-emerald-500/8'
              : score.correct >= Math.ceil(score.total * 0.6)
                ? 'bg-amber-500/8'
                : 'bg-rose-500/8'
          )}
        >
          <p className="text-sm font-bold">
            {score.correct === score.total
              ? isVi
                ? '🎉 Hoàn hảo! Bạn đã nắm vững chủ đề này.'
                : "🎉 Perfect score! You've mastered this topic."
              : score.correct >= Math.ceil(score.total * 0.6)
                ? isVi
                  ? `👍 ${score.correct}/${score.total} đúng. Xem lại phần bạn sai nhé.`
                  : `👍 ${score.correct}/${score.total} correct. Review the sections you missed.`
                : isVi
                  ? `📚 ${score.correct}/${score.total} đúng. Hãy đọc lại lý thuyết.`
                  : `📚 ${score.correct}/${score.total} correct. Re-read the theory sections.`}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Topic Progress Tracker ───────────────────────────────────── */
function ReadingProgress({
  sections,
  currentSectionIndex,
}: {
  sections: TheorySection[];
  currentSectionIndex: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {sections.map((_, i) => (
        <div
          key={i}
          className={cx(
            'h-1 rounded-full transition-all duration-300',
            i <= currentSectionIndex
              ? 'bg-[#FF7E5F]'
              : 'bg-[color:var(--cg-border)]',
            i === currentSectionIndex ? 'w-6' : 'w-2'
          )}
        />
      ))}
    </div>
  );
}

/* ─── Main TheoryViewer ─────────────────────────────────────────── */
type TheoryViewerProps = {
  topic: string;
  isVi?: boolean;
};

export function TheoryViewer({ topic, isVi = false }: TheoryViewerProps) {
  const theory = THEORY_CONTENT[topic];
  const [activeSection, setActiveSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  if (!theory) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)]">
          <span className="material-symbols-outlined text-[28px] text-[color:var(--cg-text-muted)]">
            book_2
          </span>
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold">
            {isVi ? 'Lý thuyết chưa có' : 'Theory Not Available'}
          </h3>
          <p className="mt-1 text-sm text-[color:var(--cg-text-muted)]">
            {isVi
              ? `Nội dung lý thuyết cho "${topic}" đang được biên soạn.`
              : `Theory content for "${topic}" is being prepared.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Theory Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[color:var(--cg-border)] bg-[#080618]/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-[#FF7E5F]">
                menu_book
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--cg-text-muted)]">
                {isVi ? 'Lý Thuyết' : 'Theory'}
              </span>
            </div>
            <h2 className="font-['Lexend'] text-lg font-bold leading-snug">
              {theory.topic}
            </h2>
            <p className="mt-1 text-xs text-[#FF7E5F] font-semibold italic">
              {theory.tagline}
            </p>
            <div className="mt-3">
              <EstimatedBadge
                text={theory.estimatedRead}
                difficulty={theory.difficulty}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowQuiz((q) => !q)}
            className={cx(
              'flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all',
              showQuiz
                ? 'border-[#FF7E5F]/30 bg-[#FF7E5F]/10 text-[#FF7E5F]'
                : 'border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]'
            )}
          >
            <span className="material-symbols-outlined text-[15px]">quiz</span>
            {isVi ? 'Quiz' : 'Quiz'}
            <span className="ml-0.5 rounded-full bg-[color:var(--cg-container-a16)] border border-[color:var(--cg-border)] px-1.5 text-[9px]">
              {theory.quiz.length}
            </span>
          </button>
        </div>

        <div className="mt-4">
          <ReadingProgress
            sections={theory.sections}
            currentSectionIndex={activeSection}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-4">
        {/* Overview */}
        <div className="rounded-2xl border border-[color:var(--cg-border)]/60 bg-[linear-gradient(135deg,rgba(79,70,229,0.08),rgba(255,126,95,0.05))] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[16px] text-[#FF7E5F]">
              overview
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--cg-text-muted)]">
              {isVi ? 'Tổng quan' : 'Overview'}
            </span>
          </div>
          <p className="text-sm leading-7 text-[color:var(--cg-text)]">
            {theory.overview}
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-3">
          {theory.sections.map((section, index) => (
            <div key={section.id} onClick={() => setActiveSection(index)}>
              <SectionCard section={section} index={index} />
            </div>
          ))}
        </div>

        {/* Quiz */}
        {showQuiz && (
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="h-px flex-1 bg-[color:var(--cg-border)]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--cg-text-muted)] px-3">
                {isVi ? 'Kiểm tra hiểu biết' : 'Knowledge Check'}
              </span>
              <div className="h-px flex-1 bg-[color:var(--cg-border)]" />
            </div>
            <MiniQuiz quiz={theory.quiz} isVi={isVi} />
          </div>
        )}

        {/* Footer CTA */}
        <div className="rounded-2xl border border-[color:var(--cg-border)]/40 bg-[color:var(--cg-container-a16)] p-4 text-center">
          <p className="text-xs text-[color:var(--cg-text-muted)]">
            {isVi
              ? 'Đọc xong lý thuyết? Chuyển sang tab Description để làm bài tập.'
              : 'Finished reading? Switch to the Description tab to tackle the exercise.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TheoryViewer;
