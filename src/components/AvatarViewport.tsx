import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { AvatarModel } from './AvatarModel'
import { ViewportErrorBoundary } from './ViewportErrorBoundary'
import type { CompanionState } from '../types/companionState'
import type { ZoneId } from '../types/interactionZones'
import { QUALITY_PRESETS, type QualityPreset } from '../types/qualityPreset'

function ViewportError() {
  return (
    <div className="viewport-status-overlay viewport-error">
      <span className="hud-mono">MODEL LOAD FAILED</span>
      <span className="field-hint">
        Could not load the character asset. The avatar stage stays in placeholder mode;
        nothing else in the app is affected.
      </span>
    </div>
  )
}

interface AvatarViewportProps {
  touchIntensity: number
  companionState: CompanionState
  reactionZoneId: ZoneId | null
  isSpeakingLive: boolean
  qualityPreset: QualityPreset
  isRenderActive: boolean
  onZoneClick: (zoneId: ZoneId) => void
  onZoneHover: (zoneId: ZoneId | null) => void
  onStageHoverChange: (hovering: boolean) => void
}

export function AvatarViewport({
  touchIntensity,
  companionState,
  reactionZoneId,
  isSpeakingLive,
  qualityPreset,
  isRenderActive,
  onZoneClick,
  onZoneHover,
  onStageHoverChange,
}: AvatarViewportProps) {
  const quality = QUALITY_PRESETS[qualityPreset]

  return (
    <ViewportErrorBoundary fallback={<ViewportError />}>
      <div
        className="avatar-canvas-wrap"
        onPointerEnter={() => onStageHoverChange(true)}
        onPointerLeave={() => {
          onZoneHover(null)
          onStageHoverChange(false)
        }}
      >
        <Canvas
          dpr={quality.dpr}
          camera={{ position: [0, 1.3, 2.8], fov: 32 }}
          gl={{ antialias: quality.antialias }}
          // Stops the render loop entirely (no useFrame ticks, no GPU work)
          // while this screen isn't visible or the tab is backgrounded
          // (spec Sec10: "Inactive tab cost") — resumes the instant it is.
          frameloop={isRenderActive ? 'always' : 'never'}
        >
          <color attach="background" args={['#05070d']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[2, 4, 2]} intensity={1.3} />
          <directionalLight position={[-2, 1, -2]} intensity={0.35} color="#4fd8e8" />
          <Suspense fallback={null}>
            <AvatarModel
              touchIntensity={touchIntensity}
              companionState={companionState}
              reactionZoneId={reactionZoneId}
              isSpeakingLive={isSpeakingLive}
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
          {quality.bloom && (
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.4} luminanceThreshold={0.4} luminanceSmoothing={0.3} mipmapBlur />
            </EffectComposer>
          )}
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
