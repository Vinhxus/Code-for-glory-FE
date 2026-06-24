import { api } from './apiClient';

/* ─── Public user profile (safe subset of User schema) ─── */
export interface ForumUser {
  _id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  fieldFocus?: string;
  selfAssessedLevel?: string;
  gamification?: {
    xp: number;
    level: number;
    coins: number;
    currentStreak: number;
    badges: string[];
  };
  createdAt?: string;
  friends?: ForumUser[];
  followers?: ForumUser[];
  following?: ForumUser[];
}

export interface FriendRequest {
  _id: string;
  requesterId: ForumUser;
  recipientId: string;
  status: string;
  createdAt: string;
}

/* ─── Leaderboard row (from battles module) ─── */
export interface LeaderboardMember {
  rank: number;
  userId: string;
  username: string;
  field: string;
  ratingPoints: number;
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  tier: string;
}

/* ─── Fetch all users (GET /users) ─── */
export async function getForumMembers(): Promise<ForumUser[]> {
  return api.get<ForumUser[]>('/users');
}

/* ─── Fetch leaderboard for community display ─── */
export async function getCommunityLeaderboard(
  field: 'frontend' | 'backend' | 'fullstack' = 'frontend',
  limit = 20
): Promise<LeaderboardMember[]> {
  const query = new URLSearchParams({ field, limit: String(limit) });
  return api.get<LeaderboardMember[]>(
    `/battles/leaderboard?${query.toString()}`
  );
}

/* ─── Social API ─── */
export async function getUserProfile(userId: string): Promise<ForumUser> {
  return api.get<ForumUser>(`/social/profile/${userId}`);
}

export async function sendFriendRequest(recipientId: string) {
  return api.post(`/social/friend-request/${recipientId}`, {});
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  return api.get<FriendRequest[]>('/social/friend-requests');
}

export async function acceptFriendRequest(requesterId: string) {
  return api.post(`/social/friend-request/${requesterId}/accept`, {});
}

export async function rejectFriendRequest(requesterId: string) {
  return api.post(`/social/friend-request/${requesterId}/reject`, {});
}

export async function getFriends(): Promise<ForumUser[]> {
  return api.get<ForumUser[]>('/social/friends');
}

export async function followUser(followingId: string) {
  return api.post(`/social/follow/${followingId}`, {});
}

export async function unfollowUser(followingId: string) {
  return api.post(`/social/unfollow/${followingId}`, {});
}

/* ─── Forum API ─── */
export interface ForumPost {
  _id: string;
  channelId: string;
  author: ForumUser;
  body: string;
  createdAt: string;
  reactions: Array<{ emoji: string; count: number; users: string[] }>;
  replyCount: number;
}

export interface ForumComment {
  _id: string;
  postId: string;
  author: ForumUser;
  body: string;
  createdAt: string;
  reactions: Array<{ emoji: string; count: number; users: string[] }>;
}

export async function getPosts(channelId: string): Promise<ForumPost[]> {
  return api.get<ForumPost[]>(`/forum/posts?channelId=${channelId}`);
}

export async function createPost(
  channelId: string,
  body: string
): Promise<ForumPost> {
  return api.post<ForumPost>('/forum/posts', { channelId, body });
}

export async function reactToPost(postId: string, emoji: string) {
  return api.post(`/forum/posts/${postId}/react`, { emoji });
}

export async function getComments(postId: string): Promise<ForumComment[]> {
  return api.get<ForumComment[]>(`/forum/posts/${postId}/comments`);
}

export async function createComment(
  postId: string,
  body: string
): Promise<ForumComment> {
  return api.post<ForumComment>(`/forum/posts/${postId}/comments`, { body });
}

export async function reactToComment(commentId: string, emoji: string) {
  return api.post(`/forum/comments/${commentId}/react`, { emoji });
}
