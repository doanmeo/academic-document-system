import React, { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  score?: number
  rating?: number
  count?: number
  size?: number | 'sm' | 'md' | 'lg'
  onRate?: (score: number) => void
  disabled?: boolean
  className?: string
  showLabels?: boolean
}

const STAR_LABELS = [
  '1 sao - Cần cải thiện',
  '2 sao - Trung bình',
  '3 sao - Khá tốt',
  '4 sao - Rất tốt',
  '5 sao - Xuất sắc & Mẫu mực',
]

export default function StarRating({
  score,
  rating,
  count,
  size = 'sm',
  onRate,
  disabled = false,
  className = '',
}: StarRatingProps) {
  const currentScore = rating !== undefined ? rating : score !== undefined ? score : 5
  const [hoverScore, setHoverScore] = useState<number | null>(null)

  const iconSize =
    typeof size === 'number'
      ? size
      : size === 'lg'
      ? 28
      : size === 'md'
      ? 20
      : 16

  const activeValue = hoverScore !== null ? hoverScore : currentScore
  const isInteractive = Boolean(onRate) && !disabled

  const handleStarClick = (e: React.MouseEvent, star: number) => {
    e.preventDefault()
    e.stopPropagation()
    setHoverScore(null)
    if (onRate) {
      onRate(star)
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => isInteractive && setHoverScore(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue
          const isHalf = !isFilled && star - 0.5 <= activeValue

          return isInteractive ? (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={(e) => handleStarClick(e, star)}
              onMouseEnter={() => setHoverScore(star)}
              title={STAR_LABELS[star - 1]}
              aria-label={STAR_LABELS[star - 1]}
              className="p-1 rounded-md transition-transform duration-100 hover:scale-125 focus:outline-hidden cursor-pointer select-none"
            >
              <Star
                size={iconSize}
                className={`pointer-events-none transition-colors duration-150 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : isHalf
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-stone-300 dark:text-slate-600 hover:text-amber-300'
                }`}
              />
            </button>
          ) : (
            <Star
              key={star}
              size={iconSize}
              className={`pointer-events-none ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-stone-300 dark:text-slate-600'
              }`}
            />
          )
        })}
      </div>

      {count !== undefined && (
        <span className="text-stone-500 dark:text-slate-400 text-xs font-mono ml-1">
          ({count})
        </span>
      )}
    </div>
  )
}
