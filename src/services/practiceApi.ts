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

export type PracticeEvaluationPayload = {
  practiceId: string;
  title: string;
  topic: string;
  track: string;
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
  }>('/exercises/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPracticeSubmissions(practiceId: string) {
  return request<SubmissionRecord[]>(`/exercises/${practiceId}/submissions`);
}
