import { APP_NAME } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="border-t py-4" style={{ borderColor: 'var(--card-border)' }}>
      <div className="container mx-auto px-4 text-center max-w-6xl">
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          {APP_NAME} — AI-powered image tagging
        </p>
      </div>
    </footer>
  )
}
