import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader, OrbitControls } from '@react-three/drei'
import { AvatarModel } from './AvatarModel'
import { ViewportErrorBoundary } from './ViewportErrorBoundary'
import type { ActiveReaction } from '../hooks/useAvatarReactions'
import type { ZoneId } from '../types/interactionZones'

function ViewportError() {
  return (
    <div className="viewport-status-overlay viewport-error">
      <span className="hud-mono">MODEL LOAD FAILED</span>
      <span className="field-hint">
        Could not load the test asset. The avatar stage stays in placeholder mode; nothing
        else in the app is affected.
      </span>
    </div>
  )
}

interface AvatarViewportProps {
  cursorGazeEnabled: boolean
  touchIntensity: number
  activeReaction: ActiveReaction | null
  onZoneClick: (zoneId: ZoneId) => void
  onZoneHover: (zoneId: ZoneId | null) => void
}

export function AvatarViewport({
  cursorGazeEnabled,
  touchIntensity,
  activeReaction,
  onZoneClick,
  onZoneHover,
}: AvatarViewportProps) {
  const [isPointerInStage, setIsPointerInStage] = useState(false)

  return (
    <ViewportErrorBoundary fallback={<ViewportError />}>
      <div
        className="avatar-canvas-wrap"
        onPointerEnter={() => setIsPointerInStage(true)}
        onPointerLeave={() => {
          setIsPointerInStage(false)
          onZoneHover(null)
        }}
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.3, 2.8], fov: 32 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#05070d']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[2, 4, 2]} intensity={1.3} />
          <directionalLight position={[-2, 1, -2]} intensity={0.35} color="#4fd8e8" />
          <Suspense fallback={null}>
            <AvatarModel
              cursorGazeEnabled={cursorGazeEnabled}
              isPointerInStage={isPointerInStage}
              touchIntensity={touchIntensity}
              activeReaction={activeReaction}
              onZoneClick={onZoneClick}
              onZoneHover={onZoneHover}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={1.8}
            maxDistance={4.5}
            target={[0, 1, 0]}
          />
        </Canvas>
      </div>
      <Loader
        containerStyles={{ background: 'rgba(5, 7, 13, 0.85)' }}
        barStyles={{ background: '#4fd8e8' }}
        dataStyles={{ fontFamily: "'Share Tech Mono', monospace", color: '#4fd8e8' }}
      />
    </ViewportErrorBoundary>
  )
}
