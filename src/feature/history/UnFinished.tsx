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

// ─── Sub-Components ──────────────────────────────────────────────────────────
const QuestCard: FC<QuestCardProps> = ({ quest }) => {
  return (
    <div className="quest-card">
      <div className="quest-card__icon">{quest.icon}</div>

      <div className="quest-card__content">
        <div className="quest-card__header">
          <h3 className="quest-card__title">{quest.title}</h3>
          <span className="quest-card__percent">{quest.progress}%</span>
        </div>
        <p className="quest-card__step">
          Step {quest.currentStep} of {quest.totalSteps} · {quest.stepLabel}
        </p>

        <div className="quest-progress-bar">
          <div
            className="quest-progress-bar__fill"
            style={{ width: `${quest.progress}%` }}
          />
        </div>

        <div className="quest-card__actions">
          <HButton variant="recall" className="btn-continue">
            CONTINUE QUEST
          </HButton>
        </div>
      </div>
    </div>
  );
};

const DraftCard: FC<DraftCardProps> = ({ draft, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(draft.id);
    }, 300); // Đợi hiệu ứng css fade-out trước khi xóa khỏi state
  };

  return (
    <div className={`draft-card ${isDeleting ? 'draft-card--fade-out' : ''}`}>
      <div className="draft-card__header">
        <h3 className="draft-card__title">{draft.title}</h3>
        <span className="draft-card__time">Modified {draft.timeAgo}</span>
      </div>
      <p className="draft-card__desc">{draft.description}</p>
      <div className="draft-card__footer">
        <span
          className={`intensity-badge badge--${draft.intensity.toLowerCase()}`}
        >
          {draft.intensity} INTENSITY
        </span>
        <div className="draft-card__actions">
          <HButton className="btn-resume">RESUME BATTLE</HButton>
          <button
            className="btn-delete"
            onClick={handleDelete}
            title="Discard draft"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const Unfinished: FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [drafts, setDrafts] = useState<BattleDraft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Gọi API lấy cả Quests và Drafts đang làm dở khi tab được render
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

  // Hàm xử lý xóa bản nháp (gọi API DELETE lên Backend)
  const handleDeleteDraft = async (id: string) => {
    // Optimistic removal — keep the card gone even if the request lags.
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    try {
      const res = await fetch(`/api/history/drafts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        console.error('Failed to delete draft on server');
      }
    } catch (err) {
      console.error('Error deleting draft:', err);
    }
  };

  return (
    <div className="incomplete-root">
      <header className="incomplete-header">
        <h1 className="incomplete-title">Incomplete Sagas</h1>
        <p className="incomplete-subtitle">
          Your active trials and unsubmitted scripts. Return to the battlefield
          to claim your mastery.
        </p>
      </header>

      <div className="incomplete-body">
        {/* Cột trái — Quests in Progress */}
        <section>
          <div className="quests-section__header">
            <h2 className="quests-section__title">📋 Quests in Progress</h2>
            <span className="quests-active-badge">
              {loading ? '...' : `${quests.length} Active`}
            </span>
          </div>

          {loading ? (
            <div className="loading-text">Data loading...</div>
          ) : quests.length === 0 ? (
            <div className="loading-text">No active quests in progress.</div>
          ) : (
            <div className="quests-list">
              {quests.map((q) => (
                <QuestCard key={q.id} quest={q} />
              ))}
            </div>
          )}
        </section>

        {/* Cột phải — Battlefield Drafts */}
        <section>
          <div className="drafts-section__header">
            <h2 className="drafts-section__title">⚔️ Battlefield Drafts</h2>
          </div>

          {loading ? (
            <div className="loading-text">Data loading...</div>
          ) : drafts.length === 0 ? (
            <div className="loading-text">No saved code drafts found.</div>
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
