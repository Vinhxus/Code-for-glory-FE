// Shared socket.io client. Connects to the backend and authenticates with
// the stored access token. Call connectSocket() after login (or on app start)
// and disconnectSocket() on logout.

import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL, getToken } from './apiClient';

// Host gốc cho socket.io (không kèm /api). battlesSocket dùng lại để nối
// vào namespace `/battles`.
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
      auth: (cb) => cb({ token: getToken() }),
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    // Refresh auth payload in case the token changed since last connect.
    s.auth = { token: getToken() };
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
