'use client'

import { useState, useCallback } from 'react'
import type { ImageWithUrls, PaginatedImages } from '@/types'
import { IMAGES_PER_PAGE } from '@/lib/constants'

export function useImages() {
  const [images, setImages] = useState<ImageWithUrls[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derived: recalculates automatically whenever total changes (upload, delete, fetch)
  const totalPages = Math.ceil(total / IMAGES_PER_PAGE)

  const fetchImages = useCallback(async (pageNum = 1, query = ''): Promise<{ total: number } | null> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ page: String(pageNum) })
      if (query) params.set('q', query)

      const res = await fetch(`/api/images?${params}`)
      if (!res.ok) throw new Error('Failed to fetch images')

      const data: PaginatedImages = await res.json()
      setImages(data.images)
      setTotal(data.total)
      setPage(data.page)
      return { total: data.total }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadImage = useCallback(async (file: File): Promise<ImageWithUrls | null> => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/images', { method: 'POST', body: formData })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Upload failed')
    }

    const { image } = await res.json()
    setImages(prev => [image, ...prev])
    setTotal(prev => prev + 1)
    return image
  }, [])

  const deleteImage = useCallback(async (id: string) => {
    const res = await fetch(`/api/images/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    setImages(prev => prev.filter(img => img.id !== id))
    setTotal(prev => prev - 1)
  }, [])

  const analyzeImage = useCallback(async (id: string) => {
    // Optimistically set processing state
    setImages(prev => prev.map(img =>
      img.id === id
        ? { ...img, metadata: { ...img.metadata!, ai_processing_status: 'processing' } }
        : img
    ))

    const res = await fetch(`/api/images/${id}/analyze`, { method: 'POST' })
    if (!res.ok) {
      setImages(prev => prev.map(img =>
        img.id === id
          ? { ...img, metadata: { ...img.metadata!, ai_processing_status: 'failed' } }
          : img
      ))
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? 'Analysis failed')
    }
  }, [])

  const updateImageStatus = useCallback((id: string, updates: Partial<ImageWithUrls['metadata']>) => {
    setImages(prev => prev.map(img =>
      img.id === id
        ? { ...img, metadata: { ...img.metadata!, ...updates } }
        : img
    ))
  }, [])

  return {
    images,
    total,
    page,
    totalPages,
    loading,
    error,
    fetchImages,
    uploadImage,
    deleteImage,
    analyzeImage,
    updateImageStatus,
    setPage,
  }
}
