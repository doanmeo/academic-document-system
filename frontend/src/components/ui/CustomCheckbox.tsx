import React from 'react'
import { Check } from 'lucide-react'

export interface CustomCheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  className?: string
  color?: 'blue' | 'amber' | 'emerald' | 'purple'
  size?: 'sm' | 'md'
}

export default function CustomCheckbox({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  color = 'blue',
  size = 'md',
}: CustomCheckboxProps) {
  const colorMap = {
    blue: {
      checked: 'bg-blue-600 border-blue-600 text-white shadow-xs dark:bg-blue-600 dark:border-blue-600',
      ring: 'focus-within:ring-2 focus-within:ring-blue-500/30',
    },
    amber: {
      checked: 'bg-amber-600 border-amber-600 text-white shadow-xs dark:bg-amber-600 dark:border-amber-600',
      ring: 'focus-within:ring-2 focus-within:ring-amber-500/30',
    },
    emerald: {
      checked: 'bg-emerald-600 border-emerald-600 text-white shadow-xs dark:bg-emerald-600 dark:border-emerald-600',
      ring: 'focus-within:ring-2 focus-within:ring-emerald-500/30',
    },
    purple: {
      checked: 'bg-purple-600 border-purple-600 text-white shadow-xs dark:bg-purple-600 dark:border-purple-600',
      ring: 'focus-within:ring-2 focus-within:ring-purple-500/30',
    },
  }

  const activeColor = colorMap[color] || colorMap.blue
  const boxSize = size === 'sm' ? 'w-3.5 h-3.5 rounded' : 'w-4 h-4 rounded-md'
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-start gap-2 select-none cursor-pointer group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className={`relative flex items-center justify-center shrink-0 mt-0.5 ${activeColor.ring} rounded-md`}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`${boxSize} flex items-center justify-center border transition-all duration-150 ${
            checked
              ? activeColor.checked
              : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/90 group-hover:border-stone-400 dark:group-hover:border-stone-500'
          }`}
        >
          {checked && (
            <Check className={`${iconSize} stroke-[3] animate-in zoom-in-75 duration-100 text-white`} />
          )}
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col text-xs">
          {label && (
            <span className="text-stone-700 dark:text-stone-300 group-hover:text-stone-950 dark:group-hover:text-white transition-colors font-medium">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  )
}
