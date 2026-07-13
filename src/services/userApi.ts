import { api } from './apiClient';

export type CareerField = 'frontend' | 'backend' | 'fullstack';
export type SkillLevel = 'novice' | 'apprentice' | 'journeyman' | 'master';

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface UserGamification {
  xp: number;
  level: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string;
  badges: string[];
}

export interface UserRankingSummary {
  field: CareerField;
  ratingPoints: number;
  tier: string;
  totalBattles: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  peakRating: number;
}

/** Tiến độ XP trong level hiện tại — khớp GamificationService.getXpProgress() ở BE. */
export interface XpProgress {
  level: number;
  xp: number;
  currentLevelFloor: number;
  nextLevelFloor: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  levelSpan: number;
  progressPercent: number;
}

/** Response gọn của GET /me/stats — dùng cho mini XP bar và mọi nơi chỉ cần XP/level/streak, không cần full profile. */
export interface MyStats {
  gamification: UserGamification;
  xpProgress: XpProgress;
  rankings: UserRankingSummary[];
}

/** Một dòng trong bảng xếp hạng theo tổng XP toàn thời gian (GET /users/leaderboard/xp). */
export interface XpLeaderboardEntry {
  _id: string;
  username: string;
  avatarUrl?: string;
  fieldFocus?: CareerField;
  gamification: {
    xp: number;
    level: number;
  };
}

export interface DifficultyBreakdown {
  easy: number;
  medium: number;
  hard: number;
}

export interface ChapterProgressSummary {
  chapter: string;
  breakdown: DifficultyBreakdown;
}

export interface ProgressSummary {
  solvedPracticeIds: string[];
  overall: DifficultyBreakdown;
  chapters: ChapterProgressSummary[];
}

export interface ProfileSummary {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  socialLinks: SocialLinks;
  showProfile: boolean;
  showCertificates: boolean;
  fieldFocus?: CareerField;
  selfAssessedLevel?: SkillLevel;
  createdAt: string;
  gamification: UserGamification;
  followerCount: number;
  followingCount: number;
  friendCount: number;
  rankings: UserRankingSummary[];
  progressSummary: ProgressSummary;
}

export interface UpdateProfilePayload {
  username?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  socialLinks?: SocialLinks;
  fieldFocus?: CareerField;
  selfAssessedLevel?: SkillLevel;
  learningGoal?: string;
  showProfile?: boolean;
  showCertificates?: boolean;
}

/** Gộp profile + gamification + rankings + progress-summary trong 1 call — dùng cho trang Profile. */
export async function getProfileSummary(): Promise<ProfileSummary> {
  return api.get<ProfileSummary>('/me/summary');
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ProfileSummary> {
  return api.patch<ProfileSummary>('/me', payload);
}

/** XP, level, streak, badges, coins + xpProgress — gọn hơn getProfileSummary(), dùng cho mini XP bar. */
export async function getMyStats(): Promise<MyStats> {
  return api.get<MyStats>('/me/stats');
}

/** Top N user theo tổng XP toàn thời gian, toàn hệ thống (mặc định 3) — dùng cho mini leaderboard trang chủ. */
export async function getXpLeaderboard(
  limit = 3
): Promise<XpLeaderboardEntry[]> {
  return api.get<XpLeaderboardEntry[]>(
    `/users/leaderboard/xp?limit=${limit}`
  );
}