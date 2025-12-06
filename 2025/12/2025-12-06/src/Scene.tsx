import { OrbitControls, Environment, ContactShadows, useTexture } from '@react-three/drei'
import { Item } from './components/Item'
import { VideoItem } from './components/VideoItem'
import { Suspense, useEffect, useState, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Background() {
    const texture = useTexture('/bg.jpg')
    const { scene } = useThree()

    useEffect(() => {
        texture.colorSpace = THREE.SRGBColorSpace
        scene.background = texture
        return () => {
            scene.background = null
        }
    }, [texture, scene])

    return null
}

export function Scene() {
    const controlsRef = useRef<any>(null)

    // Demo Mode State
    const [isDemoMode, setIsDemoMode] = useState(false)
    const [activeItemIndex, setActiveItemIndex] = useState(-1)
    const lastActivityRef = useRef(Date.now())

    // Item definitions for easy cycling
    const items = [
        { id: 'saturn', position: [-0.5, 0, -1] as [number, number, number] },
        { id: 'st_nicholas', position: [-5, 0, 1] as [number, number, number] },
        { id: 'dave_brubeck', position: [4, 0.5, 0] as [number, number, number] },
        { id: 'geoffrey_hinton', position: [7.5, 0, 2] as [number, number, number] },
        { id: 'android', position: [3.5, -2, 3] as [number, number, number] },
        { id: 'video', position: [5, -1.5, 4] as [number, number, number] }
    ]

    // Idle detection
    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now()
            if (isDemoMode) {
                console.log("User activity detected, exiting demo mode")
                setIsDemoMode(false)
                setActiveItemIndex(-1)
                // Reset camera
                if (controlsRef.current) {
                    controlsRef.current.reset()
                }
            }
        }

        window.addEventListener('mousemove', handleActivity)
        window.addEventListener('click', handleActivity)
        window.addEventListener('keydown', handleActivity)

        const checkIdle = setInterval(() => {
            const idleTime = Date.now() - lastActivityRef.current
            if (!isDemoMode && idleTime > 5000) { // 5 seconds idle
                console.log("Idle detected, starting demo mode")
                setIsDemoMode(true)
                setActiveItemIndex(0)
            }
        }, 1000)

        return () => {
            window.removeEventListener('mousemove', handleActivity)
            window.removeEventListener('click', handleActivity)
            window.removeEventListener('keydown', handleActivity)
            clearInterval(checkIdle)
        }
    }, [isDemoMode])

    // Cycle items in Demo Mode
    useEffect(() => {
        if (!isDemoMode) return

        const cycleInterval = setInterval(() => {
            setActiveItemIndex((prev) => (prev + 1) % items.length)
        }, 4000) // Switch every 4 seconds

        return () => clearInterval(cycleInterval)
    }, [isDemoMode, items.length])

    // Animate Camera in Demo Mode
    useFrame((state, delta) => {
        if (isDemoMode && activeItemIndex !== -1) {
            const targetItem = items[activeItemIndex]
            const targetPos = new THREE.Vector3(...targetItem.position)

            // Move camera to look at the item, slightly offset
            const cameraOffset = new THREE.Vector3(0, 0, 5) // Distance from item
            const desiredCameraPos = targetPos.clone().add(cameraOffset)

            // Smoothly interpolate camera position and controls target
            state.camera.position.lerp(desiredCameraPos, 2 * delta)
            if (controlsRef.current) {
                controlsRef.current.target.lerp(targetPos, 2 * delta)
                controlsRef.current.update()
            }
        }
    })

    return (
        <>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* Desk removed as per user request to use only the background image */}
            {/* <Desk /> */}

            <Suspense fallback={null}>
                <Background />

                {/* Items aligned to background */}

                {/* Book (Center) - Saturn */}
                {/* Tilted back slightly, centered */}
                <Item
                    position={items[0].position}
                    rotation={[-0.1, 0, 0]}
                    label="Saturn"
                    scale={[3.5, 4.5, 0.1]}
                    textureUrl="/saturn.jpg"
                    visible={!isDemoMode || activeItemIndex === 0}
                />

                {/* St Nicholas (Left) */}
                {/* Standing card, angled right */}
                <Item
                    position={items[1].position}
                    rotation={[0, 0.4, 0]}
                    label="St. Nicholas"
                    scale={[2.5, 3.5, 0.1]}
                    textureUrl="/st_nicholas.jpg"
                    visible={!isDemoMode || activeItemIndex === 1}
                />

                {/* Dave Brubeck (Right) */}
                {/* Framed photo, angled left */}
                <Item
                    position={items[2].position}
                    rotation={[0, -0.3, 0]}
                    label="Dave Brubeck"
                    scale={[3, 3.5, 0.1]}
                    textureUrl="/dave_brubeck.jpg"
                    visible={!isDemoMode || activeItemIndex === 2}
                />

                {/* Geoffrey Hinton (Far Right) */}
                {/* Card, angled left */}
                <Item
                    position={items[3].position}
                    rotation={[0, -0.5, 0]}
                    label="Geoffrey Hinton"
                    scale={[2, 3, 0.1]}
                    textureUrl="/geoffrey_hinton.jpg"
                    visible={!isDemoMode || activeItemIndex === 3}
                />

                {/* Gingerbread (Front Right) */}
                {/* Lying on desk */}
                <Item
                    position={items[4].position}
                    rotation={[-Math.PI / 3, 0, 0.2]}
                    label="Android 2.3"
                    scale={[1.5, 1.5, 0.1]}
                    textureUrl="/android.jpg"
                    visible={!isDemoMode || activeItemIndex === 4}
                />

                {/* Video Model - Placing it over the Radio area (approx) or floating */}
                <VideoItem
                    position={items[5].position}
                    rotation={[-0.2, -0.2, 0]}
                    label="History Video"
                    scale={[2, 1.5, 0.1]}
                    videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    visible={!isDemoMode || activeItemIndex === 5}
                />
            </Suspense>

            <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={20} blur={2} far={4} />
            <OrbitControls ref={controlsRef} minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
            <Environment preset="city" />
        </>
    )
}
