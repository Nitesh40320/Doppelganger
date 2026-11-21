import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_CHARACTER_PROFILE, type CharacterProfile } from '../types/characterProfile'

const STORAGE_KEY = 'doppelganger.characterProfile.v1'

function loadProfile(): CharacterProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CHARACTER_PROFILE
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_CHARACTER_PROFILE, ...parsed }
  } catch {
    return DEFAULT_CHARACTER_PROFILE
  }
}

export function useCharacterProfile() {
  const [profile, setProfile] = useState<CharacterProfile>(loadProfile)
  const [justSaved, setJustSaved] = useState(false)
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  const flashSaved = useCallback(() => {
    setJustSaved(true)
    if (savedTimeout.current) clearTimeout(savedTimeout.current)
    savedTimeout.current = setTimeout(() => setJustSaved(false), 1500)
  }, [])

  useEffect(() => {
    return () => {
      if (savedTimeout.current) clearTimeout(savedTimeout.current)
    }
  }, [])

  const updateProfile = useCallback(
    (patch: Partial<CharacterProfile>) => {
      setProfile((prev) => ({ ...prev, ...patch }))
      flashSaved()
    },
    [flashSaved],
  )

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_CHARACTER_PROFILE)
    flashSaved()
  }, [flashSaved])

  return { profile, updateProfile, resetProfile, justSaved }
}
