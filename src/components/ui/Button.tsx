import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--primary)', color: '#fff' },
  secondary: { backgroundColor: 'transparent', color: 'var(--foreground)', border: '1px solid var(--card-border)' },
  accent: { backgroundColor: 'var(--accent)', color: '#fff' },
  ghost: { backgroundColor: 'transparent', color: 'var(--secondary)' },
  danger: { backgroundColor: 'var(--error)', color: '#fff' },
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
      style={variantStyles[variant]}
      {...props}
    >
      {children}
    </button>
  )
}
