export const APP_NAME = 'AI Image Gallery'

export const IMAGES_PER_PAGE = 20

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const THUMBNAIL_SIZE = 300

export const SIGNED_URL_EXPIRY_SECONDS = 3600 // 1 hour

export const AI_POLL_INTERVAL_MS = 2000 // 2 seconds

export const SEARCH_DEBOUNCE_MS = 300

export const TOAST_DURATION_MS = 5000
