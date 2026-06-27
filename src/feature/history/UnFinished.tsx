import { useState, useEffect, type FC } from 'react';
import './UnFinished.css';
import HButton from '../../components/history/HButton';
import {
  getUnfinished,
  type UnfinishedQuest as Quest,
  type BattleDraft,
} from '../../services/historyApi';

export type { Quest, BattleDraft };

interface QuestCardProps {
  quest: Quest;
}

interface DraftCardProps {
  draft: BattleDraft;
  onDelete: (id: string) => void;
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
    let active = true;
    getUnfinished()
      .then((data) => {
        if (!active) return;
        setQuests(data.quests);
        setDrafts(data.drafts);
      })
      .catch((err) => {
        console.error('Failed to load unfinished history', err);
        if (active) {
          setQuests([]);
          setDrafts([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDeleteDraft = (id: string) => {
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
