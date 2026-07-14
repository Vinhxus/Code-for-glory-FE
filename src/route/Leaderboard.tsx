import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
import Header from '../components/layout/Header';
import { useSettingsStore } from '../store/settings';
import {
  getGlobalLeaderboard,
  getLeaderboard,
  type BattleField,
  type LeaderboardRow,
} from '../services/battlesApi';

const FIELD_TABS: { id: BattleField | 'global'; label: string; labelVi: string; icon: string; accent: string }[] = [
  { id: 'global', label: 'Global', labelVi: 'Toàn cục', icon: '🌐', accent: '#fbbf24' },
  { id: 'frontend', label: 'Frontend', labelVi: 'Frontend', icon: '🖥️', accent: '#ff7e5f' },
  { id: 'backend', label: 'Backend', labelVi: 'Backend', icon: '⚙️', accent: '#60a5fa' },
  { id: 'fullstack', label: 'Core Knowledge', labelVi: 'Core Knowledge', icon: '🧠', accent: '#a78bfa' },
];

const TIER_META: Record<string, { color: string; glow: string; label: string }> = {
  legend: { color: '#ff7e5f', glow: 'rgba(255,126,95,0.4)', label: 'Legend' },
  platinum: { color: '#60a5fa', glow: 'rgba(96,165,250,0.4)', label: 'Platinum' },
  gold: { color: '#fbbf24', glow: 'rgba(251,191,36,0.4)', label: 'Gold' },
  silver: { color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', label: 'Silver' },
  bronze: { color: '#cd7f32', glow: 'rgba(205,127,50,0.4)', label: 'Bronze' },
};

function getTierMeta(tier: string) {
  return TIER_META[tier.toLowerCase()] ?? { color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', label: tier };
}

const RANK_CROWN = ['👑', '🥈', '🥉'];

function TopThreeCard({ row, pos }: { row: LeaderboardRow; pos: number }) {
  const tier = getTierMeta(row.tier);
  const isFirst = pos === 0;
  return (
    <div
      className="relative flex flex-col items-center gap-3 rounded-3xl border p-6 transition-all duration-300 hover:scale-[1.03]"
      style={{
        background: isFirst
          ? `linear-gradient(135deg, ${tier.color}22 0%, rgba(15,23,42,0.8) 100%)`
          : 'rgba(255,255,255,0.03)',
        borderColor: isFirst ? `${tier.color}55` : 'rgba(255,255,255,0.08)',
        boxShadow: isFirst ? `0 0 40px ${tier.glow}` : 'none',
        order: pos === 1 ? -1 : pos === 2 ? 1 : 0,
      }}
    >
      {isFirst && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest"
          style={{ background: tier.color, color: '#0a0f1e' }}
        >
          Champion
        </div>
      )}
      <span className="text-3xl">{RANK_CROWN[pos] ?? `#${pos + 1}`}</span>

      {/* Avatar */}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black"
        style={{ background: `${tier.color}22`, border: `2px solid ${tier.color}55`, color: tier.color }}
      >
        {row.username.charAt(0).toUpperCase()}
      </div>

      <div className="text-center">
        <div className="font-['Lexend'] text-base font-bold text-[color:var(--cg-text)]">{row.username}</div>
        <div
          className="mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: tier.color, background: `${tier.color}18` }}
        >
          {tier.label}
        </div>
      </div>

      <div className="flex items-center gap-4 text-center">
        <div>
          <div className="text-2xl font-black" style={{ color: tier.color }}>{row.ratingPoints.toLocaleString()}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--cg-text-muted)]">Rating</div>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div>
          <div className="text-xl font-bold text-[color:var(--cg-text)]">{Math.round(row.winRate * 100)}%</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--cg-text-muted)]">WR</div>
        </div>
      </div>
    </div>
  );
}

