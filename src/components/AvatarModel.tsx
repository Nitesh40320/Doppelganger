import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { INTERACTION_ZONES, REACTION_DURATION_MS, type ZoneId } from '../types/interactionZones'
import type { ActiveReaction } from '../hooks/useAvatarReactions'

const TEST_MODEL_URL = new URL(
  '../assets/avatar/models/test/placeholder_hologram_v001.glb',
  import.meta.url,
).href

const MAX_YAW = THREE.MathUtils.degToRad(28)
const MAX_PITCH = THREE.MathUtils.degToRad(16)
const DAMP_LAMBDA = 7

interface AvatarModelProps {
  cursorGazeEnabled: boolean
  isPointerInStage: boolean
  touchIntensity: number
  activeReaction: ActiveReaction | null
  onZoneClick: (zoneId: ZoneId) => void
  onZoneHover: (zoneId: ZoneId | null) => void
}

export function AvatarModel({
  cursorGazeEnabled,
  isPointerInStage,
  touchIntensity,
  activeReaction,
  onZoneClick,
  onZoneHover,
}: AvatarModelProps) {
  const { nodes, materials } = useGLTF(TEST_MODEL_URL) as unknown as {
    nodes: Record<string, THREE.Mesh>
    materials: Record<string, THREE.Material>
  }

  const headRef = useRef<THREE.Mesh>(null)
  const zoneRefs = useRef<Partial<Record<ZoneId, THREE.Mesh>>>({})

  useFrame((state, delta) => {
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

    for (const zone of INTERACTION_ZONES) {
      const mesh = zoneRefs.current[zone.id]
      const baseNode = nodes[zone.nodeName]
      if (!mesh || !baseNode) continue
      let pulse = 0
      if (activeReaction && activeReaction.zoneId === zone.id) {
        const elapsed = performance.now() - activeReaction.startedAt
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

  const sharedMaterial = materials['Placeholder_Hologram_Mat']

  return (
    <group>
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
