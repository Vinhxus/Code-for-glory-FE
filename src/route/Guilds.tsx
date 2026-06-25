import { useState, useMemo } from 'react';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';

// ─── Types ────────────────────────────────────────────────────────────────────

type GuildType = 'Backend' | 'Frontend' | 'Data Science' | 'DevOps' | 'Security' | 'Mobile';

interface Quest {
  label: string;
  progress: number;
  total: number;
  reward: string;
}

interface Guild {
  id: string;
  name: string;
  members: number;
  maxMembers: number;
  level: number;
  xp: number;
  xpNext: number;
  type: GuildType;
  color: string;
  rank: number;
  winRate: number;
  founded: string;
  openToJoin: boolean;
  featured?: boolean;
  quests: Quest[];
  memberAvatars: string[];
  description: string;
  weeklyXP: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const GUILDS: Guild[] = [
  {
    id: '1',
    name: 'The Void Walkers',
    members: 1240,
    maxMembers: 1500,
    level: 42,
    xp: 87400,
    xpNext: 100000,
    type: 'Backend',
    color: '#a78bfa',
    rank: 1,
    winRate: 74,
    founded: '2023',
    openToJoin: true,
    featured: true,
    description: 'Elite backend engineers mastering distributed systems, API design, and high-performance architecture.',
    weeklyXP: 12400,
    quests: [
      { label: 'Win 50 ranked battles', progress: 38, total: 50, reward: '5,000 XP' },
      { label: 'Complete 10 guild challenges', progress: 7, total: 10, reward: '2,500 XP' },
      { label: 'Recruit 5 new members', progress: 3, total: 5, reward: '1,000 XP' },
    ],
    memberAvatars: ['V', 'B', 'S', 'K', 'R'],
  },
  {
    id: '2',
    name: 'Pixel Pioneers',
    members: 890,
    maxMembers: 1000,
    level: 35,
    xp: 62000,
    xpNext: 75000,
    type: 'Frontend',
    color: '#ff7e5f',
    rank: 2,
    winRate: 68,
    founded: '2023',
    openToJoin: true,
    description: 'Crafting beautiful UIs and pixel-perfect experiences. React, Vue, design systems — we do it all.',
    weeklyXP: 9800,
    quests: [
      { label: 'Win 30 JS battles', progress: 22, total: 30, reward: '3,000 XP' },
      { label: 'Top 3 this week', progress: 2, total: 3, reward: '4,000 XP' },
    ],
    memberAvatars: ['P', 'A', 'L', 'M', 'E'],
  },
  {
    id: '3',
    name: 'Data Dragons',
    members: 560,
    maxMembers: 750,
    level: 28,
    xp: 41000,
    xpNext: 55000,
    type: 'Data Science',
    color: '#4ade80',
    rank: 3,
    winRate: 61,
    founded: '2024',
    openToJoin: false,
    description: 'Python wizards and ML practitioners. We train models, crunch datasets, and dominate analytics challenges.',
    weeklyXP: 7200,
    quests: [
      { label: 'Submit 20 Python solutions', progress: 14, total: 20, reward: '2,000 XP' },
    ],
    memberAvatars: ['D', 'N', 'C', 'T'],
  },
  {
    id: '4',
    name: 'Kernel Panic',
    members: 430,
    maxMembers: 600,
    level: 31,
    xp: 51000,
    xpNext: 60000,
    type: 'DevOps',
    color: '#38bdf8',
    rank: 4,
    winRate: 65,
    founded: '2024',
    openToJoin: true,
    description: 'Infra warriors who live in the terminal. Docker, K8s, CI/CD pipelines are our battleground.',
    weeklyXP: 6100,
    quests: [
      { label: 'Complete 15 system challenges', progress: 9, total: 15, reward: '3,500 XP' },
      { label: 'Guild tournament top 10', progress: 0, total: 1, reward: '8,000 XP' },
    ],
    memberAvatars: ['K', 'J', 'O', 'F', 'H'],
  },
  {
    id: '5',
    name: 'Shadow Protocol',
    members: 310,
    maxMembers: 400,
    level: 24,
    xp: 29000,
    xpNext: 40000,
    type: 'Security',
    color: '#f472b6',
    rank: 5,
    winRate: 58,
    founded: '2024',
    openToJoin: true,
    description: 'CTF champions and ethical hackers. We find vulnerabilities before the bad guys do.',
    weeklyXP: 5300,
    quests: [
      { label: 'Solve 10 security puzzles', progress: 6, total: 10, reward: '4,000 XP' },
    ],
    memberAvatars: ['S', 'X', 'Z', 'Q'],
  },
  {
    id: '6',
    name: 'Swift Nomads',
    members: 275,
    maxMembers: 350,
    level: 19,
    xp: 18000,
    xpNext: 28000,
    type: 'Mobile',
    color: '#fb923c',
    rank: 6,
    winRate: 55,
    founded: '2024',
    openToJoin: false,
    description: 'iOS and Android artisans. Building mobile-first, performance-obsessed native experiences.',
    weeklyXP: 4100,
    quests: [
      { label: 'Win 20 mobile battles', progress: 11, total: 20, reward: '2,500 XP' },
    ],
    memberAvatars: ['W', 'I', 'R', 'Y'],
  },
];

const FILTER_TYPES: (GuildType | 'All')[] = ['All', 'Backend', 'Frontend', 'Data Science', 'DevOps', 'Security', 'Mobile'];

const TYPE_ICONS: Record<GuildType | 'All', string> = {
  All: 'apps',
  Backend: 'dns',
  Frontend: 'palette',
  'Data Science': 'analytics',
  DevOps: 'cloud',
  Security: 'shield',
  Mobile: 'smartphone',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMembers = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

const rankLabel = (r: number) =>
  r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function XPBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold text-[color:var(--cg-text-muted)]">
        <span>{value.toLocaleString()} XP</span>
        <span>{pct}%</span>
      </div>
      <div className="h-[4px] w-full rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function QuestItem({ quest, color }: { quest: Quest; color: string }) {
  const pct = Math.round((quest.progress / quest.total) * 100);
  return (
    <div className="space-y-[6px]">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-[color:var(--cg-text-muted)]">{quest.label}</span>
        <span className="text-[10px] font-bold" style={{ color }}>+{quest.reward}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
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

function MemberAvatars({ initials, color, total }: { initials: string[]; color: string; total: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {initials.slice(0, 4).map((letter, i) => (
        <div
          key={i}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[color:var(--cg-bg)] -ml-1 first:ml-0 z-10"
          style={{ background: `${color}33`, color, borderColor: 'var(--cg-bg)', zIndex: initials.length - i }}
        >
          {letter}
        </div>
      ))}
      {total > 4 && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2 -ml-1"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--cg-text-muted)', borderColor: 'var(--cg-bg)' }}
        >
          +{total - 4}
        </div>
      )}
    </div>
  );
}

// ─── Guild Card ───────────────────────────────────────────────────────────────

function GuildCard({
  guild,
  expanded,
  onToggle,
  joinLabel,
  membersLabel,
  openLabel,
  closedLabel,
  weeklyLabel,
  winRateLabel,
  questsLabel,
  viewLabel,
}: {
  guild: Guild;
  expanded: boolean;
  onToggle: () => void;
  joinLabel: string;
  membersLabel: string;
  openLabel: string;
  closedLabel: string;
  weeklyLabel: string;
  winRateLabel: string;
  questsLabel: string;
  viewLabel: string;
}) {
  const fillPct = Math.round((guild.members / guild.maxMembers) * 100);

  return (
    <div
      className="glass-card relative overflow-hidden flex flex-col cursor-pointer group transition-all duration-300"
      style={{
        border: expanded ? `1px solid ${guild.color}55` : undefined,
        boxShadow: expanded ? `0 0 24px ${guild.color}18` : undefined,
      }}
      onClick={onToggle}
    >
      {/* Color banner */}
      <div
        className="absolute top-0 left-0 w-full h-28 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        style={{ background: `linear-gradient(160deg, ${guild.color}, transparent)` }}
      />

      {/* Shimmer line */}
      <div
        className="absolute top-0 left-0 h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${guild.color}, transparent)` }}
      />

      <div className="relative z-10 p-5 flex flex-col gap-4 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            {/* Type badge + rank */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="flex items-center gap-1 px-[9px] py-[3px] rounded-full text-[10px] font-bold tracking-wide"
                style={{
                  background: `${guild.color}18`,
                  border: `1px solid ${guild.color}40`,
                  color: guild.color,
                }}
              >
                <span className="material-symbols-outlined text-[11px]">{TYPE_ICONS[guild.type]}</span>
                {guild.type}
              </span>
              <span className="text-[12px] font-bold">{rankLabel(guild.rank)}</span>
              {!guild.openToJoin && (
                <span className="px-[7px] py-[2px] rounded-full text-[9px] font-bold text-[#f87171] bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)]">
                  {closedLabel}
                </span>
              )}
            </div>

            <h2 className="text-[17px] font-black font-['Lexend'] text-[color:var(--cg-text)] leading-tight truncate">
              {guild.name}
            </h2>
          </div>

          {/* Hexagon level badge */}
          <div
            className="flex-shrink-0 w-[48px] h-[48px] rounded-2xl flex items-center justify-center font-black text-lg border-2"
            style={{
              borderColor: guild.color,
              color: guild.color,
              background: `${guild.color}18`,
            }}
          >
            {guild.level}
          </div>
        </div>

        {/* Description */}
        <p className="text-[12px] text-[color:var(--cg-text-muted)] leading-relaxed line-clamp-2">
          {guild.description}
        </p>

        {/* XP progress */}
        <XPBar value={guild.xp} max={guild.xpNext} color={guild.color} />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: 'group', label: membersLabel, value: `${fmtMembers(guild.members)}` },
            { icon: 'trending_up', label: winRateLabel, value: `${guild.winRate}%` },
            { icon: 'bolt', label: weeklyLabel, value: `${(guild.weeklyXP / 1000).toFixed(1)}k` },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-2 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="material-symbols-outlined text-[14px] block mb-[2px]" style={{ color: guild.color }}>{s.icon}</span>
              <div className="text-[13px] font-bold text-[color:var(--cg-text)]">{s.value}</div>
              <div className="text-[9px] uppercase tracking-wider text-[color:var(--cg-text-muted)]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Members row + capacity */}
        <div className="flex items-center justify-between">
          <MemberAvatars initials={guild.memberAvatars} color={guild.color} total={guild.members} />
          <span className="text-[10px] text-[color:var(--cg-text-muted)]">
            {guild.members.toLocaleString()} / {guild.maxMembers.toLocaleString()} ({fillPct}% full)
          </span>
        </div>

        {/* Expandable: Quests */}
        {expanded && (
          <div
            className="space-y-3 pt-3 mt-1"
            style={{ borderTop: `1px solid rgba(255,255,255,0.07)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
              📋 {questsLabel}
            </div>
            {guild.quests.map((q, i) => (
              <QuestItem key={i} quest={q} color={guild.color} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="flex-1 py-[10px] rounded-xl text-[13px] font-bold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: guild.openToJoin ? guild.color : 'rgba(255,255,255,0.06)',
              color: guild.openToJoin ? '#0f0b3c' : 'var(--cg-text-muted)',
              cursor: guild.openToJoin ? 'pointer' : 'not-allowed',
            }}
            disabled={!guild.openToJoin}
          >
            {guild.openToJoin ? joinLabel : closedLabel}
          </button>
          <button
            className="px-3 py-[10px] rounded-xl text-[13px] font-bold transition-all duration-150 hover:opacity-80"
            style={{ border: `1px solid ${guild.color}40`, background: `${guild.color}0f`, color: guild.color }}
            onClick={onToggle}
            title={viewLabel}
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

// ─── Featured Guild Banner ────────────────────────────────────────────────────

function FeaturedGuild({
  guild,
  isVi,
}: {
  guild: Guild;
  isVi: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 md:p-8"
      style={{
        background: `linear-gradient(135deg, ${guild.color}22 0%, rgba(255,255,255,0.03) 60%)`,
        border: `1px solid ${guild.color}44`,
        boxShadow: `0 8px 40px ${guild.color}18`,
      }}
    >
      {/* Animated shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${guild.color} 50%, transparent 100%)` }}
      />
      <div
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: guild.color }}
      />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ background: `${guild.color}20`, border: `1px solid ${guild.color}50`, color: guild.color }}
            >
              🏆 {isVi ? 'Bang hội hàng đầu' : 'Top Guild'}
            </span>
            <span className="text-[11px] text-[color:var(--cg-text-muted)]">
              {isVi ? 'Xếp hạng' : 'Global Rank'} 🥇
            </span>
          </div>
          <h2 className="font-['Lexend'] text-3xl font-black text-[color:var(--cg-text)] leading-tight">
            {guild.name}
          </h2>
          <p className="text-[13px] text-[color:var(--cg-text-muted)] leading-relaxed max-w-md">
            {guild.description}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-[12px] text-[color:var(--cg-text-muted)]">
              <span className="material-symbols-outlined text-[14px]" style={{ color: guild.color }}>group</span>
              {guild.members.toLocaleString()} {isVi ? 'thành viên' : 'members'}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-[color:var(--cg-text-muted)]">
              <span className="material-symbols-outlined text-[14px]" style={{ color: guild.color }}>trending_up</span>
              {guild.winRate}% {isVi ? 'tỉ lệ thắng' : 'win rate'}
            </div>
            <div className="flex items-center gap-1 text-[12px] text-[color:var(--cg-text-muted)]">
              <span className="material-symbols-outlined text-[14px]" style={{ color: guild.color }}>bolt</span>
              {guild.weeklyXP.toLocaleString()} XP {isVi ? 'tuần này' : 'this week'}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <div
            className="w-20 h-20 rounded-3xl flex flex-col items-center justify-center border-2 font-black"
            style={{ borderColor: guild.color, color: guild.color, background: `${guild.color}18` }}
          >
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Lv</span>
            <span className="text-3xl leading-none">{guild.level}</span>
          </div>
          <div className="w-full space-y-[5px]">
            <div className="text-[10px] text-center text-[color:var(--cg-text-muted)]">
              {guild.xp.toLocaleString()} / {guild.xpNext.toLocaleString()} XP
            </div>
            <div className="w-32 h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.round(guild.xp / guild.xpNext * 100)}%`, background: guild.color }}
              />
            </div>
          </div>
          <button
            className="px-6 py-[10px] rounded-xl text-[13px] font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: guild.color, color: '#0f0b3c' }}
          >
            {isVi ? 'Xem chi tiết →' : 'View Guild →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Route ───────────────────────────────────────────────────────────────

export default function Guilds() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [filterType, setFilterType] = useState<GuildType | 'All'>('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | 'members' | 'winRate' | 'weeklyXP'>('rank');

  const text = {
    titleA: isVi ? 'Bang Hội' : 'Guild',
    titleB: isVi ? 'Faction' : 'Factions',
    subtitle: isVi ? 'Kết nối với những developer khác. Hoàn thành quest, chia sẻ kiến thức và cùng leo bảng xếp hạng.' : 'Unite with fellow developers. Complete guild quests, share knowledge, and dominate the global leaderboards.',
    create: isVi ? 'Tạo Guild' : 'Create Guild',
    join: isVi ? 'Tham gia' : 'Join Guild',
    members: isVi ? 'TV' : 'Members',
    open: isVi ? 'Mở' : 'Open',
    closed: isVi ? 'Đóng' : 'Full',
    weeklyXP: isVi ? 'XP/tuần' : 'Wkly XP',
    winRate: isVi ? 'Tỉ lệ W' : 'Win Rate',
    quests: isVi ? 'Nhiệm vụ hiện tại' : 'Active Quests',
    searchPH: isVi ? 'Tìm kiếm guild...' : 'Search guilds...',
    sortBy: isVi ? 'Sắp xếp:' : 'Sort:',
    noResults: isVi ? 'Không tìm thấy guild nào.' : 'No guilds found.',
    total: isVi ? 'Tổng cộng' : 'Total',
    guildsLabel: isVi ? 'bang hội' : 'guilds',
    view: isVi ? 'Xem chi tiết' : 'View quests',
    totalMembers: isVi ? 'Tổng thành viên' : 'Total Members',
    avgWinRate: isVi ? 'Win Rate TB' : 'Avg Win Rate',
    activeQuests: isVi ? 'Quest đang chạy' : 'Active Quests',
  };

  const filteredGuilds = useMemo(() => {
    return GUILDS
      .filter((g) => {
        const matchType = filterType === 'All' || g.type === filterType;
        const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
          g.type.toLowerCase().includes(search.toLowerCase()) ||
          g.description.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rank') return a.rank - b.rank;
        if (sortBy === 'members') return b.members - a.members;
        if (sortBy === 'winRate') return b.winRate - a.winRate;
        if (sortBy === 'weeklyXP') return b.weeklyXP - a.weeklyXP;
        return 0;
      });
  }, [filterType, search, sortBy]);

  const featuredGuild = GUILDS.find((g) => g.featured)!;
  const totalMembers = GUILDS.reduce((acc, g) => acc + g.members, 0);
  const avgWinRate = Math.round(GUILDS.reduce((acc, g) => acc + g.winRate, 0) / GUILDS.length);
  const totalQuests = GUILDS.reduce((acc, g) => acc + g.quests.length, 0);

  const SORT_OPTIONS: { key: typeof sortBy; label: string }[] = [
    { key: 'rank', label: isVi ? 'Hạng' : 'Rank' },
    { key: 'members', label: isVi ? 'TV' : 'Members' },
    { key: 'winRate', label: isVi ? 'Thắng' : 'Win Rate' },
    { key: 'weeklyXP', label: isVi ? 'XP' : 'Weekly XP' },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(#a78bfa 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="absolute -top-[10%] right-[10%] h-[500px] w-[500px] rounded-full blur-[160px]" style={{ background: 'rgba(167,139,250,0.07)' }} />
        <div className="absolute bottom-[-10%] left-[5%] h-[400px] w-[400px] rounded-full blur-[140px]" style={{ background: 'rgba(255,126,95,0.05)' }} />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-6 md:px-8 py-12 space-y-10 animate-fade-in-up">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-[color:var(--cg-border)]">
            <div className="space-y-3">
              <h1 className="font-['Lexend'] text-5xl font-black tracking-tight leading-none">
                {text.titleA}{' '}
                <span className="gradient-text-amber">{text.titleB}</span>
              </h1>
              <p className="text-[color:var(--cg-text-muted)] max-w-lg leading-relaxed">
                {text.subtitle}
              </p>
            </div>
            <button className="neon-btn-amber px-6 py-3 font-bold flex items-center gap-2 flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">add</span>
              {text.create}
            </button>
          </div>

          {/* ── Global Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: 'hub', label: text.total, value: `${GUILDS.length}`, sub: text.guildsLabel, color: '#a78bfa' },
              { icon: 'group', label: text.totalMembers, value: fmtMembers(totalMembers), sub: isVi ? 'lập trình viên' : 'developers', color: '#60a5fa' },
              { icon: 'trending_up', label: text.avgWinRate, value: `${avgWinRate}%`, sub: isVi ? 'trung bình' : 'average', color: '#4ade80' },
              { icon: 'task_alt', label: text.activeQuests, value: `${totalQuests}`, sub: isVi ? 'đang chạy' : 'running', color: '#fbbf24' },
            ].map((s) => (
              <div key={s.label} className="glass-card px-4 py-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--cg-text-muted)]">{s.label}</div>
                  <div className="text-xl font-black text-[color:var(--cg-text)] leading-tight">{s.value}</div>
                  <div className="text-[10px] text-[color:var(--cg-text-muted)]">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Featured Guild ── */}
          <FeaturedGuild guild={featuredGuild} isVi={isVi} />

          {/* ── Filters + Search + Sort ── */}
          <div className="space-y-4">
            {/* Type filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {FILTER_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className="flex items-center gap-1 px-[11px] py-[5px] rounded-full text-[12px] font-semibold transition-all duration-150"
                  style={{
                    background: filterType === t ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.05)',
                    border: filterType === t ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: filterType === t ? '#c4b5fd' : 'var(--cg-text-muted)',
                  }}
                >
                  <span className="material-symbols-outlined text-[12px]">{TYPE_ICONS[t]}</span>
                  {t === 'All' ? (isVi ? 'Tất cả' : 'All') : t}
                </button>
              ))}
            </div>

            {/* Search + sort row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[color:var(--cg-text-muted)] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={text.searchPH}
                  className="w-full pl-9 pr-4 py-[9px] rounded-xl text-[13px] text-[color:var(--cg-text)] placeholder:text-[color:var(--cg-text-muted)] outline-none transition-colors"
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
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-[color:var(--cg-text-muted)] font-bold uppercase tracking-wider whitespace-nowrap">
                  {text.sortBy}
                </span>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className="px-3 py-[6px] rounded-lg text-[11px] font-bold transition-all"
                    style={{
                      background: sortBy === opt.key ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                      border: sortBy === opt.key ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.07)',
                      color: sortBy === opt.key ? '#fbbf24' : 'var(--cg-text-muted)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Guild Grid ── */}
          {filteredGuilds.length === 0 ? (
            <div className="glass-card py-20 flex flex-col items-center gap-3 text-center">
              <span className="material-symbols-outlined text-[48px] text-[color:var(--cg-text-muted)] opacity-40">group_off</span>
              <p className="text-[color:var(--cg-text-muted)] font-medium">{text.noResults}</p>
              <button
                onClick={() => { setSearch(''); setFilterType('All'); }}
                className="text-[12px] text-[#a78bfa] font-bold hover:underline"
              >
                {isVi ? 'Xóa bộ lọc' : 'Clear filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredGuilds.map((guild) => (
                <GuildCard
                  key={guild.id}
                  guild={guild}
                  expanded={expandedId === guild.id}
                  onToggle={() => setExpandedId(expandedId === guild.id ? null : guild.id)}
                  joinLabel={text.join}
                  membersLabel={text.members}
                  openLabel={text.open}
                  closedLabel={text.closed}
                  weeklyLabel={text.weeklyXP}
                  winRateLabel={text.winRate}
                  questsLabel={text.quests}
                  viewLabel={text.view}
                />
              ))}
            </div>
          )}

          {/* ── Result count ── */}
          {filteredGuilds.length > 0 && (
            <p className="text-[11px] text-[color:var(--cg-text-muted)] text-center">
              {isVi
                ? `Hiển thị ${filteredGuilds.length} trong ${GUILDS.length} bang hội`
                : `Showing ${filteredGuilds.length} of ${GUILDS.length} guilds`}
            </p>
          )}

        </main>
      </div>
    </div>
  );
}
