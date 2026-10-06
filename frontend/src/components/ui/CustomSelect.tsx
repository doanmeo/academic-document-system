import { useState, useRef, useEffect } from 'react'

export interface SelectOption {
  value: string | number
  label: string
}

interface CustomSelectProps {
  value: string | number
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  icon?: string
  className?: string
  menuClassName?: string
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  icon = 'keyboard_arrow_down',
  className = '',
  menuClassName = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Find active option label
  const selectedOption = options.find((opt) => String(opt.value) === String(value))
  const displayLabel = selectedOption ? selectedOption.label : placeholder || options[0]?.label || ''

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full bg-surface-container-low hover:bg-surface-container text-on-surface font-body-sm text-body-sm px-3.5 py-2 rounded-lg cursor-pointer border transition-all flex items-center justify-between gap-2 select-none text-left ${
          isOpen
            ? 'bg-white ring-2 ring-secondary border-secondary shadow-xs'
            : 'border-transparent hover:border-surface-container-high'
        }`}
      >
        <span className="truncate flex-1 font-medium">{displayLabel}</span>
        <span
          className={`material-symbols-outlined text-on-surface-variant text-[18px] shrink-0 transition-transform duration-150 ${
            icon === 'keyboard_arrow_down' && isOpen ? 'rotate-180 text-secondary' : ''
          }`}
        >
          {icon}
        </span>
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 w-full min-w-[200px] z-50 bg-surface-container-lowest rounded-xl shadow-[0_10px_25px_-5px_rgba(15,58,104,0.12),0_8px_10px_-6px_rgba(15,58,104,0.08)] border border-surface-container p-1 max-h-64 overflow-y-auto ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value)
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(String(opt.value))
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-body-sm text-body-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface hover:bg-surface-container-low hover:text-primary'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">
                    check
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
