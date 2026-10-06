import { useState } from 'react'

interface RatingStarsProps {
  score?: number
  count?: number
  readonly?: boolean
  onRate?: (score: number) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function RatingStars({
  score = 0,
  count,
  readonly = true,
  onRate,
  size = 'md',
}: RatingStarsProps) {
  const [hoverScore, setHoverScore] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const currentScore = hoverScore !== null ? hoverScore : score

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = currentScore >= star
          const isHalf = currentScore >= star - 0.5 && currentScore < star

          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => onRate && onRate(star)}
              onMouseEnter={() => !readonly && setHoverScore(star)}
              onMouseLeave={() => !readonly && setHoverScore(null)}
              className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} p-0.5 transition-transform`}
              title={`${star} sao`}
            >
              <svg
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isHalf
                    ? 'text-amber-400 fill-amber-400 opacity-60'
                    : 'text-slate-300 fill-slate-200'
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          )
        })}
      </div>

      <span className="text-xs font-semibold text-slate-700">
        {score > 0 ? score.toFixed(1) : 'Chưa có'}
        {count !== undefined && count > 0 && (
          <span className="text-slate-400 font-normal ml-1">({count})</span>
        )}
      </span>
    </div>
  )
}
