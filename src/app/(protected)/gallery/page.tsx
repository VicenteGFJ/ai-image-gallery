import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import GalleryClient from './GalleryClient'

export default async function GalleryPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <Suspense fallback={null}>
      <GalleryClient userEmail={user?.email ?? ''} />
    </Suspense>
  )
}
