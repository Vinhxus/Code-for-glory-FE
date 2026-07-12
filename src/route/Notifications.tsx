import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
import Header from '../components/layout/Header';
import { useSettingsStore } from '../store/settings';
import { useNotificationsStore } from '../store/notifications';
import {
    getNotifications,
    type AppNotification,
    type NotificationType,
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

const FILTERS: { id: NotificationType | 'all'; label: string; labelVi: string }[] = [
    { id: 'all', label: 'All', labelVi: 'Tất cả' },
    { id: 'battle_result', label: 'Battles', labelVi: 'Trận đấu' },
    { id: 'lesson_unlock', label: 'Lessons', labelVi: 'Bài học' },
    { id: 'streak_reminder', label: 'Streak', labelVi: 'Streak' },
    { id: 'penalty_applied', label: 'Penalties', labelVi: 'Khóa bài' },
    { id: 'achievement', label: 'Achievements', labelVi: 'Huy hiệu' },
    { id: 'recall_due', label: 'Recall', labelVi: 'Ôn tập' },
    { id: 'suspicious_login', label: 'Security', labelVi: 'Bảo mật' },
];

function formatDateTime(iso: string, isVi: boolean): string {
    return new Date(iso).toLocaleString(isVi ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Notifications() {
    const navigate = useNavigate();
    const language = useSettingsStore((s) => s.language);
    const isVi = language === 'vi';

    const markAsRead = useNotificationsStore((s) => s.markAsRead);
    const remove = useNotificationsStore((s) => s.remove);

    const [items, setItems] = useState<AppNotification[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>(
        'all'
    );
    const [isLoading, setIsLoading] = useState(true);

    const load = async (
        targetPage: number,
        filter: NotificationType | 'all'
    ) => {
        setIsLoading(true);
        try {
            const res = await getNotifications({
                page: targetPage,
                limit: 20,
                type: filter === 'all' ? undefined : filter,
            });
            setItems(res.items);
            setTotalPages(res.totalPages);
            setPage(res.page);
        } catch {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Cờ hủy — nếu activeFilter đổi trước khi request cũ về, bỏ qua kết
        // quả cũ để tránh hiện sai danh sách (race condition khi bấm filter
        // liên tục).
        let cancelled = false;

        async function run() {
            setIsLoading(true);
            try {
                const res = await getNotifications({
                    page: 1,
                    limit: 20,
                    type: activeFilter === 'all' ? undefined : activeFilter,
                });
                if (cancelled) return;
                setItems(res.items);
                setTotalPages(res.totalPages);
                setPage(res.page);
            } catch {
                if (!cancelled) setItems([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        void run();
        return () => {
            cancelled = true;
        };
    }, [activeFilter]);

    const handleItemClick = (notification: AppNotification) => {
        if (!notification.read) {
            void markAsRead([notification._id]);
            setItems((prev) =>
                prev.map((n) =>
                    n._id === notification._id ? { ...n, read: true } : n
                )
            );
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        void remove(id);
        setItems((prev) => prev.filter((n) => n._id !== id));
    };

    const text = isVi
        ? {
            title: 'Thông báo',
            subtitle: 'Toàn bộ lịch sử thông báo của bạn',
            empty: 'Chưa có thông báo nào',
            loading: 'Đang tải...',
            prev: 'Trước',
            next: 'Sau',
            pageOf: (p: number, total: number) => `Trang ${p} / ${total}`,
        }
        : {
            title: 'Notifications',
            subtitle: 'Your full notification history',
            empty: 'No notifications yet',
            loading: 'Loading...',
            prev: 'Previous',
            next: 'Next',
            pageOf: (p: number, total: number) => `Page ${p} of ${total}`,
        };

    return (
        <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
            <SideNav />
            <div className="relative z-10 md:pl-[96px]">
                <Header />
                <main className="mx-auto max-w-3xl px-6 py-12 pt-22 space-y-6">
                    <section className="space-y-2">
                        <h1 className="font-['Lexend'] text-3xl font-black tracking-tight">
                            {text.title}
                        </h1>
                        <p className="text-sm text-[color:var(--cg-text-muted)]">
                            {text.subtitle}
                        </p>
                    </section>

                    {/* Filter tabs */}
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => setActiveFilter(f.id)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${activeFilter === f.id
                                        ? 'border-[color:var(--cg-amber)] bg-[color:var(--cg-amber-a14)] text-[color:var(--cg-amber)]'
                                        : 'border-[color:var(--cg-border)] text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a16)]'
                                    }`}
                            >
                                {isVi ? f.labelVi : f.label}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)]">
                        {isLoading ? (
                            <p className="px-4 py-10 text-center text-sm text-[color:var(--cg-text-muted)]">
                                {text.loading}
                            </p>
                        ) : items.length === 0 ? (
                            <p className="px-4 py-10 text-center text-sm italic text-[color:var(--cg-text-muted)]">
                                {text.empty}
                            </p>
                        ) : (
                            <div className="divide-y divide-[color:var(--cg-border)]">
                                {items.map((notification) => (
                                    <div
                                        key={notification._id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleItemClick(notification)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleItemClick(notification);
                                            }
                                        }}
                                        className={`group flex w-full cursor-pointer items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-[color:var(--cg-container-a30)] ${notification.read ? '' : 'bg-[color:var(--cg-container-a22)]'
                                            }`}
                                    >
                                        <span
                                            className="material-symbols-outlined mt-0.5 shrink-0"
                                            style={{ color: TYPE_COLOR[notification.type] }}
                                        >
                                            {TYPE_ICON[notification.type]}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-[color:var(--cg-text)]">
                                                {notification.title}
                                            </p>
                                            <p className="mt-0.5 text-sm text-[color:var(--cg-text-muted)]">
                                                {notification.body}
                                            </p>
                                            <p className="mt-1.5 text-xs text-[color:var(--cg-text-muted)]">
                                                {formatDateTime(notification.createdAt, isVi)}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {!notification.read && (
                                                <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ background: 'var(--cg-coral)' }}
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(e, notification._id)}
                                                className="material-symbols-outlined rounded-lg border-none bg-transparent p-1 text-[16px] text-transparent transition-colors hover:bg-red-500/20 hover:text-red-400 group-hover:text-[color:var(--cg-text-muted)]"
                                                aria-label={isVi ? 'Xóa thông báo' : 'Delete notification'}
                                            >
                                                delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => void load(page - 1, activeFilter)}
                                className="rounded-lg border border-[color:var(--cg-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--cg-text)] disabled:opacity-40"
                            >
                                {text.prev}
                            </button>
                            <span className="text-xs text-[color:var(--cg-text-muted)]">
                                {text.pageOf(page, totalPages)}
                            </span>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => void load(page + 1, activeFilter)}
                                className="rounded-lg border border-[color:var(--cg-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--cg-text)] disabled:opacity-40"
                            >
                                {text.next}
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}