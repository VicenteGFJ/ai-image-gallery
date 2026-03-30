import { createServerSupabaseClient } from '@/lib/supabase/server'
import GalleryClient from './GalleryClient'

export default async function GalleryPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <GalleryClient userEmail={user?.email ?? ''} />
}
