import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
  className?: string;
}

const RatingStars: React.FC<Props> = ({ value, size = 16, onChange, className }) => (
  <div className={cn('flex items-center gap-0.5', className)}>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={!onChange}
        onClick={() => onChange?.(n)}
        className={cn(onChange ? 'cursor-pointer' : 'cursor-default')}
        aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
      >
        <Star
          size={size}
          className={n <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
        />
      </button>
    ))}
  </div>
);

export default RatingStars;
