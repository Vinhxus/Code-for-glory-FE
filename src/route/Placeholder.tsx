import SideNav from '../components/SideNav';
import { useT } from '../i18n/useT';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settings';

type PlaceholderProps = { title: string };

function Placeholder({ title }: PlaceholderProps) {
  const t = useT();
  const language = useSettingsStore((s) => s.language);
  const localizedTitle =
    language === 'vi'
      ? title === 'Battle'
        ? 'Đấu'
        : title === 'History'
          ? 'Lịch sử'
          : title
      : title;
  const features =
    language === 'vi'
      ? [
          {
            icon: 'swords',
            label: 'Đấu trường',
            color: '#a78bfa',
            desc: 'Những trận đấu code thời gian thực với người chơi khác',
          },
          {
            icon: 'history',
            label: 'Lịch sử',
            color: '#60a5fa',
            desc: 'Theo dõi tiến độ và xem lại các bài nộp trước đó',
          },
        ]
      : [
          {
            icon: 'swords',
            label: 'Battle Arena',
            color: '#a78bfa',
            desc: 'Real-time coding battles against other players',
          },
          {
            icon: 'history',
            label: 'History',
            color: '#60a5fa',
            desc: 'Track your progress and review past submissions',
          },
        ];
  const cta =
    language === 'vi'
      ? { backHome: 'Về trang chủ', tryPractice: 'Thử Practice' }
      : { backHome: 'Back to Home', tryPractice: 'Try Practice' };
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 10%,var(--cg-container-a30),transparent 55%),radial-gradient(circle at 78% 22%,var(--cg-coral-a18),transparent 58%),radial-gradient(circle at 30% 88%,var(--cg-amber-a14),transparent 58%)' }} />
      </div>
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center min-h-screen px-6 py-20 text-center">
          {/* Animated icon */}
          <div className="relative mb-8 animate-bounce-in">
            <div className="absolute inset-0 rounded-3xl bg-[#ff7e5f]/20 blur-2xl animate-pulse-glow" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#ff7e5f]/20 to-[#a78bfa]/20 border border-[color:var(--cg-border)] flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-[#ff7e5f] animate-float">construction</span>
            </div>
          </div>

          {/* Badge */}
          <div className="badge-amber mb-4 animate-fade-in delay-100">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            {t('common.comingSoon')}
          </div>

          {/* Title */}
          <h1 className="font-['Lexend'] text-5xl font-bold tracking-tight mb-4 animate-fade-in-up delay-150">
            <span className="gradient-text">{localizedTitle}</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-[color:var(--cg-text-muted)] mb-10 animate-fade-in-up delay-200">
            {t('common.notImplemented')}
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mb-10 animate-fade-in-up delay-300">
            {features.map((f) => (
              <div key={f.label} className="glass-card p-5 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center border border-[color:var(--cg-border)]"
                    style={{ background: f.color + '18' }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: f.color }}>{f.icon}</span>
                  </div>
                  <span className="text-sm font-bold">{f.label}</span>
                </div>
                <p className="text-xs text-[color:var(--cg-text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4 animate-fade-in-up delay-400">
            <Link to="/" className="neon-btn px-6 py-3 text-sm inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">home</span>
              {cta.backHome}
            </Link>
            <Link to="/practice" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-6 py-3 text-sm font-semibold transition hover:bg-[color:var(--cg-container-a22)]">
              <span className="material-symbols-outlined text-[18px] text-[#4ade80]">exercise</span>
              {cta.tryPractice}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Placeholder;
