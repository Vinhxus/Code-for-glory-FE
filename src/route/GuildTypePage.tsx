// ─── GuildTypePage.tsx ────────────────────────────────────────────────────────
// Gom shared components + template page vào 1 file.
// 6 type pages chỉ cần import file này và pass prop `type`.

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import {
  GUILDS,
  TYPE_ICONS,
  TYPE_COLORS,
  TYPE_DESCRIPTIONS,
  fmtMembers,
  rankLabel,
  type Guild,
  type Quest,
  type GuildType,
} from './guildData';

// ─── ALL_TYPES ────────────────────────────────────────────────────────────────

const ALL_TYPES: GuildType[] = [
  'Backend',
  'Frontend',
  'Data Science',
  'DevOps',
  'Security',
  'Mobile',
];

// ─── XPBar ────────────────────────────────────────────────────────────────────

function XPBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold text-[color:var(--cg-text-muted)]">
        <span>{value.toLocaleString()} XP</span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-[4px] w-full rounded-full"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── QuestItem ────────────────────────────────────────────────────────────────

function QuestItem({ quest, color }: { quest: Quest; color: string }) {
  const pct = Math.round((quest.progress / quest.total) * 100);
  return (
    <div className="space-y-[6px]">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-[color:var(--cg-text-muted)]">
          {quest.label}
        </span>
        <span className="text-[10px] font-bold" style={{ color }}>
          +{quest.reward}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex-1 h-[3px] rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="text-[10px] tabular-nums text-[color:var(--cg-text-muted)] flex-shrink-0">
          {quest.progress}/{quest.total}
        </span>
      </div>
    </div>
  );
}

// ─── MemberAvatars ────────────────────────────────────────────────────────────

function MemberAvatars({
  initials,
  color,
  total,
}: {
  initials: string[];
  color: string;
  total: number;
}) {
  return (
    <div className="flex items-center gap-[2px]">
      {initials.slice(0, 4).map((letter, i) => (
        <div
          key={i}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 -ml-1 first:ml-0"
          style={{
            background: `${color}33`,
            color,
            borderColor: 'var(--cg-bg)',
            zIndex: initials.length - i,
          }}
        >
          {letter}
        </div>
      ))}
      {total > 4 && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 -ml-1"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--cg-text-muted)',
            borderColor: 'var(--cg-bg)',
          }}
        >
          +{total - 4}
        </div>
      )}
    </div>
  );
}

// ─── GuildCard ────────────────────────────────────────────────────────────────

