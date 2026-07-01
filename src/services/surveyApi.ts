// Client for the onboarding survey (BE /survey/*). All endpoints require auth;
// `api` attaches the bearer token and unwraps the { data, meta } envelope.
import { api } from './apiClient';

export type CareerField = 'frontend' | 'backend' | 'fullstack';
export type SkillLevel = 'novice' | 'apprentice' | 'journeyman' | 'master';
export type DisciplineLevel = 'light' | 'strict';
export type LearningGoal =
  | 'get_job'
  | 'personal_project'
  | 'competition'
  | 'explore_ai';
export type MilestoneTestPreference = 'battle' | 'project';

export interface SampleTestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface CodingProblem {
  _id: string;
  title: string;
  content: string;
  difficulty: string;
  track: CareerField;
  targetSkillLevel: SkillLevel;
  language: 'javascript';
  starterCode: string;
  timeLimitSeconds: number;
  estimatedMinutes: number;
  sampleTestCases: SampleTestCase[];
  totalTestCases: number;
}

export interface SkillTestStartResponse {
  problems: CodingProblem[];
  totalProblems: number;
}

export interface CodeSolution {
  questionId: string;
  code: string;
  timeSpentSeconds?: number;
}

export type SkillRunStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Runtime Error'
  | 'Time Limit Exceeded';

export interface SkillTestCaseRunResult {
  index: number;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  errorMessage?: string;
  isHidden: boolean;
}

export interface SkillTestRunResult {
  questionId: string;
  status: SkillRunStatus;
  passedCount: number;
  total: number;
  notes: string;
  errorMessage?: string;
  cases: SkillTestCaseRunResult[];
}

export interface QuestionGrade {
  questionId: string;
  passedTestCases: number;
  totalTestCases: number;
  isCorrect: boolean;
  errorMessage?: string;
}

/** The BE survey draft/response document (subset the FE relies on). */
export interface SurveyDraft {
  _id: string;
  fieldFocus?: CareerField;
  learningGoal?: string;
  selfAssessedLevel?: SkillLevel;
  knownLanguages?: string[];
  technicalTestScore?: number;
  technicalTestAnswers?: QuestionGrade[];
  computedEntryLevel?: string;
  dailyHours?: number;
  focusTimeWindow?: string;
  disciplineLevel?: DisciplineLevel;
  milestoneTestPreference?: MilestoneTestPreference;
  isCompleted?: boolean;
  version?: number;
}

export interface CareerPathPayload {
  fieldFocus: CareerField;
  learningGoal?: LearningGoal;
}

export interface SkillTestStartPayload {
  fieldFocus: CareerField;
  selfAssessedLevel?: SkillLevel;
  knownLanguages?: string[];
  questionCount?: number;
}

export interface DisciplinePayload {
  dailyHours: number;
  focusTimeWindow: string; // "HH:MM-HH:MM"
  milestoneTestPreference: MilestoneTestPreference;
  disciplineLevel: DisciplineLevel;
}

/** Segment 1 — save the chosen career path / goal. */
export function saveCareerPath(
  payload: CareerPathPayload
): Promise<SurveyDraft> {
  return api.post<SurveyDraft>('/survey/career-path', payload);
}

/** Segment 2a — fetch 1–3 coding problems for the field. */
export function startSkillTest(
  payload: SkillTestStartPayload
): Promise<SkillTestStartResponse> {
  return api.post<SkillTestStartResponse>('/survey/skill-test/start', payload);
}

/** Segment 2b — submit code solutions; BE grades them and computes entry level. */
export function submitSkillTest(
  solutions: CodeSolution[],
  totalTimeSeconds?: number
): Promise<SurveyDraft> {
  return api.post<SurveyDraft>('/survey/skill-test/submit', {
    solutions,
    totalTimeSeconds,
  });
}

/** Segment 2b-alt — run sample checks for one survey coding problem. */
export function runSkillTestQuestion(payload: {
  questionId: string;
  code: string;
}): Promise<SkillTestRunResult> {
  return api.post<SkillTestRunResult>('/survey/skill-test/run', payload);
}

/** Segment 3 — discipline / penalty setup. */
export function saveDiscipline(
  payload: DisciplinePayload
): Promise<SurveyDraft> {
  return api.post<SurveyDraft>('/survey/discipline', payload);
}

/** Finalize the survey: pushes results onto the user and clears first-login. */
export function completeSurvey(): Promise<SurveyDraft> {
  return api.post<SurveyDraft>('/survey/complete', {});
}

/** Read the latest survey draft/response for the current user. */
export function getMySurvey(): Promise<SurveyDraft | null> {
  return api.get<SurveyDraft | null>('/survey/me');
}

/** Start a fresh survey version (e.g. retake after a month). */
export function retakeSurvey(): Promise<SurveyDraft> {
  return api.post<SurveyDraft>('/survey/retake', {});
}
