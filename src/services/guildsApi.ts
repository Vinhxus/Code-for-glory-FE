import { api } from './apiClient';

export type GuildType =
  | 'Backend'
  | 'Frontend'
  | 'Data Science'
  | 'DevOps'
  | 'Security'
  | 'Mobile';

export type GuildSortBy = 'rank' | 'members' | 'winRate' | 'weeklyXP';

export interface GuildMemberHighlight {
  username: string;
  title?: string;
  roleLabel?: string;
  avatarUrl?: string;
  initials: string;
}

export interface GuildQuestCard {
  questId: string;
  label: string;
  progress: number;
  total: number;
  reward: string;
  category: string;
  difficulty: string;
}

export interface GuildCard {
  id: string;
  slug: string;
  name: string;
  type: GuildType;
  color: string;
  rank: number;
  level: number;
  xp: number;
  xpNext: number;
  weeklyXP: number;
  winRate: number;
  members: number;
  maxMembers: number;
  founded: string;
  openToJoin: boolean;
  featured?: boolean;
  description: string;
  mission?: string;
  tags: string[];
  language?: string;
  quests: GuildQuestCard[];
  memberAvatars: string[];
  memberHighlights: GuildMemberHighlight[];
  isMember: boolean;
  canJoin: boolean;
  isOwner: boolean;
  headquarters?: string;
  recruitmentPitch?: string;
  availableSeats: number;
}

export interface GuildOverview {
  stats: {
    totalGuilds: number;
    totalMembers: number;
    avgWinRate: number;
    totalQuests: number;
  };
  featuredGuild: GuildCard | null;
  myGuild: {
    id: string;
    slug: string;
    name: string;
    type: GuildType;
    color: string;
    memberCount: number;
    rank: number;
    level: number;
    isOwner: boolean;
  } | null;
}

export interface GuildDetail extends Omit<GuildCard, 'members' | 'quests'> {
  mission?: string;
  requirements: Array<{ label: string; value: string }>;
  perks: string[];
  activityFeed: Array<{
    type: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
  quests: Array<{
    questId: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    progress: number;
    total: number;
    rewardXp: number;
    rewardCoins: number;
    dueInDays: number;
    completed: boolean;
    claimed: boolean;
  }>;
  members: Array<{
    id: string;
    username: string;
    title?: string;
    roleLabel?: string;
    avatarUrl?: string;
    initials: string;
    contributionXp: number;
    joinedAt: string;
    isCurrentUser: boolean;
  }>;
}

export interface CreateGuildPayload {
  name: string;
  type: GuildType;
  description: string;
  mission?: string;
  recruitmentPitch?: string;
  language?: string;
  headquarters?: string;
  openToJoin?: boolean;
  maxMembers?: number;
  tags?: string[];
}

export interface UpdateGuildPayload {
  name?: string;
  type?: GuildType;
  description?: string;
  mission?: string;
  recruitmentPitch?: string;
  language?: string;
  headquarters?: string;
  openToJoin?: boolean;
  maxMembers?: number;
  tags?: string[];
}

export interface CreateGuildQuestPayload {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  total: number;
  rewardXp: number;
  rewardCoins: number;
  dueInDays?: number;
}

export async function getGuildOverview(): Promise<GuildOverview> {
  return api.get<GuildOverview>('/guilds/overview');
}

export async function getGuilds(params?: {
  type?: GuildType;
  search?: string;
  sortBy?: GuildSortBy;
}): Promise<{ items: GuildCard[] }> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.search) query.set('search', params.search);
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return api.get<{ items: GuildCard[] }>(`/guilds${suffix}`);
}

export async function getGuildDetail(slug: string): Promise<GuildDetail> {
  return api.get<GuildDetail>(`/guilds/${slug}`);
}

export async function getMyGuild(): Promise<GuildDetail | null> {
  return api.get<GuildDetail | null>('/guilds/my-guild');
}

export async function createGuild(
  payload: CreateGuildPayload
): Promise<GuildDetail> {
  return api.post<GuildDetail>('/guilds', payload);
}

export async function updateGuild(
  slug: string,
  payload: UpdateGuildPayload
): Promise<GuildDetail> {
  return api.patch<GuildDetail>(`/guilds/${slug}`, payload);
}

export async function joinGuild(slug: string): Promise<GuildDetail> {
  return api.post<GuildDetail>(`/guilds/${slug}/join`, {});
}

export async function leaveGuild(slug: string): Promise<{ success: true }> {
  return api.post<{ success: true }>(`/guilds/${slug}/leave`, {});
}

export async function claimGuildQuest(
  slug: string,
  questId: string
): Promise<{ rewardXp: number; rewardCoins: number; questId: string }> {
  return api.post(`/guilds/${slug}/quests/${questId}/claim`, {});
}

export async function createGuildQuest(
  slug: string,
  payload: CreateGuildQuestPayload
): Promise<GuildDetail> {
  return api.post<GuildDetail>(`/guilds/${slug}/quests`, payload);
}

export async function deleteGuildQuest(
  slug: string,
  questId: string
): Promise<GuildDetail> {
  return api.delete<GuildDetail>(`/guilds/${slug}/quests/${questId}`);
}

export async function removeGuildMember(
  slug: string,
  memberId: string
): Promise<GuildDetail> {
  return api.delete<GuildDetail>(`/guilds/${slug}/members/${memberId}`);
}
