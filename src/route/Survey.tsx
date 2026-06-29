import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Survey.css';
import {
  saveCareerPath,
  startSkillTest,
  submitSkillTest,
  saveDiscipline,
  completeSurvey,
  type CareerField,
  type SkillLevel,
  type DisciplineLevel,
  type LearningGoal,
  type MilestoneTestPreference,
  type CodingProblem,
} from '../services/surveyApi';

const FIELD_OPTIONS: { id: CareerField; title: string; sub: string }[] = [
  { id: 'frontend', title: 'Frontend', sub: 'UI, React, browser' },
  { id: 'backend', title: 'Backend', sub: 'APIs, databases, servers' },
  { id: 'fullstack', title: 'Fullstack', sub: 'A bit of everything' },
];

const GOAL_OPTIONS: { id: LearningGoal; title: string }[] = [
  { id: 'get_job', title: 'Get a job' },
  { id: 'personal_project', title: 'Build personal projects' },
  { id: 'competition', title: 'Compete / contests' },
  { id: 'explore_ai', title: 'Explore AI' },
];

const LEVEL_OPTIONS: { id: SkillLevel; title: string; sub: string }[] = [
  { id: 'novice', title: 'Novice', sub: 'Just starting out' },
  { id: 'apprentice', title: 'Apprentice', sub: 'Know the basics' },
  { id: 'journeyman', title: 'Journeyman', sub: 'Comfortable coding' },
  { id: 'master', title: 'Master', sub: 'Experienced' },
];

