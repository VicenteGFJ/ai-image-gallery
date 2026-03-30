'use client'

interface UploadZoneProps {
  disabled?: boolean
  onUpload?: (file: File) => void
  isUploading?: boolean
  uploadProgress?: number
}

export default function UploadZone({ disabled, onUpload, isUploading, uploadProgress }: UploadZoneProps) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && onUpload) {
      onUpload(file)
    }
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file && onUpload) {
      onUpload(file)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative rounded-xl border-2 border-dashed p-8 text-center transition"
      style={{
        borderColor: 'var(--card-border)',
        backgroundColor: 'var(--card)',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
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
              {disabled ? 'Upload coming in Wave 2' : isUploading ? 'Uploading…' : 'Drop image here or click to upload'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              JPEG, PNG, WebP · max 10 MB
            </p>
          </div>
        </div>

        {!disabled && !isUploading && (
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />
        )}
      </label>

      {isUploading && uploadProgress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%`, backgroundColor: 'var(--primary)' }}
            />
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{uploadProgress}%</p>
        </div>
      )}
    </div>
  )
}
