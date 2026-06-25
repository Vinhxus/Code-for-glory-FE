import { useState, useEffect } from 'react';
import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  searchUsers,
} from '../services/forumApi';
import type { ForumUser, FriendRequest } from '../services/forumApi';
import { useSettingsStore } from '../store/settings';

interface FriendsSidebarProps {
  onSelectFriend?: (userId: string, username: string) => void;
  onViewProfile?: (userId: string) => void;
}

export default function FriendsSidebar({
  onSelectFriend,
  onViewProfile,
}: FriendsSidebarProps) {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<ForumUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ForumUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={
            isVi ? 'Tìm ID / Username...' : 'Search ID / Username...'
          }
          className="w-full rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2 text-sm text-[color:var(--cg-text)] placeholder:text-[color:var(--cg-text-muted)] focus:outline-none focus:border-[#4ade80]/50"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--cg-text-muted)]">
              {isVi ? 'Kết quả tìm kiếm' : 'Search Results'}
            </p>
            <button
              onClick={() => setSearchResults([])}
              className="text-xs text-[color:var(--cg-text-muted)] hover:underline"
            >
              {isVi ? 'Đóng' : 'Close'}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => onViewProfile?.(user._id)}
                className="flex items-center gap-3 p-2 hover:bg-[color:var(--cg-container-a30)] rounded-xl cursor-pointer transition-colors"
              >
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  className="w-8 h-8 rounded-full bg-[color:var(--cg-border)]"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
                onClick={() => onSelectFriend?.(friend._id, friend.username)}
                className="flex items-center gap-3 p-2 hover:bg-[color:var(--cg-container-a30)] rounded-xl cursor-pointer transition-colors"
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
