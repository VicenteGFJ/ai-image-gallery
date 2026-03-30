import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition ${className}`}
        style={{
          backgroundColor: 'var(--background)',
          borderColor: error ? 'var(--error)' : 'var(--card-border)',
          color: 'var(--foreground)',
        }}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{error}</p>
      )}
    </div>
  )
}
