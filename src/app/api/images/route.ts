import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

  const { data: images, error, count } = await supabase
    .from('images')
    .select('*, image_metadata(*)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / perPage)

  // Generate signed URLs
  const imagesWithUrls = await Promise.all(
    (images ?? []).map(async (image) => {
      const [{ data: originalData }, { data: thumbnailData }] = await Promise.all([
        supabase.storage.from('images').createSignedUrl(image.original_path, 3600),
        supabase.storage.from('images').createSignedUrl(image.thumbnail_path, 3600),
      ])

      return {
        ...image,
        metadata: image.image_metadata,
        original_url: originalData?.signedUrl ?? '',
        thumbnail_url: thumbnailData?.signedUrl ?? '',
      }
    })
  )

  return NextResponse.json({
    images: imagesWithUrls,
    total,
    page,
    per_page: perPage,
    total_pages: totalPages,
  })
}

// POST /api/images — upload image (Wave 2)
export async function POST() {
  return NextResponse.json({ error: 'Upload not yet implemented (Wave 2)' }, { status: 501 })
}