const TOTAL_STEPS = 4;

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export default function Survey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — career path
  const [fieldFocus, setFieldFocus] = useState<CareerField | null>(null);
  const [goal, setGoal] = useState<LearningGoal | null>(null);

  // Step 2 — skill test
  const [selfLevel, setSelfLevel] = useState<SkillLevel | null>(null);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [code, setCode] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [entryLevel, setEntryLevel] = useState<string | null>(null);

  // Step 3 — discipline
  const [dailyHours, setDailyHours] = useState(2);
  const [focusStart, setFocusStart] = useState('20:00');
  const [focusEnd, setFocusEnd] = useState('22:00');
  const [milestone, setMilestone] =
    useState<MilestoneTestPreference>('project');
  const [discipline, setDiscipline] = useState<DisciplineLevel>('light');

  // ----- Step 1: career path -----
  const submitCareerPath = async () => {
    if (!fieldFocus) return;
    setError('');
    setLoading(true);
    try {
      await saveCareerPath({
        fieldFocus,
        learningGoal: goal ?? undefined,
      });
      setStep(1);
    } catch (err) {
      setError(errMsg(err, 'Could not save career path'));
    } finally {
      setLoading(false);
    }
  };

  // ----- Step 2: load + submit skill test -----
  const loadSkillTest = async () => {
    if (!fieldFocus) return;
    setError('');
    setLoading(true);
    try {
      const res = await startSkillTest({
        fieldFocus,
        selfAssessedLevel: selfLevel ?? undefined,
        questionCount: 3,
      });
      setProblems(res.problems);
      setCode(
        Object.fromEntries(res.problems.map((p) => [p._id, p.starterCode]))
      );
      setStartedAt(Date.now());
    } catch (err) {
      setError(errMsg(err, 'Could not load the skill test'));
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    setError('');
    setLoading(true);
    try {
      const totalTimeSeconds = startedAt
        ? Math.round((Date.now() - startedAt) / 1000)
        : undefined;
      const draft = await submitSkillTest(
        problems.map((p) => ({ questionId: p._id, code: code[p._id] ?? '' })),
        totalTimeSeconds
      );
      setScore(draft.technicalTestScore ?? 0);
      setEntryLevel(draft.computedEntryLevel ?? null);
    } catch (err) {
      setError(errMsg(err, 'Could not grade your submission'));
    } finally {
      setLoading(false);
    }
  };

  // ----- Step 3: discipline -----
  const submitDiscipline = async () => {
    setError('');
    setLoading(true);
    try {
      await saveDiscipline({
        dailyHours,
        focusTimeWindow: `${focusStart}-${focusEnd}`,
        milestoneTestPreference: milestone,
        disciplineLevel: discipline,
      });
      setStep(3);
    } catch (err) {
      setError(errMsg(err, 'Could not save discipline setup'));
    } finally {
      setLoading(false);
    }
  };

  // ----- Step 4: finalize -----
  const finish = async () => {
    setError('');
    setLoading(true);
    try {
      await completeSurvey();
      navigate('/learning-path');
    } catch (err) {
      setError(errMsg(err, 'Could not complete the survey'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sv-page">
      <div className="sv-shell">
        <div className="sv-steps">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`sv-step-pill ${
                i < step ? 'done' : i === step ? 'active' : ''
              }`}
            />
          ))}
        </div>

        <div className="sv-card">
          {error && <p className="sv-error">{error}</p>}

          {/* ===== Step 1: Career path ===== */}
          {step === 0 && (
            <>
              <h1 className="sv-title">Choose your path</h1>
              <p className="sv-desc">
                Which area do you want to focus on? This tailors your roadmap.
              </p>
              <div className="sv-options">
                {FIELD_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    className={`sv-option ${fieldFocus === o.id ? 'selected' : ''}`}
                    onClick={() => setFieldFocus(o.id)}
                  >
                    <div className="sv-option-title">{o.title}</div>
                    <div className="sv-option-sub">{o.sub}</div>
                  </button>
                ))}
              </div>

              <span className="sv-label">What's your main goal?</span>
              <div className="sv-options">
                {GOAL_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    className={`sv-option ${goal === o.id ? 'selected' : ''}`}
                    onClick={() => setGoal(o.id)}
                  >
                    <div className="sv-option-title">{o.title}</div>
                  </button>
                ))}
              </div>

              <div className="sv-actions">
                <button
                  className="sv-btn sv-btn-ghost"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </button>
                <button
                  className="sv-btn sv-btn-primary"
                  disabled={!fieldFocus || loading}
                  onClick={submitCareerPath}
                >
                  {loading ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </>
          )}

          {/* ===== Step 2: Skill test ===== */}
          {step === 1 && (
            <>
              <h1 className="sv-title">Skill check</h1>
              {problems.length === 0 ? (
                <>
                  <p className="sv-desc">
                    Pick your self-assessed level, then solve a few short coding
                    problems so we can place you correctly.
                  </p>
                  <div className="sv-options">
                    {LEVEL_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        className={`sv-option ${selfLevel === o.id ? 'selected' : ''}`}
                        onClick={() => setSelfLevel(o.id)}
                      >
                        <div className="sv-option-title">{o.title}</div>
                        <div className="sv-option-sub">{o.sub}</div>
                      </button>
                    ))}
                  </div>
                  <div className="sv-actions">
                    <button
                      className="sv-btn sv-btn-ghost"
                      onClick={() => setStep(0)}
                    >
                      Back
                    </button>
                    <button
                      className="sv-btn sv-btn-primary"
                      disabled={loading}
                      onClick={loadSkillTest}
                    >
                      {loading ? 'Loading...' : 'Begin coding test'}
                    </button>
                  </div>
                </>
              ) : score !== null ? (
                <div className="sv-result">
                  <p className="sv-desc">Here's how you did:</p>
                  <div className="score">{score}%</div>
                  {entryLevel && (
                    <div className="level">Entry level: {entryLevel}</div>
                  )}
                  <div className="sv-actions">
                    <span />
                    <button
                      className="sv-btn sv-btn-primary"
                      onClick={() => setStep(2)}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="sv-desc">
                    Implement <code>solve()</code> for each problem in
                    JavaScript. Your code is graded against hidden test cases.
                  </p>
                  {problems.map((p, idx) => (
                    <div className="sv-problem" key={p._id}>
                      <h3>
                        {idx + 1}. {p.title} <small>({p.difficulty})</small>
                      </h3>
                      <div className="sv-problem-body">{p.content}</div>
                      {p.sampleTestCases.length > 0 && (
                        <div className="sv-cases">
                          {p.sampleTestCases
                            .map(
                              (tc) =>
                                `in:  ${tc.input}\nout: ${tc.expectedOutput}`
                            )
                            .join('\n\n')}
                        </div>
                      )}
                      <textarea
                        className="sv-code"
                        spellCheck={false}
                        value={code[p._id] ?? ''}
                        onChange={(e) =>
                          setCode((c) => ({ ...c, [p._id]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                  <div className="sv-actions">
                    <button
                      className="sv-btn sv-btn-ghost"
                      onClick={() => setProblems([])}
                    >
                      Back
                    </button>
                    <button
                      className="sv-btn sv-btn-primary"
                      disabled={loading}
                      onClick={submitTest}
                    >
                      {loading ? 'Grading...' : 'Submit solutions'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ===== Step 3: Discipline ===== */}
          {step === 2 && (
            <>
              <h1 className="sv-title">Set your discipline</h1>
              <p className="sv-desc">
                Tell us how you want to study and how strict we should be.
              </p>

              <span className="sv-label">Hours per day (1-24)</span>
              <input
                className="sv-input"
                type="number"
                min={1}
                max={24}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
              />

              <span className="sv-label">Focus time window</span>
              <div className="sv-row">
                <input
                  className="sv-input"
                  type="time"
                  value={focusStart}
                  onChange={(e) => setFocusStart(e.target.value)}
                />
                <input
                  className="sv-input"
                  type="time"
                  value={focusEnd}
                  onChange={(e) => setFocusEnd(e.target.value)}
                />
              </div>

              <span className="sv-label">Milestone check preference</span>
              <div className="sv-options">
                {(
                  [
                    { id: 'project', title: 'Project', sub: 'Build something' },
                    { id: 'battle', title: 'Battle', sub: 'Beat an opponent' },
                  ] as {
                    id: MilestoneTestPreference;
                    title: string;
                    sub: string;
                  }[]
                ).map((o) => (
                  <button
                    key={o.id}
                    className={`sv-option ${milestone === o.id ? 'selected' : ''}`}
                    onClick={() => setMilestone(o.id)}
                  >
                    <div className="sv-option-title">{o.title}</div>
                    <div className="sv-option-sub">{o.sub}</div>
                  </button>
                ))}
              </div>

              <span className="sv-label">Discipline level</span>
              <div className="sv-options">
                {(
                  [
                    {
                      id: 'light',
                      title: 'Light',
                      sub: 'Gentle reminders only',
                    },
                    {
                      id: 'strict',
                      title: 'Strict',
                      sub: 'Lock lessons on failure',
                    },
                  ] as { id: DisciplineLevel; title: string; sub: string }[]
                ).map((o) => (
                  <button
                    key={o.id}
                    className={`sv-option ${discipline === o.id ? 'selected' : ''}`}
                    onClick={() => setDiscipline(o.id)}
                  >
                    <div className="sv-option-title">{o.title}</div>
                    <div className="sv-option-sub">{o.sub}</div>
                  </button>
                ))}
              </div>

              <div className="sv-actions">
                <button
                  className="sv-btn sv-btn-ghost"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className="sv-btn sv-btn-primary"
                  disabled={loading}
                  onClick={submitDiscipline}
                >
                  {loading ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </>
          )}

          {/* ===== Step 4: Confirm ===== */}
          {step === 3 && (
            <>
              <h1 className="sv-title">You're all set 🎉</h1>
              <p className="sv-desc">
                We'll build a personalized roadmap from your answers.
              </p>
              <div className="sv-result">
                <div className="score">{score ?? 0}%</div>
                {entryLevel && (
                  <div className="level">Starting level: {entryLevel}</div>
                )}
              </div>
              <div className="sv-actions">
                <button
                  className="sv-btn sv-btn-ghost"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  className="sv-btn sv-btn-primary"
                  disabled={loading}
                  onClick={finish}
                >
                  {loading ? 'Finishing...' : 'Start learning'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}