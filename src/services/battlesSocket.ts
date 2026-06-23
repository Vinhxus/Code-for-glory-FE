// Socket.io client cho namespace `/battles` (xem backend BattlesGateway).
// Dùng sau khi vào một trận: connectBattlesSocket() rồi joinBattle(battleId),
// đăng ký các listener, và disconnectBattlesSocket() khi rời trận.
import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from './socket';
import { getToken } from './apiClient';

// ===== Payload các sự kiện server -> client =====
export type JoinedBattlePayload = { battleId: string };
export type OpponentCorrectPayload = {
  userId: string;
  questionId: string;
  questionOrder: number;
};
export type BattleEndedPayload = {
  winnerId?: string;
  isDraw?: boolean;
  finalScores: { userId: string; score: number }[];
};
export type TimerTickPayload = { timeRemaining: number };

let battlesSocket: Socket | null = null;

export function getBattlesSocket(): Socket {
  if (!battlesSocket) {
    battlesSocket = io(`${SOCKET_URL}/battles`, {
      autoConnect: false,
      transports: ['websocket'],
      auth: (cb) => cb({ token: getToken() }),
    });
  }
  return battlesSocket;
}

export function connectBattlesSocket(): Socket {
  const s = getBattlesSocket();
  if (!s.connected) {
    s.auth = { token: getToken() };
    s.connect();
  }
  return s;
}

export function disconnectBattlesSocket(): void {
  if (battlesSocket?.connected) {
    battlesSocket.disconnect();
  }
}

// ===== Emit =====
export function joinBattle(battleId: string): void {
  connectBattlesSocket().emit('join-battle', { battleId });
}

// ===== Listeners (trả về hàm hủy đăng ký để cleanup trong useEffect) =====
export function onJoinedBattle(cb: (p: JoinedBattlePayload) => void) {
  const s = getBattlesSocket();
  s.on('joined-battle', cb);
  return () => s.off('joined-battle', cb);
}

export function onOpponentCorrect(cb: (p: OpponentCorrectPayload) => void) {
  const s = getBattlesSocket();
  s.on('opponent-correct', cb);
  return () => s.off('opponent-correct', cb);
}

export function onBattleEnded(cb: (p: BattleEndedPayload) => void) {
  const s = getBattlesSocket();
  s.on('battle-ended', cb);
  return () => s.off('battle-ended', cb);
}

export function onTimerTick(cb: (p: TimerTickPayload) => void) {
  const s = getBattlesSocket();
  s.on('timer-tick', cb);
  return () => s.off('timer-tick', cb);
}
