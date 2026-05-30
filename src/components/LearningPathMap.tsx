import { useState } from 'react';
import RoadmapViewer, { type RoadmapKey } from './RoadmapViewer';
import { useT } from '../i18n/useT';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const TABS: { key: RoadmapKey; label: string; emoji: string; sub: string }[] = [
  { key: 'frontend', label: 'Frontend', emoji: '🧩', sub: 'UI · Web · React' },
  { key: 'backend', label: 'Backend', emoji: '⚙️', sub: 'API · DB · Auth' },
];

function LearningPathMap() {
  const t = useT();
  const [selected, setSelected] = useState<RoadmapKey>('frontend');

  return (
    <div className="w-full">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {/* Left: title block */}
        <div className="flex flex-col gap-1">
          <div className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--cg-text-muted)]">
            {t('home.path.title').toUpperCase()}
          </div>
          <h1 className="font-['Lexend'] text-3xl font-semibold tracking-tight md:text-4xl">
            Learning Path
          </h1>
          <p className="text-sm leading-6 text-[color:var(--cg-text-muted)]">
            Chọn Frontend hoặc Backend để khám phá roadmap học tập.
          </p>
        </div>

        {/* Right: pill toggle */}
        <div
          className="flex items-center gap-1 rounded-2xl border border-[color:var(--cg-border)] bg-[color:var(--cg-container-a16)] p-1 backdrop-blur"
          role="tablist"
          aria-label="Learning path type"
        >
          {TABS.map((tab) => {
            const active = selected === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(tab.key)}
                className={cx(
                  'relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-[color:var(--cg-coral)] to-[color:var(--cg-amber)] text-white shadow-[0_4px_16px_rgba(255,120,0,0.3)]'
                    : 'text-[color:var(--cg-text-muted)] hover:text-[color:var(--cg-text)] hover:bg-[color:var(--cg-bg-a55)]'
                )}
              >
                <span className="text-base leading-none">{tab.emoji}</span>
                <span>{tab.label}</span>
                {active && (
                  <span className="ml-1 hidden text-[11px] font-normal opacity-80 md:inline">
                    {tab.sub}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[color:var(--cg-border)] to-transparent" />

      {/* ── Roadmap viewer ── */}
      <div className="mt-6">
        <RoadmapViewer key={selected} selected={selected} />
      </div>
    </div>
  );
}

export default LearningPathMap;
