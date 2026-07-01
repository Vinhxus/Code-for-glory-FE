import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import './Survey.css';
import {
  completeSurvey,
  runSkillTestQuestion,
  saveCareerPath,
  saveDiscipline,
  startSkillTest,
  submitSkillTest,
  type CareerField,
  type CodingProblem,
  type DisciplineLevel,
  type LearningGoal,
  type MilestoneTestPreference,
  type QuestionGrade,
  type SkillLevel,
  type SkillTestRunResult,
} from '../services/surveyApi';

const FIELD_OPTIONS: { id: CareerField; title: string; sub: string }[] = [
  { id: 'frontend', title: 'Frontend', sub: 'UI, React, browser, trải nghiệm người dùng' },
  { id: 'backend', title: 'Backend', sub: 'API, database, auth, xử lý dữ liệu' },
  { id: 'fullstack', title: 'Fullstack', sub: 'Kết hợp workflow frontend và backend' },
];

const GOAL_OPTIONS: { id: LearningGoal; title: string }[] = [
  { id: 'get_job', title: 'Xin việc' },
  { id: 'personal_project', title: 'Làm sản phẩm cá nhân' },
  { id: 'competition', title: 'Thi đấu / contest' },
  { id: 'explore_ai', title: 'Khám phá AI' },
];

const LEVEL_OPTIONS: {
  id: SkillLevel;
  title: string;
  sub: string;
  detail: string;
}[] = [
  {
    id: 'novice',
    title: 'Novice',
    sub: 'Mới bắt đầu',
    detail: 'Bài test tập trung vào thao tác mảng, string và object cơ bản.',
  },
  {
    id: 'apprentice',
    title: 'Apprentice',
    sub: 'Đã biết nền tảng',
    detail: 'Bài test kiểm tra tư duy chuẩn hóa dữ liệu và xử lý input thực tế.',
  },
  {
    id: 'journeyman',
    title: 'Journeyman',
    sub: 'Code khá vững',
    detail: 'Bài test yêu cầu tổng hợp dữ liệu và tổ chức logic rõ ràng.',
  },
  {
    id: 'master',
    title: 'Master',
    sub: 'Kinh nghiệm tốt',
    detail: 'Bài test mô phỏng các tình huống merge dữ liệu và xử lý nhiều quy tắc.',
  },
];

const LEVEL_CHALLENGE_COUNT: Record<SkillLevel, number> = {
  novice: 1,
  apprentice: 2,
  journeyman: 3,
  master: 3,
};

const TOTAL_STEPS = 4;

