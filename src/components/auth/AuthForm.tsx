'use client'

// Shared auth form primitives — used by login/signup pages
// Each page implements its own form logic; this file exports reusable layout helpers.

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-8 shadow-sm"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
    >
      {children}
    </div>
  )
}

export function AuthField({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{error}</p>
      )}
    </div>
  )
}
