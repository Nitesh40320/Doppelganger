import { useCallback, useEffect, useState } from 'react'
import type { MemoryCategory, MemoryEntry } from '../types/memory'

const STORAGE_KEY = 'doppelganger.memoryEntries.v1'

function loadEntries(): MemoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export interface NewMemoryEntryInput {
  category: MemoryCategory
  content: string
  source?: string
  confidence?: number
}

export function useMemoryStore() {
  const [entries, setEntries] = useState<MemoryEntry[]>(loadEntries)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const addEntry = useCallback((input: NewMemoryEntryInput) => {
    const now = Date.now()
    const entry: MemoryEntry = {
      id: crypto.randomUUID(),
      category: input.category,
      content: input.content.trim(),
      source: input.source?.trim() ?? '',
      confidence: input.confidence ?? 100,
      createdAt: now,
      updatedAt: now,
    }
    setEntries((prev) => [entry, ...prev])
  }, [])

  const updateEntry = useCallback((id: string, patch: Partial<NewMemoryEntryInput>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e)),
    )
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setEntries([])
  }, [])

  return { entries, addEntry, updateEntry, deleteEntry, clearAll }
}
