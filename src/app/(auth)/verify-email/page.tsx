'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleResend() {
    if (!email) return
    setResendStatus('sending')

    const supabase = createClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${appUrl}/auth/callback` },
    })

    setResendStatus(error ? 'error' : 'sent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--card)', border: '2px solid var(--card-border)' }}>
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'var(--primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>Check your email</h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--secondary)' }}>
            We sent a verification link to{' '}
            {email ? <strong style={{ color: 'var(--foreground)' }}>{email}</strong> : 'your email address'}.
            {' '}Click the link to activate your account.
          </p>
        </div>

        <div className="rounded-xl border p-6 shadow-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--secondary)' }}>
            Didn&apos;t receive the email? Check your spam folder or resend.
          </p>

          {resendStatus === 'sent' && (
            <p className="text-sm mb-4" style={{ color: 'var(--success)' }}>
              Verification email resent successfully.
            </p>
          )}
          {resendStatus === 'error' && (
            <p className="text-sm mb-4" style={{ color: 'var(--error)' }}>
              Failed to resend. Please try again.
            </p>
          )}

          <button
            onClick={handleResend}
            disabled={resendStatus === 'sending' || !email}
            className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)', backgroundColor: 'transparent' }}
          >
            {resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}
          </button>

          <Link
            href="/login"
            className="block text-sm font-medium hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            Back to sign in
          </Link>
        </div>

        <p className="mt-4 text-xs" style={{ color: 'var(--muted)' }}>{APP_NAME}</p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
