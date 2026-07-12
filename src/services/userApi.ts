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
