import { useEffect, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { INTERACTION_ZONES, type ZoneId } from '../types/interactionZones'
import type { CompanionState } from '../types/companionState'

const MODEL_URL = new URL('../assets/avatar/models/astra_v001.glb', import.meta.url).href

/** Restrained, in-palette glow cue per animation state — layered on top of
 * the real P0 clips below (Phase 5). Real facial micro-expression is still
 * limited to the four basic shape keys built this phase (Blink, Mouth_Open,
 * Smile, Frown); richer expression work is a later pass. */
const STATE_GLOW: Record<CompanionState, { color: THREE.Color; baseIntensity: number }> = {
  boot: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.05 },
  idle: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.15 },
  attention: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.25 },
  listening: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.45 },
  thinking: { color: new THREE.Color('#b084f5'), baseIntensity: 0.4 },
  speaking: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.5 },
  reaction: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.35 },
  error: { color: new THREE.Color('#ff6b6b'), baseIntensity: 0.45 },
}

/** Which clip plays for the current discrete state (reaction is handled
 * separately below, keyed by which zone was touched). */
const STATE_CLIP: Record<CompanionState, string> = {
  boot: 'Idle',
  idle: 'Idle',
  attention: 'Idle',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
  reaction: 'Idle',
  error: 'Idle',
}

const REACTION_CLIP: Record<ZoneId, string> = {
  head: 'LookAt',
  torso: 'LookAt',
  armLeft: 'Wave',
  armRight: 'Wave',
}

/** Invisible proxy colliders track a bone's world position each frame so
 * named hit zones still work on a single skinned mesh (no separate meshes
 * per zone exist anymore, unlike the Phase 2-4 placeholder). */
const ZONE_BONE: Record<ZoneId, string> = {
  head: 'head',
  torso: 'chest',
  armLeft: 'hand.L',
  armRight: 'hand.R',
}

const BLINK_DURATION_S = 0.12

interface AvatarModelProps {
  touchIntensity: number
  companionState: CompanionState
  reactionZoneId: ZoneId | null
  isSpeakingLive: boolean
  onZoneClick: (zoneId: ZoneId) => void
  onZoneHover: (zoneId: ZoneId | null) => void
}

