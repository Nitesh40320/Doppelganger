import { ADDRESS_MODE_OPTIONS, type CharacterProfile } from '../types/characterProfile'

interface CharacterSettingsScreenProps {
  profile: CharacterProfile
  onChange: (patch: Partial<CharacterProfile>) => void
  onReset: () => void
  justSaved: boolean
}

export function CharacterSettingsScreen({
  profile,
  onChange,
  onReset,
  justSaved,
}: CharacterSettingsScreenProps) {
  return (
    <section className="settings-screen">
      <header className="settings-header">
        <h1>Character Settings</h1>
        <span className={`save-indicator${justSaved ? ' visible' : ''}`}>Saved</span>
      </header>

      <div className="settings-grid">
        <label className="field">
          <span className="field-label">Character name</span>
          <input
            type="text"
            value={profile.characterName}
            onChange={(e) => onChange({ characterName: e.target.value })}
            placeholder="Astra"
          />
        </label>

        <label className="field">
          <span className="field-label">Your preferred name</span>
          <input
            type="text"
            value={profile.userPreferredName}
            onChange={(e) => onChange({ userPreferredName: e.target.value })}
            placeholder="Rojin"
          />
        </label>

        <label className="field">
          <span className="field-label">How she addresses you</span>
          <select
            value={profile.addressMode}
            onChange={(e) => onChange({ addressMode: e.target.value as CharacterProfile['addressMode'] })}
          >
            {ADDRESS_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {profile.addressMode === 'custom' && (
          <label className="field">
            <span className="field-label">Custom form of address</span>
            <input
              type="text"
              value={profile.customAddress}
              onChange={(e) => onChange({ customAddress: e.target.value })}
              placeholder="e.g. Captain"
              maxLength={40}
            />
          </label>
        )}

        <label className="field">
          <span className="field-label">Personality preset</span>
          <input
            type="text"
            value={profile.personalityPreset}
            onChange={(e) => onChange({ personalityPreset: e.target.value })}
            placeholder="Warm / playful / intelligent"
          />
        </label>

        <div className="field readonly-field">
          <span className="field-label">Selected outfit</span>
          <span className="field-static">{profile.selectedOutfit}</span>
          <span className="field-hint">Change this from the Wardrobe screen.</span>
        </div>

        <label className="field toggle-field">
          <span className="field-label">Cursor gaze</span>
          <input
            type="checkbox"
            checked={profile.cursorGaze}
            onChange={(e) => onChange({ cursorGaze: e.target.checked })}
          />
          <span className="field-hint">
            Temporarily paused: the real rigged character's baked animation clips (Phase 5)
            now drive head movement, and layering live cursor-follow on top without fighting
            those clips needs additive animation blending — planned for a later pass.
          </span>
        </label>

        <label className="field toggle-field">
          <span className="field-label">Touch reactions</span>
          <input
            type="checkbox"
            checked={profile.touchReactions}
            onChange={(e) => onChange({ touchReactions: e.target.checked })}
          />
          <span className="field-hint">
            Click the head/hands on the companion stage for a brief reaction (Phase 3).
          </span>
        </label>

        <label className="field">
          <span className="field-label">Touch reaction intensity</span>
          <input
            type="range"
            min={0}
            max={100}
            value={profile.touchIntensity}
            disabled={!profile.touchReactions}
            onChange={(e) => onChange({ touchIntensity: Number(e.target.value) })}
          />
          <span className="field-hint">{profile.touchIntensity}%</span>
        </label>

        <label className="field toggle-field">
          <span className="field-label">Sound effects</span>
          <input
            type="checkbox"
            checked={profile.soundEffects}
            onChange={(e) => onChange({ soundEffects: e.target.checked })}
          />
          <span className="field-hint">
            No reaction sounds are wired up yet. This only stores your preference for later.
          </span>
        </label>

        <label className="field toggle-field">
          <span className="field-label">Voice activation</span>
          <select
            value={profile.voiceActivation}
            onChange={(e) =>
              onChange({ voiceActivation: e.target.value as CharacterProfile['voiceActivation'] })
            }
          >
            <option value="push-to-talk">Push-to-talk</option>
            <option value="always-on">Always listening</option>
          </select>
          <span className="field-hint">
            No microphone or voice pipeline is connected yet (Phase 8). This only stores your
            preference for later.
          </span>
        </label>
      </div>

      <button type="button" className="reset-button" onClick={onReset}>
        Reset to defaults
      </button>
    </section>
  )
}
