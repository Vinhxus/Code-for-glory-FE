import { useState, useEffect } from 'react';
import {
  getUserProfile,
  sendFriendRequest,
  followUser,
  unfollowUser,
} from '../services/forumApi';
import type { ForumUser } from '../services/forumApi';
import { useSettingsStore } from '../store/settings';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

export default function UserProfileModal({
  userId,
  onClose,
}: UserProfileModalProps) {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [profile, setProfile] = useState<ForumUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile(userId)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-2xl bg-[color:var(--cg-bg)] p-6 shadow-xl">
          Loading...
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg)] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[color:var(--cg-text-muted)] hover:bg-[color:var(--cg-container-a16)]"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <img
            src={
              profile.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
            }
            alt={profile.username}
            className="h-24 w-24 rounded-full border-4 border-[#4ade80]/20 bg-[color:var(--cg-container-a16)] object-cover shadow-lg"
          />
          <h2 className="mt-4 text-2xl font-bold">{profile.username}</h2>
          <p className="text-sm text-[color:var(--cg-text-muted)]">
            {profile.role || 'Member'}
          </p>

          <div className="mt-4 flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold">
                {profile.followers?.length || 0}
              </p>
              <p className="text-xs text-[color:var(--cg-text-muted)]">
                {isVi ? 'Người theo dõi' : 'Followers'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {profile.friends?.length || 0}
              </p>
              <p className="text-xs text-[color:var(--cg-text-muted)]">
                {isVi ? 'Bạn bè' : 'Friends'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex w-full gap-3">
            <button
              onClick={() =>
                sendFriendRequest(profile._id).then(() =>
                  alert('Request sent!')
                )
              }
              className="flex-1 rounded-xl bg-[#4ade80] py-2.5 font-semibold text-[#0f0b3c] transition-opacity hover:opacity-90"
            >
              {isVi ? 'Thêm bạn bè' : 'Add Friend'}
            </button>
            <button
              onClick={() =>
                followUser(profile._id).then(() => alert('Followed!'))
              }
              className="flex-1 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] py-2.5 font-semibold transition-colors hover:bg-[color:var(--cg-container-a30)]"
            >
              {isVi ? 'Theo dõi' : 'Follow'}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-4 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-4">
          <h3 className="font-semibold">{isVi ? 'Thông tin thêm' : 'About'}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[color:var(--cg-text-muted)]">
                {isVi ? 'Cấp độ' : 'Level'}
              </p>
              <p className="font-medium">{profile.gamification?.level || 1}</p>
            </div>
            <div>
              <p className="text-[color:var(--cg-text-muted)]">
                {isVi ? 'Lĩnh vực' : 'Field'}
              </p>
              <p className="font-medium uppercase">
                {profile.fieldFocus || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
