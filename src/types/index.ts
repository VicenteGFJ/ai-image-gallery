export interface Image {
  id: string
  user_id: string
  filename: string
  original_path: string
  thumbnail_path: string
  file_size_bytes: number | null
  mime_type: string
  width: number | null
  height: number | null
  uploaded_at: string
  updated_at: string
  // Joined from image_metadata
  metadata?: ImageMetadata
  // Computed signed URLs
  original_url?: string
  thumbnail_url?: string
}

export interface ImageMetadata {
  id: string
  image_id: string
  user_id: string
  description: string | null
  tags: string[]
  ai_processing_status: 'pending' | 'processing' | 'complete' | 'failed'
  ai_error_message: string | null
  model_used: string | null
  processing_time_ms: number | null
  created_at: string
  updated_at: string
}

export interface ImageWithUrls extends Image {
  original_url: string
  thumbnail_url: string
  metadata: ImageMetadata
}

export interface PaginatedImages {
  images: ImageWithUrls[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface UploadResponse {
  image: ImageWithUrls
}

export interface ApiError {
  error: string
  details?: string
}
