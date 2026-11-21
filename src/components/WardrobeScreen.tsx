import type { CharacterProfile } from '../types/characterProfile'
import { OUTFITS } from '../types/outfits'

interface WardrobeScreenProps {
  profile: CharacterProfile
  onChange: (patch: Partial<CharacterProfile>) => void
}

export function WardrobeScreen({ profile, onChange }: WardrobeScreenProps) {
  return (
    <section className="wardrobe-screen">
      <header className="settings-header">
        <h1>Wardrobe</h1>
      </header>
      <p className="placeholder-note wardrobe-intro">
        Switching outfits here does not interrupt whatever {profile.characterName} is doing —
        her conversation state and current animation keep running on the Companion screen.
      </p>
      <div className="outfit-grid">
        {OUTFITS.map((outfit) => {
          const selected = profile.selectedOutfit === outfit.id
          return (
            <div
              key={outfit.id}
              className={`outfit-card hud-frame-soft${selected ? ' selected' : ''}${!outfit.available ? ' unavailable' : ''}`}
            >
              <div className="outfit-card-header">
                <span className="outfit-name">{outfit.name}</span>
                {selected && <span className="outfit-badge selected-badge hud-mono">SELECTED</span>}
                {!outfit.available && <span className="outfit-badge hud-mono">SOON</span>}
              </div>
              <p className="outfit-direction">{outfit.direction}</p>
              {outfit.available ? (
                <button
                  type="button"
                  className="outfit-select-button"
                  disabled={selected}
                  onClick={() => onChange({ selectedOutfit: outfit.id })}
                >
                  {selected ? 'Currently worn' : 'Wear this outfit'}
                </button>
              ) : (
                <span className="field-hint">{outfit.unavailableReason}</span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
