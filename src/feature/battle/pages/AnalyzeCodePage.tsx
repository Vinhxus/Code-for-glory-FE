import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SideNav from '../../../components/SideNav';
import Header from '../../../components/layout/Header';
import {
  getAnalysis,
  createAnalysis,
  getSubmissions,
} from '../services/battleService';
import type { CodeAnalysis } from '../types/battle.types';
import { BATTLE_ROUTES } from '../constants/battle.constants';
import { useAuth } from '../../auth/useAuth';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 10;

type Phase = 'loading' | 'generating' | 'ready' | 'error';
type ErrorKind = 'no-submission' | 'failed' | null;

const AnalyzeCodePage = () => {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const pollCountRef = useRef(0);

  const pollUntilCompleted = useCallback(async (id: string) => {
    let data = await getAnalysis(id);
    pollCountRef.current = 0;

    while (
      data.status === 'pending' &&
      pollCountRef.current < MAX_POLL_ATTEMPTS
    ) {
      pollCountRef.current += 1;
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      data = await getAnalysis(id);
    }
    return data;
  }, []);

  const generateAnalysis = useCallback(
    async (id: string) => {
      const submissions = await getSubmissions(id);
      const myRealId = user?.id ?? '';

      const mySolved = submissions
        .filter((s) => s.userId === myRealId && s.isCorrect)
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        );

      const latest = mySolved[0];
      if (!latest) {
        throw new Error('NO_CORRECT_SUBMISSION');
      }

      const language =
        localStorage.getItem(`battleLang:${id}:${latest.questionId}`) ??
        'javascript';

      return createAnalysis({
        battleId: id,
        code: latest.answer,
        language,
      });
    },
    [user]
  );

  const load = useCallback(
    async (id: string) => {
      setPhase('loading');
      setError(null);
      setErrorKind(null);

      try {
        const existing = await getAnalysis(id);
        if (existing.status === 'pending') {
          setPhase('generating');
          const finalData = await pollUntilCompleted(id);
          setAnalysis(finalData);
        } else {
          setAnalysis(existing);
        }
        setPhase('ready');
        return;
      } catch (err) {
        const is404 = axios.isAxiosError(err) && err.response?.status === 404;
        if (!is404) {
          setError('Could not load your code analysis. Please try again.');
          setErrorKind('failed');
          setPhase('error');
          return;
        }
      }

      // No analysis yet → create one
      try {
        setPhase('generating');
        const created = await generateAnalysis(id);
        if (created.status === 'pending') {
          const finalData = await pollUntilCompleted(id);
          setAnalysis(finalData);
        } else {
          setAnalysis(created);
        }
        setPhase('ready');
      } catch (err) {
        if (err instanceof Error && err.message === 'NO_CORRECT_SUBMISSION') {
          setError(
            "You haven't solved any question correctly in this battle, so there's no code to break down."
          );
          setErrorKind('no-submission');
        } else {
          setError(
            'Something went wrong while generating your analysis. Please try again.'
          );
          setErrorKind('failed');
        }
        setPhase('error');
      }
    },
    [generateAnalysis, pollUntilCompleted]
  );

  useEffect(() => {
    if (!battleId) return;
    let isActive = true;
    Promise.resolve().then(() => {
      if (isActive) load(battleId);
    });
    return () => {
      isActive = false;
    };
  }, [battleId, load]);

  if (!battleId) {
    return (
      <Shell>
        <StateCard
          icon="❓"
          title="Missing Battle ID"
          description="We couldn't find a battle to analyze. Please go back and try again."
          action={
            <button
              type="button"
              onClick={() => navigate('/')}
              className="neon-btn px-4 py-2.5 text-xs font-bold"
            >
              Back to Home
            </button>
          }
        />
      </Shell>
    );
  }

  if (phase === 'loading' || phase === 'generating') {
    return (
      <Shell>
        <StateCard
          icon={<Spinner />}
          title={
            phase === 'generating' ? 'Analyzing Your Code' : 'Loading Results'
          }
          description={
            phase === 'generating'
              ? 'Our AI is reviewing your solution. This usually takes a few seconds.'
              : 'Fetching your battle breakdown...'
          }
        />
      </Shell>
    );
  }

  if (phase === 'error' || !analysis) {
    const isNoSubmission = errorKind === 'no-submission';
    return (
      <Shell>
        <StateCard
          icon={isNoSubmission ? '📝' : '⚠️'}
          title={
            isNoSubmission ? 'Nothing to Analyze Yet' : "Couldn't Load Analysis"
          }
          description={
            error ??
            (isNoSubmission
              ? "You haven't solved any question correctly in this battle, so there's no code to break down."
              : 'Something went wrong while loading your code analysis.')
          }
          action={
            isNoSubmission ? (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="neon-btn px-4 py-2.5 text-xs font-bold"
              >
                Back to Home
              </button>
            ) : (
              <button
                type="button"
                onClick={() => load(battleId)}
                className="neon-btn px-4 py-2.5 text-xs font-bold"
              >
                Try Again
              </button>
            )
          }
        />
      </Shell>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[700px] w-[700px] rounded-full bg-[color:var(--cg-coral-a18)] blur-[160px]" />
        <div className="absolute top-[40%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[color:var(--cg-green-a14)] blur-[140px]" />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <Header />
        <main className="px-6 pt-20 pb-12">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <h1 className="font-['Lexend'] text-2xl font-bold">
                Battle Breakdown
              </h1>
              <p className="mt-1 text-sm text-[color:var(--cg-text-muted)]">
                {analysis.summary || 'AI has reviewed your solution.'}
              </p>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_1fr_minmax(280px,0.85fr)]">
              <Panel title="Your Solution" icon="👤">
                <CodeBlock content={analysis.code} />
              </Panel>

              <Panel title="AI Suggestion" icon="⭐">
                <CodeBlock content={analysis.refactoringSuggestion} />
              </Panel>

              <Panel title="AI Mentor Notes" icon="🤖">
                <div className="space-y-4 text-sm leading-relaxed">
                  {analysis.strengths.length > 0 && (
                    <div>
                      <p className="mb-1 font-semibold text-[color:var(--cg-green-a14,#4ade80)]">
                        Strengths
                      </p>
                      <ul className="space-y-1 text-[color:var(--cg-text-muted)]">
                        {analysis.strengths.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.improvements.length > 0 && (
                    <div>
                      <p className="mb-1 font-semibold text-[#ff7e5f]">
                        Areas to Improve
                      </p>
                      <ul className="space-y-1 text-[color:var(--cg-text-muted)]">
                        {analysis.improvements.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.resources.length > 0 && (
                    <div>
                      <p className="mb-1 font-semibold">Resources</p>
                      <ul className="space-y-1">
                        {analysis.resources.map((r, i) => (
                          <li key={i}>
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#ff7e5f] underline"
                            >
                              {r.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Panel>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2.5 text-xs font-semibold hover:bg-[color:var(--cg-container-a22)]"
              >
                Back To Home
              </button>
              <button
                type="button"
                onClick={() => navigate(BATTLE_ROUTES.FIELD)}
                className="neon-btn px-4 py-2.5 text-xs font-bold"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const Panel = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <div className="flex h-full flex-col rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] backdrop-blur-md">
    <div className="border-b border-[color:var(--cg-border)] px-4 py-3 text-sm font-semibold">
      {icon} {title}
    </div>
    <div className="flex-1 p-4">{children}</div>
  </div>
);

const CodeBlock = ({ content }: { content: string }) => (
  <pre className="max-h-[480px] overflow-auto rounded-xl bg-[color:var(--cg-bg)]/60 p-3 text-xs leading-relaxed font-['JetBrains_Mono']">
    <code>{content}</code>
  </pre>
);

/** Spinner dùng cho 2 trạng thái loading/generating */
const Spinner = () => (
  <div className="h-7 w-7 animate-spin rounded-full border-2 border-[color:var(--cg-border)] border-t-[#ff7e5f]" />
);

/** Card thống nhất cho mọi trạng thái phụ (loading / generating / error / missing id) */
const StateCard = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="w-full max-w-md rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-8 text-center backdrop-blur-md">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--cg-container-a22)] text-2xl">
      {icon}
    </div>
    <h2 className="font-['Lexend'] text-base font-semibold">{title}</h2>
    <p className="mt-2 text-sm leading-relaxed text-[color:var(--cg-text-muted)]">
      {description}
    </p>
    {action && <div className="mt-6 flex justify-center gap-3">{action}</div>}
  </div>
);

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
    <SideNav />
    <div className="relative z-10 md:pl-[96px]">
      <Header />
      <main className="flex min-h-screen items-center justify-center px-6 pt-20 pb-12">
        {children}
      </main>
    </div>
  </div>
);

export default AnalyzeCodePage;
