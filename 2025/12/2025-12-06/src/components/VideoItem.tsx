import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useVideoTexture } from '@react-three/drei'
import * as THREE from 'three'

interface VideoItemProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    videoUrl: string
    label: string
    scale?: [number, number, number]
    visible?: boolean
}

export function VideoItem({ position, rotation = [0, 0, 0], videoUrl, label, scale = [1, 1, 1], visible = true }: VideoItemProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    const texture = useVideoTexture(videoUrl)

    useFrame(() => {
        if (meshRef.current) {
            const targetScale = hovered ? 1.1 : 1
            meshRef.current.scale.lerp(new THREE.Vector3(scale[0] * targetScale, scale[1] * targetScale, scale[2] * targetScale), 0.1)
        }
    })

    return (
        <group position={position} rotation={new THREE.Euler(...rotation)} visible={visible}>
            <mesh
                ref={meshRef}
                onClick={() => {
                    setActive(!active)
                    if (active) texture.image.pause()
                    else texture.image.play()
                }}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[1, 1, 0.1]} />
                <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>

            <Text
                position={[0, scale[1] / 2 + 0.5, 0]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="black"
            >
                {label}
            </Text>
        </group>
    )
}
