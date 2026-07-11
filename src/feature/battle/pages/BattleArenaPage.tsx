import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import SideNav from '../../../components/SideNav';
import Header from '../../../components/layout/Header';
import { useBattleArena } from '../hooks/useBattleArena';
import SubmitFailedModal from '../components/SubmitFailedModal';

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Tailwind', value: 'css' },
  { label: 'SQL', value: 'sql' },
  { label: 'C++', value: 'cpp' },
];

const BattleArenaPage = () => {
  const { battleId } = useParams<{ battleId: string }>();
  const {
    battle,
    isLoading,
    error,
    timeLeft,
    formatTime,
    me,
    opponent,
    currentQuestionIndex,
    code,
    setCode,
    isSubmitting,
    submitResult,
    handleSubmit,
    dismissFeedback,
    isWaiting,
  } = useBattleArena(battleId);

  const [language, setLanguage] = useState('javascript');
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'vs'>('vs-dark');
  const currentQuestion = battle?.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-(--cg-bg) text-(--cg-text) overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#a78bfa 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute top-[-20%] left-[-10%] h-150 w-150 rounded-full bg-(--cg-coral-a18) blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] h-125 w-125 rounded-full bg-(--cg-green-a14) blur-[120px]" />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-24">
        <Header />

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Waiting for opponent */}
        {battle && isWaiting && (
          <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-(--cg-border) border-t-[#ff7e5f]" />
            <p className="font-['Lexend'] text-lg text-(--cg-text)">
              Waiting for opponent...
            </p>
            <p className="text-sm text-(--cg-text-muted)">
              Battle will start once an opponent joins
            </p>
          </div>
        )}
        {/* Main Content */}
        {battle && !isLoading && !isWaiting && (
          <main className="flex flex-col gap-4 px-4 pt-20 pb-6">
            {/* TopBar: Timer + Score */}
            <div className="flex items-center justify-between rounded-2xl border border-(--cg-border) bg-(--cg-container-a16) px-6 py-3">
              {/* Me */}
              <div className="flex flex-col items-start">
                <span className="text-xs text-(--cg-text-muted)">You</span>
                <span className="font-['Lexend'] text-lg font-bold text-[#ff7e5f]">
                  {me?.currentScore ?? 0} pts
                </span>
              </div>

              {/* Timer */}
              <div className="flex flex-col items-center">
                <span
                  className={`font-['JetBrains_Mono'] text-3xl font-bold tabular-nums ${
                    timeLeft <= 60 ? 'text-red-400' : 'text-(--cg-text)'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-(--cg-text-muted)">
                  Remaining
                </span>
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-end">
                <span className="text-xs text-(--cg-text-muted)">
                  {opponent?.username ?? 'Waiting...'}
                </span>
                <span className="font-['Lexend'] text-lg font-bold text-(--cg-text)">
                  {opponent?.currentScore ?? 0} pts
                </span>
              </div>
            </div>

            {/* Body: Question + Editor */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Question Panel */}
              <div className="rounded-2xl border border-(--cg-border) bg-(--cg-container-a16) p-6">
                {currentQuestion ? (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-md border border-(--cg-border) bg-(--cg-container-a16) px-2 py-0.5 font-['JetBrains_Mono'] text-xs text-(--cg-text-muted)">
                        Q{currentQuestionIndex + 1} / {battle.questions.length}
                      </span>
                      <span className="text-xs text-(--cg-text-muted) capitalize">
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                    <h2 className="font-['Lexend'] text-xl font-semibold">
                      {currentQuestion.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-(--cg-text-muted) whitespace-pre-wrap">
                      {currentQuestion.content}
                    </p>
                  </>
                ) : (
                  <p className="text-(--cg-text-muted)">Loading question...</p>
                )}
              </div>

              {/* Editor Panel */}
              <div className="flex flex-col gap-3">
                {/* Toolbar: Language + Theme */}
                <div className="flex items-center justify-between rounded-xl border border-(--cg-border) bg-(--cg-container-a16) px-3 py-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-sm text-(--cg-text) outline-none cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option
                        key={lang.label}
                        value={lang.value}
                        className="bg-[#1e1e2e] text-white"
                      >
                        {lang.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      setEditorTheme((prev) =>
                        prev === 'vs-dark' ? 'vs' : 'vs-dark'
                      )
                    }
                    className="rounded-md px-2 py-1 text-xs text-(--cg-text-muted) hover:text-(--cg-text) transition-colors border border-(--cg-border) hover:border-(--cg-text-muted)"
                  >
                    {editorTheme === 'vs-dark' ? '☀ Light' : '🌙 Dark'}
                  </button>
                </div>

                {/* Monaco Editor */}
                <div className="overflow-hidden rounded-2xl border border-(--cg-border)">
                  <Editor
                    height="420px"
                    language={language}
                    theme={editorTheme}
                    value={code}
                    onChange={(val) => setCode(val ?? '')}
                    options={{
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>

                {/* Feedback bar */}
                {submitResult && submitResult.isCorrect && (
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                    <span className="font-semibold">✓ Correct</span>
                    {' — '}
                    {submitResult.message}
                  </div>
                )}

                {/* Submit button */}
                <button
                  onClick={() => handleSubmit(language)}
                  disabled={isSubmitting}
                  className="neon-btn w-full py-3 font-['Lexend'] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            </div>
          </main>
        )}
      </div>
      {submitResult && !submitResult.isCorrect && (
        <SubmitFailedModal
          message={submitResult.message}
          points={submitResult.points}
          onRetry={dismissFeedback}
        />
      )}
    </div>
  );
};

export default BattleArenaPage;
