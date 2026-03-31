'use client'

const RING_RADIUS = 38
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

interface UploadZoneProps {
  disabled?: boolean
  onUpload?: (files: File[]) => void
  isUploading?: boolean
  uploadProgress?: number
  uploadPhase?: string
}

export default function UploadZone({ disabled, onUpload, isUploading, uploadProgress = 0, uploadPhase }: UploadZoneProps) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0 && onUpload) onUpload(files)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (disabled || isUploading) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && onUpload) onUpload(files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  const dashOffset = RING_CIRCUMFERENCE * (1 - uploadProgress / 100)

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative rounded-xl border-2 border-dashed p-8 text-center transition-colors"
      style={{
        borderColor: isUploading ? 'var(--primary)' : 'var(--card-border)',
        backgroundColor: 'var(--card)',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled || isUploading ? 'default' : 'pointer',
      }}
    >
      {isUploading ? (
        /* ── Uploading state ── */
        <div className="flex flex-col items-center gap-5 py-1">

          {/* Circular progress ring */}
          <div className="relative" style={{ width: 96, height: 96 }}>
            <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="48" cy="48" r={RING_RADIUS}
                fill="none"
                stroke="var(--card-border)"
                strokeWidth="5"
              />
              <circle
                cx="48" cy="48" r={RING_RADIUS}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                style={{
                  transition: 'stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 0 6px var(--primary))',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                {uploadProgress}%
              </span>
            </div>
          </div>

          {/* Phase label + animated dots */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {uploadPhase || 'Uploading…'}
            </p>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="block rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: 'var(--primary)',
                    animation: `dot-wave 1.4s ease-in-out ${i * 0.18}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Thin glow progress bar */}
          <div className="w-full rounded-full overflow-hidden" style={{ height: 3, backgroundColor: 'var(--card-border)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${uploadProgress}%`,
                backgroundColor: 'var(--primary)',
                transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 8px var(--primary)',
              }}
            />
          </div>
        </div>
      ) : (
        /* ── Idle state ── */
        <label className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'var(--primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {disabled ? 'Upload coming in Wave 2' : 'Drop images here or click to upload'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                JPEG, PNG, WebP · max 10 MB · multiple files supported
              </p>
            </div>
          </div>

          {!disabled && (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />
          )}
        </label>
      )}
    </div>
  )
}
