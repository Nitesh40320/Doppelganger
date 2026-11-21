import { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { INTERACTION_ZONES, REACTION_DURATION_MS, type ZoneId } from '../types/interactionZones'
import type { CompanionState } from '../types/companionState'

const TEST_MODEL_URL = new URL(
  '../assets/avatar/models/test/placeholder_hologram_v001.glb',
  import.meta.url,
).href

const MAX_YAW = THREE.MathUtils.degToRad(28)
const MAX_PITCH = THREE.MathUtils.degToRad(16)
const DAMP_LAMBDA = 7

/** Restrained, in-palette glow cue per animation state. Real facial/viseme
 * cues arrive with the rigged character (Phase 5) and lip-sync (Phase 8) —
 * this is a deliberately simple stand-in so the state machine's output is
 * visible today, not a claim that this is the final speaking/listening look. */
const STATE_GLOW: Record<CompanionState, { color: THREE.Color; baseIntensity: number }> = {
  boot: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.1 },
  idle: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.35 },
  attention: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.5 },
  listening: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.8 },
  thinking: { color: new THREE.Color('#b084f5'), baseIntensity: 0.75 },
  speaking: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.95 },
  reaction: { color: new THREE.Color('#4fd8e8'), baseIntensity: 0.7 },
  error: { color: new THREE.Color('#ff6b6b'), baseIntensity: 0.6 },
}

interface AvatarModelProps {
  cursorGazeEnabled: boolean
  isPointerInStage: boolean
  touchIntensity: number
  companionState: CompanionState
  reactionZoneId: ZoneId | null
  onZoneClick: (zoneId: ZoneId) => void
  onZoneHover: (zoneId: ZoneId | null) => void
}

