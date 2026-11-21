import { useState } from 'react'
import './App.css'
import { Sidebar, type ScreenId } from './components/Sidebar'
import { CompanionScreen } from './components/CompanionScreen'
import { CharacterSettingsScreen } from './components/CharacterSettingsScreen'
import { useCharacterProfile } from './hooks/useCharacterProfile'

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('companion')
  const { profile, updateProfile, resetProfile, justSaved } = useCharacterProfile()

  return (
    <div className="app-shell">
      <Sidebar active={activeScreen} onSelect={setActiveScreen} />
      <main className="app-main">
        {activeScreen === 'companion' && <CompanionScreen profile={profile} />}
        {activeScreen === 'settings' && (
          <CharacterSettingsScreen
            profile={profile}
            onChange={updateProfile}
            onReset={resetProfile}
            justSaved={justSaved}
          />
        )}
      </main>
    </div>
  )
}

export default App