function RankRow({ row, delay }: { row: LeaderboardRow; delay: number }) {
  const tier = getTierMeta(row.tier);
  const fieldAccent =
    row.field === 'frontend' ? '#ff7e5f' : row.field === 'backend' ? '#60a5fa' : '#a78bfa';
  const fieldLabel =
    row.field === 'frontend' ? 'FE' : row.field === 'backend' ? 'BE' : 'Core';

  return (
    <div
      className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05] animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Rank */}
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black"
        style={
          row.rank <= 3
            ? { background: `${tier.color}22`, color: tier.color }
            : { color: 'var(--cg-text-muted)', background: 'rgba(255,255,255,0.04)' }
        }
      >
        {row.rank <= 3 ? RANK_CROWN[row.rank - 1] : `#${row.rank}`}
      </div>

      {/* Avatar */}
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
        style={{ background: `${tier.color}18`, color: tier.color }}
      >
        {row.username.charAt(0).toUpperCase()}
      </div>

      {/* Name + tier */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-[color:var(--cg-text)]">{row.username}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
            style={{ color: tier.color, background: `${tier.color}18` }}
          >
            {tier.label}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{ color: fieldAccent, background: `${fieldAccent}18` }}
          >
            {fieldLabel}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-5 text-right">
        <div>
          <div className="text-xs text-[color:var(--cg-text-muted)]">{row.totalBattles} battles</div>
          <div className="text-[10px] text-[color:var(--cg-text-muted)] opacity-60">
            {row.wins}W · {row.losses}L · {row.draws}D
          </div>
        </div>
        <div className="w-12">
          <div className="text-xs font-bold text-[color:var(--cg-text)]">{Math.round(row.winRate * 100)}%</div>
          <div className="mt-1 h-1 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round(row.winRate * 100)}%`, background: tier.color }}
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="text-right flex-shrink-0">
        <div className="text-base font-black" style={{ color: tier.color }}>
          {row.ratingPoints.toLocaleString()}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--cg-text-muted)]">pts</div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [activeTab, setActiveTab] = useState<BattleField | 'global'>('global');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    const fetch = async () => {
      try {
        const data =
          activeTab === 'global'
            ? await getGlobalLeaderboard(50)
            : await getLeaderboard(activeTab as BattleField, 50);
        if (active) setRows(data);
      } catch {
        if (active) setError(isVi ? 'Không tải được dữ liệu.' : 'Failed to load leaderboard.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetch();
    return () => { active = false; };
  }, [activeTab, isVi]);

  const top3 = useMemo(() => rows.slice(0, 3), [rows]);
  const rest = useMemo(() => rows.slice(3), [rows]);

  const activeTabMeta = FIELD_TABS.find((t) => t.id === activeTab)!;

  const summary = useMemo(() => {
    if (!rows.length) return null;
    const totalBattles = rows.reduce((s, r) => s + r.totalBattles, 0);
    const avgWinRate = rows.length > 0 ? rows.reduce((s, r) => s + r.winRate, 0) / rows.length : 0;
    return { totalBattles, avgWinRate };
  }, [rows]);

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute -top-[15%] left-[5%] h-[600px] w-[600px] rounded-full blur-[160px]" style={{ background: 'rgba(251,191,36,0.1)' }} />
        <div className="absolute top-[30%] right-[-10%] h-[500px] w-[500px] rounded-full blur-[150px]" style={{ background: 'rgba(167,139,250,0.08)' }} />
        <div className="absolute bottom-[-10%] left-[30%] h-[400px] w-[400px] rounded-full blur-[130px]" style={{ background: 'rgba(255,126,95,0.07)' }} />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <Header />
        <main className="mx-auto max-w-5xl px-6 py-12 pt-22 space-y-10">

          <div className="flex justify-start">
            <button
              onClick={() => navigate('/')}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-5 py-2.5 text-sm font-bold transition hover:bg-[color:var(--cg-container-a22)] hover:border-[#ff7e5f]/40 group animate-fade-in-up"
            >
              <span className="material-symbols-outlined text-[18px] text-[#ff7e5f] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              {isVi ? 'Quay lại' : 'Back'}
            </button>
          </div>

          {/* Hero */}
          <section className="space-y-4 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#fbbf24]/25 bg-[#fbbf24]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#fbbf24]">
              <span className="material-symbols-outlined text-[15px]">leaderboard</span>
              {isVi ? 'Bảng xếp hạng toàn cầu' : 'Global Rankings'}
            </div>
            <h1 className="font-['Lexend'] text-4xl font-black tracking-tight md:text-5xl">
              <span className="bg-gradient-to-r from-[#fbbf24] via-[#ff7e5f] to-[#a78bfa] bg-clip-text text-transparent">
                {isVi ? 'Leaderboard' : 'Leaderboard'}
              </span>
              <br />
              <span className="text-[color:var(--cg-text)]">{isVi ? 'Chiến binh xuất sắc nhất' : 'Top Warriors'}</span>
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--cg-text-muted)]">
              {isVi
                ? 'Theo dõi thứ hạng của những người giỏi nhất nền tảng theo từng lĩnh vực. Chinh phục đỉnh cao — tên bạn sẽ ở đây.'
                : 'Track the top performers across every discipline. Conquer the leaderboard — your name belongs here.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/battle')}
              className="neon-btn px-6 py-3 text-sm font-extrabold"
            >
              {isVi ? 'Tham chiến ngay' : 'Enter Battle'} →
            </button>
          </section>

          {/* Summary stats */}
          {summary && (
            <section className="grid grid-cols-2 gap-4 md:grid-cols-4 animate-fade-in-up">
              {[
                { label: isVi ? 'Người chơi' : 'Players', value: rows.length.toString(), icon: 'groups', color: '#fbbf24' },
                { label: isVi ? 'Tổng trận' : 'Total Battles', value: summary.totalBattles.toLocaleString(), icon: 'swords', color: '#ff7e5f' },
                { label: isVi ? 'WR trung bình' : 'Avg. Win Rate', value: `${Math.round(summary.avgWinRate * 100)}%`, icon: 'trending_up', color: '#4ade80' },
                { label: isVi ? 'Tier cao nhất' : 'Top Tier', value: rows[0] ? getTierMeta(rows[0].tier).label : '–', icon: 'emoji_events', color: '#a78bfa' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px]" style={{ color: s.color }}>{s.icon}</span>
                  <div>
                    <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--cg-text-muted)]">{s.label}</div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Field tabs */}
          <div className="flex flex-wrap gap-2">
            {FIELD_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="rounded-full px-4 py-2 text-sm font-bold transition-all duration-200"
                  style={{
                    color: isActive ? tab.accent : 'var(--cg-text-muted)',
                    border: isActive ? `1px solid ${tab.accent}` : '1px solid rgba(255,255,255,0.08)',
                    background: isActive ? `${tab.accent}16` : 'rgba(255,255,255,0.03)',
                    boxShadow: isActive ? `0 0 20px ${tab.accent}30` : 'none',
                  }}
                >
                  {tab.icon} {isVi ? tab.labelVi : tab.label}
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && rows.length === 0 && (
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-8 py-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-[color:var(--cg-text-muted)]">leaderboard</span>
              <div className="mt-4 text-base font-semibold text-[color:var(--cg-text-muted)]">
                {isVi ? 'Chưa có dữ liệu xếp hạng' : 'No ranking data yet'}
              </div>
              <p className="mt-2 text-sm text-[color:var(--cg-text-muted)] opacity-70">
                {isVi ? 'Hãy là người đầu tiên thi đấu!' : 'Be the first to compete!'}
              </p>
              <button type="button" onClick={() => navigate('/battle')} className="mt-6 neon-btn px-6 py-2.5 text-sm">
                {isVi ? 'Vào battle' : 'Start Battle'}
              </button>
            </div>
          )}

          {!isLoading && !error && rows.length > 0 && (
            <>
              {/* Top 3 Podium */}
              {top3.length >= 3 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: activeTabMeta.accent }}>
                    <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                    {isVi ? 'Bục vinh danh' : 'Podium'}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-end">
                    {/* Silver (pos 1) */}
                    <TopThreeCard row={top3[1]} pos={1} />
                    {/* Gold (pos 0) */}
                    <TopThreeCard row={top3[0]} pos={0} />
                    {/* Bronze (pos 2) */}
                    <TopThreeCard row={top3[2]} pos={2} />
                  </div>
                </section>
              )}

              {/* Full Table */}
              {rest.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: activeTabMeta.accent }}>
                      <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
                      {isVi ? 'Bảng xếp hạng đầy đủ' : 'Full Rankings'}
                    </div>
                    <span className="text-[11px] text-[color:var(--cg-text-muted)]">
                      {isVi ? `${rows.length} người chơi` : `${rows.length} players`}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="hidden sm:flex items-center gap-4 px-5 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
                      <div className="w-9">#</div>
                      <div className="w-9" />
                      <div className="flex-1">Player</div>
                      <div className="w-32 text-right">Battles</div>
                      <div className="w-12 text-right">WR</div>
                      <div className="w-16 text-right">Rating</div>
                    </div>
                    {rest.map((row, i) => (
                      <RankRow key={`${row.userId}-${row.field}`} row={row} delay={i * 30} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* CTA bottom */}
          <section className="rounded-3xl border border-[#fbbf24]/20 bg-gradient-to-br from-[#fbbf24]/10 via-transparent to-[#a78bfa]/10 p-8 text-center space-y-4">
            <div className="text-2xl">🏆</div>
            <h2 className="font-['Lexend'] text-xl font-bold">
              {isVi ? 'Muốn tên bạn ở đây?' : 'Want your name here?'}
            </h2>
            <p className="text-sm text-[color:var(--cg-text-muted)]">
              {isVi
                ? 'Tham gia battle để tích lũy rating và leo lên bảng xếp hạng.'
                : 'Join battles to accumulate rating and climb the leaderboard.'}
            </p>
            <button type="button" onClick={() => navigate('/battle')} className="neon-btn px-8 py-3 text-sm font-extrabold">
              {isVi ? 'Bắt đầu chinh phục' : 'Start Climbing'} →
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
