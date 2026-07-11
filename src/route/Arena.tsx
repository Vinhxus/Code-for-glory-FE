import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
import Header from '../components/layout/Header';
import { useSettingsStore } from '../store/settings';
import {
  getArenaOverview,
  getLeaderboard,
  type ArenaFocusLane,
  type ArenaKnowledgeTrack,
  type ArenaOverview,
  type ArenaTournament,
  type BattleField,
  type LeaderboardRow,
} from '../services/battlesApi';

const FIELD_META: Record<
  BattleField,
  { icon: string; accent: string; soft: string; labelVi: string; labelEn: string }
> = {
  frontend: {
    icon: '🖥️',
    accent: '#ff7e5f',
    soft: 'rgba(255,126,95,0.12)',
    labelVi: 'Frontend',
    labelEn: 'Frontend',
  },
  backend: {
    icon: '⚙️',
    accent: '#60a5fa',
    soft: 'rgba(96,165,250,0.12)',
    labelVi: 'Backend',
    labelEn: 'Backend',
  },
  fullstack: {
    icon: '🧠',
    accent: '#a78bfa',
    soft: 'rgba(167,139,250,0.12)',
    labelVi: 'Core Knowledge',
    labelEn: 'Core Knowledge',
  },
};

const LEADERBOARD_FIELDS: BattleField[] = ['frontend', 'backend', 'fullstack'];

