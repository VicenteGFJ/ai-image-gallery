import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { generateThumbnail, getImageDimensions } from '@/lib/image-processing'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, SIGNED_URL_EXPIRY_SECONDS } from '@/lib/constants'
import { randomUUID } from 'crypto'

// GET /api/images — list images with optional search
export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const perPage = 20
  const offset = (page - 1) * perPage
  const query = searchParams.get('q')?.trim() ?? ''

  let dbQuery = supabase
    .from('images')
    .select('*, image_metadata(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  // Full-text search (Wave 3 — basic filter for now)
  if (query) {
    dbQuery = supabase
      .from('image_metadata')
      .select('image_id, images!inner(*), *', { count: 'exact' })
      .eq('user_id', user.id)
      .or(`description.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1) as typeof dbQuery
  }

  const { data: images, error, count } = await dbQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / perPage)

  const imagesWithUrls = await Promise.all(
    (images ?? []).map(async (row) => {
      const image = query ? (row as { images: typeof row }).images ?? row : row
      const metadata = query ? row : (row as { image_metadata: unknown }).image_metadata

      const [{ data: originalData }, { data: thumbnailData }] = await Promise.all([
        supabase.storage.from('images').createSignedUrl(image.original_path, SIGNED_URL_EXPIRY_SECONDS),
        supabase.storage.from('images').createSignedUrl(image.thumbnail_path, SIGNED_URL_EXPIRY_SECONDS),
      ])

      return {
        ...image,
        metadata,
        original_url: originalData?.signedUrl ?? '',
        thumbnail_url: thumbnailData?.signedUrl ?? '',
      }
    })
  )

  return NextResponse.json({ images: imagesWithUrls, total, page, per_page: perPage, total_pages: totalPages })
}

// POST /api/images — upload image
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 })
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const filename = `${randomUUID()}.${ext}`

  // Get dimensions + generate thumbnail
  const [dimensions, thumbnailBuffer] = await Promise.all([
    getImageDimensions(buffer),
    generateThumbnail(buffer),
  ])

  const originalPath = `${user.id}/originals/${filename}`
  const thumbnailFilename = filename.replace(/\.\w+$/, '.jpg')
  const thumbnailPath = `${user.id}/thumbnails/${thumbnailFilename}`

  // Upload to Supabase Storage using service client (bypasses RLS for server-side upload)
  const serviceClient = createServiceClient()

  const [originalUpload, thumbnailUpload] = await Promise.all([
    serviceClient.storage.from('images').upload(originalPath, buffer, { contentType: file.type }),
    serviceClient.storage.from('images').upload(thumbnailPath, thumbnailBuffer, { contentType: 'image/jpeg' }),
  ])

  if (originalUpload.error) {
    return NextResponse.json({ error: `Storage upload failed: ${originalUpload.error.message}` }, { status: 500 })
  }
  if (thumbnailUpload.error) {
    return NextResponse.json({ error: `Thumbnail upload failed: ${thumbnailUpload.error.message}` }, { status: 500 })
  }

  // Insert into DB using service client (with user_id set explicitly — RLS-safe)
  const { data: image, error: dbError } = await serviceClient
    .from('images')
    .insert({
      user_id: user.id,
      filename,
      original_path: originalPath,
      thumbnail_path: thumbnailPath,
      file_size_bytes: file.size,
      mime_type: file.type,
      width: dimensions.width,
      height: dimensions.height,
    })
    .select()
    .single()

  if (dbError || !image) {
    return NextResponse.json({ error: dbError?.message ?? 'DB insert failed' }, { status: 500 })
  }

  const { data: metadata, error: metaError } = await serviceClient
    .from('image_metadata')
    .insert({ image_id: image.id, user_id: user.id, ai_processing_status: 'pending' })
    .select()
    .single()

  if (metaError) {
    return NextResponse.json({ error: metaError.message }, { status: 500 })
  }

  // Generate signed URLs
  const [{ data: originalSigned }, { data: thumbnailSigned }] = await Promise.all([
    serviceClient.storage.from('images').createSignedUrl(originalPath, SIGNED_URL_EXPIRY_SECONDS),
    serviceClient.storage.from('images').createSignedUrl(thumbnailPath, SIGNED_URL_EXPIRY_SECONDS),
  ])

  return NextResponse.json({
    image: {
      ...image,
      metadata,
      original_url: originalSigned?.signedUrl ?? '',
      thumbnail_url: thumbnailSigned?.signedUrl ?? '',
    },
  }, { status: 201 })
}
