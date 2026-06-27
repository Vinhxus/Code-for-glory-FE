import { useState, useEffect, type FC } from 'react';
import './UnFinished.css';
import HButton from '../../components/history/HButton';
import {
  getUnfinished,
  type UnfinishedQuest as Quest,
  type BattleDraft,
} from '../../services/historyApi';

export type { Quest, BattleDraft };

export interface Quest {
  id: string;
  title: string;
  stepLabel: string;
  currentStep: number;
  totalSteps: number;
  progress: number;
  icon: string;
}

export interface BattleDraft {
  id: string;
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
  onDelete: (id: string) => void;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────
const QuestCard: FC<QuestCardProps> = ({ quest }) => {
  return (
    <div className="quest-card glass-card card-hover">
      <div className="quest-card__main">
        <div className="quest-card__icon-box">{quest.icon}</div>
        <div className="quest-card__details">
          <h3 className="quest-card__title">{quest.title}</h3>
          <p className="quest-card__step-label">Current: {quest.stepLabel}</p>
          <p className="quest-card__step-counter">
            Step {quest.currentStep} of {quest.totalSteps}
          </p>
        </div>
      </div>

      <div className="quest-card__progress-section">
        <div className="quest-progress-bar">
          <div
            className="quest-progress-bar__fill"
            style={{ width: `${quest.progress}%` }}
          />
        </div>
        <div className="quest-card__footer">
          <span className="quest-card__percentage">{quest.progress}%</span>
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
    <div
      className={`draft-card glass-card card-hover ${isDeleting ? 'draft-card--fade-out' : ''}`}
    >
      <div className="draft-card__header">
        <h3 className="draft-card__title">{draft.title}</h3>
        <span
          className={`intensity-badge intensity-${draft.intensity.toLowerCase()}`}
        >
          {draft.intensity} INTENSITY
        </span>
      </div>
      <p className="draft-card__desc">{draft.description}</p>
      <div className="draft-card__footer">
        <span className="draft-card__time">Modified {draft.timeAgo}</span>
        <div className="draft-card__actions">
          <button className="btn-resume">RESUME BATTLE</button>
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

  const handleDeleteDraft = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    fetch('/api/history/unfinished')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch unfinished items');
        return res.json();
      })
      .then((data: { quests: Quest[]; drafts: BattleDraft[] }) => {
        setQuests(data.quests || []);
        setDrafts(data.drafts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching unfinished tasks:', err);
        setLoading(false);
      });
  }, []);

  // Hàm xử lý xóa bản nháp (gọi API DELETE lên Backend)
  const handleDeleteDraft = async (id: string) => {
    try {
      const res = await fetch(`/api/history/drafts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      } else {
        console.error('Failed to delete draft on server');
      }
    } catch (err) {
      console.error('Error deleting draft:', err);
    }
  };

  return (
    <div className="incomplete-root animate-fade-in-up">
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
