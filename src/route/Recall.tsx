import './Recall.css';
import { useState } from 'react';

interface RecallCard {
  id: number;
  icon: string;
  tag: string;
  tagColor: 'coral' | 'amber' | 'purple';
  title: string;
  context: string;
  prompt: string;
  fix: string;
}

const RECALL_CARDS: RecallCard[] = [
  {
    id: 1,
    icon: 'memory',
    tag: 'MEMORY',
    tagColor: 'coral',
    title: 'Memory Leak Sigil',
    context: 'kernel/allocation.arc',
    prompt: 'What curse caused unbound heap growth here?',
    fix: 'An unreleased reference loop kept the allocation alive. Bind a finalizer — or call free() in the cleanup ward — before the scope exits.',
  },
  {
    id: 2,
    icon: 'autorenew',
    tag: 'LOGIC',
    tagColor: 'amber',
    title: 'Recursion Loop Abyss',
    context: 'logic/gate.handler.arc',
    prompt: 'Why did the gate handler spiral into infinite descent?',
    fix: 'The base-case ward was missing. Add a termination clause that runs before the recursive invocation is cast again.',
  },
  {
    id: 3,
    icon: 'error_outline',
    tag: 'POINTER',
    tagColor: 'purple',
    title: 'Null Pointer Wraith',
    context: 'entity/spawner.arc',
    prompt: 'What summoned the wraith when accessing .health?',
    fix: 'The entity was never instantiated. Guard the dereference with an existence check before reading its properties.',
  },
  {
    id: 4,
    icon: 'swap_horiz',
    tag: 'TYPE',
    tagColor: 'coral',
    title: 'Type Coercion Curse',
    context: 'combat/damage.calc.arc',
    prompt: "Why did '10' + 5 conjure '105' instead of 15?",
    fix: 'Implicit string coercion took over the operator. Cast both operands explicitly before the arithmetic ritual runs.',
  },
  {
    id: 5,
    icon: 'bolt',
    tag: 'CONCURRENCY',
    tagColor: 'amber',
    title: 'Race Condition Phantom',
    context: 'async/queue.worker.arc',
    prompt: 'Why did two workers corrupt the same ledger entry?',
    fix: 'Shared state was left unsynchronized. Wrap the critical section in a mutex ward so only one worker enters at a time.',
  },
];

export default function Recall() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const card = RECALL_CARDS[index];
  const isSaved = saved.has(card.id);

  function goNext() {
    setFlipped(false);
    setIndex((i) => (i + 1) % RECALL_CARDS.length);
  }

  function goPrev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + RECALL_CARDS.length) % RECALL_CARDS.length);
  }

  function toggleFlip() {
    setFlipped((f) => !f);
  }

  function toggleSave(e: React.MouseEvent) {
    e.stopPropagation();
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) {
        next.delete(card.id);
      } else {
        next.add(card.id);
      }
      return next;
    });
  }

  function handleCardKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFlip();
    }
  }

  return (
    <div className="recall-wrapper">
      <div className="recall-backdrop" />

      <div className="recall-header animate-fade-in">
        <span className="material-symbols-outlined recall-header-icon">
          auto_stories
        </span>
        <p className="recall-eyebrow">Recall Chamber</p>
      </div>

      <div className="recall-progress">
        <span>
          Card {index + 1} of {RECALL_CARDS.length}
        </span>
        <div className="recall-dots">
          {RECALL_CARDS.map((c, i) => (
            <span
              key={c.id}
              className={`recall-dot ${i === index ? 'recall-dot-active' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className="flashcard-scene" key={card.id}>
        <div
          className={`flashcard animate-scale-in ${flipped ? 'flashcard-flipped' : ''}`}
          onClick={toggleFlip}
          onKeyDown={handleCardKeyDown}
          role="button"
          tabIndex={0}
          aria-label={
            flipped
              ? 'Showing fix, tap to flip back'
              : 'Showing error, tap to reveal fix'
          }
        >
          <div className="flashcard-face flashcard-front">
            <div className="flashcard-top">
              <span className={`tag-chip tag-chip-${card.tagColor}`}>
                {card.tag}
              </span>
              <button
                className={`save-btn ${isSaved ? 'save-btn-active' : ''}`}
                onClick={toggleSave}
                aria-label={isSaved ? 'Remove from saved' : 'Save card'}
              >
                <span className="material-symbols-outlined">
                  {isSaved ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
            </div>

            <div className="flashcard-icon-wrap">
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>

            <h3 className="flashcard-title">{card.title}</h3>
            <p className="flashcard-context">Context: {card.context}</p>
            <p className="flashcard-prompt">{card.prompt}</p>

            <p className="flashcard-hint">Tap to reveal the fix</p>
          </div>

          <div className="flashcard-face flashcard-back">
            <div className="flashcard-top">
              <span className="tag-chip tag-chip-green">RESOLVED WARD</span>
              <button
                className={`save-btn ${isSaved ? 'save-btn-active' : ''}`}
                onClick={toggleSave}
                aria-label={isSaved ? 'Remove from saved' : 'Save card'}
              >
                <span className="material-symbols-outlined">
                  {isSaved ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
            </div>

            <p className="flashcard-fix-label">The Fix</p>
            <p className="flashcard-fix">{card.fix}</p>

            <p className="flashcard-hint">Tap to flip back</p>
          </div>
        </div>
      </div>

      <div className="recall-controls">
        <button
          className="ctrl-btn"
          onClick={goPrev}
          aria-label="Previous card"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          className="ctrl-btn ctrl-btn-flip"
          onClick={toggleFlip}
          aria-label="Flip card"
        >
          <span className="material-symbols-outlined">sync</span>
        </button>
        <button className="ctrl-btn" onClick={goNext} aria-label="Next card">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <p className="recall-saved-count">
        {saved.size} card{saved.size !== 1 ? 's' : ''} saved for review
      </p>
    </div>
  );
}
