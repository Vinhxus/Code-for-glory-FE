import { useParams, useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import { useEventsStore } from '../feature/events/EventStore';
import { EVENTS } from '../feature/events/events.data';
import CountdownTimer from '../feature/events/CountdownTimer';

const COLOR_MAP: Record<
  string,
  { badge: string; bar: string; accent: string; glow: string }
> = {
  coral: {
    badge: 'text-[#ff7e5f] bg-[#ff7e5f1a] border border-[#ff7e5f40]',
    bar: '#ff7e5f',
    accent: '#ff7e5f',
    glow: 'rgba(255,126,95,0.08)',
  },
  purple: {
    badge: 'text-[#a78bfa] bg-[#a78bfa1a] border border-[#a78bfa40]',
    bar: '#a78bfa',
    accent: '#a78bfa',
    glow: 'rgba(167,139,250,0.08)',
  },
  amber: {
    badge: 'text-[#fbbf24] bg-[#fbbf241a] border border-[#fbbf2440]',
    bar: '#fbbf24',
    accent: '#fbbf24',
    glow: 'rgba(251,191,36,0.08)',
  },
};

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  Ongoing: { dot: 'bg-[#4ade80] animate-status-pulse', text: 'text-[#4ade80]' },
  'Registration Open': { dot: 'bg-[#60a5fa]', text: 'text-[#60a5fa]' },
  Upcoming: { dot: 'bg-[#60a5fa]', text: 'text-[#60a5fa]' },
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  const { toggleRegistration, isRegistered, toggleBookmark, isBookmarked } =
    useEventsStore();

  const event = EVENTS.find((ev) => ev.id === Number(id));

  if (!event) {
    return (
      <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
        <SideNav />
        <div className="relative z-10 md:pl-[96px]">
          <main className="max-w-4xl mx-auto px-8 py-16 animate-fade-in-up">
            <div className="glass-card p-16 text-center space-y-4">
              <span className="material-symbols-outlined text-[64px] text-[color:var(--cg-text-muted)] opacity-40">
                event_busy
              </span>
              <h2 className="font-['Lexend'] text-2xl font-bold text-[color:var(--cg-text)]">
                {isVi ? 'Không tìm thấy sự kiện' : 'Event Not Found'}
              </h2>
              <p className="text-[color:var(--cg-text-muted)]">
                {isVi
                  ? 'Sự kiện bạn tìm không tồn tại hoặc đã bị xóa.'
                  : "The event you're looking for doesn't exist or has been removed."}
              </p>
              <button
                onClick={() => navigate('/events')}
                className="mt-4 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#6c5dd3] to-[#9c5dd3] text-white hover:opacity-85 transition-opacity"
              >
                ← {isVi ? 'Quay về danh sách sự kiện' : 'Back to Events'}
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const colors = COLOR_MAP[event.color];
  const registered = isRegistered(event.id);
  const saved = isBookmarked(event.id);
  const statusStyle = STATUS_STYLES[event.status] ?? STATUS_STYLES['Upcoming'];
  const pct = event.maxParticipants
    ? Math.round((event.participants / event.maxParticipants) * 100)
    : null;
  const remaining = event.maxParticipants
    ? event.maxParticipants - event.participants
    : null;

  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(${colors.accent} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div
          className="absolute -top-[10%] right-[15%] h-[500px] w-[500px] rounded-full blur-[160px]"
          style={{ background: colors.glow }}
        />
        <div
          className="absolute bottom-[-10%] left-[5%] h-[400px] w-[400px] rounded-full blur-[140px]"
          style={{ background: 'rgba(167,139,250,0.05)' }}
        />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-4xl mx-auto px-6 md:px-8 py-12 space-y-8 animate-fade-in-up">
          {/* ── Back Button ── */}
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-sm font-semibold text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] transition-colors group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            {isVi ? 'Quay về danh sách sự kiện' : 'Back to Events'}
          </button>

          {/* ── Hero Banner ── */}
          <div
            className="relative overflow-hidden rounded-2xl p-8 md:p-10"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}22 0%, rgba(255,255,255,0.03) 60%)`,
              border: `1px solid ${colors.accent}44`,
              boxShadow: `0 8px 40px ${colors.accent}18`,
            }}
          >
            {/* Top shimmer */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${colors.accent} 50%, transparent 100%)`,
              }}
            />
            {/* Glow orb */}
            <div
              className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
              style={{ background: colors.accent }}
            />

            <div className="relative z-10 space-y-5">
              {/* Badges row */}
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}
                >
                  {event.type}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-[color:var(--cg-text-muted)]">
                  <span className="material-symbols-outlined text-[15px]">
                    calendar_today
                  </span>
                  {event.date}
                </span>
                <div
                  className={`flex items-center gap-1.5 text-xs font-bold ${statusStyle.text}`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                  />
                  {event.status}
                </div>
              </div>

              {/* Title */}
              <h1 className="font-['Lexend'] text-4xl md:text-5xl font-black tracking-tight text-[color:var(--cg-text)] leading-tight">
                {event.title}
              </h1>

              {/* Reward */}
              <div
                className="flex items-center gap-2 text-lg font-bold"
                style={{ color: colors.accent }}
              >
                <span className="material-symbols-outlined text-[22px]">
                  workspace_premium
                </span>
                {isVi ? 'Phần thưởng' : 'Reward'}: {event.reward}
              </div>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-[color:var(--cg-text-muted)] border border-[color:var(--cg-border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Main Content Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column — Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="glass-card p-6 space-y-3">
                <h3 className="font-['Lexend'] text-lg font-bold text-[color:var(--cg-text)] flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ color: colors.accent }}
                  >
                    info
                  </span>
                  {isVi ? 'Mô tả sự kiện' : 'About This Event'}
                </h3>
                <p className="text-sm text-[color:var(--cg-text-muted)] leading-relaxed">
                  {event.desc}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    icon: 'group',
                    val: event.participants.toLocaleString(),
                    lbl: isVi ? 'Đã đăng ký' : 'Registered',
                    color: '#60a5fa',
                  },
                  {
                    icon: 'groups',
                    val: event.maxParticipants?.toLocaleString() ?? '∞',
                    lbl: isVi ? 'Sức chứa' : 'Capacity',
                    color: '#a78bfa',
                  },
                  {
                    icon: 'schedule',
                    val: event.duration,
                    lbl: isVi ? 'Thời lượng' : 'Duration',
                    color: '#4ade80',
                  },
                ].map((s) => (
                  <div
                    key={s.lbl}
                    className="glass-card px-4 py-5 flex flex-col items-center gap-1 text-center"
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ color: s.color }}
                    >
                      {s.icon}
                    </span>
                    <span className="text-xl font-extrabold text-[color:var(--cg-text)]">
                      {s.val}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--cg-text-muted)]">
                      {s.lbl}
                    </span>
                  </div>
                ))}
              </div>

              {/* Registration Progress */}
              {pct !== null && (
                <div className="glass-card p-6 space-y-3">
                  <h3 className="text-xs font-bold text-[color:var(--cg-text-muted)] uppercase tracking-widest">
                    {isVi ? 'Tiến độ đăng ký' : 'Registration Progress'}
                  </h3>
                  <div className="h-3 bg-[color:var(--cg-container-a16)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${colors.accent}cc, ${colors.accent})`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[color:var(--cg-text-muted)]">
                    <span>
                      {pct}% {isVi ? 'đã đầy' : 'filled'}
                    </span>
                    <span className="text-white font-semibold">
                      {remaining?.toLocaleString()}{' '}
                      {isVi ? 'chỗ còn trống' : 'spots remaining'}
                    </span>
                  </div>
                </div>
              )}

              {/* Prizes */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-['Lexend'] text-lg font-bold text-[color:var(--cg-text)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#fbbf24]">
                    emoji_events
                  </span>
                  {isVi ? 'Giải thưởng' : 'Prizes & Rewards'}
                </h3>
                <div className="flex flex-col gap-3">
                  {event.prizes.map((prize, i) => (
                    <div
                      key={prize.name}
                      className="flex items-center gap-4 rounded-xl px-5 py-4 transition-all hover:scale-[1.01]"
                      style={{
                        background: `${prize.color}0a`,
                        border: `1px solid ${prize.color}25`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${prize.color}18` }}
                      >
                        <span
                          className="material-symbols-outlined text-[22px]"
                          style={{ color: prize.color }}
                        >
                          {prize.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[color:var(--cg-text)]">
                          {prize.name}
                        </div>
                        <div className="text-xs text-[color:var(--cg-text-muted)]">
                          {i === 0
                            ? isVi
                              ? 'Giải nhất'
                              : 'Grand Prize'
                            : isVi
                              ? 'Giải thưởng'
                              : 'Prize'}
                        </div>
                      </div>
                      <span
                        className="font-extrabold text-sm tabular-nums"
                        style={{ color: prize.color }}
                      >
                        {prize.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — Sidebar */}
            <div className="space-y-6">
              {/* Countdown */}
              {event.status !== 'Ongoing' && (
                <div className="glass-card p-6 space-y-3">
                  <h3 className="text-xs font-bold text-[color:var(--cg-text-muted)] uppercase tracking-widest">
                    {isVi ? 'Bắt đầu sau' : 'Starts In'}
                  </h3>
                  <CountdownTimer target={event.target} status={event.status} />
                </div>
              )}

              {/* Actions */}
              <div className="glass-card p-6 space-y-4">
                <button
                  onClick={() => toggleRegistration(event.id)}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all hover:opacity-85 active:scale-[0.98] ${
                    registered
                      ? 'bg-gradient-to-r from-[#1a6b3c] to-[#15803d] text-white'
                      : 'text-white'
                  }`}
                  style={
                    !registered
                      ? {
                          background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`,
                        }
                      : undefined
                  }
                >
                  {registered
                    ? isVi
                      ? '✓ Đã đăng ký — Nhấn để hủy'
                      : '✓ Registered — Click to cancel'
                    : isVi
                      ? 'Đăng ký ngay'
                      : 'Register Now'}
                </button>

                <button
                  onClick={() => toggleBookmark(event.id)}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    saved
                      ? 'text-[#fbbf24] border border-[#fbbf2440] bg-[#fbbf241a]'
                      : 'text-[color:var(--cg-text-muted)] border border-[color:var(--cg-border)] hover:text-[#fbbf24] hover:border-[#fbbf2440]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {saved ? 'bookmark_added' : 'bookmark'}
                  </span>
                  {saved
                    ? isVi
                      ? 'Đã lưu'
                      : 'Bookmarked'
                    : isVi
                      ? 'Lưu sự kiện'
                      : 'Bookmark Event'}
                </button>
              </div>

              {/* Event Info */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-xs font-bold text-[color:var(--cg-text-muted)] uppercase tracking-widest">
                  {isVi ? 'Thông tin' : 'Event Info'}
                </h3>
                {[
                  {
                    icon: 'category',
                    label: isVi ? 'Loại' : 'Type',
                    value: event.type,
                  },
                  {
                    icon: 'calendar_today',
                    label: isVi ? 'Ngày' : 'Date',
                    value: event.date,
                  },
                  {
                    icon: 'timer',
                    label: isVi ? 'Thời lượng' : 'Duration',
                    value: event.duration,
                  },
                  {
                    icon: 'workspace_premium',
                    label: isVi ? 'Phần thưởng' : 'Reward',
                    value: event.reward,
                  },
                ].map((info) => (
                  <div
                    key={info.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-xs text-[color:var(--cg-text-muted)]">
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ color: colors.accent }}
                      >
                        {info.icon}
                      </span>
                      {info.label}
                    </div>
                    <span className="text-xs font-bold text-[color:var(--cg-text)]">
                      {info.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Share */}
              <div className="glass-card p-6 space-y-3">
                <h3 className="text-xs font-bold text-[color:var(--cg-text-muted)] uppercase tracking-widest">
                  {isVi ? 'Chia sẻ' : 'Share Event'}
                </h3>
                <div className="flex gap-2">
                  {['link', 'share', 'content_copy'].map((icon) => (
                    <button
                      key={icon}
                      className="flex-1 py-3 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] flex items-center justify-center hover:bg-[color:var(--cg-container-a30)] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[color:var(--cg-text-muted)]">
                        {icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
