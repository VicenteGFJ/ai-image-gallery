interface TagChipProps {
  tag: string
  size?: 'sm' | 'md'
}

export default function TagChip({ tag, size = 'sm' }: TagChipProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-block rounded-full font-medium ${sizeClass}`}
      style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}
    >
      {tag}
    </span>
  )
}
