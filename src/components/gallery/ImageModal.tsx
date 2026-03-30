'use client'

import { useState } from 'react'
import Image from 'next/image'
import Modal from '@/components/ui/Modal'
import TagChip from '@/components/ui/TagChip'
import type { ImageWithUrls } from '@/types'

interface ImageModalProps {
  image: ImageWithUrls | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (id: string) => void
}

export default function ImageModal({ image, isOpen, onClose, onDelete }: ImageModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!image) return null

  const status = image.metadata?.ai_processing_status ?? 'pending'
  const tags = image.metadata?.tags ?? []
  const title = image.metadata?.title
  const description = image.metadata?.description

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete?.(image!.id)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { setConfirmDelete(false); onClose() }} maxWidth="max-w-3xl">
      <div className="overflow-hidden">
        {/* Image */}
        <div className="relative w-full" style={{ aspectRatio: '16/9', backgroundColor: 'var(--card-border)' }}>
          <Image
            src={image.original_url}
            alt={image.filename}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate" style={{ color: 'var(--foreground)' }}>
                {title ?? image.filename}
              </h3>
              {title && (
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>{image.filename}</p>
              )}
            </div>
            <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>
              {image.width && image.height ? `${image.width}×${image.height}` : ''}
            </span>
          </div>

          {/* AI status */}
          {status === 'processing' && (
            <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--accent)' }}>
              <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Analyzing image…
            </div>
          )}

          {description && (
            <p className="text-sm mb-4" style={{ color: 'var(--secondary)' }}>{description}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {tags.map(tag => (
                <TagChip key={tag} tag={tag} size="md" />
              ))}
            </div>
          )}

          {/* Delete */}
          <div className="flex justify-end">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: 'var(--secondary)' }}>Delete this image?</span>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border px-3 py-1.5 text-sm transition hover:opacity-80"
                  style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--error)' }}
                >
                  Delete
                </button>
              </div>
            ) : (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition hover:opacity-80"
                style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                Delete image
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
