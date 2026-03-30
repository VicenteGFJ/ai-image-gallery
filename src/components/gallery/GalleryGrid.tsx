'use client'

import { useState } from 'react'
import ImageCard from './ImageCard'
import ImageModal from './ImageModal'
import EmptyState from './EmptyState'
import Pagination from './Pagination'
import { ImageCardSkeleton } from '@/components/ui/Skeleton'
import type { ImageWithUrls } from '@/types'

interface GalleryGridProps {
  images?: ImageWithUrls[]
  total?: number
  page?: number
  totalPages?: number
  isLoading?: boolean
  searchQuery?: string
  onPageChange?: (page: number) => void
  onDelete?: (id: string) => void
  onAnalyze?: (id: string) => void
}

export default function GalleryGrid({
  images = [],
  total = 0,
  page = 1,
  totalPages = 0,
  isLoading = false,
  searchQuery,
  onPageChange,
  onDelete,
  onAnalyze,
}: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageWithUrls | null>(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ImageCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return <EmptyState searchQuery={searchQuery} />
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => setSelectedImage(image)}
            onAnalyze={onAnalyze}
          />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange ?? (() => {})}
      />

      <ImageModal
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        onDelete={onDelete}
      />
    </>
  )
}
