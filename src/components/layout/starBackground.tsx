import React from "react";
import "./starBackground.css"; 

interface StarBackgroundProps {
  count?: number;
}

export default function StarBackground({ count = 60 }: StarBackgroundProps) {
  return (
    <div className="stars" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
          }}
        />
      ))}
    </div>
  );
}