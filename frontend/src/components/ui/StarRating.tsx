import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  score: number;
  count?: number;
  size?: 'sm' | 'md';
}

export default function StarRating({ score, count, size = 'sm' }: StarRatingProps) {
  const iconSize = size === 'sm' ? 16 : 20;
  
  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={iconSize}
            className={`${
              star <= score
                ? 'text-yellow-400 fill-yellow-400'
                : star - 0.5 <= score
                ? 'text-yellow-400 fill-yellow-400' // Simple half-star approximation
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-gray-500 text-sm ml-1">({count})</span>
      )}
    </div>
  );
}
