export type BattleField = 'FE' | 'BE';
export type BattleMode = 'speed' | 'performance';
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
