'use client'

import { useEffect, useCallback, useState } from 'react'
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
}

export default function GalleryClient({ userEmail }: GalleryClientProps) {
  const {
    images, total, page, totalPages, loading,
    fetchImages, uploadImage, deleteImage, analyzeImage, updateImageStatus,
  } = useImages()

  const [toasts, setToasts] = useState<ToastData[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentQuery, setCurrentQuery] = useState('')

  function addToast(message: string, type: ToastData['type']) {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Run only on mount
  useEffect(() => {
    fetchImages(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stable callback for useSearch — avoids infinite loop from inline function
  const handleSearch = useCallback((q: string) => {
    setCurrentQuery(q)
    fetchImages(1, q)
  }, [fetchImages])

  const { query, setQuery } = useSearch(handleSearch)

  async function handleUpload(file: File) {
    // Client-side validation
    if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
      addToast('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 'error')
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      addToast('File too large. Maximum size is 10MB.', 'error')
      return
    }

    setUploading(true)
    setUploadProgress(30)

    try {
      setUploadProgress(60)
      await uploadImage(file)
      setUploadProgress(100)
      addToast('Image uploaded successfully!', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Upload failed', 'error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  async function handleAnalyze(id: string) {
    try {
      await analyzeImage(id)
      // Poll for completion
      const poll = setInterval(async () => {
        const res = await fetch(`/api/images/${id}/status`)
        if (!res.ok) { clearInterval(poll); return }
        const data = await res.json()
        updateImageStatus(id, data)
        if (data.ai_processing_status === 'complete') {
          clearInterval(poll)
          addToast('AI analysis complete!', 'success')
        } else if (data.ai_processing_status === 'failed') {
          clearInterval(poll)
          addToast('AI analysis failed. Click "Retry" to try again.', 'error')
        }
      }, AI_POLL_INTERVAL_MS)
    } catch {
      addToast('Failed to start AI analysis', 'error')
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
    fetchImages(p, currentQuery)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Header userEmail={userEmail} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            resultCount={currentQuery ? total : undefined}
          />
        </div>

        <div className="mb-8">
          <UploadZone
            onUpload={handleUpload}
            isUploading={uploading}
            uploadProgress={uploadProgress}
          />
        </div>

        <GalleryGrid
          images={images}
          total={total}
          page={page}
          totalPages={totalPages}
          isLoading={loading}
          searchQuery={currentQuery || undefined}
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
