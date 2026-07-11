import axiosInstance from './axiosInstance';
import type {
  Battle,
  BattleField,
  BattleMode,
  SubmitAnswerPayload,
  SubmitAnswerResponse,
  BattleSubmission,
  CodeAnalysis,
  CreateAnalysisPayload,
} from '../types/battle.types';

type ApiBattleField = 'frontend' | 'backend' | 'fullstack';
type ApiBattleMode = 'speed' | 'performance';
type ApiBattleStatus = 'waiting' | 'in_progress' | 'finished' | 'cancelled';

type ApiBattle = {
  _id: string;
  mode: ApiBattleMode;
  field: ApiBattleField;
  status: ApiBattleStatus;
  players: Array<{
    userId: string;
    username?: string;
    avatar?: string;
    score: number;
    ratingBefore?: number;
    ratingAfter?: number;
    passedTestCount?: number;
    submissionCount?: number;
    result?: string;
    totalPassedTests?: number;
    totalTests?: number;
    totalMemoryKb?: number;
  }>;
  questions?: Array<{
    questionId: string;
    title: string;
    content: string;
    difficulty: string;
  }>;
  timeLimitSeconds?: number;
  startTime?: string;
  endTime?: string;
  winnerId?: string | null;
  isDraw?: boolean;
};

const FIELD_TO_API: Record<BattleField, ApiBattleField> = {
  FE: 'frontend',
  BE: 'backend',
  CORE: 'fullstack',
};

const MODE_TO_API: Record<BattleMode, ApiBattleMode> = {
  SPEED: 'speed',
  PERFORMANCE: 'performance',
};

const FIELD_FROM_API: Record<ApiBattleField, BattleField> = {
  frontend: 'FE',
  backend: 'BE',
  fullstack: 'CORE',
};

const MODE_FROM_API: Record<ApiBattleMode, BattleMode> = {
  speed: 'SPEED',
  performance: 'PERFORMANCE',
};

const STATUS_FROM_API: Record<ApiBattleStatus, Battle['status']> = {
  waiting: 'WAITING',
  in_progress: 'IN_PROGRESS',
  finished: 'COMPLETED',
  cancelled: 'ABANDONED',
};

const normalizeBattle = (battle: ApiBattle): Battle => ({
  _id: battle._id,
  mode: MODE_FROM_API[battle.mode],
  field: FIELD_FROM_API[battle.field],
  status: STATUS_FROM_API[battle.status],
  players: battle.players.map((player) => ({
    userId: player.userId,
    username: player.username ?? 'Unknown',
    avatar: player.avatar,
    score: player.score,
    ratingBefore: player.ratingBefore ?? 1000,
    ratingAfter: player.ratingAfter,
    passedTestCount: player.passedTestCount ?? 0,
    submissionCount: player.submissionCount ?? 0,
    result: player.result,
    totalPassedTests: player.totalPassedTests,
    totalTests: player.totalTests,
    totalMemoryKb: player.totalMemoryKb,
  })),
  questions: (battle.questions ?? []).map((question) => ({
    questionId: question.questionId,
    title: question.title,
    content: question.content,
    difficulty: question.difficulty,
  })),
  timeLimitSeconds: battle.timeLimitSeconds ?? 0,
  startTime: battle.startTime,
  endTime: battle.endTime,
  winnerId: battle.winnerId ?? undefined,
  isDraw: battle.isDraw ?? false,
});

export const createBattle = async (
  field: BattleField,
  mode: BattleMode
): Promise<Battle> => {
  const response = await axiosInstance.post('/battles/match', {
    field: FIELD_TO_API[field],
    mode: MODE_TO_API[mode],
  });
  return normalizeBattle(response.data as ApiBattle);
};

export const submitAnswer = async (
  battleId: string,
  payload: SubmitAnswerPayload
): Promise<SubmitAnswerResponse> => {
  const response = await axiosInstance.post(
    `/battles/${battleId}/submit`,
    payload
  );
  return response.data;
};
// Pages and limit number item
export const getBattleHistory = async (page = 1, limit = 10) => {
  const response = await axiosInstance.get('/battles/history', {
    params: { page, limit },
  });
  return response.data;
};

export const abandonBattle = async (battleId: string) => {
  const response = await axiosInstance.post(`/battles/${battleId}/abandon`);
  return response.data;
};
export const getBattleById = async (battleId: string): Promise<Battle> => {
  const response = await axiosInstance.get(`/battles/${battleId}`);
  return normalizeBattle(response.data as ApiBattle);
};
export const getSubmissions = async (
  battleId: string
): Promise<BattleSubmission[]> => {
  const response = await axiosInstance.get(`/battles/${battleId}/submissions`);
  return response.data;
};

// ⚠️ CHƯA CÓ BACKEND: BE hiện không có module/route `code-analysis`.
// Hai hàm dưới sẽ trả 404 cho tới khi BE bổ sung controller `/code-analysis`
// (xem AnalyzeCodePage). Cần quyết định sản phẩm trước khi nối.
export const createAnalysis = async (
  payload: CreateAnalysisPayload
): Promise<CodeAnalysis> => {
  const response = await axiosInstance.post('/code-analysis', payload);
  return response.data;
};

export const getAnalysis = async (battleId: string): Promise<CodeAnalysis> => {
  const response = await axiosInstance.get(`/code-analysis/${battleId}`);
  return response.data;
};

// BE không có route cancel-match riêng; huỷ tìm trận = abandon trận đang ở
// trạng thái WAITING (service BE chấp nhận WAITING -> CANCELLED).
export const cancelMatchmaking = async (battleId: string) => {
  const response = await axiosInstance.post(`/battles/${battleId}/abandon`);
  return response.data;
};
