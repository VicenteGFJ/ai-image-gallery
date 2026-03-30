import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/images/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: image, error } = await supabase
    .from('images')
    .select('*, image_metadata(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !image) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const [{ data: originalData }, { data: thumbnailData }] = await Promise.all([
    supabase.storage.from('images').createSignedUrl(image.original_path, 3600),
    supabase.storage.from('images').createSignedUrl(image.thumbnail_path, 3600),
  ])

  return NextResponse.json({
    ...image,
    metadata: image.image_metadata,
    original_url: originalData?.signedUrl ?? '',
    thumbnail_url: thumbnailData?.signedUrl ?? '',
  })
}

// DELETE /api/images/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: image, error: fetchError } = await supabase
    .from('images')
    .select('original_path, thumbnail_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !image) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Delete from storage
  await supabase.storage.from('images').remove([image.original_path, image.thumbnail_path])

  // Delete from DB (cascade removes metadata)
  const { error: deleteError } = await supabase
    .from('images')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
