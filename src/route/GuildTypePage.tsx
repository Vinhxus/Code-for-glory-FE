/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import {
  TYPE_COLORS,
  TYPE_DESCRIPTIONS,
  TYPE_ICONS,
  fmtMembers,
  rankLabel,
  type GuildType,
} from './guildData';
import { ApiError } from '../services/apiClient';
import {
  getGuilds,
  joinGuild,
  type GuildCard,
  type GuildSortBy,
} from '../services/guildsApi';

const ALL_TYPES: GuildType[] = [
  'Backend',
  'Frontend',
  'Data Science',
  'DevOps',
  'Security',
  'Mobile',
];

function GuildRow({
  guild,
  isVi,
  onJoin,
  onView,
  joining,
}: {
  guild: GuildCard;
  isVi: boolean;
  onJoin: () => void;
  onView: () => void;
  joining: boolean;
}) {
  return (
    <div
      className="glass-card p-5 flex flex-col gap-4"
      style={{ borderTop: `2px solid ${guild.color}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: `${guild.color}14`,
                border: `1px solid ${guild.color}35`,
                color: guild.color,
              }}
            >
              <span className="material-symbols-outlined text-[12px]">
                {TYPE_ICONS[guild.type]}
              </span>
              {guild.type}
            </span>
            <span className="text-[12px] font-bold">{rankLabel(guild.rank)}</span>
            {guild.isMember && (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[rgba(74,222,128,0.14)] border border-[rgba(74,222,128,0.2)] text-[#4ade80]">
                {isVi ? 'Guild của bạn' : 'Your guild'}
              </span>
            )}
          </div>
          <h3 className="mt-2 text-[20px] font-black font-['Lexend'] truncate">
            {guild.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
            {guild.description}
          </p>
        </div>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl"
          style={{
            background: `${guild.color}14`,
            border: `1px solid ${guild.color}35`,
            color: guild.color,
          }}
        >
          {guild.level}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {guild.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: isVi ? 'Thành viên' : 'Members', value: fmtMembers(guild.members) },
          { label: 'Win rate', value: `${guild.winRate}%` },
          { label: isVi ? 'XP tuần' : 'Weekly XP', value: `${(guild.weeklyXP / 1000).toFixed(1)}k` },
          { label: isVi ? 'Ngôn ngữ' : 'Language', value: guild.language || 'Mixed' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl px-3 py-3 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
          >
            <div className="text-lg font-black">{item.value}</div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--cg-text-muted)]">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {guild.quests.slice(0, 2).map((quest) => {
          const pct = Math.round((quest.progress / quest.total) * 100);
          return (
            <div key={quest.questId}>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-[color:var(--cg-text-muted)]">{quest.label}</span>
                <span style={{ color: guild.color }}>{quest.reward}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-[rgba(255,255,255,0.06)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: guild.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onView}
          className="px-4 py-2.5 rounded-xl font-bold"
          style={{ background: guild.color, color: '#0f0b3c' }}
        >
          {isVi ? 'Xem guild' : 'View Guild'}
        </button>
        <button
          onClick={onJoin}
          disabled={!guild.canJoin || joining}
          className="px-4 py-2.5 rounded-xl font-bold border"
          style={{
            borderColor: `${guild.color}40`,
            background: `${guild.color}10`,
            color: guild.canJoin ? guild.color : 'var(--cg-text-muted)',
            cursor: guild.canJoin ? 'pointer' : 'not-allowed',
          }}
        >
          {joining
            ? isVi
              ? 'Đang tham gia...'
              : 'Joining...'
            : guild.isMember
              ? isVi
                ? 'Đã tham gia'
                : 'Joined'
              : guild.canJoin
                ? isVi
                  ? 'Tham gia'
                  : 'Join Guild'
                : isVi
                  ? 'Tạm đóng'
                  : 'Closed'}
        </button>
      </div>
    </div>
  );
}

export default function GuildTypePage({ type }: { type: GuildType }) {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const color = TYPE_COLORS[type];
  const icon = TYPE_ICONS[type];
  const description = TYPE_DESCRIPTIONS[type];

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<GuildSortBy>('rank');
  const [guilds, setGuilds] = useState<GuildCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getGuilds({ type, search, sortBy })
      .then((data) => {
        if (!active) return;
        setGuilds(data.items);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : isVi
              ? 'Không tải được guild.'
              : 'Unable to load guilds.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isVi, search, sortBy, type]);

  const stats = useMemo(() => {
    const totalMembers = guilds.reduce((sum, guild) => sum + guild.members, 0);
    const avgWinRate = guilds.length
      ? Math.round(guilds.reduce((sum, guild) => sum + guild.winRate, 0) / guilds.length)
      : 0;
    const openGuilds = guilds.filter((guild) => guild.openToJoin).length;
    return { totalMembers, avgWinRate, openGuilds };
  }, [guilds]);

  const handleJoin = async (guild: GuildCard) => {
    if (!guild.canJoin) return;
    try {
      setJoiningSlug(guild.slug);
      const detail = await joinGuild(guild.slug);
      navigate(`/guilds/hall/${detail.slug}`);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể tham gia guild.'
            : 'Unable to join guild.'
      );
    } finally {
      setJoiningSlug(null);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] select-none overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-12 space-y-8 animate-fade-in-up">
          <div className="flex items-center gap-2 text-[12px] text-[color:var(--cg-text-muted)]">
            <Link to="/guilds" className="hover:text-[color:var(--cg-text)]">
              {isVi ? 'Bang hội' : 'Guilds'}
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span style={{ color }}>{type}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {ALL_TYPES.map((entry) => (
              <Link
                key={entry}
                to={`/guilds/${entry.toLowerCase().replace(' ', '-')}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={{
                  background:
                    entry === type
                      ? `${TYPE_COLORS[entry]}20`
                      : 'rgba(255,255,255,0.04)',
                  border:
                    entry === type
                      ? `1px solid ${TYPE_COLORS[entry]}40`
                      : '1px solid rgba(255,255,255,0.08)',
                  color:
                    entry === type
                      ? TYPE_COLORS[entry]
                      : 'var(--cg-text-muted)',
                }}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {TYPE_ICONS[entry]}
                </span>
                {entry}
              </Link>
            ))}
          </div>

          <div
            className="rounded-3xl p-6 md:p-8"
            style={{
              background: `linear-gradient(135deg, ${color}18 0%, rgba(255,255,255,0.02) 70%)`,
              border: `1px solid ${color}35`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${color}18`, color }}
              >
                <span className="material-symbols-outlined text-[30px]">{icon}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-black font-['Lexend']">
                  {type} <span style={{ color }}>{isVi ? 'Guild' : 'Guilds'}</span>
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--cg-text-muted)]">
                  {isVi ? description.vi : description.en}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: isVi ? 'Bang hội' : 'Guilds', value: guilds.length },
                  {
                    label: isVi ? 'Thành viên' : 'Members',
                    value: fmtMembers(stats.totalMembers),
                  },
                  {
                    label: isVi ? 'Mở tuyển' : 'Open',
                    value: stats.openGuilds,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl px-4 py-3 text-center"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="text-xl font-black" style={{ color }}>
                      {item.value}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--cg-text-muted)]">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[color:var(--cg-text-muted)]">
                search
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={isVi ? `Tìm guild ${type}...` : `Search ${type} guilds...`}
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] outline-none"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['rank', 'members', 'winRate', 'weeklyXP'] as GuildSortBy[]).map((entry) => (
                <button
                  key={entry}
                  onClick={() => setSortBy(entry)}
                  className="px-3 py-2 rounded-xl text-[12px] font-bold"
                  style={{
                    background: sortBy === entry ? `${color}18` : 'rgba(255,255,255,0.04)',
                    border:
                      sortBy === entry
                        ? `1px solid ${color}40`
                        : '1px solid rgba(255,255,255,0.07)',
                    color: sortBy === entry ? color : 'var(--cg-text-muted)',
                  }}
                >
                  {entry === 'rank'
                    ? isVi
                      ? 'Hạng'
                      : 'Rank'
                    : entry === 'members'
                      ? isVi
                        ? 'Thành viên'
                        : 'Members'
                      : entry === 'winRate'
                        ? 'Win rate'
                        : isVi
                          ? 'XP tuần'
                          : 'Weekly XP'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="glass-card px-4 py-3 text-sm text-[#fda4af] border border-[rgba(244,114,182,0.24)]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {loading ? (
              <div className="glass-card py-16 text-center text-[color:var(--cg-text-muted)] xl:col-span-2">
                {isVi ? 'Đang tải guild...' : 'Loading guilds...'}
              </div>
            ) : guilds.length === 0 ? (
              <div className="glass-card py-16 text-center text-[color:var(--cg-text-muted)] xl:col-span-2">
                {isVi ? 'Không có guild phù hợp.' : 'No guilds matched your filters.'}
              </div>
            ) : (
              guilds.map((guild) => (
                <GuildRow
                  key={guild.id}
                  guild={guild}
                  isVi={isVi}
                  onJoin={() => void handleJoin(guild)}
                  onView={() => navigate(`/guilds/hall/${guild.slug}`)}
                  joining={joiningSlug === guild.slug}
                />
              ))
            )}
          </div>

          {!loading && guilds.length > 0 && (
            <p className="text-center text-[11px] text-[color:var(--cg-text-muted)]">
              {isVi
                ? `${guilds.length} guild ${type} · win rate trung bình ${stats.avgWinRate}%`
                : `${guilds.length} ${type} guilds · average win rate ${stats.avgWinRate}%`}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
