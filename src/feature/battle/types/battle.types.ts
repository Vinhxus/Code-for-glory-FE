export type BattleField = 'FE' | 'BE' | 'CORE';
export type BattleMode = 'SPEED' | 'PERFORMANCE';
export type BattleStatus =
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ABANDONED';

export interface BattlePlayer {
  userId: string;
  username: string;
  avatar?: string;
  currentScore: number;
  hasSubmitted: boolean;
  submissionCount?: number;
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
  timeLimit: number;
  startTime?: string;
  expectedEndTime?: string;
  endTime?: string;
  result?: {
    winnerId?: string;
    isDraw?: boolean;
    finalScores: { userId: string; score: number }[];
  };
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
