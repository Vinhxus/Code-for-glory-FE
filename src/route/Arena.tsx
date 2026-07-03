import { useEffect, useState } from 'react';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import { getLeaderboard, type LeaderboardRow } from '../services/battlesApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveMatch {
  id: number;
  p1: string;
  p2: string;
  stake: string;
  language: string;
  timer: string;
  p1Progress: number;
  p2Progress: number;
  spectators: number;
}

interface BattleRecord {
  id: number;
  result: 'WIN' | 'LOSS';
  opponent: string;
  xp: string;
  language: string;
  date: string;
}

interface MatchType {
  key: string;
  label: string;
  icon: string;
}

interface Difficulty {
  key: string;
  label: string;
  color: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LIVE_MATCHES: LiveMatch[] = [
  { id: 1, p1: 'Alex_Dev', p2: 'CodeNinja', stake: '500 XP', language: 'JavaScript', timer: '08:24', p1Progress: 62, p2Progress: 45, spectators: 34 },
  { id: 2, p1: 'Sarah199', p2: 'ByteMaster', stake: '1.2k XP', language: 'Python', timer: '18:07', p1Progress: 89, p2Progress: 72, spectators: 127 },
  { id: 3, p1: 'Neo', p2: 'Trinity', stake: '5k XP', language: 'C++', timer: '03:41', p1Progress: 30, p2Progress: 18, spectators: 892 },
];

const BATTLE_HISTORY: BattleRecord[] = [
  { id: 1, result: 'WIN', opponent: 'CodeNinja', xp: '+450', language: 'Python', date: '2h ago' },
  { id: 2, result: 'WIN', opponent: 'ByteMaster', xp: '+320', language: 'JavaScript', date: '5h ago' },
  { id: 3, result: 'LOSS', opponent: 'xX_L33tH4x0r', xp: '−200', language: 'C++', date: '1d ago' },
  { id: 4, result: 'WIN', opponent: 'SyntaxSavage', xp: '+890', language: 'Python', date: '1d ago' },
  { id: 5, result: 'LOSS', opponent: 'ByteSlayer', xp: '−750', language: 'JavaScript', date: '2d ago' },
];

const LANGUAGES: string[] = ['Python', 'JavaScript', 'TypeScript', 'C++', 'Java', 'Go', 'Rust', 'C'];

const MATCH_TYPES: MatchType[] = [
  { key: 'ranked', label: 'Ranked', icon: '⚔️' },
  { key: 'casual', label: 'Casual', icon: '🎮' },
  { key: 'tournament', label: 'Tournament', icon: '🏆' },
];

const DIFFICULTIES: Difficulty[] = [
  { key: 'newbie', label: 'Newbie', color: '#4ade80' },
  { key: 'intermediate', label: 'Mid', color: '#60a5fa' },
  { key: 'expert', label: 'Expert', color: '#a78bfa' },
  { key: 'legend', label: 'Legend', color: '#ff7e5f' },
];

const TIER_COLORS: Record<string, string> = {
  Legend: '#ff7e5f', Platinum: '#60a5fa', Gold: '#fbbf24', Silver: '#94a3b8',
};

const fmtTime = (s: number): string =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const winRate = (w: number, l: number): number => Math.round((w / (w + l)) * 100);

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, color, size = 38 }: { name: string; color: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: `${color}22`, border: `2px solid ${color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: size * 0.37, color, flexShrink: 0, fontFamily: 'monospace',
      }}
    >
      {name[0].toUpperCase()}
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex-1 h-[5px] rounded-full bg-white/[0.06]">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.05] rounded-[10px] p-[10px_12px]">
      <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[color:var(--cg-text-muted)] mb-1">
        {label}
      </div>
      <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
    </div>
  );
}

// ─── Section: Matchmaking ─────────────────────────────────────────────────────

function MatchmakingPanel({
  matchType, setMatchType,
  difficulty, setDifficulty,
  selectedLangs, toggleLang,
  searching, setSearching,
  queueTime, isVi,
}: {
  matchType: string;
  setMatchType: (v: string) => void;
  difficulty: string;
  setDifficulty: (v: string) => void;
  selectedLangs: string[];
  toggleLang: (l: string) => void;
  searching: boolean;
  setSearching: (v: boolean | ((p: boolean) => boolean)) => void;
  queueTime: number;
  isVi: boolean;
}) {
  return (
    <div className="glass-card p-6 space-y-5">
      <h2 className="text-xl font-extrabold font-['Lexend'] text-[color:var(--cg-text)] flex items-center gap-2">
        🎯 {isVi ? 'Tìm Trận' : 'Find a Match'}
      </h2>

      {/* Match Type */}
      <div>
        <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[color:var(--cg-text-muted)] mb-2">
          {isVi ? 'Loại trận' : 'Match Type'}
        </p>
        <div className="flex gap-2">
          {MATCH_TYPES.map((mt) => (
            <button
              key={mt.key}
              onClick={() => setMatchType(mt.key)}
              className="flex-1 py-[10px] rounded-[10px] text-[13px] font-bold transition-all duration-150"
              style={{
                border: matchType === mt.key ? '1px solid #ff7e5f' : '1px solid rgba(255,255,255,0.08)',
                background: matchType === mt.key ? 'rgba(255,126,95,0.14)' : 'transparent',
                color: matchType === mt.key ? '#ff9a7e' : 'var(--cg-text-muted)',
              }}
            >
              {mt.icon} {mt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[color:var(--cg-text-muted)] mb-2">
          {isVi ? 'Độ khó' : 'Difficulty Tier'}
        </p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              onClick={() => setDifficulty(d.key)}
              className="flex-1 py-2 rounded-[9px] text-xs font-bold transition-all duration-150"
              style={{
                border: difficulty === d.key ? `1px solid ${d.color}` : '1px solid rgba(255,255,255,0.08)',
                background: difficulty === d.key ? `${d.color}22` : 'transparent',
                color: difficulty === d.key ? d.color : 'var(--cg-text-muted)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[color:var(--cg-text-muted)] mb-2">
          {isVi ? 'Ngôn ngữ' : 'Language'}{' '}
          <span className="normal-case font-normal text-[10px]">
            ({isVi ? 'chọn một hoặc nhiều' : 'select one or more'})
          </span>
        </p>
        <div className="flex flex-wrap gap-[7px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleLang(lang)}
              className="px-[14px] py-[5px] rounded-full text-xs font-semibold transition-all duration-150"
              style={{
                border: selectedLangs.includes(lang) ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.08)',
                background: selectedLangs.includes(lang) ? 'rgba(167,139,250,0.15)' : 'transparent',
                color: selectedLangs.includes(lang) ? '#c4b5fd' : 'var(--cg-text-muted)',
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSearching((s) => !s)}
          className="flex-1 py-[14px] rounded-xl text-[15px] font-extrabold tracking-[0.08em] uppercase flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            border: searching ? '1px solid rgba(239,68,68,0.2)' : 'none',
            background: searching ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg,#ff7e5f,#f97316)',
            color: searching ? '#fca5a5' : '#fff',
          }}
        >
          {searching ? (
            <>
              <span className="inline-block w-[14px] h-[14px] rounded-full border-2 border-[rgba(252,165,165,0.25)] border-t-[#fca5a5] animate-spin" />
              {isVi ? 'Đang tìm' : 'Searching'} · {fmtTime(queueTime)}
            </>
          ) : (
            `⚔️  ${isVi ? 'Tìm Trận' : 'Find Match'}`
          )}
        </button>
        {searching ? (
          <button
            onClick={() => setSearching(false)}
            className="px-4 py-[14px] rounded-xl text-[13px] font-bold text-[color:var(--cg-text-muted)]"
            style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
          >
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
        ) : (
          <div className="text-[11px] text-[color:var(--cg-text-muted)] text-center leading-snug">
            {isVi ? 'Thời gian chờ' : 'Est. wait'}<br />
            <span className="text-[#60a5fa] font-bold">~30s</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section: Live Spectate ───────────────────────────────────────────────────

function LiveSpectate({ matches, isVi }: { matches: LiveMatch[]; isVi: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-['Lexend'] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ff7e5f]">sensors</span>
          {isVi ? 'Xem trực tiếp' : 'Live Spectate'}
        </h2>
        <div className="flex items-center gap-2 text-xs font-bold text-[#4ade80]">
          <div className="h-2 w-2 rounded-full bg-[#4ade80] animate-status-pulse" />
          {`124 ${isVi ? 'trận đang diễn ra' : 'matches running'}`}
        </div>
      </div>

      {matches.map((m) => (
        <div key={m.id} className="glass-card p-5 card-hover space-y-3">
          {/* Players row */}
          <div className="flex items-center">
            <div className="flex-1 flex items-center gap-2">
              <Avatar name={m.p1} color="#a78bfa" />
              <div>
                <div className="font-bold text-[14px] text-[#c4b5fd]">{m.p1}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--cg-text-muted)]">
                  {isVi ? 'Thách đấu' : 'Challenger'}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-[2px] px-5">
              <span className="font-black italic text-[18px] text-[#ff7e5f] tracking-tight">VS</span>
              <span className="text-[11px] font-bold text-[color:var(--cg-text-muted)] tabular-nums">⏱ {m.timer}</span>
            </div>
            <div className="flex-1 flex items-center justify-end gap-2">
              <div className="text-right">
                <div className="font-bold text-[14px] text-[#93c5fd]">{m.p2}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--cg-text-muted)]">
                  {isVi ? 'Phòng thủ' : 'Defender'}
                </div>
              </div>
              <Avatar name={m.p2} color="#60a5fa" />
            </div>
          </div>

          {/* Progress bars */}
          <div className="space-y-[5px]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#a78bfa] w-8 text-right tabular-nums">{m.p1Progress}%</span>
              <ProgressBar pct={m.p1Progress} color="linear-gradient(90deg,#7c3aed,#a78bfa)" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#60a5fa] w-8 text-right tabular-nums">{m.p2Progress}%</span>
              <ProgressBar pct={m.p2Progress} color="linear-gradient(90deg,#1d4ed8,#60a5fa)" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="badge-amber">{m.stake}</span>
              <span
                className="px-[10px] py-[3px] rounded-full text-[11px] font-semibold text-[#94a3b8]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {m.language}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[color:var(--cg-text-muted)]">👁 {m.spectators.toLocaleString()}</span>
              <button
                className="px-[14px] py-[5px] rounded-lg text-xs font-bold text-[#60a5fa] transition-colors"
                style={{ border: '1px solid rgba(96,165,250,0.35)', background: 'rgba(96,165,250,0.08)' }}
              >
                {isVi ? 'Xem' : 'Watch'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section: Recent Battles ──────────────────────────────────────────────────

function RecentBattles({ battles, isVi }: { battles: BattleRecord[]; isVi: boolean }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-['Lexend']">
        🕐 {isVi ? 'Trận gần đây' : 'Recent Battles'}
      </h2>
      <div className="glass-card overflow-hidden">
        {battles.map((b, i) => (
          <div
            key={b.id}
            className="flex items-center justify-between px-[18px] py-[13px]"
            style={{ borderBottom: i < battles.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-11 text-center px-2 py-[3px] rounded-md text-[10px] font-extrabold tracking-[0.06em] flex-shrink-0"
                style={{
                  background: b.result === 'WIN' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                  border: b.result === 'WIN' ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(239,68,68,0.2)',
                  color: b.result === 'WIN' ? '#4ade80' : '#f87171',
                }}
              >
                {b.result}
              </span>
              <div>
                <div className="font-bold text-[13px] text-[color:var(--cg-text)]">vs {b.opponent}</div>
                <div className="text-[11px] text-[color:var(--cg-text-muted)]">{b.language} · {b.date}</div>
              </div>
            </div>
            <span
              className="font-extrabold text-[14px] tabular-nums"
              style={{ color: b.result === 'WIN' ? '#4ade80' : '#f87171' }}
            >
              {b.xp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section: My Stats ────────────────────────────────────────────────────────

function MyStats({ isVi }: { isVi: boolean }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-['Lexend'] text-base font-extrabold text-[color:var(--cg-text)]">
          ⚡ {isVi ? 'Thống kê' : 'My Stats'}
        </h3>
        <span className="badge-amber">Gold III</span>
      </div>
      <div className="grid grid-cols-2 gap-[9px]">
        <StatMini label={isVi ? 'Thắng' : 'Wins'} value="47" color="#4ade80" />
        <StatMini label={isVi ? 'Thua' : 'Losses'} value="18" color="#f87171" />
        <StatMini label={isVi ? 'Tỉ lệ' : 'Win Rate'} value="72%" color="#60a5fa" />
        <StatMini label="XP" value="12.4k" color="#fbbf24" />
      </div>
      <div
        className="flex items-center gap-2 p-3 rounded-[10px]"
        style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.15)' }}
      >
        <span className="text-xl">🔥</span>
        <div>
          <div className="text-[13px] font-bold text-[#fb923c]">
            {isVi ? 'Chuỗi 3 trận thắng!' : '3-Win Streak!'}
          </div>
          <div className="text-[11px] text-[color:var(--cg-text-muted)]">
            {isVi ? 'Tiếp tục để nhận thưởng' : 'Keep going for streak bonus XP'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Tournament Spotlight ───────────────────────────────────────────

function TournamentSpotlight({ isVi }: { isVi: boolean }) {
  const details = [
    { label: isVi ? 'Giải thưởng' : 'Prize Pool', value: '500,000 XP + 🎖️ Legend', c: '#fbbf24' },
    { label: isVi ? 'Bắt đầu sau' : 'Starts In', value: '2d 14h 33m', c: '#4ade80' },
    { label: isVi ? 'Slot còn lại' : 'Slots Left', value: '23 / 64', c: '#e2e8f0' },
  ];
  return (
    <div
      className="glass-card p-5 space-y-4"
      style={{
        background: 'linear-gradient(135deg,rgba(109,40,217,0.12),rgba(255,126,95,0.08))',
        border: '1px solid rgba(167,139,250,0.2)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#fbbf24]">emoji_events</span>
        <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#a78bfa]">
          {isVi ? 'Giải đấu nổi bật' : 'Tournament Spotlight'}
        </span>
      </div>
      <div>
        <div className="font-['Lexend'] text-[18px] font-extrabold text-[color:var(--cg-text)] mb-1">
          Grand Clash S3
        </div>
        <div className="text-xs text-[color:var(--cg-text-muted)] leading-relaxed">
          {isVi
            ? 'Top 64 đấu sĩ tranh ngôi vương. Loại trực tiếp. Không khoan nhượng.'
            : 'Top 64 gladiators compete for the season crown. Single-elimination. No mercy.'}
        </div>
      </div>
      <div className="space-y-[7px]">
        {details.map((r) => (
          <div key={r.label} className="flex justify-between items-center text-xs">
            <span className="text-[color:var(--cg-text-muted)]">{r.label}</span>
            <span className="font-bold" style={{ color: r.c }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="text-[10px] text-[color:var(--cg-text-muted)] mb-[5px]">
          {isVi ? 'Đăng ký — 41/64 slot đã đầy' : 'Registration — 41 of 64 slots filled'}
        </div>
        <div className="h-[5px] rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full" style={{ width: '64%', background: 'linear-gradient(90deg,#7c3aed,#ff7e5f)' }} />
        </div>
      </div>
      <button
        className="w-full py-[11px] rounded-xl text-[13px] font-bold tracking-[0.04em] text-[#c4b5fd] transition-colors"
        style={{ border: '1px solid rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.1)' }}
      >
        {isVi ? 'Đăng ký ngay →' : 'Register Now →'}
      </button>
    </div>
  );
}

// ─── Section: Top Gladiators (leaderboard từ API) ────────────────────────────

function TopGladiators({ leaders, isVi }: { leaders: LeaderboardRow[]; isVi: boolean }) {
  const rankIcon = (i: number, rank: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${rank}`);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-['Lexend'] flex items-center gap-2">
        <span className="material-symbols-outlined text-[#fbbf24]">emoji_events</span>
        {isVi ? 'Đấu sĩ hàng đầu' : 'Top Gladiators'}
      </h2>
      <div className="glass-card p-5 space-y-4">
        {leaders.length === 0 ? (
          <div className="text-xs text-[color:var(--cg-text-muted)] py-2">
            {isVi ? 'Chưa có dữ liệu xếp hạng.' : 'No ranking data yet.'}
          </div>
        ) : (
          leaders.map((row, i) => (
            <div
              key={row.userId}
              className="flex items-center gap-3 pb-3 last:pb-0"
              style={{ borderBottom: i < leaders.length - 1 ? '1px solid var(--cg-border)' : 'none' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                style={{
                  fontSize: i < 3 ? 15 : 11,
                  background: i === 0 ? 'rgba(251,191,36,0.12)' : i === 1 ? 'rgba(148,163,184,0.12)' : i === 2 ? 'rgba(205,127,50,0.12)' : 'rgba(255,255,255,0.04)',
                  color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--cg-text-muted)',
                }}
              >
                {rankIcon(i, row.rank)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[13px] text-[color:var(--cg-text)] flex items-center gap-1 truncate">
                  {row.username}
                </div>
                <div className="text-[10px] text-[color:var(--cg-text-muted)]">
                  {winRate(row.wins ?? 0, row.losses ?? 0)}% WR
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 gap-[2px]">
                <span className="font-extrabold text-[13px] text-[#fbbf24] tabular-nums">
                  {row.ratingPoints} pts
                </span>
                {row.tier && (
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: TIER_COLORS[row.tier] ?? '#94a3b8' }}
                  >
                    {row.tier}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <button
        className="w-full py-[10px] rounded-xl text-xs font-semibold text-[color:var(--cg-text-muted)] transition-colors"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'transparent' }}
      >
        {isVi ? 'Xem bảng xếp hạng đầy đủ →' : 'View Full Leaderboard →'}
      </button>
    </div>
  );
}

// ─── Main Route ───────────────────────────────────────────────────────────────

export default function Arena() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [matchType, setMatchType] = useState<string>('ranked');
  const [difficulty, setDifficulty] = useState<string>('intermediate');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Python']);
  const [searching, setSearching] = useState<boolean>(false);
  const [queueTime, setQueueTime] = useState<number>(0);
  const [leaders, setLeaders] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    if (!searching) { setQueueTime(0); return; }
    const id = setInterval(() => setQueueTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [searching]);

  useEffect(() => {
    let active = true;
    getLeaderboard('frontend', 5)
      .then((rows) => { if (active) setLeaders(rows); })
      .catch(() => { if (active) setLeaders([]); });
    return () => { active = false; };
  }, []);

  const toggleLang = (lang: string): void =>
    setSelectedLangs((prev) =>
      prev.includes(lang)
        ? prev.length > 1 ? prev.filter((l) => l !== lang) : prev
        : [...prev, lang]
    );

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(#ff7e5f 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />
        <div className="absolute -top-[10%] left-[20%] h-[600px] w-[600px] rounded-full bg-[color:var(--cg-coral-a18)] blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[5%] w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: 'rgba(167,139,250,0.06)' }} />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-8 py-12 space-y-10">

          {/* ── Hero ── */}
          <div className="text-center space-y-6 animate-fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-[14px] py-1 rounded-full text-[11px] font-bold tracking-[0.1em] uppercase text-[#ff9a7e]"
              style={{ border: '1px solid rgba(255,126,95,0.3)', background: 'rgba(255,126,95,0.08)' }}
            >
              ⚔️ {isVi ? 'Mùa 3 · Đang diễn ra' : 'Season 3 · Active'}
            </div>
            <h1 className="font-['Lexend'] text-6xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-[#ff7e5f] to-[#fbbf24] animate-pulse-glow">
              {isVi ? 'Đấu Trường' : 'The Colosseum'}
            </h1>
            <p className="mx-auto max-w-xl text-lg text-[color:var(--cg-text-muted)]">
              {isVi
                ? 'Chứng minh bản lĩnh trong những trận đấu code thời gian thực. Cược XP và leo bảng xếp hạng toàn cầu.'
                : 'Prove your worth in real-time coding battles. Wager your XP and climb the global rankings.'}
            </p>
          </div>

          {/* ── Stats Ticker ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🟢', label: isVi ? 'Đang online' : 'Online Now', value: '2,841', sub: isVi ? 'đấu sĩ' : 'gladiators' },
              { icon: '⚔️', label: isVi ? 'Trận đang diễn' : 'Active Battles', value: '124', sub: isVi ? 'ngay bây giờ' : 'right now' },
              { icon: '💰', label: isVi ? 'XP đã cược' : 'XP Wagered', value: '47.8k', sub: isVi ? 'hôm nay' : 'today' },
              { icon: '📅', label: isVi ? 'Mùa kết thúc' : 'Season Ends', value: '12d 4h', sub: isVi ? 'còn lại' : 'remaining' },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card px-[18px] py-[14px]"
              >
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[color:var(--cg-text-muted)] mb-1">{s.icon} {s.label}</div>
                <div className="text-2xl font-extrabold text-[color:var(--cg-text)] leading-none">{s.value}</div>
                <div className="text-[10px] text-[color:var(--cg-text-muted)] mt-[2px]">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-8 animate-fade-in-up delay-100">
              <MatchmakingPanel
                matchType={matchType} setMatchType={setMatchType}
                difficulty={difficulty} setDifficulty={setDifficulty}
                selectedLangs={selectedLangs} toggleLang={toggleLang}
                searching={searching} setSearching={setSearching}
                queueTime={queueTime} isVi={isVi}
              />
              <LiveSpectate matches={LIVE_MATCHES} isVi={isVi} />
              <RecentBattles battles={BATTLE_HISTORY} isVi={isVi} />
            </div>

            {/* Right sidebar */}
            <div className="space-y-6 animate-fade-in-up delay-200">
              <MyStats isVi={isVi} />
              <TournamentSpotlight isVi={isVi} />
              <TopGladiators leaders={leaders} isVi={isVi} />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}