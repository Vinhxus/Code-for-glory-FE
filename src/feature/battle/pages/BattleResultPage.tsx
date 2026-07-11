import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SideNav from '../../../components/SideNav';
import Header from '../../../components/layout/Header';
import { getBattleById } from '../services/battleService';
import type { Battle, ResultType } from '../types/battle.types';
import { RESULT_CONFIG, BATTLE_ROUTES } from '../constants/battle.constants';
import { useAuth } from '../../auth/useAuth';

const BattleResultPage = () => {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [battle, setBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!battleId) {
      return;
    }

    let isMounted = true;

    const fetchBattle = async () => {
      try {
        const data = await getBattleById(battleId);
        if (!isMounted) return;

        if (data.status !== 'finished' && data.status !== 'cancelled') {
          navigate(`${BATTLE_ROUTES.ARENA}/${battleId}`, { replace: true });
          return;
        }

        setBattle(data);
      } catch {
        if (isMounted) setError('Không tải được kết quả trận đấu');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBattle();
    return () => {
      isMounted = false;
    };
  }, [battleId, navigate]);

  if (!battleId) {
    return (
      <ResultShell>
        <p className="text-sm text-[#ff7e5f]">Thiếu battleId</p>
      </ResultShell>
    );
  }
  if (isLoading) {
    return (
      <ResultShell>
        <p className="text-sm text-[color:var(--cg-text-muted)]">
          Đang tải kết quả...
        </p>
      </ResultShell>
    );
  }

  if (error || !battle) {
    return (
      <ResultShell>
        <p className="text-sm text-[#ff7e5f]">
          {error ?? 'Không tìm thấy trận đấu'}
        </p>
      </ResultShell>
    );
  }

  const myRealId = user?.id ?? '';

  const resultType: ResultType = battle.isDraw
    ? 'draw'
    : battle.winnerId === myRealId
      ? 'victory'
      : 'defeat';
  const config = RESULT_CONFIG[resultType];
  const me = battle.players.find((p) => p.userId === myRealId);
  const opponent = battle.players.find((p) => p.userId !== myRealId);
  const myPassedTests = me?.totalPassedTests ?? 0;
  const myTotalTests = me?.totalTests ?? 0;
  const myMemoryKb = me?.totalMemoryKb ?? 0;
  return (
    <ResultShell>
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-10 text-center backdrop-blur-md">
        <div className="text-6xl mb-4">{config.icon}</div>
        <h1
          className={`font-['Lexend'] text-3xl font-bold mb-2 ${config.accentClass}`}
        >
          {config.label}
        </h1>
        <p className="text-sm text-[color:var(--cg-text-muted)] mb-6">
          {config.subtitle}
        </p>

        <div className="rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-bg)]/40 p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--cg-text-muted)]">
              {config.statLabels.left}
            </span>
            <span className="font-semibold">
              {myPassedTests} / {myTotalTests}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--cg-text-muted)]">
              {config.statLabels.right}
            </span>
            <span className="font-semibold">
              {myMemoryKb > 1024
                ? `${(myMemoryKb / 1024).toFixed(1)} MB`
                : `${myMemoryKb} KB`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2.5 text-xs font-semibold transition hover:bg-[color:var(--cg-container-a22)]"
          >
            <span className="material-symbols-outlined text-[15px]">home</span>
            Back to Home
          </button>

          <button
            type="button"
            onClick={() => navigate(BATTLE_ROUTES.FIELD)}
            className="neon-btn inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[15px]">
              {config.primaryIcon}
            </span>
            {config.primaryLabel}
          </button>

          <button
            type="button"
            onClick={() => navigate(`${BATTLE_ROUTES.ANALYZE}/${battleId}`)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] px-4 py-2.5 text-xs font-semibold transition hover:bg-[color:var(--cg-container-a22)]"
          >
            <span className="material-symbols-outlined text-[15px]">code</span>
            Analyze Code
          </button>
        </div>
      </div>
    </ResultShell>
  );
};

const ResultShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[color:var(--cg-bg)] text-[color:var(--cg-text)]">
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-[20%] -left-[10%] h-[700px] w-[700px] rounded-full bg-[color:var(--cg-coral-a18)] blur-[160px]" />
      <div className="absolute top-[40%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[color:var(--cg-green-a14)] blur-[140px]" />
    </div>

    <SideNav />

    <div className="relative z-10 md:pl-[96px]">
      <Header />
      <main className="flex min-h-screen items-center justify-center px-6 pt-20 pb-12">
        {children}
      </main>
    </div>
  </div>
);

export default BattleResultPage;
