import { createServerSupabaseClient } from '@/lib/supabase/server'
import GalleryClient from './GalleryClient'

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { q } = await searchParams

  return <GalleryClient userEmail={user?.email ?? ''} initialQuery={q ?? ''} />
}
