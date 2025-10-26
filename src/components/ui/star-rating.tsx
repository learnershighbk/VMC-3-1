'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) => {
  const handleClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex gap-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(index)}
          disabled={readonly}
          className={cn(
            'transition-colors',
            !readonly && 'hover:scale-110 cursor-pointer',
            readonly && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              index < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
};
