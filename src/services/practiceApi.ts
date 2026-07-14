import { request } from './apiClient';

export type SubmissionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Compilation Error'
  | 'Runtime Error'
  | 'Time Limit Exceeded';

export type JudgeCaseResult = {
  id: string;
  title: string;
  input: string;
  expected: string;
  passed: boolean;
  detail: string;
};

export type JudgeRunResult = {
  status: SubmissionStatus;
  passedCount: number;
  total: number;
  runtime: string;
  memory: string;
  notes: string;
  cases: JudgeCaseResult[];
};

export type SubmissionRecord = {
  id: number;
  status: SubmissionStatus;
  date: string;
  language: string;
  runtime: string;
  memory: string;
  notes: string;
};

export type ChapterProgressSummary = {
  chapter: string;
  breakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
};

export type ProgressSummaryResponse = {
  solvedPracticeIds: string[];
  overall: {
    easy: number;
    medium: number;
    hard: number;
  };
  chapters: ChapterProgressSummary[];
};

export type ActivityDay = {
  date: string; // 'yyyy-MM-dd'
  count: number;
};

export type ActivityCalendarResponse = {
  totalSubmissions: number;
  totalActiveDays: number;
  maxStreak: number;
  currentStreak: number;
  rangeStart: string;
  rangeEnd: string;
  days: ActivityDay[];
};

export type PracticeEvaluationPayload = {
  practiceId: string;
  title: string;
  topic: string;
  track: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  language: string;
  code: string;
  locale: 'vi' | 'en';
  nodeId?: string;
};

export async function runPracticeCode(payload: PracticeEvaluationPayload) {
  return request<JudgeRunResult>('/exercises/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitPracticeCode(payload: PracticeEvaluationPayload) {
  return request<{
    runResult: JudgeRunResult;
    submission: SubmissionRecord;
    submissions: SubmissionRecord[];
    coinsEarned: number;
    xpEarned: number;
  }>('/exercises/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPracticeSubmissions(practiceId: string) {
  return request<SubmissionRecord[]>(`/exercises/${practiceId}/submissions`);
}

export async function getProgressSummary() {
  return request<ProgressSummaryResponse>(`/exercises/progress-summary`);
}

export async function getActivityCalendar(days = 365) {
  return request<ActivityCalendarResponse>(
    `/exercises/activity-calendar?days=${days}`
  );
}