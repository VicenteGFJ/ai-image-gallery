'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchBar from '@/components/gallery/SearchBar'
import UploadZone from '@/components/gallery/UploadZone'
import GalleryGrid from '@/components/gallery/GalleryGrid'
import { ToastContainer, type ToastData } from '@/components/ui/Toast'
import { useImages } from '@/hooks/useImages'
import { useSearch } from '@/hooks/useSearch'
import { AI_POLL_INTERVAL_MS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/constants'

interface GalleryClientProps {
  userEmail: string
  initialQuery: string
}

export default function GalleryClient({ userEmail, initialQuery }: GalleryClientProps) {
  const router = useRouter()

  const {
    images, total, page, totalPages, loading,
    fetchImages, uploadImage, deleteImage, analyzeImage, updateImageStatus,
  } = useImages()

  const [toasts, setToasts] = useState<ToastData[]>([])

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadPhase, setUploadPhase] = useState('')

  // Analyze-all queue state
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false)
  const [analyzeAllCurrent, setAnalyzeAllCurrent] = useState(0)
  const [analyzeAllTotal, setAnalyzeAllTotal] = useState(0)

  function addToast(message: string, type: ToastData['type']) {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Fetch images whenever URL ?q param changes; toast result count when searching
  useEffect(() => {
    fetchImages(1, initialQuery).then(result => {
      if (initialQuery && result !== null) {
        const count = result.total
        addToast(
          count === 0
            ? 'No images match your search'
            : `${count} image${count !== 1 ? 's' : ''} found`,
          count === 0 ? 'info' : 'success'
        )
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const handleSearch = useCallback((q: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    router.replace(`/gallery${q ? `?${params}` : ''}`, { scroll: false })
  }, [router])

  const { query, setQuery } = useSearch(handleSearch)

  // ── Multi-file upload ────────────────────────────────────────────────────────

  // Per-file progress (0-100) mapped into an overall slice of the ring
  function overallProgress(fileIndex: number, total: number, fileProgress: number) {
    if (total === 0) return 0
    const sliceSize = 100 / total
    return Math.round((fileIndex / total) * 100 + (fileProgress / 100) * sliceSize)
  }

  async function handleUpload(files: File[]) {
    const valid: File[] = []
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
        addToast(`"${file.name}": Invalid file type. Only JPEG, PNG, and WebP are allowed.`, 'error')
        continue
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        addToast(`"${file.name}": File too large. Maximum size is 10 MB.`, 'error')
        continue
      }
      valid.push(file)
    }

    if (valid.length === 0) return

    const multi = valid.length > 1
    setUploading(true)

    let succeeded = 0

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i]
      const label = multi ? ` (${i + 1} of ${valid.length})` : ''

      setUploadPhase(`Preparing upload${label}…`)
      setUploadProgress(overallProgress(i, valid.length, 8))

      try {
        await new Promise(r => setTimeout(r, 150))

        setUploadPhase(`Uploading image${label}…`)
        setUploadProgress(overallProgress(i, valid.length, 30))

        await uploadImage(file)

        setUploadPhase(`Generating thumbnail${label}…`)
        setUploadProgress(overallProgress(i, valid.length, 82))
        await new Promise(r => setTimeout(r, 300))

        setUploadProgress(overallProgress(i, valid.length, 100))
        succeeded++

        if (!multi) addToast('Image uploaded successfully!', 'success')
      } catch (err) {
        addToast(err instanceof Error ? err.message : `Failed to upload "${file.name}"`, 'error')
      }
    }

    if (multi && succeeded > 0) {
      addToast(
        succeeded === valid.length
          ? `${succeeded} images uploaded successfully!`
          : `${succeeded} of ${valid.length} images uploaded.`,
        'success'
      )
    }

    setUploading(false)
    setUploadProgress(0)
    setUploadPhase('')
  }

  // ── AI analysis ──────────────────────────────────────────────────────────────

  // Awaitable: resolves when the image reaches complete or failed
  async function analyzeAndWait(id: string): Promise<'complete' | 'failed'> {
    await analyzeImage(id)
    return new Promise((resolve) => {
      const poll = setInterval(async () => {
        try {
          const res = await fetch(`/api/images/${id}/status`)
          if (!res.ok) { clearInterval(poll); resolve('failed'); return }
          const data = await res.json()
          updateImageStatus(id, data)
          if (data.ai_processing_status === 'complete') {
            clearInterval(poll); resolve('complete')
          } else if (data.ai_processing_status === 'failed') {
            clearInterval(poll); resolve('failed')
          }
        } catch {
          clearInterval(poll); resolve('failed')
        }
      }, AI_POLL_INTERVAL_MS)
    })
  }

  // Single-image analyze (called from ImageCard)
  async function handleAnalyze(id: string) {
    try {
      const result = await analyzeAndWait(id)
      if (result === 'complete') {
        addToast('AI analysis complete!', 'success')
      } else {
        addToast('AI analysis failed. Click "Retry" to try again.', 'error')
      }
    } catch {
      addToast('Failed to start AI analysis', 'error')
    }
  }

  // Bulk analyze: sequential queue
  async function handleAnalyzeAll() {
    const pending = images.filter(img => img.metadata?.ai_processing_status === 'pending')
    if (pending.length === 0) return

    setIsAnalyzingAll(true)
    setAnalyzeAllTotal(pending.length)
    setAnalyzeAllCurrent(0)

    let completed = 0
    let failed = 0

    for (let i = 0; i < pending.length; i++) {
      setAnalyzeAllCurrent(i + 1)
      try {
        const result = await analyzeAndWait(pending[i].id)
        if (result === 'complete') completed++
        else failed++
      } catch {
        failed++
      }
    }

    setIsAnalyzingAll(false)
    setAnalyzeAllCurrent(0)
    setAnalyzeAllTotal(0)

    if (failed === 0) {
      addToast(`All ${completed} image${completed !== 1 ? 's' : ''} analyzed successfully!`, 'success')
    } else {
      addToast(`${completed} analyzed, ${failed} failed.`, 'error')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteImage(id)
      addToast('Image deleted.', 'info')
    } catch {
      addToast('Failed to delete image.', 'error')
    }
  }

  function handlePageChange(p: number) {
    fetchImages(p, initialQuery)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Derived
  const pendingCount = images.filter(img => img.metadata?.ai_processing_status === 'pending').length
  const showAnalyzeBanner = !loading && (isAnalyzingAll || pendingCount >= 2)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Header userEmail={userEmail} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <div className="mb-6">
          <UploadZone
            onUpload={handleUpload}
            isUploading={uploading}
            uploadProgress={uploadProgress}
            uploadPhase={uploadPhase}
          />
        </div>

        {/* ── Analyze-all banner ────────────────────────────────────────────── */}
        {showAnalyzeBanner && (
          <div
            className="mb-6 flex items-center justify-between gap-4 rounded-xl px-5 py-4"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--card-border)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Icon */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
              >
                {isAnalyzingAll ? (
                  <div
                    className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                  />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                )}
              </div>

              {/* Text + progress */}
              <div className="min-w-0">
                {isAnalyzingAll ? (
                  <>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      Analyzing image {analyzeAllCurrent} of {analyzeAllTotal}…
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 w-40 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--card-border)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round((analyzeAllCurrent / analyzeAllTotal) * 100)}%`,
                            backgroundColor: 'var(--accent)',
                            transition: 'width 400ms ease-out',
                            boxShadow: '0 0 6px var(--accent)',
                          }}
                        />
                      </div>
                      <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
                        {Math.round((analyzeAllCurrent / analyzeAllTotal) * 100)}%
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {pendingCount} images waiting for AI analysis
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Analyze them all sequentially with one click
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Action button */}
            {!isAnalyzingAll && (
              <button
                onClick={handleAnalyzeAll}
                className="shrink-0 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                Analyze all with AI
              </button>
            )}
          </div>
        )}

        <GalleryGrid
          images={images}
          total={total}
          page={page}
          totalPages={totalPages}
          isLoading={loading}
          searchQuery={initialQuery || undefined}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
          onAnalyze={handleAnalyze}
        />
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
