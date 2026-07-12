import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/settings';
import { useNotificationsStore } from '../store/notifications';
import type {
    AppNotification,
    NotificationType,
} from '../services/notificationsApi';

const TYPE_ICON: Record<NotificationType, string> = {
    streak_reminder: 'local_fire_department',
    streak_broken: 'heart_broken',
    lesson_unlock: 'lock_open',
    penalty_applied: 'block',
    battle_invite: 'sports_martial_arts',
    battle_result: 'emoji_events',
    achievement: 'military_tech',
    recall_due: 'history_edu',
    suspicious_login: 'gpp_maybe',
    system: 'campaign',
};

const TYPE_COLOR: Record<NotificationType, string> = {
    streak_reminder: 'var(--cg-amber)',
    streak_broken: '#f87171',
    lesson_unlock: 'var(--cg-green)',
    penalty_applied: '#f87171',
    battle_invite: 'var(--cg-coral)',
    battle_result: 'var(--cg-amber)',
    achievement: 'var(--cg-amber)',
    recall_due: '#60a5fa',
    suspicious_login: '#f87171',
    system: 'var(--cg-text-muted)',
};

function formatRelativeTime(iso: string, isVi: boolean): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return isVi ? 'Vừa xong' : 'Just now';
    if (minutes < 60) return isVi ? `${minutes} phút trước` : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return isVi ? `${hours} giờ trước` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return isVi ? `${days} ngày trước` : `${days}d ago`;
    return new Date(iso).toLocaleDateString(isVi ? 'vi-VN' : 'en-US');
}

function NotificationItem({
    notification,
    isVi,
    onClick,
}: {
    notification: AppNotification;
    isVi: boolean;
    onClick: (n: AppNotification) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onClick(notification)}
            className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[color:var(--cg-container-a30)] ${notification.read ? '' : 'bg-[color:var(--cg-container-a16)]'
                }`}
        >
            <span
                className="material-symbols-outlined mt-0.5 shrink-0 text-[18px]"
                style={{ color: TYPE_COLOR[notification.type] }}
            >
                {TYPE_ICON[notification.type]}
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[color:var(--cg-text)]">
                    {notification.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--cg-text-muted)]">
                    {notification.body}
                </p>
                <p className="mt-1 text-[11px] text-[color:var(--cg-text-muted)]">
                    {formatRelativeTime(notification.createdAt, isVi)}
                </p>
            </div>
            {!notification.read && (
                <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: 'var(--cg-coral)' }}
                    aria-label={isVi ? 'Chưa đọc' : 'Unread'}
                />
            )}
        </button>
    );
}

export default function NotificationBell() {
    const navigate = useNavigate();
    const language = useSettingsStore((s) => s.language);
    const isVi = language === 'vi';

    const recent = useNotificationsStore((s) => s.recent);
    const unreadCount = useNotificationsStore((s) => s.unreadCount);
    const isLoading = useNotificationsStore((s) => s.isLoading);
    const init = useNotificationsStore((s) => s.init);
    const markAsRead = useNotificationsStore((s) => s.markAsRead);
    const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        init();
    }, [init]);

    // Đóng panel khi click ra ngoài.
    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleItemClick = (notification: AppNotification) => {
        if (!notification.read) {
            void markAsRead([notification._id]);
        }
        setIsOpen(false);
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const text = isVi
        ? {
            title: 'Thông báo',
            markAllRead: 'Đánh dấu tất cả đã đọc',
            empty: 'Chưa có thông báo nào',
            loading: 'Đang tải...',
            viewAll: 'Xem tất cả',
            label: 'Thông báo',
        }
        : {
            title: 'Notifications',
            markAllRead: 'Mark all as read',
            empty: 'No notifications yet',
            loading: 'Loading...',
            viewAll: 'View all',
            label: 'Notifications',
        };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                className="header-icon-btn relative"
                aria-label={text.label}
                onClick={() => setIsOpen((v) => !v)}
            >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span
                        className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                        style={{ background: 'var(--cg-coral)' }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-[calc(100%+10px)] z-[60] w-80 max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-sidebar)] shadow-2xl"
                    role="menu"
                >
                    <div className="flex items-center justify-between border-b border-[color:var(--cg-border)] px-4 py-3">
                        <p className="text-sm font-bold text-[color:var(--cg-text)]">
                            {text.title}
                        </p>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => void markAllAsRead()}
                                className="text-xs font-semibold text-[color:var(--cg-green)] hover:underline"
                            >
                                {text.markAllRead}
                            </button>
                        )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto p-2">
                        {isLoading && recent.length === 0 ? (
                            <p className="px-2 py-6 text-center text-xs text-[color:var(--cg-text-muted)]">
                                {text.loading}
                            </p>
                        ) : recent.length === 0 ? (
                            <p className="px-2 py-6 text-center text-xs italic text-[color:var(--cg-text-muted)]">
                                {text.empty}
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {recent.map((notification) => (
                                    <NotificationItem
                                        key={notification._id}
                                        notification={notification}
                                        isVi={isVi}
                                        onClick={handleItemClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/notifications');
                        }}
                        className="w-full border-t border-[color:var(--cg-border)] py-2.5 text-center text-xs font-semibold text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a16)] hover:text-[color:var(--cg-text)]"
                    >
                        {text.viewAll}
                    </button>
                </div>
            )}
        </div>
    );
}