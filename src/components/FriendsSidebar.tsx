import { useState, useEffect } from 'react';
import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
} from '../services/forumApi';
import type { ForumUser, FriendRequest } from '../services/forumApi';
import { useSettingsStore } from '../store/settings';

export default function FriendsSidebar() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<ForumUser[]>([]);

  const loadData = () => {
    getFriendRequests().then(setRequests);
    getFriends().then(setFriends);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (reqId: string) => {
    await acceptFriendRequest(reqId);
    loadData();
  };

  const handleReject = async (reqId: string) => {
    await rejectFriendRequest(reqId);
    loadData();
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {requests.length > 0 && (
        <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
            {isVi ? 'Lời mời kết bạn' : 'Friend Requests'}
          </p>
          <div className="mt-3 space-y-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[color:var(--cg-bg)] p-3 shadow-sm border border-[color:var(--cg-border)]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={
                      req.requesterId.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requesterId.username}`
                    }
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="truncate text-sm font-semibold">
                    {req.requesterId.username}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleAccept(req.requesterId._id)}
                    className="rounded-lg bg-[#4ade80]/20 p-1.5 text-[#4ade80] hover:bg-[#4ade80]/30"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      check
                    </span>
                  </button>
                  <button
                    onClick={() => handleReject(req.requesterId._id)}
                    className="rounded-lg bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      close
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
          {isVi ? 'Danh sách bạn bè' : 'Friends List'}
        </p>
        <div className="mt-3 space-y-2">
          {friends.length === 0 ? (
            <p className="text-xs text-[color:var(--cg-text-muted)] italic">
              {isVi ? 'Chưa có bạn bè' : 'No friends yet'}
            </p>
          ) : (
            friends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center gap-3 p-2 hover:bg-[color:var(--cg-bg)] rounded-xl cursor-pointer"
              >
                <img
                  src={
                    friend.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`
                  }
                  className="w-10 h-10 rounded-full bg-[color:var(--cg-border)]"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {friend.username}
                  </p>
                  <p className="text-xs text-[color:var(--cg-text-muted)]">
                    {friend.role || 'Member'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
