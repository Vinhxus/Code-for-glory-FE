// export type BattleField = 'FE' | 'BE';
export type BattleField = 'frontend' | 'backend';
export type BattleMode = 'speed' | 'performance';
export type BattleStatus =
  | 'waiting'
  | 'matched'
  | 'in_progress'
  | 'finished'
  | 'cancelled';

export interface BattlePlayer {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  ratingBefore: number;
  ratingAfter?: number;
  passedTestCount: number;
  submissionCount: number;
  result?: string;
  totalPassedTests?: number;
  totalTests?: number;
  totalMemoryKb?: number;
}

export interface BattleQuestion {
  questionId: string;
  title: string;
  content: string;
  difficulty: string;
  correctAnswer?: string;
}

export interface Battle {
  _id: string;
  mode: BattleMode;
  field: BattleField;
  status: BattleStatus;
  players: BattlePlayer[];
  questions: BattleQuestion[];
  timeLimitSeconds: number;
  startTime?: string;
  expectedEndTime?: string;
  endTime?: string;
  winnerId?: string;
  isDraw?: boolean;
}

export interface SubmitAnswerPayload {
  questionId: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  points: number;
  currentScore: number;
  currentQuestionIndex: number;
  message: string;
}

export type ResultType = 'victory' | 'defeat' | 'draw';

export interface BattleSubmission {
  _id: string;
  battleId: string;
  userId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
  timeSpent: number;
  submittedAt: string;
}

export interface CodeAnalysisResource {
  title: string;
  url: string;
}

export interface CodeAnalysis {
  _id: string;
  battleId: string;
  userId: string;
  code: string;
  language: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  refactoringSuggestion: string;
  resources: CodeAnalysisResource[];
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnalysisPayload {
  battleId: string;
  code: string;
  language: string;
}
export interface OpponentCorrectPayload {
  userId: string;
  questionId: string;
  questionOrder: number;
  currentScore: number;
}
