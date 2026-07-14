import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/settings';
import ActivityHeatmap from '../../route/ActivityHeatmap';
import {
  getProfileSummary,
  type ProfileSummary,
  type CareerField,
} from '../../services/userApi';
import './Profile.css';

const DIFFICULTY_COLORS = {
  easy: '#4ade80',
  medium: '#ffa500',
  hard: '#ff7e5f',
} as const;

const TIER_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  bronze: {
    bg: 'rgba(205, 127, 50, 0.14)',
    border: 'rgba(205, 127, 50, 0.4)',
    text: '#cd7f32',
  },
  silver: {
    bg: 'rgba(192, 192, 192, 0.14)',
    border: 'rgba(192, 192, 192, 0.4)',
    text: '#c0c0c0',
  },
  gold: {
    bg: 'rgba(255, 165, 0, 0.14)',
    border: 'rgba(255, 165, 0, 0.4)',
    text: '#ffa500',
  },
  platinum: {
    bg: 'rgba(96, 220, 200, 0.14)',
    border: 'rgba(96, 220, 200, 0.4)',
    text: '#60dcc8',
  },
  diamond: {
    bg: 'rgba(147, 197, 253, 0.14)',
    border: 'rgba(147, 197, 253, 0.4)',
    text: '#93c5fd',
  },
  archmage: {
    bg: 'rgba(255, 126, 95, 0.14)',
    border: 'rgba(255, 126, 95, 0.4)',
    text: '#ff7e5f',
  },
};

function tierStyle(tier: string) {
  return (
    TIER_COLORS[tier.toLowerCase()] ?? {
      bg: 'rgba(255, 255, 255, 0.06)',
      border: 'rgba(255, 255, 255, 0.2)',
      text: 'var(--cg-text-muted)',
    }
  );
}

const FIELD_LABEL_VI: Record<CareerField, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Fullstack',
};

