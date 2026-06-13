import React, { useMemo } from 'react';
import './starBackground.css';

interface StarBackgroundProps {
  count?: number;
}

// Pure random function generator that's deterministic based on seed
function getSeededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function StarBackground({
  count = 60,
}: StarBackgroundProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => ({
      left: getSeededRandom(index * 2.71) * 100,
      top: getSeededRandom(index * 3.14) * 100,
      animationDelay: getSeededRandom(index * 1.41) * 3,
      width: getSeededRandom(index * 2.23) * 2 + 1,
      height: getSeededRandom(index * 1.73) * 2 + 1,
    }));
  }, [count]);

  return (
    <div className="stars" aria-hidden="true">
      {stars.map((star, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.animationDelay}s`,
            width: `${star.width}px`,
            height: `${star.height}px`,
          }}
        />
      ))}
    </div>
  );
}