export function AvatarModel({
  touchIntensity,
  companionState,
  reactionZoneId,
  isSpeakingLive,
  onZoneClick,
  onZoneHover,
}: AvatarModelProps) {
  const { scene, animations, nodes } = useGLTF(MODEL_URL) as unknown as {
    scene: THREE.Group
    animations: THREE.AnimationClip[]
    nodes: Record<string, THREE.Object3D>
  }

  const groupRef = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, groupRef)
  const currentActionRef = useRef<THREE.AnimationAction | null>(null)
  const elapsedRef = useRef(0)
  const ownedMaterialsRef = useRef<THREE.Material[]>([])
  const zoneProxyRefs = useRef<Partial<Record<ZoneId, THREE.Mesh>>>({})
  const skinnedMeshRef = useRef<THREE.SkinnedMesh | null>(null)
  const nextBlinkRef = useRef(0)
  const blinkTimerRef = useRef(0)

  // Math.random() can't run during render (purity rule) - roll the first
  // blink delay after mount instead.
  useEffect(() => {
    nextBlinkRef.current = 2 + Math.random() * 3
  }, [])

  // Clone every material in the scene once so the per-frame glow animation
  // below never mutates useGLTF's shared, cached material resources.
  useEffect(() => {
    const cloneMap = new Map<THREE.Material, THREE.Material>()
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.Material
        if (!cloneMap.has(mat)) cloneMap.set(mat, mat.clone())
        obj.material = cloneMap.get(mat)!
      }
      if (obj instanceof THREE.SkinnedMesh && obj.morphTargetDictionary) {
        skinnedMeshRef.current = obj
      }
    })
    ownedMaterialsRef.current = Array.from(cloneMap.values())
  }, [scene])

  function playClip(name: string, loop: boolean, fadeDuration = 0.35) {
    const next = actions[name]
    if (!next) return
    if (currentActionRef.current === next && next.isRunning()) return
    next.reset()
    next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity)
    // AnimationAction is an inherently mutable three.js control object (play/pause/
    // setLoop/clampWhenFinished all mutate it by design) — not a shared cache like
    // useGLTF's materials; each useAnimations() call owns its own action instances.
    // eslint-disable-next-line react-hooks/immutability
    next.clampWhenFinished = !loop
    next.fadeIn(fadeDuration)
    next.play()
    if (currentActionRef.current && currentActionRef.current !== next) {
      currentActionRef.current.fadeOut(fadeDuration)
    }
    currentActionRef.current = next
  }

  // This effect drives three.js AnimationAction control objects via playClip()
  // (see comment above) — mutating them is the documented API, not a React bug.
  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => {
    if (companionState === 'reaction' && reactionZoneId) {
      playClip(REACTION_CLIP[reactionZoneId], false, 0.2)
    } else {
      playClip(STATE_CLIP[companionState], true)
    }

    const mouthAction = actions['Speaking_Mouth']
    if (mouthAction) {
      if (companionState === 'speaking') {
        mouthAction.reset().setLoop(THREE.LoopRepeat, Infinity)
        mouthAction.fadeIn(0.2)
        mouthAction.play()
      } else {
        mouthAction.fadeOut(0.2)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companionState, reactionZoneId, actions])

  useFrame((_, delta) => {
    elapsedRef.current += delta

    // Keep hit-zone proxies glued to their bone's current world position.
    for (const zone of INTERACTION_ZONES) {
      const proxy = zoneProxyRefs.current[zone.id]
      const bone = nodes[ZONE_BONE[zone.id]]
      if (!proxy || !bone) continue
      bone.getWorldPosition(proxy.position)
      if (groupRef.current) groupRef.current.worldToLocal(proxy.position)
    }

    // State glow across every owned material clone.
    const { color, baseIntensity } = STATE_GLOW[companionState]
    let intensity = baseIntensity
    if (companionState === 'listening') {
      intensity += Math.sin(elapsedRef.current * 6) * 0.08
    } else if (companionState === 'thinking') {
      intensity += Math.sin(elapsedRef.current * 10) * 0.1
    } else if (companionState === 'speaking') {
      intensity += (Math.sin(elapsedRef.current * 14) * 0.5 + Math.sin(elapsedRef.current * 23)) * 0.08
    } else if (companionState === 'error') {
      intensity += Math.sin(elapsedRef.current * 3) * 0.15
    }
    for (const mat of ownedMaterialsRef.current) {
      const standard = mat as THREE.MeshStandardMaterial
      if (!standard.emissive) continue
      standard.emissive.lerp(color, Math.min(delta * 6, 1))
      // These are our own clones (made in the mount effect above specifically to
      // avoid mutating useGLTF's shared cache) — mutating them here is the correct,
      // standard R3F imperative-animation pattern, not a shared-state bug.
      // eslint-disable-next-line react-hooks/immutability
      standard.emissiveIntensity = THREE.MathUtils.damp(
        standard.emissiveIntensity,
        Math.max(intensity, 0),
        8,
        delta,
      )
    }

    // Live lip-sync + periodic blink. Runs after the mixer's own update above
    // (hook call order), so this always wins for the current frame.
    const mesh = skinnedMeshRef.current
    const dict = mesh?.morphTargetDictionary
    const influences = mesh?.morphTargetInfluences
    if (dict && influences) {
      // Real TTS audio is playing: drive Mouth_Open directly with a simple
      // oscillation (spec Sec6's "lightweight approximate fallback" — Web
      // Speech API gives no phoneme-level timing to sync precisely to).
      // Stops the instant isSpeakingLive goes false (spec: "stop immediately").
      const mouthIdx = dict['Mouth_Open']
      // influences is a plain mutable Float32Array owned by our own skinnedMeshRef
      // (found via scene.traverse in the mount effect above, same pattern as the
      // material clones) - writing to it per-frame is the standard three.js
      // morph-target control API, not a React state mutation.
      if (mouthIdx !== undefined) {
        if (isSpeakingLive) {
          // eslint-disable-next-line react-hooks/immutability
          influences[mouthIdx] = 0.25 + Math.abs(Math.sin(elapsedRef.current * 12)) * 0.5
        } else if (companionState !== 'speaking') {
          // Not driven by live TTS and no baked clip owns this target either —
          // force it shut so a cancelled/ended utterance never leaves it stuck open.
          influences[mouthIdx] = 0
        }
      }

      // Periodic blink, independent of the discrete state machine — spec Sec6
      // asks to "keep blinking and eye movement active while speaking", and
      // this project had no blink loop at all before this phase.
      const blinkIdx = dict['Blink']
      if (blinkIdx !== undefined) {
        nextBlinkRef.current -= delta
        if (nextBlinkRef.current <= 0 && blinkTimerRef.current <= 0) {
          blinkTimerRef.current = BLINK_DURATION_S
          nextBlinkRef.current = 2.5 + Math.random() * 3.5
        }
        let blinkValue = 0
        if (blinkTimerRef.current > 0) {
          blinkTimerRef.current -= delta
          const progress = 1 - Math.max(blinkTimerRef.current, 0) / BLINK_DURATION_S
          blinkValue = Math.sin(Math.min(progress, 1) * Math.PI)
        }
        influences[blinkIdx] = blinkValue
      }
    }
  })

  function zoneHandlers(zoneId: ZoneId) {
    return {
      onPointerOver: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
        onZoneHover(zoneId)
      },
      onPointerOut: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        document.body.style.cursor = 'auto'
        onZoneHover(null)
      },
      onClick: (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onZoneClick(zoneId)
      },
    }
  }

  void touchIntensity // reserved: reaction intensity now comes from clip choice, not a scale pulse

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      {INTERACTION_ZONES.map((zone) => (
        <mesh
          key={zone.id}
          ref={(m) => {
            zoneProxyRefs.current[zone.id] = m ?? undefined
          }}
          visible={false}
          {...zoneHandlers(zone.id)}
        >
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      ))}
    </group>
  )
}

useGLTF.preload(MODEL_URL)
