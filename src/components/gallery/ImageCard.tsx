'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import TagChip from '@/components/ui/TagChip'
import type { ImageWithUrls } from '@/types'

interface ImageCardProps {
  image: ImageWithUrls
  onClick: () => void
  onAnalyze?: (id: string) => void
}

const AI_PHASES = [
  'Reading image…',
  'Identifying content…',
  'Generating tags…',
  'Writing description…',
]

export default function ImageCard({ image, onClick, onAnalyze }: ImageCardProps) {
  const status = image.metadata?.ai_processing_status ?? 'pending'
  const tags = image.metadata?.tags ?? []
  const title = image.metadata?.title

  const [phaseIndex, setPhaseIndex] = useState(0)

  useEffect(() => {
    if (status !== 'processing') {
      setPhaseIndex(0)
      return
    }
    const interval = setInterval(() => {
      setPhaseIndex(i => (i + 1) % AI_PHASES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [status])

  const isProcessing = status === 'processing'

  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
      style={{
        border: isProcessing ? 'none' : '1px solid var(--card-border)',
        backgroundColor: 'var(--card)',
        animation: isProcessing ? 'glow-pulse 2s ease-in-out infinite' : undefined,
      }}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ backgroundColor: 'var(--card-border)' }}
      >
        <Image
          src={image.thumbnail_url}
          alt={image.filename}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ filter: isProcessing ? 'brightness(0.5) saturate(0.6)' : undefined }}
        />

        {/* AI processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 overflow-hidden">
            {/* Horizontal scan line */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, transparent 0%, var(--primary) 30%, var(--accent) 70%, transparent 100%)',
                animation: 'scan 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                boxShadow: '0 0 12px 4px color-mix(in srgb, var(--accent) 55%, transparent)',
              }}
            />

            {/* Phase pill at bottom */}
            <div className="absolute bottom-0 inset-x-0 p-2.5">
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.72)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <span
                  className="block shrink-0 rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: 'var(--accent)',
                    animation: 'dot-wave 1.2s ease-in-out infinite',
                  }}
                />
                <p className="text-xs font-medium text-white truncate">
                  {AI_PHASES[phaseIndex]}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 space-y-2">
        {status === 'complete' && (
          <>
            {title && (
              <p className="text-sm font-medium leading-tight truncate" style={{ color: 'var(--foreground)' }}>
                {title}
              </p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map(tag => (
                  <TagChip key={tag} tag={tag} />
                ))}
                {tags.length > 3 && (
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>+{tags.length - 3}</span>
                )}
              </div>
            )}
          </>
        )}

        {status === 'pending' && (
          <button
            onClick={e => { e.stopPropagation(); onAnalyze?.(image.id) }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            Analyze with AI
          </button>
        )}

        {/* Skeleton tag placeholders while processing */}
        {isProcessing && (
          <div className="flex gap-1.5">
            {[44, 56, 40].map((w, i) => (
              <div
                key={i}
                className="h-5 rounded-full"
                style={{
                  width: w,
                  backgroundColor: 'var(--card-border)',
                  animation: `dot-wave 1.6s ease-in-out ${i * 0.22}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {status === 'failed' && (
          <button
            onClick={e => { e.stopPropagation(); onAnalyze?.(image.id) }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--error)' }}
          >
            Retry AI Analysis
          </button>
        )}
      </div>
    </div>
  )
}
