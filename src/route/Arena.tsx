import { useEffect, useState } from 'react';
import SideNav from '../components/SideNav';
import { useSettingsStore } from '../store/settings';
import { getLeaderboard, type LeaderboardRow } from '../services/battlesApi';

const LIVE_MATCHES = [
  {
    id: 1,
    p1: 'Alex_Dev',
    p2: 'CodeNinja',
    stake: '500 XP',
    language: 'JavaScript',
  },
  {
    id: 2,
    p1: 'Sarah199',
    p2: 'ByteMaster',
    stake: '1.2k XP',
    language: 'Python',
  },
  { id: 3, p1: 'Neo', p2: 'Trinity', stake: '5k XP', language: 'C++' },
];

export default function Arena() {
  const language = useSettingsStore((s) => s.language);
  const isVi = language === 'vi';

  // Bảng xếp hạng thật (mặc định lĩnh vực frontend — chưa có bộ chọn field).
  const [leaders, setLeaders] = useState<LeaderboardRow[]>([]);
  useEffect(() => {
    let active = true;
    getLeaderboard('frontend', 5)
      .then((rows) => {
        if (active) setLeaders(rows);
      })
      .catch(() => {
        if (active) setLeaders([]);
      });
    return () => {
      active = false;
    };
  }, []);
  const text = isVi
    ? {
        title: 'Đấu Trường',
        subtitle:
          'Chứng minh bản lĩnh trong những trận đấu code thời gian thực. Cược XP và leo bảng xếp hạng toàn cầu.',
        findMatch: 'Tìm trận',
        spectate: 'Xem trực tiếp',
        matchesRunning: 'trận đang diễn ra',
        challenger: 'Thách đấu',
        defender: 'Phòng thủ',
        top: 'Đấu sĩ hàng đầu',
      }
    : {
        title: 'The Colosseum',
        subtitle:
          'Prove your worth in real-time coding battles. Wager your XP and climb the global rankings.',
        findMatch: 'Find Match',
        spectate: 'Live Spectate',
        matchesRunning: 'matches running',
        challenger: 'Challenger',
        defender: 'Defender',
        top: 'Top Gladiators',
      };
  return (
    <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)] selection:bg-[color:var(--cg-coral-a18)] select-none overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#ff7e5f 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute -top-[10%] left-[20%] h-[600px] w-[600px] rounded-full bg-[color:var(--cg-coral-a18)] blur-[150px]" />
      </div>
      <SideNav />
      <div className="relative z-10 md:pl-[96px]">
        <main className="max-w-7xl mx-auto px-8 py-12 space-y-12">
          {/* Hero */}
          <div className="text-center space-y-6 animate-fade-in-up">
            <h1 className="font-['Lexend'] text-6xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-[#ff7e5f] to-[#fbbf24] animate-pulse-glow">
              {text.title}
            </h1>
            <p className="mx-auto max-w-xl text-lg text-[color:var(--cg-text-muted)]">
              {text.subtitle}
            </p>
            <button className="neon-btn px-10 py-4 text-lg font-black tracking-widest uppercase mt-4">
              {text.findMatch}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            <div className="lg:col-span-2 space-y-6 animate-fade-in-up delay-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-['Lexend'] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ff7e5f]">
                    sensors
                  </span>{' '}
                  {text.spectate}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-[#4ade80]">
                  <div className="h-2 w-2 rounded-full bg-[#4ade80] animate-status-pulse" />{' '}
                  {`124 ${text.matchesRunning}`}
                </div>
              </div>
              <div className="space-y-4">
                {LIVE_MATCHES.map((match) => (
                  <div
                    key={match.id}
                    className="glass-card flex items-center justify-between p-5 card-hover"
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="font-bold text-[#a78bfa]">
                          {match.p1}
                        </div>
                        <div className="text-[10px] text-[color:var(--cg-text-muted)] uppercase tracking-wider">
                          {text.challenger}
                        </div>
                      </div>
                      <div className="font-black italic text-[#ff7e5f] text-xl">
                        VS
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-[#60a5fa]">
                          {match.p2}
                        </div>
                        <div className="text-[10px] text-[color:var(--cg-text-muted)] uppercase tracking-wider">
                          {text.defender}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="badge-amber mb-1">{match.stake}</div>
                      <div className="text-xs text-[color:var(--cg-text-muted)] font-medium block mt-1">
                        {match.language}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 animate-fade-in-up delay-200">
              <h2 className="text-2xl font-bold font-['Lexend'] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fbbf24]">
                  emoji_events
                </span>{' '}
                {text.top}
              </h2>
              <div className="glass-card p-5 space-y-4">
                {leaders.length === 0 ? (
                  <div className="text-xs text-[color:var(--cg-text-muted)] py-2">
                    {isVi
                      ? 'Chưa có dữ liệu xếp hạng.'
                      : 'No ranking data yet.'}
                  </div>
                ) : (
                  leaders.map((row) => (
                    <div
                      key={row.userId}
                      className="flex items-center justify-between border-b border-[color:var(--cg-border)] pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-[color:var(--cg-container-a30)]">
                          #{row.rank}
                        </div>
                        <div className="font-bold text-sm">{row.username}</div>
                      </div>
                      <div className="text-xs font-bold text-[#fbbf24]">
                        {row.ratingPoints} pts
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
