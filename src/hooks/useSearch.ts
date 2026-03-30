'use client'

import { useState, useEffect, useRef } from 'react'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'

export function useSearch(onSearch: (query: string) => void) {
  const [query, setQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(query), SEARCH_DEBOUNCE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, onSearch])

  return { query, setQuery }
}