function formatJoinDate(iso: string, isVi: boolean): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/** Vòng tròn Easy/Medium/Hard vẽ bằng stroke-dasharray thuần, không phụ thuộc lib chart. */
function DifficultyRing({
  easy,
  medium,
  hard,
}: {
  easy: number;
  medium: number;
  hard: number;
}) {
  const total = easy + medium + hard;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const stroke = 12;

  const segments =
    total === 0
      ? []
      : (
          [
            ['easy', easy],
            ['medium', medium],
            ['hard', hard],
          ] as const
        ).reduce<{ key: string; offset: number; length: number }[]>(
          (acc, [key, value]) => {
            const prevOffset = acc.length
              ? acc[acc.length - 1].offset + acc[acc.length - 1].length
              : 0;
            const length = (value / total) * circumference;
            acc.push({ key, offset: prevOffset, length });
            return acc;
          },
          []
        );

  return (
    <div className="profile-ring-wrap">
      <svg viewBox="0 0 132 132">
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        {segments.map((seg) => (
          <circle
            key={seg.key}
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            stroke={
              DIFFICULTY_COLORS[seg.key as keyof typeof DIFFICULTY_COLORS]
            }
            strokeWidth={stroke}
            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="profile-ring-center">
        <span className="profile-ring-total">{total}</span>
        <span className="profile-ring-label">solved</span>
      </div>
    </div>
  );
}

function SocialIcon({
  kind,
}: {
  kind: 'github' | 'linkedin' | 'twitter' | 'website';
}) {
  // Icon tối giản dạng SVG inline — tránh thêm dependency icon-lib mới chỉ vì 4 icon.
  const paths: Record<typeof kind, string> = {
    github:
      'M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5v-1.94c-2.78.62-3.37-1.19-3.37-1.19-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 2.5-.35c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.95.68 1.92v2.85c0 .28.18.61.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z',
    linkedin:
      'M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3.2 8.75h3.5V21H3.2V8.75Zm6.34 0h3.36v1.68h.05c.47-.88 1.6-1.8 3.3-1.8 3.53 0 4.18 2.32 4.18 5.35V21h-3.5v-6.15c0-1.47-.03-3.36-2.05-3.36-2.05 0-2.37 1.6-2.37 3.25V21H9.54V8.75Z',
    twitter:
      'M22 5.9c-.68.3-1.4.5-2.16.6a3.8 3.8 0 0 0 1.66-2.1c-.73.43-1.53.75-2.39.92a3.75 3.75 0 0 0-6.4 3.42A10.66 10.66 0 0 1 5.03 4.9a3.75 3.75 0 0 0 1.16 5.01c-.6-.02-1.18-.19-1.68-.46v.05a3.75 3.75 0 0 0 3.01 3.68 3.8 3.8 0 0 1-1.69.06 3.76 3.76 0 0 0 3.5 2.6A7.53 7.53 0 0 1 3 17.3a10.63 10.63 0 0 0 5.76 1.69c6.9 0 10.68-5.72 10.68-10.68l-.01-.49A7.6 7.6 0 0 0 22 5.9Z',
    website:
      'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 8h-3.1a15.6 15.6 0 0 0-1.28-5.44A8.03 8.03 0 0 1 18.9 10ZM12 4.05c.9 1.24 1.72 3.16 2.02 5.95H9.98c.3-2.8 1.12-4.71 2.02-5.95ZM9.48 4.56A15.6 15.6 0 0 0 8.2 10H5.1a8.03 8.03 0 0 1 4.38-5.44ZM5.1 12h3.1c.13 2.1.6 3.98 1.28 5.44A8.03 8.03 0 0 1 5.1 12Zm4.88 0h4.04c-.3 2.8-1.12 4.71-2.02 5.95-.9-1.24-1.72-3.15-2.02-5.95Zm5.5 5.44c.68-1.46 1.15-3.34 1.28-5.44h3.1a8.03 8.03 0 0 1-4.38 5.44Z',
  };
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProfileSummary()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : isVi
                ? 'Không tải được hồ sơ.'
                : 'Failed to load profile.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-state">
          {isVi ? 'Đang tải hồ sơ…' : 'Loading profile…'}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-state is-error">
          <p>
            {error ?? (isVi ? 'Không tìm thấy hồ sơ.' : 'Profile not found.')}
          </p>
        </div>
      </div>
    );
  }

  const { overall, chapters } = profile.progressSummary;

  type SocialKind = 'github' | 'linkedin' | 'twitter' | 'website';
  const socialEntries: { kind: SocialKind; href: string }[] = [];
  if (profile.socialLinks.github) {
    socialEntries.push({
      kind: 'github',
      href: `https://github.com/${profile.socialLinks.github}`,
    });
  }
  if (profile.socialLinks.linkedin) {
    socialEntries.push({
      kind: 'linkedin',
      href: `https://linkedin.com/in/${profile.socialLinks.linkedin}`,
    });
  }
  if (profile.socialLinks.twitter) {
    socialEntries.push({
      kind: 'twitter',
      href: `https://x.com/${profile.socialLinks.twitter}`,
    });
  }
  if (profile.socialLinks.website) {
    socialEntries.push({ kind: 'website', href: profile.socialLinks.website });
  }

  return (
    <div className="profile-page">
      {/* Back */}
      <div className="mb-6 flex justify-start">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-5 py-2.5 text-sm font-bold transition hover:bg-[color:var(--cg-container-a22)] hover:border-[#ff7e5f]/40 group animate-fade-in-up"
        >
          <span className="material-symbols-outlined text-[18px] text-[#ff7e5f] transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          {isVi ? 'Quay lại' : 'Back'}
        </Link>
      </div>
      <div className="profile-top-grid">
        {/* ---------- Left: identity ---------- */}
        <div className="profile-identity glass-card">
          <div className="profile-identity-head">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {profile.username.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="profile-identity-names">
              <div className="profile-username">
                {profile.username}
                <span className="profile-level-chip">
                  Lv {profile.gamification.level}
                </span>
              </div>
              <div className="profile-joined">
                {isVi ? 'Tham gia ' : 'Joined '}
                {formatJoinDate(profile.createdAt, isVi)}
              </div>
            </div>
          </div>

          <p className={`profile-bio${profile.bio ? '' : ' is-empty'}`}>
            {profile.bio || (isVi ? 'Chưa có mô tả bản thân.' : 'No bio yet.')}
          </p>

          {profile.location && (
            <div className="profile-meta-row">
              <span aria-hidden="true">📍</span>
              {profile.location}
            </div>
          )}

          {socialEntries.length > 0 && (
            <div className="profile-social-row">
              {socialEntries.map(({ kind, href }) => (
                <a
                  key={kind}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="profile-social-link"
                >
                  <SocialIcon kind={kind} />
                  {kind.charAt(0).toUpperCase() + kind.slice(1)}
                </a>
              ))}
            </div>
          )}

          <div className="profile-follow-row">
            <span>
              <strong>{profile.followerCount}</strong>{' '}
              {isVi ? 'người theo dõi' : 'Followers'}
            </span>
            <span>
              <strong>{profile.followingCount}</strong>{' '}
              {isVi ? 'đang theo dõi' : 'Following'}
            </span>
          </div>

          <Link to="/profile/edit" className="neon-btn profile-edit-btn">
            {isVi ? 'Chỉnh sửa hồ sơ' : 'Edit Profile'}
          </Link>
        </div>

        {/* ---------- Right: solved ring + quick stats ---------- */}
        <div className="profile-right-col">
          <div className="profile-solved-card glass-card">
            <DifficultyRing
              easy={overall.easy}
              medium={overall.medium}
              hard={overall.hard}
            />
            <div className="profile-diff-breakdown">
              {(
                [
                  ['easy', overall.easy, isVi ? 'Dễ' : 'Easy'],
                  ['medium', overall.medium, isVi ? 'Trung bình' : 'Medium'],
                  ['hard', overall.hard, isVi ? 'Khó' : 'Hard'],
                ] as const
              ).map(([key, count, label]) => (
                <div className="profile-diff-row" key={key}>
                  <span className="profile-diff-name">
                    <span
                      className="profile-diff-dot"
                      style={{ background: DIFFICULTY_COLORS[key] }}
                    />
                    {label}
                  </span>
                  <span className="profile-diff-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-stats-strip glass-card">
            <div className="profile-stat">
              <span className="profile-stat-label">XP</span>
              <span className="profile-stat-value">
                {profile.gamification.xp}
              </span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-label">
                {isVi ? 'Xu' : 'Coins'}
              </span>
              <span className="profile-stat-value">
                {profile.gamification.coins}
              </span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-label">
                {isVi ? 'Chuỗi' : 'Streak'}
              </span>
              <span className="profile-stat-value">
                {profile.gamification.currentStreak}🔥
              </span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-label">
                {isVi ? 'Chuỗi dài nhất' : 'Longest'}
              </span>
              <span className="profile-stat-value">
                {profile.gamification.longestStreak}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Battle rankings ---------- */}
      <div className="profile-section glass-card">
        <div className="profile-section-title">
          ⚔️ {isVi ? 'Xếp hạng Đấu trường' : 'Battle Rankings'}
        </div>
        {profile.rankings.length === 0 ? (
          <p className="profile-empty-note">
            {isVi
              ? 'Chưa tham gia trận đấu nào. Vào Đấu trường để bắt đầu xếp hạng!'
              : 'No battles yet. Head to the Arena to start ranking up!'}
          </p>
        ) : (
          <div className="profile-ranking-list">
            {profile.rankings.map((r) => {
              const style = tierStyle(r.tier);
              return (
                <div className="profile-ranking-row" key={r.field}>
                  <span className="profile-ranking-field">
                    {isVi ? FIELD_LABEL_VI[r.field] : r.field}
                  </span>
                  <div className="profile-ranking-mid">
                    <div className="profile-ranking-bar-track">
                      <div
                        className="profile-ranking-bar-fill"
                        style={{ width: `${Math.round(r.winRate * 100)}%` }}
                      />
                    </div>
                    <span className="profile-ranking-record">
                      {r.wins}W-{r.losses}L-{r.draws}D
                    </span>
                  </div>
                  <div className="profile-ranking-right">
                    <span className="profile-ranking-rating">
                      {r.ratingPoints}
                    </span>
                    <span
                      className="profile-tier-chip"
                      style={{
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.text,
                      }}
                    >
                      {r.tier}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------- Activity heatmap (tái dùng nguyên component cũ) ---------- */}
      <ActivityHeatmap />

      {/* ---------- Badges ---------- */}
      {profile.gamification.badges.length > 0 && (
        <div className="profile-section glass-card">
          <div className="profile-section-title">
            🏅 {isVi ? 'Huy hiệu' : 'Badges'}
          </div>
          <div className="profile-badge-grid">
            {profile.gamification.badges.map((badge) => (
              <span className="profile-badge-pill" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Chapter breakdown ---------- */}
      <div className="profile-section glass-card">
        <div className="profile-section-title">
          📚 {isVi ? 'Tiến độ theo chương' : 'Progress by Chapter'}
        </div>
        {chapters.length === 0 ? (
          <p className="profile-empty-note">
            {isVi
              ? 'Chưa giải bài nào. Vào Luyện tập để bắt đầu!'
              : 'No exercises solved yet. Head to Practice to get started!'}
          </p>
        ) : (
          <div className="profile-chapter-table">
            <div className="profile-chapter-head">
              <span>{isVi ? 'Chương' : 'Chapter'}</span>
              <span style={{ color: DIFFICULTY_COLORS.easy }}>
                {isVi ? 'Dễ' : 'Easy'}
              </span>
              <span style={{ color: DIFFICULTY_COLORS.medium }}>
                {isVi ? 'TB' : 'Med'}
              </span>
              <span style={{ color: DIFFICULTY_COLORS.hard }}>
                {isVi ? 'Khó' : 'Hard'}
              </span>
            </div>
            {chapters.map((c) => (
              <div className="profile-chapter-row" key={c.chapter}>
                <span className="profile-chapter-name">{c.chapter}</span>
                <span
                  className="profile-chapter-count"
                  style={{ color: DIFFICULTY_COLORS.easy }}
                >
                  {c.breakdown.easy}
                </span>
                <span
                  className="profile-chapter-count"
                  style={{ color: DIFFICULTY_COLORS.medium }}
                >
                  {c.breakdown.medium}
                </span>
                <span
                  className="profile-chapter-count"
                  style={{ color: DIFFICULTY_COLORS.hard }}
                >
                  {c.breakdown.hard}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
