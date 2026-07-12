import { create } from 'zustand';
import {
    getNotifications,
    getUnreadCount,
    markNotificationsRead,
    markAllNotificationsRead,
    deleteNotification,
    type AppNotification,
} from '../services/notificationsApi';
import {
    connectNotificationsSocket,
    onNewNotification,
    onUnreadCountChanged,
} from '../services/notificationsSocket';

type NotificationsState = {
    /** Vài mục gần nhất, dùng cho dropdown panel dưới chuông. */
    recent: AppNotification[];
    unreadCount: number;
    isLoading: boolean;
    /** true sau lần init() đầu tiên trong phiên này — tránh connect socket 2 lần
     * khi Header unmount/remount lúc chuyển trang (mỗi trang tự import Header). */
    initialized: boolean;
    /** Hàm hủy đăng ký socket listener từ init() — gọi ở reset() để tránh
     * chồng listener nếu user logout rồi login lại trong cùng tab (socket
     * instance là singleton, không tự mất listener cũ khi disconnect). */
    _unsubscribers: (() => void)[];

    init: () => void;
    loadRecent: () => Promise<void>;
    markAsRead: (ids: string[]) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    remove: (id: string) => Promise<void>;
    /** Dùng lúc logout — xóa sạch state + cho phép init() chạy lại ở lần
     * đăng nhập tiếp theo trong cùng tab (không cần reload trang). */
    reset: () => void;
};

const RECENT_LIMIT = 8;

export const useNotificationsStore = create<NotificationsState>(
    (set, get) => ({
        recent: [],
        unreadCount: 0,
        isLoading: false,
        initialized: false,
        _unsubscribers: [],

        init: () => {
            if (get().initialized) return;
            set({ initialized: true });

            connectNotificationsSocket();

            // Khi có notification mới: đẩy lên đầu danh sách gần đây (cắt bớt cho
            // vừa dropdown) — badge count đã có event riêng nên không tự +1 ở đây,
            // tránh lệch nếu 2 event tới không đúng thứ tự.
            const offNew = onNewNotification((notification) => {
                set((state) => ({
                    recent: [notification, ...state.recent].slice(0, RECENT_LIMIT),
                }));
            });

            const offUnread = onUnreadCountChanged(({ unreadCount }) => {
                set({ unreadCount });
            });

            set({ _unsubscribers: [offNew, offUnread] });

            void get().loadRecent();
            void getUnreadCount()
                .then((unreadCount) => set({ unreadCount }))
                .catch(() => undefined);
        },

        loadRecent: async () => {
            set({ isLoading: true });
            try {
                const { items } = await getNotifications({ limit: RECENT_LIMIT });
                set({ recent: items });
            } catch {
                // Best-effort — dropdown chỉ hiện rỗng nếu load lỗi, không chặn UI khác.
            } finally {
                set({ isLoading: false });
            }
        },

        markAsRead: async (ids) => {
            if (ids.length === 0) return;
            // Optimistic update — cập nhật UI ngay, không đợi network.
            set((state) => ({
                recent: state.recent.map((n) =>
                    ids.includes(n._id) ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - ids.length),
            }));
            try {
                await markNotificationsRead(ids);
            } catch {
                // Server là nguồn sự thật cuối cùng — nếu lỗi, lần load tiếp theo
                // (hoặc event unread-count từ socket) sẽ tự sửa lại state.
            }
        },

        markAllAsRead: async () => {
            set((state) => ({
                recent: state.recent.map((n) => ({ ...n, read: true })),
                unreadCount: 0,
            }));
            try {
                await markAllNotificationsRead();
            } catch {
                // như trên
            }
        },

        remove: async (id) => {
            const prev = get().recent;
            set((state) => ({ recent: state.recent.filter((n) => n._id !== id) }));
            try {
                await deleteNotification(id);
            } catch {
                // Rollback nếu xóa thất bại thật sự (khác optimistic read — xóa mà
                // fail thì item biến mất oan, cần khôi phục lại).
                set({ recent: prev });
            }
        },

        reset: () => {
            get()._unsubscribers.forEach((off) => off());
            set({
                recent: [],
                unreadCount: 0,
                isLoading: false,
                initialized: false,
                _unsubscribers: [],
            });
        },
    })
);