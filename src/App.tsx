import { useState } from 'react'
import './App.css'
import { Sidebar, type ScreenId } from './components/Sidebar'
import { CompanionScreen } from './components/CompanionScreen'
import { CharacterSettingsScreen } from './components/CharacterSettingsScreen'
import { WardrobeScreen } from './components/WardrobeScreen'
import { MemoryScreen } from './components/MemoryScreen'
import { useCharacterProfile } from './hooks/useCharacterProfile'

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('companion')
  const { profile, updateProfile, resetProfile, justSaved } = useCharacterProfile()

  return (
    <div className="app-shell">
      <Sidebar active={activeScreen} onSelect={setActiveScreen} />
      <main className="app-main">
        {/* Always mounted, hidden via CSS rather than unmounted: switching
            screens must not reload the 3D scene or reset the companion's
            animation state (spec Sec3/Sec14, Phase 6 acceptance criterion). */}
        <div style={{ display: activeScreen === 'companion' ? 'block' : 'none', height: '100%' }}>
          <CompanionScreen profile={profile} isActiveScreen={activeScreen === 'companion'} />
        </div>
        {activeScreen === 'settings' && (
          <CharacterSettingsScreen
            profile={profile}
            onChange={updateProfile}
            onReset={resetProfile}
            justSaved={justSaved}
          />
        )}
        {activeScreen === 'wardrobe' && (
          <WardrobeScreen profile={profile} onChange={updateProfile} />
        )}
        {activeScreen === 'memory' && <MemoryScreen />}
      </main>
    </div>
  )
}

export default App
