import { useGLTF } from '@react-three/drei'

const TEST_MODEL_URL = new URL(
  '../assets/avatar/models/test/placeholder_hologram_v001.glb',
  import.meta.url,
).href

export function AvatarModel() {
  const { scene } = useGLTF(TEST_MODEL_URL)
  return <primitive object={scene} />
}

useGLTF.preload(TEST_MODEL_URL)
