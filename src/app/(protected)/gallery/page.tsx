import { createServerSupabaseClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchBar from '@/components/gallery/SearchBar'
import UploadZone from '@/components/gallery/UploadZone'
import GalleryGrid from '@/components/gallery/GalleryGrid'

export default async function GalleryPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Header userEmail={user?.email ?? ''} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <SearchBar disabled />
        </div>

        <div className="mb-8">
          <UploadZone disabled />
        </div>

        <GalleryGrid />
      </main>

      <Footer />
    </div>
  )
}
