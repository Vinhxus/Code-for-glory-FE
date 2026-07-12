// Socket.io client cho namespace `/notifications` (xem backend
// NotificationsGateway). Kết nối 1 lần khi app khởi động (đã đăng nhập) và
// disconnect khi logout — khác với battlesSocket vốn chỉ sống trong 1 trận.
import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from './socket';
import { getToken } from './apiClient';
import type { AppNotification } from './notificationsApi';

export type UnreadCountPayload = { unreadCount: number };

let notificationsSocket: Socket | null = null;

export function getNotificationsSocket(): Socket {
    if (!notificationsSocket) {
        notificationsSocket = io(`${SOCKET_URL}/notifications`, {
            autoConnect: false,
            transports: ['websocket'],
            auth: (cb) => cb({ token: getToken() }),
        });
    }
    return notificationsSocket;
}

export function connectNotificationsSocket(): Socket {
    const s = getNotificationsSocket();
    if (!s.connected) {
        s.auth = { token: getToken() };
        s.connect();
    }
    return s;
}

export function disconnectNotificationsSocket(): void {
    if (notificationsSocket?.connected) {
        notificationsSocket.disconnect();
    }
}

// ===== Listeners (trả về hàm hủy đăng ký để cleanup trong useEffect) =====
export function onNewNotification(cb: (p: AppNotification) => void) {
    const s = getNotificationsSocket();
    s.on('notification:new', cb);
    return () => s.off('notification:new', cb);
}

export function onUnreadCountChanged(cb: (p: UnreadCountPayload) => void) {
    const s = getNotificationsSocket();
    s.on('notification:unread-count', cb);
    return () => s.off('notification:unread-count', cb);
}