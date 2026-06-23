import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000/battles';

let socket: Socket | null = null;

export const getBattleSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
};

export const disconnectBattleSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