const TIER_COLORS: Record<string, string> = {
  legend: '#ff7e5f',
  platinum: '#60a5fa',
  gold: '#fbbf24',
  silver: '#94a3b8',
  bronze: '#cd7f32',
};

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff9a7e]">
        {eyebrow}
      </div>
      <div className="space-y-2">
        <h2 className="font-['Lexend'] text-3xl font-bold tracking-tight text-[color:var(--cg-text)]">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--cg-text-muted)]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function LeaderboardCard({
  title,
  rows,
  accent,
  isVi,
}: {
  title: string;
  rows: LeaderboardRow[];
  accent: string;
  isVi: boolean;
}) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-['Lexend'] text-lg font-bold">{title}</h3>
        <span
          className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}33` }}
        >
          {isVi ? 'Top 5' : 'Top 5'}
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-6 text-sm text-[color:var(--cg-text-muted)]">
          {isVi ? 'Chưa có dữ liệu xếp hạng.' : 'No ranking data yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.userId}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl font-black"
                style={{ background: `${accent}1a`, color: accent }}
              >
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-[color:var(--cg-text)]">
                  {row.username}
                </div>
                <div className="text-[11px] text-[color:var(--cg-text-muted)]">
                  {row.totalBattles} {isVi ? 'trận' : 'matches'} · {row.winRate}% WR
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-[#fbbf24]">
                  {row.ratingPoints}
                </div>
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{
                    color: TIER_COLORS[row.tier.toLowerCase()] ?? '#94a3b8',
                  }}
                >
                  {row.tier}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TournamentCard({
  item,
  isVi,
  activeField,
}: {
  item: ArenaTournament;
  isVi: boolean;
  activeField: BattleField;
}) {
  const meta =
    item.field === 'all'
      ? {
          icon: '🌐',
          accent: '#e2e8f0',
          label: isVi ? 'Mọi lane' : 'All lanes',
        }
      : {
          icon: FIELD_META[item.field].icon,
          accent: FIELD_META[item.field].accent,
          label: isVi ? FIELD_META[item.field].labelVi : FIELD_META[item.field].labelEn,
        };
  const isHighlighted = item.field === 'all' || item.field === activeField;

  return (
    <div
      className="glass-card p-5 space-y-4 transition-all"
      style={{
        border: isHighlighted ? `1px solid ${meta.accent}33` : '1px solid rgba(255,255,255,0.08)',
        background: isHighlighted
          ? `linear-gradient(135deg, ${meta.accent}14, rgba(15,23,42,0.6))`
          : 'rgba(255,255,255,0.03)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ color: meta.accent, background: `${meta.accent}18` }}
          >
            <span>{meta.icon}</span>
            {meta.label}
          </div>
          <div>
            <h3 className="font-['Lexend'] text-lg font-bold text-[color:var(--cg-text)]">
              {item.title}
            </h3>
            <p className="text-xs text-[color:var(--cg-text-muted)]">
              {item.organizer}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[color:var(--cg-text-muted)]">
          {item.level}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--cg-text-muted)]">
            {isVi ? 'Nhịp độ' : 'Cadence'}
          </div>
          <div className="font-semibold text-[color:var(--cg-text)]">{item.cadence}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[color:var(--cg-text-muted)]">
            {isVi ? 'Format' : 'Format'}
          </div>
          <div className="font-semibold text-[color:var(--cg-text)]">{item.format}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {item.focus.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] text-[color:var(--cg-text-muted)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="text-sm leading-6 text-[color:var(--cg-text-muted)]">{item.note}</p>

      <a
        href={item.link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ color: meta.accent }}
      >
        {isVi ? 'Mở nguồn chính thức' : 'Open official source'}
        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
      </a>
    </div>
  );
}

function FocusLanePanel({
  lane,
  track,
  isVi,
}: {
  lane: ArenaFocusLane;
  track?: ArenaKnowledgeTrack;
  isVi: boolean;
}) {
  const meta = FIELD_META[lane.field];
  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ color: meta.accent, background: meta.soft }}
          >
            <span>{meta.icon}</span>
            {isVi ? meta.labelVi : meta.labelEn}
          </div>
          <div>
            <h3 className="font-['Lexend'] text-2xl font-bold">{lane.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--cg-text-muted)]">
              {lane.summary}
            </p>
          </div>
        </div>
        <div
          className="rounded-3xl border px-4 py-4 lg:w-[260px]"
          style={{ borderColor: `${meta.accent}33`, background: `${meta.accent}12` }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
            {isVi ? 'Match profile' : 'Match profile'}
          </div>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[color:var(--cg-text-muted)]">
                {isVi ? 'Độ khó' : 'Difficulty'}
              </span>
              <span className="font-semibold">{lane.difficulty}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[color:var(--cg-text-muted)]">
                {isVi ? 'Kiểu battle' : 'Battle style'}
              </span>
              <span className="font-semibold text-right">{lane.matchType}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[color:var(--cg-text-muted)]">
                {isVi ? 'Queue dự kiến' : 'Expected queue'}
              </span>
              <span className="font-semibold">{lane.estimatedQueue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-5">
          <div>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
              {isVi ? 'Chủ đề trọng tâm' : 'Focus topics'}
            </div>
            <div className="flex flex-wrap gap-2">
              {lane.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[12px] text-[color:var(--cg-text)]"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
              {isVi ? 'Kết quả kỳ vọng' : 'Expected outcomes'}
            </div>
            <div className="grid gap-3">
              {lane.outcomes.map((outcome) => (
                <div
                  key={outcome}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-[color:var(--cg-text-muted)]"
                >
                  {outcome}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
              {isVi ? 'Platforms nên theo dõi' : 'Platforms to follow'}
            </div>
            <div className="flex flex-wrap gap-2">
              {lane.platforms.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full border border-white/8 px-3 py-1.5 text-xs font-semibold"
                  style={{ color: meta.accent, background: `${meta.accent}12` }}
                >
                  {platform}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-[color:var(--cg-text-muted)]">
              {lane.highlight}
            </p>
          </div>

          {track && (
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
                {isVi ? 'Knowledge map' : 'Knowledge map'}
              </div>
              <div className="space-y-4">
                {track.milestones.map((milestone, index) => (
                  <div key={milestone.title} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-black"
                        style={{ color: meta.accent, background: `${meta.accent}18` }}
                      >
                        {index + 1}
                      </div>
                      {index < track.milestones.length - 1 && (
                        <div className="mt-2 h-full w-px bg-white/8" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="font-semibold text-[color:var(--cg-text)]">
                        {milestone.title}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                        {milestone.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Arena() {
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const [overview, setOverview] = useState<ArenaOverview | null>(null);
  const [leaders, setLeaders] = useState<Record<BattleField, LeaderboardRow[]>>({
    frontend: [],
    backend: [],
    fullstack: [],
  });
  const [activeField, setActiveField] = useState<BattleField>('frontend');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [overviewData, frontRows, backRows, coreRows] = await Promise.all([
          getArenaOverview(),
          getLeaderboard('frontend', 5).catch(() => []),
          getLeaderboard('backend', 5).catch(() => []),
          getLeaderboard('fullstack', 5).catch(() => []),
        ]);

        if (!active) return;
        setOverview(overviewData);
        setLeaders({
          frontend: frontRows,
          backend: backRows,
          fullstack: coreRows,
        });
        setError(null);
      } catch {
        if (!active) return;
        setError(
          isVi
            ? 'Không tải được dữ liệu Arena. Vui lòng thử lại.'
            : 'Failed to load arena data. Please try again.',
        );
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchData();
    return () => {
      active = false;
    };
  }, [isVi]);

  const activeLane = useMemo(
    () => overview?.focusLanes.find((item) => item.field === activeField),
    [overview, activeField],
  );

  const activeTrack = useMemo(
    () => overview?.knowledgeTracks.find((item) => item.field === activeField),
    [overview, activeField],
  );

  const filteredTournaments = useMemo(
    () =>
      overview?.tournaments.filter(
        (item) => item.field === 'all' || item.field === activeField,
      ) ?? [],
    [overview, activeField],
  );

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#ff7e5f 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-[12%] left-[8%] h-[520px] w-[520px] rounded-full bg-[color:var(--cg-coral-a18)] blur-[150px]" />
        <div
          className="absolute top-[22%] right-[-10%] h-[560px] w-[560px] rounded-full blur-[150px]"
          style={{ background: 'rgba(96,165,250,0.08)' }}
        />
        <div
          className="absolute bottom-[-12%] left-[25%] h-[460px] w-[460px] rounded-full blur-[140px]"
          style={{ background: 'rgba(167,139,250,0.08)' }}
        />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <Header />
        <main className="mx-auto flex max-w-7xl flex-col gap-10 px-8 py-12 pt-22">
          <section className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ff7e5f]/25 bg-[#ff7e5f]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff9a7e]">
                <span className="material-symbols-outlined text-[15px]">stadia_controller</span>
                {overview?.season.badge ?? (isVi ? 'Arena Season' : 'Arena Season')}
              </div>

              <div className="space-y-4">
                <h1 className="font-['Lexend'] text-5xl font-black tracking-tight md:text-6xl">
                  <span className="bg-gradient-to-r from-[#ff7e5f] via-[#fbbf24] to-[#a78bfa] bg-clip-text text-transparent">
                    {isVi ? 'Arena chuyên nghiệp' : 'Professional Arena'}
                  </span>
                  <br />
                  <span className="text-[color:var(--cg-text)]">
                    {isVi ? 'cho FE, BE và core knowledge' : 'for FE, BE, and core knowledge'}
                  </span>
                </h1>
                <p className="max-w-3xl text-base leading-8 text-[color:var(--cg-text-muted)]">
                  {overview?.season.subtitle ??
                    (isVi
                      ? 'Xây một hub thi đấu và luyện kỹ năng có định hướng: chọn lane, xem lịch giải tham khảo, bám roadmap kiến thức rồi bước vào battle thật.'
                      : 'Build a focused competitive hub: choose a lane, follow tournament references, learn from skill tracks, then jump into real battles.')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/battle')}
                  className="neon-btn px-7 py-3 text-sm font-extrabold"
                >
                  {isVi ? 'Vào battle ngay' : 'Enter battle'} →
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  className="rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-6 py-3 text-sm font-semibold transition hover:border-white/20 hover:bg-[color:var(--cg-container-a22)]"
                >
                  {isVi ? 'Xem lịch sử thi đấu' : 'View battle history'}
                </button>
              </div>
            </div>

            <div className="glass-card p-6 space-y-5 animate-fade-in-up delay-150">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
                    {isVi ? 'Quick launch' : 'Quick launch'}
                  </div>
                  <h2 className="mt-2 font-['Lexend'] text-2xl font-bold">
                    {isVi ? 'Battle modes' : 'Battle modes'}
                  </h2>
                </div>
                <span className="badge-amber">{isVi ? 'Live' : 'Live'}</span>
              </div>

              {[
                {
                  icon: '⚡',
                  title: isVi ? 'Speed mode' : 'Speed mode',
                  desc: isVi
                    ? 'Warm-up nhanh, áp lực thời gian cao, hợp phản xạ contest.'
                    : 'Short warm-up format with higher time pressure.',
                  stats: '1 question · 10m',
                },
                {
                  icon: '🚀',
                  title: isVi ? 'Performance mode' : 'Performance mode',
                  desc: isVi
                    ? 'Chuỗi câu hỏi sâu hơn cho interview, reasoning và kiến thức production.'
                    : 'Deeper question chain for interviews and production reasoning.',
                  stats: '2–3 questions · 30m',
                },
              ].map((mode) => (
                <div
                  key={mode.title}
                  className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
                        {mode.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-[color:var(--cg-text)]">
                          {mode.title}
                        </div>
                        <div className="text-xs text-[color:var(--cg-text-muted)]">
                          {mode.stats}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                    {mode.desc}
                  </p>
                </div>
              ))}

              <div className="rounded-3xl border border-[#a78bfa]/25 bg-[#a78bfa]/10 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#c4b5fd]">
                  {isVi ? 'Gợi ý luồng sử dụng' : 'Suggested flow'}
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--cg-text-muted)]">
                  {isVi
                    ? 'Bắt đầu ở Core Knowledge nếu user mới, sau đó chuyển dần sang Frontend hoặc Backend để luyện đúng hướng nghề nghiệp.'
                    : 'Start from Core Knowledge for newer users, then specialize into Frontend or Backend as confidence grows.'}
                </p>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-3xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(overview?.stats ?? []).map((item) => (
              <div key={item.key} className="glass-card px-5 py-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--cg-text-muted)]">
                  {item.label}
                </div>
                <div
                  className="mt-3 text-3xl font-black tracking-tight"
                  style={{ color: item.accent }}
                >
                  {item.value}
                </div>
                <div className="mt-2 text-xs leading-6 text-[color:var(--cg-text-muted)]">
                  {item.subtitle}
                </div>
              </div>
            ))}
            {isLoading && !overview && (
              <>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="glass-card h-[122px] animate-pulse bg-white/[0.03]"
                  />
                ))}
              </>
            )}
          </section>

          <section className="space-y-6">
            <SectionHeading
              eyebrow={isVi ? 'Skill lanes' : 'Skill lanes'}
              title={isVi ? 'Chọn lane luyện tập' : 'Pick your practice lane'}
              subtitle={
                isVi
                  ? 'Mỗi lane được thiết kế như một hướng rèn luyện riêng: có chủ đề trọng tâm, outcome kỳ vọng, platform nên theo dõi và knowledge map đi kèm.'
                  : 'Each lane is tuned for a different growth path, with focused topics, expected outcomes, external references, and a matching knowledge map.'
              }
            />

            <div className="flex flex-wrap gap-3">
              {LEADERBOARD_FIELDS.map((field) => {
                const meta = FIELD_META[field];
                const isActive = activeField === field;
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => setActiveField(field)}
                    className="rounded-full px-4 py-2 text-sm font-bold transition-all"
                    style={{
                      color: isActive ? meta.accent : 'var(--cg-text-muted)',
                      border: isActive
                        ? `1px solid ${meta.accent}`
                        : '1px solid rgba(255,255,255,0.08)',
                      background: isActive ? `${meta.accent}16` : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {meta.icon} {isVi ? meta.labelVi : meta.labelEn}
                  </button>
                );
              })}
            </div>

            {activeLane && (
              <FocusLanePanel lane={activeLane} track={activeTrack} isVi={isVi} />
            )}
          </section>

          <section className="space-y-6">
            <SectionHeading
              eyebrow={isVi ? 'Tournament references' : 'Tournament references'}
              title={isVi ? 'Lịch và nền tảng nên theo dõi' : 'Schedules and platforms to follow'}
              subtitle={
                isVi
                  ? 'Danh sách này dùng làm nguồn tham khảo để user biết nên luyện ở đâu và theo nhịp nào. Mỗi card mở ra nguồn chính thức của nền tảng tương ứng.'
                  : 'This list acts as a professional reference so users know what to follow and how often to train. Each card links directly to the official platform source.'
              }
            />

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {filteredTournaments.map((item) => (
                <TournamentCard
                  key={item.id}
                  item={item}
                  isVi={isVi}
                  activeField={activeField}
                />
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <SectionHeading
              eyebrow={isVi ? 'Leaderboards' : 'Leaderboards'}
              title={isVi ? 'Top user theo từng lane' : 'Top users by lane'}
              subtitle={
                isVi
                  ? 'Bảng xếp hạng được kéo trực tiếp từ API battles hiện tại để Arena không còn là trang tĩnh. User có thể nhìn rõ chất lượng cạnh tranh theo từng lane.'
                  : 'These rankings are loaded from the live battles API so the Arena no longer feels static. Users can immediately see competitive depth in each lane.'
              }
            />

            <div className="grid gap-5 xl:grid-cols-3">
              {LEADERBOARD_FIELDS.map((field) => (
                <LeaderboardCard
                  key={field}
                  title={isVi ? FIELD_META[field].labelVi : FIELD_META[field].labelEn}
                  rows={leaders[field]}
                  accent={FIELD_META[field].accent}
                  isVi={isVi}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
