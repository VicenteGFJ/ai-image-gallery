'use client'

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export default function SearchBar({ value = '', onChange, disabled }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="relative flex items-center">
        <svg
          className="absolute left-3 h-4 w-4 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{ color: 'var(--muted)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>

        <input
          type="text"
          placeholder={disabled ? 'Search coming in Wave 3…' : 'Search by tags or description…'}
          disabled={disabled}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--card-border)',
            color: 'var(--foreground)',
          }}
        />

        {value && !disabled && (
          <button
            onClick={() => onChange?.('')}
            className="absolute right-3 hover:opacity-70 transition"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: 'var(--muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
