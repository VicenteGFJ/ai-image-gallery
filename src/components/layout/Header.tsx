'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'

interface HeaderProps {
  userEmail: string
}

export default function Header({ userEmail }: HeaderProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3 max-w-6xl">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
          {APP_NAME}
        </h1>

        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm" style={{ color: 'var(--secondary)' }}>
            {userEmail}
          </span>
          <button
            onClick={handleSignOut}
            className="rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:opacity-80"
            style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