function GuildCard({
  guild,
  expanded,
  onToggle,
  isVi,
}: {
  guild: Guild;
  expanded: boolean;
  onToggle: () => void;
  isVi: boolean;
}) {
  const { color } = guild;
  const fillPct = Math.round((guild.members / guild.maxMembers) * 100);

  return (
    <div
      className="glass-card relative overflow-hidden flex flex-col cursor-pointer group transition-all duration-300"
      style={{
        border: expanded ? `1px solid ${color}55` : undefined,
        boxShadow: expanded ? `0 0 24px ${color}18` : undefined,
      }}
      onClick={onToggle}
    >
      <div
        className="absolute top-0 left-0 w-full h-24 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        style={{ background: `linear-gradient(160deg, ${color}, transparent)` }}
      />
      <div
        className="absolute top-0 left-0 h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      <div className="relative z-10 p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold">
                {rankLabel(guild.rank)}
              </span>
              {!guild.openToJoin && (
                <span className="px-[7px] py-[2px] rounded-full text-[9px] font-bold text-[#f87171] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)]">
                  {isVi ? 'Đóng' : 'Full'}
                </span>
              )}
            </div>
            <h3 className="text-[17px] font-black font-['Lexend'] text-[color:var(--cg-text)] leading-tight truncate">
              {guild.name}
            </h3>
            <p className="text-[11px] text-[color:var(--cg-text-muted)] line-clamp-2 leading-relaxed">
              {guild.description}
            </p>
          </div>
          <div
            className="flex-shrink-0 w-[48px] h-[48px] rounded-2xl flex items-center justify-center font-black text-lg border-2"
            style={{ borderColor: color, color, background: `${color}18` }}
          >
            {guild.level}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-[5px]">
          {guild.tags.map((tag) => (
            <span
              key={tag}
              className="px-[8px] py-[3px] rounded-full text-[10px] font-semibold"
              style={{
                background: `${color}15`,
                border: `1px solid ${color}30`,
                color,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* XP */}
        <XPBar value={guild.xp} max={guild.xpNext} color={color} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              icon: 'group',
              label: isVi ? 'TV' : 'Members',
              value: fmtMembers(guild.members),
            },
            {
              icon: 'trending_up',
              label: isVi ? 'Tỉ lệ W' : 'Win Rate',
              value: `${guild.winRate}%`,
            },
            {
              icon: 'bolt',
              label: isVi ? 'XP/tuần' : 'Wkly XP',
              value: `${(guild.weeklyXP / 1000).toFixed(1)}k`,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-2 text-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                className="material-symbols-outlined text-[14px] block mb-[2px]"
                style={{ color }}
              >
                {s.icon}
              </span>
              <div className="text-[13px] font-bold text-[color:var(--cg-text)]">
                {s.value}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-[color:var(--cg-text-muted)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Members + capacity */}
        <div className="flex items-center justify-between">
          <MemberAvatars
            initials={guild.memberAvatars}
            color={color}
            total={guild.members}
          />
          <span className="text-[10px] text-[color:var(--cg-text-muted)]">
            {guild.members.toLocaleString()} /{' '}
            {guild.maxMembers.toLocaleString()} ({fillPct}%{' '}
            {isVi ? 'đầy' : 'full'})
          </span>
        </div>

        {/* Expandable Quests */}
        {expanded && (
          <div
            className="space-y-3 pt-3 mt-1"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
              📋 {isVi ? 'Nhiệm vụ hiện tại' : 'Active Quests'}
            </div>
            {guild.quests.map((q, i) => (
              <QuestItem key={i} quest={q} color={color} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex gap-2 mt-auto pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex-1 py-[10px] rounded-xl text-[13px] font-bold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: guild.openToJoin ? color : 'rgba(255,255,255,0.06)',
              color: guild.openToJoin ? '#0f0b3c' : 'var(--cg-text-muted)',
              cursor: guild.openToJoin ? 'pointer' : 'not-allowed',
            }}
            disabled={!guild.openToJoin}
          >
            {guild.openToJoin
              ? isVi
                ? 'Tham gia'
                : 'Join Guild'
              : isVi
                ? 'Đóng'
                : 'Full'}
          </button>
          <button
            className="px-3 py-[10px] rounded-xl text-[13px] font-bold transition-all duration-150 hover:opacity-80"
            style={{
              border: `1px solid ${color}40`,
              background: `${color}0f`,
              color,
            }}
            onClick={onToggle}
          >
            <span className="material-symbols-outlined text-[16px]">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TypeHeroBanner ───────────────────────────────────────────────────────────

function TypeHeroBanner({
  icon,
  type,
  color,
  description,
  totalGuilds,
  totalMembers,
  avgWinRate,
  topGuildName,
  isVi,
}: {
  icon: string;
  type: string;
  color: string;
  description: string;
  totalGuilds: number;
  totalMembers: number;
  avgWinRate: number;
  topGuildName: string;
  isVi: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 md:p-8"
      style={{
        background: `linear-gradient(135deg, ${color}20 0%, rgba(255,255,255,0.02) 70%)`,
        border: `1px solid ${color}40`,
        boxShadow: `0 8px 40px ${color}15`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
      <div
        className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: color }}
      />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}50` }}
        >
          <span
            className="material-symbols-outlined text-[32px]"
            style={{ color }}
          >
            {icon}
          </span>
        </div>

        <div className="flex-1 space-y-2">
          <div
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}40`,
              color,
            }}
          >
            {isVi ? 'Chuyên môn' : 'Specialization'}
          </div>
          <h1 className="font-['Lexend'] text-3xl md:text-4xl font-black text-[color:var(--cg-text)] leading-tight">
            {type} <span style={{ color }}>Guilds</span>
          </h1>
          <p className="text-[13px] text-[color:var(--cg-text-muted)] leading-relaxed max-w-lg">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-shrink-0">
          {[
            { label: isVi ? 'Bang hội' : 'Guilds', value: totalGuilds },
            {
              label: isVi ? 'Thành viên' : 'Members',
              value: fmtMembers(totalMembers),
            },
            {
              label: isVi ? 'Win Rate TB' : 'Avg Win Rate',
              value: `${avgWinRate}%`,
            },
            {
              label: isVi ? 'Guild #1' : 'Top Guild',
              value: topGuildName.split(' ')[0] + '…',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-4 py-3 text-center"
              style={{
                background: `${color}10`,
                border: `1px solid ${color}25`,
              }}
            >
              <div className="text-[16px] font-black" style={{ color }}>
                {s.value}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-[color:var(--cg-text-muted)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GuildTypePage (main export) ─────────────────────────────────────────────

export default function GuildTypePage({ type }: { type: GuildType }) {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const color = TYPE_COLORS[type];
  const icon = TYPE_ICONS[type];
  const desc = TYPE_DESCRIPTIONS[type];

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<
    'rank' | 'members' | 'winRate' | 'weeklyXP'
  >('rank');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const guilds = useMemo(() => {
    return GUILDS.filter((g) => g.type === type)
      .filter((g) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'rank') return a.rank - b.rank;
        if (sortBy === 'members') return b.members - a.members;
        if (sortBy === 'winRate') return b.winRate - a.winRate;
        if (sortBy === 'weeklyXP') return b.weeklyXP - a.weeklyXP;
        return 0;
      });
  }, [type, search, sortBy]);

  const totalMembers = guilds.reduce((acc, g) => acc + g.members, 0);
  const avgWinRate = guilds.length
    ? Math.round(guilds.reduce((acc, g) => acc + g.winRate, 0) / guilds.length)
    : 0;
  const topGuild = [...guilds].sort((a, b) => a.rank - b.rank)[0];
  const openCount = guilds.filter((g) => g.openToJoin).length;

  const SORT_OPTIONS: { key: typeof sortBy; label: string }[] = [
    { key: 'rank', label: isVi ? 'Hạng' : 'Rank' },
    { key: 'members', label: isVi ? 'TV' : 'Members' },
    { key: 'winRate', label: isVi ? 'Thắng' : 'Win Rate' },
    { key: 'weeklyXP', label: isVi ? 'XP' : 'Weekly XP' },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] select-none overflow-x-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div
          className="absolute -top-[10%] right-[10%] h-[500px] w-[500px] rounded-full blur-[160px]"
          style={{ background: `${color}10` }}
        />
        <div
          className="absolute bottom-[-10%] left-[5%] h-[400px] w-[400px] rounded-full blur-[140px]"
          style={{ background: `${color}08` }}
        />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-12 space-y-10 animate-fade-in-up">
          {/* ── Breadcrumb ── */}
          <div className="flex items-center gap-2 text-[12px] text-[color:var(--cg-text-muted)]">
            <Link
              to="/guilds"
              className="hover:text-[color:var(--cg-text)] transition-colors"
            >
              {isVi ? 'Bang hội' : 'Guilds'}
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span style={{ color }}>{type}</span>
          </div>

          {/* ── Type Tabs ── */}
          <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-[color:var(--cg-border)]">
            {ALL_TYPES.map((t) => {
              const isActive = t === type;
              const tColor = TYPE_COLORS[t];
              return (
                <Link
                  key={t}
                  to={`/guilds/${t.toLowerCase().replace(' ', '-')}`}
                  className="flex items-center gap-1 px-[11px] py-[5px] rounded-full text-[12px] font-semibold transition-all duration-150"
                  style={{
                    background: isActive
                      ? `${tColor}20`
                      : 'rgba(255,255,255,0.05)',
                    border: isActive
                      ? `1px solid ${tColor}50`
                      : '1px solid rgba(255,255,255,0.08)',
                    color: isActive ? tColor : 'var(--cg-text-muted)',
                  }}
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {TYPE_ICONS[t]}
                  </span>
                  {t}
                </Link>
              );
            })}
          </div>

          {/* ── Hero Banner ── */}
          <TypeHeroBanner
            icon={icon}
            type={type}
            color={color}
            description={isVi ? desc.vi : desc.en}
            totalGuilds={guilds.length}
            totalMembers={totalMembers}
            avgWinRate={avgWinRate}
            topGuildName={topGuild?.name ?? '—'}
            isVi={isVi}
          />

          {/* ── Quick Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: 'hub',
                label: isVi ? 'Bang hội' : 'Total Guilds',
                value: guilds.length,
                sub: type,
                c: color,
              },
              {
                icon: 'group',
                label: isVi ? 'Tổng thành viên' : 'Total Members',
                value: fmtMembers(totalMembers),
                sub: isVi ? 'lập trình viên' : 'developers',
                c: '#60a5fa',
              },
              {
                icon: 'trending_up',
                label: isVi ? 'Win Rate TB' : 'Avg Win Rate',
                value: `${avgWinRate}%`,
                sub: isVi ? 'trung bình' : 'average',
                c: '#4ade80',
              },
              {
                icon: 'lock_open',
                label: isVi ? 'Đang mở' : 'Open to Join',
                value: openCount,
                sub: isVi ? 'bang hội' : 'guilds',
                c: '#fbbf24',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card px-4 py-4 flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${s.c}18`,
                    border: `1px solid ${s.c}30`,
                  }}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ color: s.c }}
                  >
                    {s.icon}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--cg-text-muted)]">
                    {s.label}
                  </div>
                  <div className="text-xl font-black text-[color:var(--cg-text)] leading-tight">
                    {s.value}
                  </div>
                  <div className="text-[10px] text-[color:var(--cg-text-muted)]">
                    {s.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Search + Sort ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[color:var(--cg-text-muted)] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isVi ? `Tìm trong ${type}...` : `Search ${type} guilds...`
                }
                className="w-full pl-9 pr-4 py-[9px] rounded-xl text-[13px] text-[color:var(--cg-text)] placeholder:text-[color:var(--cg-text-muted)] outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)]"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] text-[color:var(--cg-text-muted)] font-bold uppercase tracking-wider whitespace-nowrap">
                {isVi ? 'Sắp xếp:' : 'Sort:'}
              </span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className="px-3 py-[6px] rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    background:
                      sortBy === opt.key
                        ? `${color}18`
                        : 'rgba(255,255,255,0.04)',
                    border:
                      sortBy === opt.key
                        ? `1px solid ${color}50`
                        : '1px solid rgba(255,255,255,0.07)',
                    color: sortBy === opt.key ? color : 'var(--cg-text-muted)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Guild Grid ── */}
          {guilds.length === 0 ? (
            <div className="glass-card py-20 flex flex-col items-center gap-3 text-center">
              <span className="material-symbols-outlined text-[48px] text-[color:var(--cg-text-muted)] opacity-40">
                group_off
              </span>
              <p className="text-[color:var(--cg-text-muted)] font-medium">
                {isVi ? 'Không tìm thấy guild nào.' : 'No guilds found.'}
              </p>
              <button
                onClick={() => setSearch('')}
                className="text-[12px] font-bold hover:underline"
                style={{ color }}
              >
                {isVi ? 'Xóa tìm kiếm' : 'Clear search'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {guilds.map((guild) => (
                <GuildCard
                  key={guild.id}
                  guild={guild}
                  expanded={expandedId === guild.id}
                  onToggle={() =>
                    setExpandedId(expandedId === guild.id ? null : guild.id)
                  }
                  isVi={isVi}
                />
              ))}
            </div>
          )}

          {guilds.length > 0 && (
            <p className="text-[11px] text-[color:var(--cg-text-muted)] text-center">
              {isVi
                ? `${guilds.length} bang hội ${type}`
                : `${guilds.length} ${type} guild${guilds.length > 1 ? 's' : ''}`}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
