import Image from 'next/image'

interface EmptyStateProps {
  searchQuery?: string
}

export default function EmptyState({ searchQuery }: EmptyStateProps) {
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-5xl">🔍</div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          No images match &ldquo;{searchQuery}&rdquo;
        </h3>
        <p className="text-sm" style={{ color: 'var(--secondary)' }}>
          Try different keywords or upload more images
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6">
        <Image
          src="/placeholder.svg"
          alt="Empty gallery"
          width={120}
          height={120}
          className="opacity-40"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
        Your gallery is empty
      </h3>
      <p className="text-sm" style={{ color: 'var(--secondary)' }}>
        Upload your first image to get started
      </p>
    </div>
  )
}
