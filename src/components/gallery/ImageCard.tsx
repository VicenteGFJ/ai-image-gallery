'use client'

import Image from 'next/image'
import TagChip from '@/components/ui/TagChip'
import type { ImageWithUrls } from '@/types'

interface ImageCardProps {
  image: ImageWithUrls
  onClick: () => void
  onAnalyze?: (id: string) => void
}

export default function ImageCard({ image, onClick, onAnalyze }: ImageCardProps) {
  const status = image.metadata?.ai_processing_status ?? 'pending'
  const tags = image.metadata?.tags ?? []
  const title = image.metadata?.title

  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
      style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card)' }}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
        <Image
          src={image.thumbnail_url}
          alt={image.filename}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Processing overlay */}
        {status === 'processing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <p className="text-xs text-white font-medium">Analyzing…</p>
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
