import { request } from './apiClient';

// History page — client layer for the backend `/history` endpoints.
// Shapes mirror the backend (camelCase, BE is source of truth).

export type FinishedLesson = {
  id: string;
  title: string;
  status: 'MASTERED' | 'IN_PROGRESS' | 'SAVED';
  completedAt: string;
  score: number;
  icon: string;
};

export type UnfinishedQuest = {
  id: string;
  title: string;
  stepLabel: string;
  currentStep: number;
  totalSteps: number;
  progress: number;
  icon: string;
};

export type BattleDraft = {
  id: string;
  title: string;
  description: string;
  intensity: 'HIGH' | 'MEDIUM' | 'LOW';
  timeAgo: string;
};

export type UnfinishedResponse = {
  quests: UnfinishedQuest[];
  drafts: BattleDraft[];
};

export type SavedLore = {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  tags: string[];
  isBookmarked: boolean;
};

export type ActivityEntry = {
  id: string;
  action: string;
  score?: number;
  xpEarned?: number;
  coinsEarned?: number;
  createdAt: string;
  metadata: Record<string, unknown>;
};

/** "Archives of Mastery" — completed lessons. */
export async function getFinishedLessons() {
  return request<FinishedLesson[]>('/history/finished');
}

/** "Archives of the Incomplete" — in-progress quests + battle drafts. */
export async function getUnfinished() {
  return request<UnfinishedResponse>('/history/unfinished');
}

/** "Bookmarked Lore" — saved items. */
export async function getSavedLore() {
  return request<SavedLore[]>('/history/bookmarks');
}

/** Remove a saved bookmark by id. */
export async function removeBookmark(id: string) {
  return request<{ success: boolean }>(`/history/bookmarks/${id}`, {
    method: 'DELETE',
  });
}

/** Raw learning-history activity feed. */
export async function getActivity() {
  return request<ActivityEntry[]>('/history/activity');
}
