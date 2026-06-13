import React, { useMemo } from 'react';
import './starBackground.css';

interface StarBackgroundProps {
  count?: number;
}

const DEFAULT_STAR_COUNT = 60;

function createStars(count: number) {
  return Array.from({ length: count }).map(() => {
    const left = `${Math.random() * 100}%`;
    const top = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 3}s`;
    const size = `${Math.random() * 2 + 1}px`;
    return { left, top, animationDelay, size };
  });
}

// Generate a stable list at module initialization (not during render)
const INITIAL_STARS = createStars(DEFAULT_STAR_COUNT);

export default function StarBackground({
  count = DEFAULT_STAR_COUNT,
}: StarBackgroundProps) {
  const stars = INITIAL_STARS.slice(0, count);

  return (
    <div className="stars" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            animationDelay: s.animationDelay,
            width: s.size,
            height: s.size,
          }}
        />
      ))}
    </div>
  );
}
