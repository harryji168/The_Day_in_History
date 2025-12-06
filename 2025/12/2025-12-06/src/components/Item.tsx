import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'

interface ItemProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    color?: string
    label: string
    scale?: [number, number, number]
    textureUrl?: string
    visible?: boolean
}

export function Item({ position, rotation = [0, 0, 0], color = 'white', label, scale = [1, 1, 1], textureUrl, visible = true }: ItemProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    const texture = textureUrl ? useTexture(textureUrl) : null

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
                onClick={() => setActive(!active)}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[1, 1, 0.1]} />
                <meshStandardMaterial color={texture ? 'white' : color} map={texture || null} />
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

            {hovered && visible && (
                <Html position={[0, scale[1] / 2 + 1, 0]} center>
                    <div style={{
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        whiteSpace: 'nowrap',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        pointerEvents: 'none'
                    }}>
                        {label}
                    </div>
                </Html>
            )}
        </group>
    )
}
