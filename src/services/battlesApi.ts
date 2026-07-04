// Client cho module Battles (1v1 coding battle).
// Khớp với backend `src/battles/*`. Tất cả route nằm dưới prefix /api/battles.
import { request } from './apiClient';

export type BattleMode = 'speed' | 'performance';
export type BattleField = 'frontend' | 'backend' | 'fullstack';
export type BattleStatus =
  | 'waiting'
  | 'matched'
  | 'in_progress'
  | 'finished'
  | 'cancelled';
export type BattleResult = 'victory' | 'defeat' | 'draw';

export type BattlePlayer = {
  userId: string;
  ratingBefore: number;
  ratingAfter?: number;
  score: number;
  passedTestCount: number;
  finishTimeSeconds?: number;
  submissionCount: number;
  result?: BattleResult;
};

export type Battle = {
  _id: string;
  mode: BattleMode;
  field: BattleField;
  status: BattleStatus;
  players: BattlePlayer[];
  questionIds: string[];
  winnerId?: string | null;
  isDraw: boolean;
  startTime?: string;
  endTime?: string;
  timeLimitSeconds: number;
  createdAt?: string;
  updatedAt?: string;
};

export type LeaderboardRow = {
  rank: number;
  userId: string;
  username: string;
  field: BattleField;
  ratingPoints: number;
  totalBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  tier: string;
};

export type ArenaOverviewStat = {
  key: string;
  label: string;
  value: string;
  subtitle: string;
  accent: string;
};

export type ArenaFocusLane = {
  field: BattleField;
  title: string;
  summary: string;
  difficulty: string;
  matchType: string;
  estimatedQueue: string;
  topics: string[];
  outcomes: string[];
  platforms: string[];
  highlight: string;
};

export type ArenaTournament = {
  id: string;
  title: string;
  organizer: string;
  field: BattleField | 'all';
  cadence: string;
  format: string;
  level: string;
  focus: string[];
  link: string;
  note: string;
};

export type ArenaKnowledgeTrack = {
  field: BattleField;
  title: string;
  description: string;
  milestones: Array<{
    title: string;
    detail: string;
  }>;
};

export type ArenaOverview = {
  season: {
    badge: string;
    title: string;
    subtitle: string;
  };
  stats: ArenaOverviewStat[];
  focusLanes: ArenaFocusLane[];
  tournaments: ArenaTournament[];
  knowledgeTracks: ArenaKnowledgeTrack[];
};

export type SubmitAnswerResult = {
  isCorrect: boolean;
  points: number;
  currentScore: number;
  currentQuestionIndex: number;
  message: string;
};

export type BattleSubmission = {
  _id: string;
  battleId: string;
  userId: string;
  questionId: string;
  language: string;
  code: string;
  status: string;
  pointsEarned: number;
  elapsedSeconds: number;
  createdAt?: string;
};

export type BattleHistory = {
  items: Battle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// POST /battles/match — tìm hoặc tạo trận. Trả về battle ở trạng thái
// `waiting` (đang chờ đối thủ) hoặc `in_progress` (đã ghép đôi).
export async function createMatch(payload: {
  mode: BattleMode;
  field: BattleField;
  opponentId?: string;
}) {
  return request<Battle>('/battles/match', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBattle(battleId: string) {
  return request<Battle>(`/battles/${battleId}`);
}

export async function getBattleHistory(params?: {
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<BattleHistory>(`/battles/history${suffix}`);
}

export async function getLeaderboard(field: BattleField, limit = 20) {
  const query = new URLSearchParams({ field, limit: String(limit) });
  return request<LeaderboardRow[]>(`/battles/leaderboard?${query.toString()}`);
}

export async function getArenaOverview() {
  return request<ArenaOverview>('/battles/overview');
}

export async function submitBattleAnswer(
  battleId: string,
  payload: { questionId: string; answer: string }
) {
  return request<SubmitAnswerResult>(`/battles/${battleId}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBattleSubmissions(battleId: string, userId?: string) {
  const suffix = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return request<BattleSubmission[]>(
    `/battles/${battleId}/submissions${suffix}`
  );
}

export async function endBattle(battleId: string) {
  return request<unknown>(`/battles/${battleId}/end`, { method: 'POST' });
}

export async function abandonBattle(battleId: string) {
  return request<{ message: string; winnerId?: string }>(
    `/battles/${battleId}/abandon`,
    { method: 'POST' }
  );
}
