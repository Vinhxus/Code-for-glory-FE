import './Recall.css';
import { useState, useEffect } from 'react';

interface RecallCard {
  id: string;
  icon: string;
  tag: string;
  tagColor: 'coral' | 'amber' | 'purple';
  title: string;
  context: string;
  prompt: string;
  fix: string;
}

export default function Recall() {
  const [cards, setCards] = useState<RecallCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Fetch danh sách Flashcard cần ôn tập hôm nay từ Backend
  useEffect(() => {
    fetch('/api/history/recall')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch recall cards');
        return res.json();
      })
      .then((data: RecallCard[]) => {
        setCards(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading recall chamber:', err);
        setLoading(false);
      });
  }, []);

  // 2. Gửi lệnh lưu/hủy lưu thẻ về Backend (Bookmark)
  const toggleSave = async (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    const isCurrentlySaved = saved.has(cardId);

    try {
      const method = isCurrentlySaved ? 'DELETE' : 'POST';
      const res = await fetch(`/api/history/recall/${cardId}/bookmark`, {
        method,
      });

      if (res.ok) {
        setSaved((prev) => {
          const next = new Set(prev);
          if (next.has(cardId)) {
            next.delete(cardId);
          } else {
            next.add(cardId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Error toggling bookmark for card:', err);
    }
  };

  // 3. Hàm chấm điểm chất lượng nhớ (Hệ thống SM-2 dùng điểm từ 0-5)
  const handleRateQuality = async (qualityScore: number) => {
    if (cards.length === 0) return;
    const currentCard = cards[index];

    try {
      const res = await fetch(`/api/history/recall/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality: qualityScore }), // điểm 0 - 5 phục vụ lastQuality trong schema
      });

      if (res.ok) {
        // Chuyển sang thẻ tiếp theo sau khi đã chấm điểm thành công
        goNext();
      }
    } catch (err) {
      console.error('Error submitting review quality:', err);
    }
  };

  function goNext() {
    if (cards.length === 0) return;
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  }

  function goPrev() {
    if (cards.length === 0) return;
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  }

  function toggleFlip() {
    setFlipped((f) => !f);
  }

  function handleCardKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFlip();
    }
  }

  if (loading)
    return (
      <div
        className="recall-wrapper"
        style={{ color: 'var(--cg-text-muted)', padding: '40px' }}
      >
        Chamber is opening...
      </div>
    );
  if (cards.length === 0)
    return (
      <div
        className="recall-wrapper"
        style={{ color: 'var(--cg-text-muted)', padding: '40px' }}
      >
        🎉 Excellent! All sigils are perfectly remembered for today.
      </div>
    );

  const card = cards[index];
  const isSaved = saved.has(card.id);

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
          Card {index + 1} of {cards.length}
        </span>
        <div className="recall-dots">
          {cards.map((c, i) => (
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
          {/* Mặt trước thẻ */}
          <div className="flashcard-face flashcard-front">
            <div className="flashcard-top">
              <span className={`tag-chip tag-chip-${card.tagColor || 'amber'}`}>
                {card.tag}
              </span>
              <button
                className={`save-btn ${isSaved ? 'save-btn-active' : ''}`}
                onClick={(e) => toggleSave(e, card.id)}
                aria-label={isSaved ? 'Remove from saved' : 'Save card'}
              >
                <span className="material-symbols-outlined">
                  {isSaved ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
            </div>

            <div className="flashcard-icon-wrap">
              <span className="material-symbols-outlined">
                {card.icon || 'help_outline'}
              </span>
            </div>

            <h3 className="flashcard-title">{card.title}</h3>
            <p className="flashcard-context">Context: {card.context}</p>
            <p className="flashcard-prompt">{card.prompt}</p>
            <p className="flashcard-hint">Tap to reveal the fix</p>
          </div>

          {/* Mặt sau thẻ */}
          <div className="flashcard-face flashcard-back">
            <div className="flashcard-top">
              <span className="tag-chip tag-chip-green">RESOLVED WARD</span>
              <button
                className={`save-btn ${isSaved ? 'save-btn-active' : ''}`}
                onClick={(e) => toggleSave(e, card.id)}
                aria-label={isSaved ? 'Remove from saved' : 'Save card'}
              >
                <span className="material-symbols-outlined">
                  {isSaved ? 'bookmark' : 'bookmark_border'}
                </span>
              </button>
            </div>

            <p className="flashcard-fix-label">The Fix</p>
            <p className="flashcard-fix">{card.fix}</p>

            {/* Bộ nút chấm điểm nhanh theo chất lượng SM-2 (0-5) khi lật mặt sau */}
            <div
              className="sm2-rating-bar"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="rating-label">How well did you remember?</p>
              <div className="rating-buttons">
                <button
                  onClick={() => handleRateQuality(1)}
                  className="rate-btn rate-forgot"
                >
                  Forgot ❌
                </button>
                <button
                  onClick={() => handleRateQuality(3)}
                  className="rate-btn rate-hard"
                >
                  Hard ⏳
                </button>
                <button
                  onClick={() => handleRateQuality(5)}
                  className="rate-btn rate-easy"
                >
                  Easy ✨
                </button>
              </div>
            </div>

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