const ENTRY_LEVEL_LABELS: Record<string, string> = {
  root: 'Root',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TRACK_LABELS: Record<CareerField, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Fullstack',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

function errMsg(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function prettyEntryLevel(value: string | null): string | null {
  if (!value) return null;
  return ENTRY_LEVEL_LABELS[value] ?? value;
}

export default function Survey() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [fieldFocus, setFieldFocus] = useState<CareerField | null>(null);
  const [goal, setGoal] = useState<LearningGoal | null>(null);

  const [selfLevel, setSelfLevel] = useState<SkillLevel | null>(null);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [code, setCode] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [entryLevel, setEntryLevel] = useState<string | null>(null);
  const [gradingDetails, setGradingDetails] = useState<QuestionGrade[]>([]);
  const [runResults, setRunResults] = useState<Record<string, SkillTestRunResult>>(
    {}
  );
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<'description' | 'testcases'>(
    'description'
  );
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>(
    'testcase'
  );
  const [runningProblemId, setRunningProblemId] = useState<string | null>(null);

  const [dailyHours, setDailyHours] = useState(2);
  const [focusStart, setFocusStart] = useState('20:00');
  const [focusEnd, setFocusEnd] = useState('22:00');
  const [milestone, setMilestone] =
    useState<MilestoneTestPreference>('project');
  const [discipline, setDiscipline] = useState<DisciplineLevel>('light');

  const activeProblem = useMemo(
    () => problems.find((problem) => problem._id === activeProblemId) ?? problems[0],
    [activeProblemId, problems]
  );

  const activeRunResult = activeProblem ? runResults[activeProblem._id] : null;

  const progressText = useMemo(() => {
    const passed = problems.filter(
      (problem) => runResults[problem._id]?.status === 'Accepted'
    ).length;
    return `${passed}/${problems.length}`;
  }, [problems, runResults]);

  const challengeCount =
    LEVEL_CHALLENGE_COUNT[selfLevel ?? 'apprentice'] ?? 2;

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
      setError(errMsg(err, 'Không thể lưu định hướng học tập'));
    } finally {
      setLoading(false);
    }
  };

  const loadSkillTest = async () => {
    if (!fieldFocus || !selfLevel) return;
    setError('');
    setLoading(true);
    try {
      const res = await startSkillTest({
        fieldFocus,
        selfAssessedLevel: selfLevel,
        questionCount: LEVEL_CHALLENGE_COUNT[selfLevel],
      });
      setProblems(res.problems);
      setCode(
        Object.fromEntries(res.problems.map((problem) => [problem._id, problem.starterCode]))
      );
      setActiveProblemId(res.problems[0]?._id ?? null);
      setRunResults({});
      setWorkspaceTab('description');
      setConsoleTab('testcase');
      setStartedAt(Date.now());
      setScore(null);
      setEntryLevel(null);
      setGradingDetails([]);
    } catch (err) {
      setError(errMsg(err, 'Không thể tải bộ bài test kỹ năng'));
    } finally {
      setLoading(false);
    }
  };

  const runActiveProblem = async () => {
    if (!activeProblem) return;
    setError('');
    setRunningProblemId(activeProblem._id);
    try {
      const result = await runSkillTestQuestion({
        questionId: activeProblem._id,
        code: code[activeProblem._id] ?? '',
      });
      setRunResults((current) => ({
        ...current,
        [activeProblem._id]: result,
      }));
      setConsoleTab('result');
    } catch (err) {
      setError(errMsg(err, 'Không thể chạy sample test cho bài hiện tại'));
    } finally {
      setRunningProblemId(null);
    }
  };

  const resetActiveProblemCode = () => {
    if (!activeProblem) return;
    setCode((current) => ({
      ...current,
      [activeProblem._id]: activeProblem.starterCode,
    }));
  };

  const submitTest = async () => {
    if (problems.length === 0) return;
    setError('');
    setLoading(true);
    try {
      const totalTimeSeconds = startedAt
        ? Math.round((Date.now() - startedAt) / 1000)
        : undefined;
      const draft = await submitSkillTest(
        problems.map((problem) => ({
          questionId: problem._id,
          code: code[problem._id] ?? '',
        })),
        totalTimeSeconds
      );
      setScore(draft.technicalTestScore ?? 0);
      setEntryLevel(draft.computedEntryLevel ?? null);
      setGradingDetails(draft.technicalTestAnswers ?? []);
    } catch (err) {
      setError(errMsg(err, 'Không thể chấm bài survey'));
    } finally {
      setLoading(false);
    }
  };

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
      setError(errMsg(err, 'Không thể lưu thiết lập kỷ luật học'));
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    setError('');
    setLoading(true);
    try {
      await completeSurvey();
      navigate('/learning-path');
    } catch (err) {
      setError(errMsg(err, 'Không thể hoàn tất survey'));
    } finally {
      setLoading(false);
    }
  };

  const leaveWorkspace = () => {
    setProblems([]);
    setActiveProblemId(null);
    setRunResults({});
    setScore(null);
    setEntryLevel(null);
    setGradingDetails([]);
    setWorkspaceTab('description');
    setConsoleTab('testcase');
  };

  const problemStatus = (problemId: string) => {
    const finalGrade = gradingDetails.find((item) => item.questionId === problemId);
    if (finalGrade) {
      return finalGrade.isCorrect
        ? { label: 'Pass', tone: 'success' as const }
        : { label: 'Cần sửa', tone: 'danger' as const };
    }

    const runResult = runResults[problemId];
    if (!runResult) {
      return { label: 'Draft', tone: 'neutral' as const };
    }

    return runResult.status === 'Accepted'
      ? { label: 'Sample pass', tone: 'success' as const }
      : { label: 'Đang lỗi', tone: 'warning' as const };
  };

  return (
    <div className="sv-page">
      <div className="sv-shell">
        <div className="sv-steps">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={`sv-step-pill ${
                index < step ? 'done' : index === step ? 'active' : ''
              }`}
            />
          ))}
        </div>

        <div className="sv-card">
          {error && <p className="sv-error">{error}</p>}

          {step === 0 && (
            <>
              <h1 className="sv-title">Chọn định hướng học tập</h1>
              <p className="sv-desc">
                Chọn track chính để hệ thống tạo bài survey coding phù hợp với nhu
                cầu của bạn.
              </p>

              <div className="sv-options">
                {FIELD_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className={`sv-option ${fieldFocus === option.id ? 'selected' : ''}`}
                    onClick={() => setFieldFocus(option.id)}
                    type="button"
                  >
                    <div className="sv-option-title">{option.title}</div>
                    <div className="sv-option-sub">{option.sub}</div>
                  </button>
                ))}
              </div>

              <span className="sv-label">Mục tiêu chính của bạn là gì?</span>
              <div className="sv-options">
                {GOAL_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className={`sv-option ${goal === option.id ? 'selected' : ''}`}
                    onClick={() => setGoal(option.id)}
                    type="button"
                  >
                    <div className="sv-option-title">{option.title}</div>
                  </button>
                ))}
              </div>

              <div className="sv-actions">
                <button
                  className="sv-btn sv-btn-ghost"
                  onClick={() => navigate('/')}
                  type="button"
                >
                  Hủy
                </button>
                <button
                  className="sv-btn sv-btn-primary"
                  disabled={!fieldFocus || loading}
                  onClick={submitCareerPath}
                  type="button"
                >
                  {loading ? 'Đang lưu...' : 'Tiếp tục'}
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="sv-title">Đánh giá kỹ năng bằng code</h1>
              {problems.length === 0 ? (
                <>
                  <p className="sv-desc">
                    Chọn level tự đánh giá của bạn. Hệ thống sẽ tạo bộ bài survey
                    coding theo đúng level và track bạn vừa chọn.
                  </p>

                  <div className="sv-level-grid">
                    {LEVEL_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        className={`sv-level-card ${
                          selfLevel === option.id ? 'selected' : ''
                        }`}
                        onClick={() => setSelfLevel(option.id)}
                        type="button"
                      >
                        <div className="sv-level-top">
                          <span className="sv-level-name">{option.title}</span>
                          <span className="sv-level-count">
                            {LEVEL_CHALLENGE_COUNT[option.id]} bài
                          </span>
                        </div>
                        <div className="sv-level-sub">{option.sub}</div>
                        <div className="sv-level-detail">{option.detail}</div>
                      </button>
                    ))}
                  </div>

                  <div className="sv-highlight">
                    <div className="sv-highlight-title">Survey coding workspace</div>
                    <div className="sv-highlight-text">
                      Editor dùng Monaco giống phần Practice, có chạy sample test,
                      xem kết quả từng case và chấm tổng toàn bộ bài.
                    </div>
                  </div>

                  <div className="sv-actions">
                    <button
                      className="sv-btn sv-btn-ghost"
                      onClick={() => setStep(0)}
                      type="button"
                    >
                      Quay lại
                    </button>
                    <button
                      className="sv-btn sv-btn-primary"
                      disabled={!selfLevel || loading}
                      onClick={loadSkillTest}
                      type="button"
                    >
                      {loading ? 'Đang chuẩn bị...' : 'Bắt đầu coding test'}
                    </button>
                  </div>
                </>
              ) : score !== null ? (
                <>
                  <div className="sv-result-hero">
                    <div className="sv-result-score">{score}%</div>
                    <div className="sv-result-copy">
                      <div className="sv-result-title">Kết quả skill survey</div>
                      <div className="sv-result-sub">
                        Điểm này được tính từ toàn bộ test case công khai và ẩn.
                      </div>
                      {prettyEntryLevel(entryLevel) && (
                        <div className="sv-entry-chip">
                          Entry level: {prettyEntryLevel(entryLevel)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sv-grade-list">
                    {problems.map((problem, index) => {
                      const result = gradingDetails.find(
                        (item) => item.questionId === problem._id
                      );
                      return (
                        <div className="sv-grade-card" key={problem._id}>
                          <div className="sv-grade-top">
                            <div>
                              <div className="sv-grade-index">Bài {index + 1}</div>
                              <div className="sv-grade-title">{problem.title}</div>
                            </div>
                            <div
                              className={`sv-grade-badge ${
                                result?.isCorrect ? 'success' : 'fail'
                              }`}
                            >
                              {result?.isCorrect ? 'Passed' : 'Needs work'}
                            </div>
                          </div>
                          <div className="sv-grade-meta">
                            {TRACK_LABELS[problem.track]} ·{' '}
                            {DIFFICULTY_LABELS[problem.difficulty] ?? problem.difficulty}
                          </div>
                          <div className="sv-grade-meta">
                            Test case pass: {result?.passedTestCases ?? 0}/
                            {result?.totalTestCases ?? 0}
                          </div>
                          {result?.errorMessage && (
                            <div className="sv-grade-error">{result.errorMessage}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="sv-actions">
                    <button
                      className="sv-btn sv-btn-ghost"
                      onClick={leaveWorkspace}
                      type="button"
                    >
                      Làm lại phần test
                    </button>
                    <button
                      className="sv-btn sv-btn-primary"
                      onClick={() => setStep(2)}
                      type="button"
                    >
                      Tiếp tục
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="sv-summary-bar">
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">Track</span>
                      <strong>{fieldFocus ? TRACK_LABELS[fieldFocus] : '--'}</strong>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">Level chọn</span>
                      <strong>
                        {LEVEL_OPTIONS.find((item) => item.id === selfLevel)?.title ?? '--'}
                      </strong>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">Tiến độ sample</span>
                      <strong>{progressText}</strong>
                    </div>
                    <div className="sv-summary-item">
                      <span className="sv-summary-label">Số challenge</span>
                      <strong>{challengeCount}</strong>
                    </div>
                  </div>

                  <p className="sv-desc">
                    Mỗi bài đều dùng Monaco editor như phần Practice. Bạn có thể
                    chạy sample test từng bài trước khi nộp toàn bộ lời giải.
                  </p>

                  <div className="sv-skill-layout">
                    <aside className="sv-problem-nav">
                      <div className="sv-problem-nav-title">Danh sách bài survey</div>
                      <div className="sv-problem-nav-list">
                        {problems.map((problem, index) => {
                          const status = problemStatus(problem._id);
                          return (
                            <button
                              key={problem._id}
                              type="button"
                              className={`sv-problem-tab ${
                                activeProblem?._id === problem._id ? 'active' : ''
                              }`}
                              onClick={() => {
                                setActiveProblemId(problem._id);
                                setWorkspaceTab('description');
                                setConsoleTab('testcase');
                              }}
                            >
                              <div className="sv-problem-tab-top">
                                <span>Bài {index + 1}</span>
                                <span className="sv-problem-difficulty">
                                  {DIFFICULTY_LABELS[problem.difficulty] ??
                                    problem.difficulty}
                                </span>
                              </div>
                              <div className="sv-problem-tab-title">{problem.title}</div>
                              <div className="sv-problem-tab-meta">
                                {TRACK_LABELS[problem.track]} ·{' '}
                                {LEVEL_OPTIONS.find(
                                  (item) => item.id === problem.targetSkillLevel
                                )?.title ?? problem.targetSkillLevel}
                              </div>
                              <div className={`sv-status-badge ${status.tone}`}>
                                {status.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </aside>

                    {activeProblem && (
                      <div className="sv-workspace">
                        <section className="sv-problem-panel">
                          <div className="sv-panel-tabs">
                            <button
                              className={workspaceTab === 'description' ? 'active' : ''}
                              onClick={() => setWorkspaceTab('description')}
                              type="button"
                            >
                              Description
                            </button>
                            <button
                              className={workspaceTab === 'testcases' ? 'active' : ''}
                              onClick={() => setWorkspaceTab('testcases')}
                              type="button"
                            >
                              Testcases
                            </button>
                          </div>

                          <h3 className="sv-problem-heading">{activeProblem.title}</h3>
                          <div className="sv-problem-tags">
                            <span className="sv-chip">
                              {TRACK_LABELS[activeProblem.track]}
                            </span>
                            <span className="sv-chip">
                              {LEVEL_OPTIONS.find(
                                (item) => item.id === activeProblem.targetSkillLevel
                              )?.title ?? activeProblem.targetSkillLevel}
                            </span>
                            <span className="sv-chip">
                              {DIFFICULTY_LABELS[activeProblem.difficulty] ??
                                activeProblem.difficulty}
                            </span>
                            <span className="sv-chip">JavaScript</span>
                            <span className="sv-chip">
                              ~{activeProblem.estimatedMinutes} phút
                            </span>
                          </div>

                          {workspaceTab === 'description' ? (
                            <>
                              <div className="sv-problem-body">
                                {activeProblem.content}
                              </div>
                              <div className="sv-problem-section">
                                <div className="sv-problem-section-title">
                                  Yêu cầu triển khai
                                </div>
                                <div className="sv-problem-section-box">
                                  Hoàn thiện hàm <code>solve()</code>. Ưu tiên lời
                                  giải rõ ràng, đúng với sample test và ổn định khi
                                  chấm hidden test.
                                </div>
                              </div>
                              <div className="sv-problem-section">
                                <div className="sv-problem-section-title">
                                  Lưu ý
                                </div>
                                <div className="sv-problem-section-box">
                                  Khi bấm <strong>Chạy code</strong>, hệ thống chỉ
                                  chạy sample test công khai. Khi bấm{' '}
                                  <strong>Nộp tất cả lời giải</strong>, backend sẽ
                                  chấm toàn bộ test case.
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="sv-case-list">
                              {activeProblem.sampleTestCases.length > 0 ? (
                                activeProblem.sampleTestCases.map((testCase, index) => (
                                  <div className="sv-case-card" key={index}>
                                    <div className="sv-case-title">Case {index + 1}</div>
                                    <pre className="sv-case-block">
{`Input:
${testCase.input}

Expected:
${testCase.expectedOutput}`}
                                    </pre>
                                    {testCase.explanation && (
                                      <div className="sv-case-note">
                                        {testCase.explanation}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="sv-case-card">
                                  Bài này chưa có sample test công khai.
                                </div>
                              )}
                            </div>
                          )}
                        </section>

                        <section className="sv-editor-panel">
                          <div className="sv-editor-header">
                            <div>
                              <div className="sv-editor-title">Monaco editor</div>
                              <div className="sv-editor-sub">
                                Hàm bắt buộc: <code>solve()</code>
                              </div>
                            </div>
                            <div className="sv-editor-tools">
                              <span className="sv-editor-language">JavaScript</span>
                              <button
                                className="sv-link-btn"
                                onClick={resetActiveProblemCode}
                                type="button"
                              >
                                Reset starter
                              </button>
                            </div>
                          </div>

                          <div className="sv-editor-shell">
                            <Editor
                              height="100%"
                              language="javascript"
                              theme="vs-dark"
                              value={code[activeProblem._id] ?? ''}
                              onChange={(value) =>
                                setCode((current) => ({
                                  ...current,
                                  [activeProblem._id]: value ?? '',
                                }))
                              }
                              options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                fontFamily: "'JetBrains Mono', monospace",
                                lineHeight: 22,
                              }}
                            />
                          </div>

                          <div className="sv-console-panel">
                            <div className="sv-console-tabs">
                              <button
                                className={consoleTab === 'testcase' ? 'active' : ''}
                                onClick={() => setConsoleTab('testcase')}
                                type="button"
                              >
                                Testcase
                              </button>
                              <button
                                className={consoleTab === 'result' ? 'active' : ''}
                                onClick={() => setConsoleTab('result')}
                                type="button"
                              >
                                Test Result
                              </button>
                            </div>

                            <div className="sv-console-body">
                              {consoleTab === 'testcase' ? (
                                activeProblem.sampleTestCases.length > 0 ? (
                                  <div className="sv-console-list">
                                    {activeProblem.sampleTestCases.map((testCase, index) => (
                                      <div className="sv-console-case" key={index}>
                                        <div className="sv-console-case-title">
                                          Case {index + 1}
                                        </div>
                                        <pre className="sv-console-code">
{`Input: ${testCase.input}
Expected: ${testCase.expectedOutput}`}
                                        </pre>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="sv-console-empty">
                                    Chưa có sample test công khai cho bài này.
                                  </div>
                                )
                              ) : activeRunResult ? (
                                <div className="sv-run-result">
                                  <div className="sv-run-summary">
                                    <span
                                      className={`sv-status-badge ${
                                        activeRunResult.status === 'Accepted'
                                          ? 'success'
                                          : activeRunResult.status === 'Wrong Answer'
                                            ? 'warning'
                                            : 'danger'
                                      }`}
                                    >
                                      {activeRunResult.status}
                                    </span>
                                    <span className="sv-run-count">
                                      {activeRunResult.passedCount}/{activeRunResult.total}{' '}
                                      sample test pass
                                    </span>
                                  </div>
                                  <div className="sv-run-note">{activeRunResult.notes}</div>
                                  {activeRunResult.cases.map((item) => (
                                    <div className="sv-run-case" key={item.index}>
                                      <div className="sv-run-case-top">
                                        <span>Case {item.index + 1}</span>
                                        <span
                                          className={`sv-status-badge ${
                                            item.passed ? 'success' : 'danger'
                                          }`}
                                        >
                                          {item.passed ? 'Passed' : 'Failed'}
                                        </span>
                                      </div>
                                      <div className="sv-run-grid">
                                        <div>
                                          <div className="sv-run-label">Input</div>
                                          <pre className="sv-console-code">
                                            {item.input}
                                          </pre>
                                        </div>
                                        <div>
                                          <div className="sv-run-label">Expected</div>
                                          <pre className="sv-console-code">
                                            {item.expectedOutput}
                                          </pre>
                                        </div>
                                      </div>
                                      {!item.passed && (
                                        <div className="sv-run-grid">
                                          <div>
                                            <div className="sv-run-label">Actual</div>
                                            <pre className="sv-console-code">
                                              {item.actualOutput ?? '(không có output)'}
                                            </pre>
                                          </div>
                                          <div>
                                            <div className="sv-run-label">Error</div>
                                            <pre className="sv-console-code">
                                              {item.errorMessage ?? 'Wrong answer'}
                                            </pre>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="sv-console-empty">
                                  Chạy bài hiện tại để xem kết quả từng testcase.
                                </div>
                              )}
                            </div>
                          </div>
                        </section>
                      </div>
                    )}
                  </div>

                  <div className="sv-actions sv-actions-tight">
                    <div className="sv-action-group">
                      <button
                        className="sv-btn sv-btn-ghost"
                        onClick={leaveWorkspace}
                        type="button"
                      >
                        Đổi level
                      </button>
                    </div>
                    <div className="sv-action-group">
                      <button
                        className="sv-btn sv-btn-secondary"
                        disabled={!activeProblem || runningProblemId === activeProblem?._id}
                        onClick={runActiveProblem}
                        type="button"
                      >
                        {runningProblemId === activeProblem?._id
                          ? 'Đang chạy...'
                          : 'Chạy code'}
                      </button>
                      <button
                        className="sv-btn sv-btn-primary"
                        disabled={loading || !!runningProblemId}
                        onClick={submitTest}
                        type="button"
                      >
                        {loading ? 'Đang chấm...' : 'Nộp tất cả lời giải'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="sv-title">Thiết lập nhịp học</h1>
              <p className="sv-desc">
                Chọn khung học mỗi ngày để roadmap và milestone phù hợp hơn với
                cường độ bạn muốn theo.
              </p>
              <span className="sv-label">Số giờ học mỗi ngày (1–24)</span>
              <input
                className="sv-input"
                type="number"
                min={1}
                max={24}
                value={dailyHours}
                onChange={(event) => setDailyHours(Number(event.target.value))}
              />

              <span className="sv-label">Khung giờ tập trung</span>
              <div className="sv-row">
                <input
                  className="sv-input"
                  type="time"
                  value={focusStart}
                  onChange={(event) => setFocusStart(event.target.value)}
                />
                <input
                  className="sv-input"
                  type="time"
                  value={focusEnd}
                  onChange={(event) => setFocusEnd(event.target.value)}
                />
              </div>

              <span className="sv-label">Kiểu milestone bạn muốn</span>
              <div className="sv-options">
                {(
                  [
                    { id: 'project', title: 'Project', sub: 'Xây một sản phẩm nhỏ' },
                    { id: 'battle', title: 'Battle', sub: 'Đấu bài và phản xạ nhanh' },
                  ] as {
                    id: MilestoneTestPreference;
                    title: string;
                    sub: string;
                  }[]
                ).map((option) => (
                  <button
                    key={option.id}
                    className={`sv-option ${milestone === option.id ? 'selected' : ''}`}
                    onClick={() => setMilestone(option.id)}
                    type="button"
                  >
                    <div className="sv-option-title">{option.title}</div>
                    <div className="sv-option-sub">{option.sub}</div>
                  </button>
                ))}
              </div>

              <span className="sv-label">Mức độ kỷ luật</span>
              <div className="sv-options">
                {(
                  [
                    {
                      id: 'light',
                      title: 'Light',
                      sub: 'Nhắc nhở nhẹ và giữ nhịp học ổn định',
                    },
                    {
                      id: 'strict',
                      title: 'Strict',
                      sub: 'Siết milestone chặt hơn khi làm chưa tốt',
                    },
                  ] as { id: DisciplineLevel; title: string; sub: string }[]
                ).map((option) => (
                  <button
                    key={option.id}
                    className={`sv-option ${discipline === option.id ? 'selected' : ''}`}
                    onClick={() => setDiscipline(option.id)}
                    type="button"
                  >
                    <div className="sv-option-title">{option.title}</div>
                    <div className="sv-option-sub">{option.sub}</div>
                  </button>
                ))}
              </div>

              <div className="sv-actions">
                <button
                  className="sv-btn sv-btn-ghost"
                  onClick={() => setStep(1)}
                  type="button"
                >
                  Quay lại
                </button>
                <button
                  className="sv-btn sv-btn-primary"
                  disabled={loading}
                  onClick={submitDiscipline}
                  type="button"
                >
                  {loading ? 'Đang lưu...' : 'Tiếp tục'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="sv-title">Hoàn tất onboarding survey</h1>
              <p className="sv-desc">
                Hệ thống đã có đủ dữ liệu để khởi tạo lộ trình học cá nhân hóa cho
                bạn.
              </p>
              <div className="sv-result">
                <div className="score">{score ?? 0}%</div>
                {prettyEntryLevel(entryLevel) && (
                  <div className="level">
                    Entry level: {prettyEntryLevel(entryLevel)}
                  </div>
                )}
              </div>
              <div className="sv-actions">
                <button
                  className="sv-btn sv-btn-ghost"
                  onClick={() => setStep(2)}
                  type="button"
                >
                  Quay lại
                </button>
                <button
                  className="sv-btn sv-btn-primary"
                  disabled={loading}
                  onClick={finish}
                  type="button"
                >
                  {loading ? 'Đang hoàn tất...' : 'Bắt đầu học'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}