export function AvatarModel({
  cursorGazeEnabled,
  isPointerInStage,
  touchIntensity,
  companionState,
  reactionZoneId,
  onZoneClick,
  onZoneHover,
}: AvatarModelProps) {
  const { nodes, materials } = useGLTF(TEST_MODEL_URL) as unknown as {
    nodes: Record<string, THREE.Mesh>
    materials: Record<string, THREE.Material & THREE.MeshStandardMaterial>
  }

  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const zoneRefs = useRef<Partial<Record<ZoneId, THREE.Mesh>>>({})
  const reactionStartRef = useRef(0)
  const elapsedRef = useRef(0)

  // useGLTF's returned materials are a shared, cached resource. Clone our own
  // copy after mount and swap every mesh over to it, so the per-frame
  // emissive animation below never mutates the shared cache.
  const sharedMaterial = materials['Placeholder_Hologram_Mat']
  const ownedMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)

  useEffect(() => {
    const clone = sharedMaterial.clone()
    ownedMaterialRef.current = clone
    groupRef.current?.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material === sharedMaterial) {
        obj.material = clone
      }
    })
  }, [sharedMaterial])

  useEffect(() => {
    if (reactionZoneId) reactionStartRef.current = performance.now()
  }, [reactionZoneId])

  useFrame((state, delta) => {
    elapsedRef.current += delta

    // Idle breathing: a very small, slow vertical scale oscillation on the
    // whole figure. Stands in for a real breathing clip until Phase 5.
    const group = groupRef.current
    if (group) {
      const breathe =
        companionState === 'idle' || companionState === 'attention'
          ? 1 + Math.sin(elapsedRef.current * 1.1) * 0.012
          : 1
      group.scale.set(1, THREE.MathUtils.damp(group.scale.y, breathe, 6, delta), 1)
    }

    // Head gaze: continuous low-level behavior, independent of the discrete
    // state machine above it (matches spec Sec4's always-on gaze tracking).
    const head = headRef.current
    if (head) {
      const targetYaw =
        cursorGazeEnabled && isPointerInStage
          ? THREE.MathUtils.clamp(state.pointer.x * MAX_YAW, -MAX_YAW, MAX_YAW)
          : 0
      const targetPitch =
        cursorGazeEnabled && isPointerInStage
          ? THREE.MathUtils.clamp(-state.pointer.y * MAX_PITCH, -MAX_PITCH, MAX_PITCH)
          : 0
      head.rotation.y = THREE.MathUtils.damp(head.rotation.y, targetYaw, DAMP_LAMBDA, delta)
      head.rotation.x = THREE.MathUtils.damp(head.rotation.x, targetPitch, DAMP_LAMBDA, delta)
    }

    // Reaction pulse: scale the targeted zone mesh up and back down.
    for (const zone of INTERACTION_ZONES) {
      const mesh = zoneRefs.current[zone.id]
      const baseNode = nodes[zone.nodeName]
      if (!mesh || !baseNode) continue
      let pulse = 0
      if (companionState === 'reaction' && reactionZoneId === zone.id) {
        const elapsed = performance.now() - reactionStartRef.current
        const t = Math.min(elapsed / REACTION_DURATION_MS, 1)
        pulse = Math.sin(t * Math.PI)
      }
      const targetMultiplier = 1 + pulse * 0.18 * (touchIntensity / 100)
      const currentMultiplier = mesh.scale.x / (baseNode.scale.x || 1)
      const dampedMultiplier = THREE.MathUtils.damp(currentMultiplier, targetMultiplier, 10, delta)
      mesh.scale.set(
        baseNode.scale.x * dampedMultiplier,
        baseNode.scale.y * dampedMultiplier,
        baseNode.scale.z * dampedMultiplier,
      )
    }

    // State glow: one shared (owned-clone) material, so this is a single
    // global cue rather than per-mesh — simple and legible for a primitive placeholder.
    const mat = ownedMaterialRef.current
    if (mat) {
      const { color, baseIntensity } = STATE_GLOW[companionState]
      let intensity = baseIntensity
      if (companionState === 'listening') {
        intensity += Math.sin(elapsedRef.current * 6) * 0.15
      } else if (companionState === 'thinking') {
        intensity += Math.sin(elapsedRef.current * 10) * 0.2
      } else if (companionState === 'speaking') {
        intensity += (Math.sin(elapsedRef.current * 14) * 0.5 + Math.sin(elapsedRef.current * 23)) * 0.15
      } else if (companionState === 'error') {
        intensity += Math.sin(elapsedRef.current * 3) * 0.25
      }
      mat.emissive.lerp(color, Math.min(delta * 6, 1))
      mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, Math.max(intensity, 0), 8, delta)
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

  return (
    <group ref={groupRef}>
      <mesh
        ref={(m) => {
          headRef.current = m
          zoneRefs.current.head = m ?? undefined
        }}
        geometry={nodes.Placeholder_Head.geometry}
        material={sharedMaterial}
        position={nodes.Placeholder_Head.position}
        scale={nodes.Placeholder_Head.scale}
        {...zoneHandlers('head')}
      />
      <mesh
        ref={(m) => {
          zoneRefs.current.torso = m ?? undefined
        }}
        geometry={nodes.Placeholder_Torso.geometry}
        material={sharedMaterial}
        position={nodes.Placeholder_Torso.position}
        scale={nodes.Placeholder_Torso.scale}
        {...zoneHandlers('torso')}
      />
      <mesh
        ref={(m) => {
          zoneRefs.current.armLeft = m ?? undefined
        }}
        geometry={nodes.Placeholder_ArmL.geometry}
        material={sharedMaterial}
        position={nodes.Placeholder_ArmL.position}
        rotation={nodes.Placeholder_ArmL.rotation}
        scale={nodes.Placeholder_ArmL.scale}
        {...zoneHandlers('armLeft')}
      />
      <mesh
        ref={(m) => {
          zoneRefs.current.armRight = m ?? undefined
        }}
        geometry={nodes.Placeholder_ArmR.geometry}
        material={sharedMaterial}
        position={nodes.Placeholder_ArmR.position}
        rotation={nodes.Placeholder_ArmR.rotation}
        scale={nodes.Placeholder_ArmR.scale}
        {...zoneHandlers('armRight')}
      />
      <mesh
        geometry={nodes.Placeholder_LegL.geometry}
        material={sharedMaterial}
        position={nodes.Placeholder_LegL.position}
        scale={nodes.Placeholder_LegL.scale}
      />
      <mesh
        geometry={nodes.Placeholder_LegR.geometry}
        material={sharedMaterial}
        position={nodes.Placeholder_LegR.position}
        scale={nodes.Placeholder_LegR.scale}
      />
    </group>
  )
}

useGLTF.preload(TEST_MODEL_URL)
