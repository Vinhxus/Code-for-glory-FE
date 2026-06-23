import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from '../../../components/SideNav';
import Header from '../../../components/layout/Header';
import { useBattleStore } from '../store/battleStore';
import { createBattle } from '../services/battleService';
import type { BattleMode } from '../types/battle.types';
import { BATTLE_ROUTES } from '../constants/battle.constants';

const MODE: {
  value: BattleMode;
  icon: string;
  title: string;
  description: string;
  stats: { label: string; value: string }[];
}[] = [
  {
    value: 'SPEED',
    icon: '⚡',
    title: 'Speed Mode',
    description:
      'A quick, intense battle focused on a single complex problem. Perfect for a fast warmup.',
    stats: [
      { label: 'Question', value: '1' },
      { label: 'Minutes', value: '10' },
      { label: 'XP', value: '+50' },
    ],
  },
  {
    value: 'PERFORMANCE',
    icon: '🚀',
    title: 'Performance Mode',
    description:
      'Test your comprehensive knowledge with a series of in-depth algorithmic and structural challenges.',
    stats: [
      { label: 'Questions', value: '2–3' },
      { label: 'Minutes', value: '30' },
      { label: 'XP', value: '+150' },
    ],
  },
];

const FIELD_LABEL: Record<string, string> = {
  FE: 'Frontend Engineering',
  BE: 'Backend Engineering',
};

const ModeSelectPage = () => {
  const navigate = useNavigate();
  const { field, setBattleMode, setBattleId } = useBattleStore();

  const [selectedMode, setSelectedMode] = useState<BattleMode>('performance');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!field) {
    navigate(BATTLE_ROUTES.FIELD);
    return null;
  }

  const handleFindMatch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const battle = await createBattle(field, selectedMode);
      setBattleMode(selectedMode);
      setBattleId(battle._id);
      navigate(`${BATTLE_ROUTES.ARENA}/${battle._id}`);
    } catch {
      setError('Failed to find a match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-(--cg-bg) text-(--cg-text) select-none overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(#a78bfa 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute top-[20%] left-[10%] h-175 w-175 rounded-full bg-(--cg-coral-a18) blur-[160px]" />
        <div className="absolute top-[40%] right-[10%] h-150 w-150 rounded-full bg-(--cg-green-a14) blur-[140px]" />
      </div>

      <SideNav />

      <div className="relative z-10 md:pl-24">
        <Header />

        <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-8 py-16 pt-18">
          {/* Header text */}
          <div className="text-center space-y-4 animate-fade-in-up">
            <div className="badge-coral w-fit mx-auto flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff7e5f]" />
              {FIELD_LABEL[field] ?? field}
            </div>
            <h1 className="font-['Lexend'] text-4xl font-bold tracking-tight">
              Select Battle <span className="gradient-text">Mode</span>
            </h1>
            <p className="text-sm text-(--cg-text-muted) max-w-md mx-auto">
              Choose your preferred challenge intensity before finding an
              opponent in the arena.
            </p>
          </div>

          {/* ModeCard  */}
          <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 animate-fade-in-up ">
            {MODE.map((m) => {
              const isSelected = selectedMode === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setSelectedMode(m.value)}
                  className={`relative flex flex-col gap-3 rounded-2xl border p-6 text-left transition ${
                    isSelected
                      ? 'border-[#ff7e5f]/50 bg-[#ff7e5f]/8'
                      : 'border-(--cg-border) bg-(--cg-container-a16) hover:border-white/20 hover:bg-(--cg-container-a22)'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-[#ff7e5f]/30 bg-[#ff7e5f]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff7e5f]">
                      ✓ Selected
                    </span>
                  )}
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${
                      isSelected
                        ? 'border-[#ff7e5f]/30 bg-[#ff7e5f]/15'
                        : 'border-(--cg-border) bg-(--cg-container-a16)'
                    }`}
                  >
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="font-['Lexend'] text-lg font-semibold text-(--cg-text)">
                      {m.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-(--cg-text-muted)">
                      {m.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {m.stats.map((s) => (
                      <span
                        key={s.label}
                        className="rounded-md border border-(--cg-border) bg-(--cg-container-a16) px-2 py-0.5 text-xs text-(--cg-text-muted)"
                      >
                        {s.value} {s.label}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error  */}
          {error && (
            <p className="text-sm text-red-400 animate-fade-in-up">{error}</p>
          )}

          {/* CTA  */}
          <div className="flex flex-col items-center gap-2 animate-fade-in-up">
            <button
              onClick={handleFindMatch}
              disabled={isLoading}
              className="neon-btn flex items-center gap-2 px-8 py-3 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Finding Match...
                </>
              ) : (
                '🔍 Find Match'
              )}
            </button>
            <p className="text-xs text-(--cg-text-muted)">Est. wait: ~30s</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModeSelectPage;
