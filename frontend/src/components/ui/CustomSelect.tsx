import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'

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
  size?: 'sm' | 'md'
  searchable?: boolean
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  menuClassName = '',
  size = 'md',
  searchable,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterText, setFilterText] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Find active option label
  const selectedOption = options.find((opt) => String(opt.value) === String(value))
  const displayLabel = selectedOption ? selectedOption.label : placeholder || options[0]?.label || ''

  // Enable search if explicitly set, or auto-enable when >= 8 options
  const isSearchEnabled = searchable !== undefined ? searchable : options.length >= 8

  // Filter options based on filterText
  const filteredOptions = useMemo(() => {
    if (!filterText.trim()) return options
    const q = filterText.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, filterText])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchEnabled) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    } else {
      setFilterText('')
    }
  }, [isOpen, isSearchEnabled])

  // Close when clicking outside or pressing Escape
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

  const buttonPadding = size === 'sm' ? 'px-2.5 py-1 text-xs rounded-lg' : 'px-3 py-2 text-xs rounded-xl'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full font-sans transition-all flex items-center justify-between gap-2 select-none text-left cursor-pointer border ${buttonPadding} ${
          isOpen
            ? 'ring-2 ring-blue-500/30 border-blue-500 dark:border-blue-400 bg-white dark:bg-[#151a24] text-stone-900 dark:text-stone-100 shadow-sm'
            : 'border-stone-200 dark:border-stone-700/80 bg-stone-50 dark:bg-stone-900/70 text-stone-800 dark:text-stone-200 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-white dark:hover:bg-stone-900'
        }`}
      >
        <span className="truncate flex-1 font-medium">{displayLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 dark:text-stone-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
          }`}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 w-full min-w-[200px] z-50 bg-white dark:bg-[#12161f] rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700/80 p-1.5 animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
        >
          {/* Quick Search inside dropdown if many options */}
          {isSearchEnabled && (
            <div className="p-1 pb-1.5 mb-1 border-b border-stone-100 dark:border-stone-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Lọc nhanh danh sách..."
                  className="w-full pl-7 pr-2 py-1 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 font-sans">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-stone-400">
                Không tìm thấy lựa chọn phù hợp
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value)
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange(String(opt.value))
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
