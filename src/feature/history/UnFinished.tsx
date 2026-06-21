import { useState, useEffect, type FC } from 'react';
import './UnFinished.css';
import HButton from '../../components/history/HButton';

export interface Quest {
  id: number;
  title: string;
  stepLabel: string;
  currentStep: number;
  totalSteps: number;
  progress: number;
  icon: string;
}

export interface BattleDraft {
  id: number;
  title: string;
  description: string;
  intensity: 'HIGH' | 'MEDIUM' | 'LOW';
  timeAgo: string;
}

interface QuestCardProps {
  quest: Quest;
}

interface DraftCardProps {
  draft: BattleDraft;
  onDelete: (id: number) => void;
}

const MOCK_QUESTS: Quest[] = [
  {
    id: 1,
    title: 'Advanced Mana Scripting',
    stepLabel: 'Conditional Invocations',
    currentStep: 4,
    totalSteps: 12,
    progress: 32,
    icon: '📟',
  },
  {
    id: 2,
    title: 'Cyber-Sigil Defense',
    stepLabel: 'Barrier Encryption',
    currentStep: 8,
    totalSteps: 10,
    progress: 80,
    icon: '🛡',
  },
  {
    id: 3,
    title: 'Ether-Database Architecture',
    stepLabel: 'Introduction to Flux-Tables',
    currentStep: 1,
    totalSteps: 15,
    progress: 5,
    icon: '🗄',
  },
];

const MOCK_DRAFTS: BattleDraft[] = [
  {
    id: 1,
    title: 'The Void-Array Challenge',
    description:
      'Algorithm optimization draft for high-frequency trading in the digital market.',
    intensity: 'HIGH',
    timeAgo: '3d ago',
  },
  {
    id: 2,
    title: 'Sigil-Parsing Sprint',
    description:
      'Unfinished logic for rapid sigil recognition and classification draft.',
    intensity: 'MEDIUM',
    timeAgo: '4d ago',
  },
];

// ─── Fetch functions ──────────────────────────────────────────────────────────
async function fetchQuests(): Promise<Quest[]> {
  // Thay bằng endpoint thật:
  // const res = await fetch("/api/quests/in-progress");
  // return res.json();
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_QUESTS), 600));
}

async function fetchDrafts(): Promise<BattleDraft[]> {
  // Thay bằng endpoint thật:
  // const res = await fetch("/api/battle-drafts");
  // return res.json();
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_DRAFTS), 700));
}

// ─── Quest Card ───────────────────────────────────────────────────────────────
const QuestCard: FC<QuestCardProps> = ({ quest }) => (
  <div className="quest-card">
    <div className="quest-card__icon">{quest.icon}</div>

    <div className="quest-card__content">
      <div className="quest-card__header">
        <p className="quest-card__title">{quest.title}</p>
        <span className="quest-card__percent">{quest.progress}% Complete</span>
      </div>

      <p className="quest-card__step">
        Step {quest.currentStep} of {quest.totalSteps}: {quest.stepLabel}
      </p>

      <div className="quest-progress-bar">
        <div
          className="quest-progress-bar__fill"
          style={{ width: `${quest.progress}%` }}
        />
      </div>

      <div className="quest-card__actions">
        <HButton className="btn-continue">CONTINUE QUEST</HButton>
      </div>
    </div>
  </div>
);

const INTENSITY_CLASS: Record<BattleDraft['intensity'], string> = {
  HIGH: 'badge--high',
  MEDIUM: 'badge--medium',
  LOW: 'badge--low',
};

const DraftCard: FC<DraftCardProps> = ({ draft, onDelete }) => (
  <div className="draft-card">
    <div className="draft-card__header">
      <span className={`intensity-badge ${INTENSITY_CLASS[draft.intensity]}`}>
        {draft.intensity} INTENSITY
      </span>
      <span className="draft-card__time">{draft.timeAgo}</span>
    </div>

    <p className="draft-card__title">{draft.title}</p>
    <p className="draft-card__desc">{draft.description}</p>

    <div className="draft-card__footer">
      <button className="btn-resume">RESUME BATTLE</button>
      <button className="btn-delete" onClick={() => onDelete(draft.id)}>
        🗑
      </button>
    </div>
  </div>
);

// Main Component
const Unfinished: FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [drafts, setDrafts] = useState<BattleDraft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([fetchQuests(), fetchDrafts()]).then(([q, d]) => {
      setQuests(q);
      setDrafts(d);
      setLoading(false);
    });
  }, []);

  const handleDeleteDraft = (id: number) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="incomplete-root">
      {/* Page Header */}
      <div className="incomplete-header">
        <h1 className="incomplete-title">Archives of the Incomplete</h1>
        <p className="incomplete-subtitle">
          Your journey through the digital ether remains unfinished. Return to
          your path and claim your mastery.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="incomplete-body">
        {/* Left — Quests in Progress */}
        <section>
          <div className="quests-section__header">
            <h2 className="quests-section__title">📋 Quests in Progress</h2>
            <span className="quests-active-badge">{quests.length} Active</span>
          </div>

          {loading ? (
            <div className="loading-text">Data loading...</div>
          ) : (
            <div className="quests-list">
              {quests.map((q) => (
                <QuestCard key={q.id} quest={q} />
              ))}
            </div>
          )}
        </section>

        {/* Right — Battlefield Drafts */}
        <section>
          <div className="drafts-section__header">
            <h2 className="drafts-section__title">⚔️ Battlefield Drafts</h2>
          </div>

          {loading ? (
            <div className="loading-text">Data loading...</div>
          ) : (
            <>
              <div className="drafts-list">
                {drafts.map((d) => (
                  <DraftCard
                    key={d.id}
                    draft={d}
                    onDelete={handleDeleteDraft}
                  />
                ))}
              </div>

              <button className="btn-import">
                <span className="btn-import__icon">⬇️</span>
                Import from Arena
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Unfinished;
