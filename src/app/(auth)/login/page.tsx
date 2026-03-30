'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'verification_failed') {
      setError('Email verification failed. Please try again.')
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      if (signInError.message.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email before signing in.')
      } else {
        setError('Invalid email or password.')
      }
      setLoading(false)
      return
    }

    router.push('/gallery')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--foreground)' }}>{APP_NAME}</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--secondary)' }}>Sign in to your account</p>
        </div>

        <div className="rounded-xl border p-8 shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 transition"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading ? 'var(--muted)' : 'var(--primary)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
