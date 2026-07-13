import { api } from './apiClient';

/* ─── Types (mirror BE: notifications/schemas/notification.schema.ts) ─── */

export type NotificationType =
    | 'streak_reminder'
    | 'streak_broken'
    | 'lesson_unlock'
    | 'penalty_applied'
    | 'battle_invite'
    | 'battle_result'
    | 'achievement'
    | 'recall_due'
    | 'suspicious_login'
    | 'system'
    | 'practice_solved'
    | 'shop_purchase';

export interface AppNotification {
    _id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    actionUrl?: string;
    data?: Record<string, unknown>;
    read: boolean;
    readAt?: string;
    priority: 'low' | 'normal' | 'high';
    escalationLevel: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedNotifications {
    items: AppNotification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface GetNotificationsParams {
    page?: number;
    limit?: number;
    type?: NotificationType;
    read?: boolean;
}

/* ─── Notifications API (mirror BE: notifications/notifications.controller.ts) ─── */

export async function getNotifications(
    params: GetNotificationsParams = {}
): Promise<PaginatedNotifications> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.type) query.set('type', params.type);
    if (params.read !== undefined) query.set('read', String(params.read));

    const qs = query.toString();
    return api.get<PaginatedNotifications>(
        `/notifications${qs ? `?${qs}` : ''}`
    );
}

export async function getUnreadCount(): Promise<number> {
    const res = await api.get<{ unreadCount: number }>(
        '/notifications/unread-count'
    );
    return res.unreadCount;
}

export async function markNotificationsRead(
    ids: string[]
): Promise<{ modified: number }> {
    return api.patch<{ modified: number }>('/notifications/read', { ids });
}

export async function markAllNotificationsRead(): Promise<{
    modified: number;
}> {
    return api.patch<{ modified: number }>('/notifications/read-all', {});
}

export async function deleteNotification(id: string): Promise<void> {
    return api.delete(`/notifications/${id}`);
}