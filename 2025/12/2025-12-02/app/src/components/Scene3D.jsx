import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Astronaut, Student, Doctor } from './ModelCharacters';

// Transparent Shadow Plane
const ShadowPlane = () => {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial transparent opacity={0.4} color="#000" />
        </mesh>
    );
};

// Component to handle character pathing - Random Wander
const WanderingCharacter = ({ Component, color, startPos, speed = 1 }) => {
    const ref = useRef();
    // State to store movement direction vector {x, z}
    const direction = useRef({ x: (Math.random() - 0.5), z: (Math.random() - 0.5) });
    const changeDirTimer = useRef(0);

    useFrame((state, delta) => {
        if (ref.current) {
            // Update timer
            changeDirTimer.current -= delta;

            // Randomly change direction occasionally
            if (changeDirTimer.current <= 0) {
                direction.current = {
                    x: (Math.random() - 0.5) * 2,
                    z: (Math.random() - 0.5) * 2
                };
                // Normalize roughly
                const len = Math.sqrt(direction.current.x ** 2 + direction.current.z ** 2) || 1;
                direction.current.x /= len;
                direction.current.z /= len;

                changeDirTimer.current = Math.random() * 3 + 2; // Change every 2-5 seconds
            }

            // Move
            ref.current.position.x += direction.current.x * speed * delta;
            ref.current.position.z += direction.current.z * speed * delta;

            // Rotate to face direction
            const angle = Math.atan2(direction.current.x, direction.current.z);
            ref.current.rotation.y = angle;

            // Bounds checks (Bounce)
            if (ref.current.position.x > 12) {
                ref.current.position.x = 12;
                direction.current.x *= -1;
            } else if (ref.current.position.x < -12) {
                ref.current.position.x = -12;
                direction.current.x *= -1;
            }

            if (ref.current.position.z > 5) { // Closer to camera
                ref.current.position.z = 5;
                direction.current.z *= -1;
            } else if (ref.current.position.z < -8) { // Further back
                ref.current.position.z = -8;
                direction.current.z *= -1;
            }
        }
    });

    return (
        <group ref={ref} position={startPos}>
            <Component color={color} />
        </group>
    )
}


const Scene3D = () => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}>
            <Canvas shadows gl={{ alpha: true }}>
                {/* Isometric View: Orthographic Camera at 45-ish degrees */}
                <OrthographicCamera
                    makeDefault
                    position={[20, 20, 20]}
                    zoom={40}
                    near={-50}
                    far={200}
                    onUpdate={c => c.lookAt(0, 0, 0)}
                />

                <ambientLight intensity={0.7} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                />

                <ShadowPlane />

                {/* Characters Wandering - Slowed Down */}
                <WanderingCharacter Component={Astronaut} color="crimson" startPos={[-2, -2, 2]} speed={0.5} />
                <WanderingCharacter Component={Astronaut} color="seagreen" startPos={[2, -2, -2]} speed={0.4} />
                <WanderingCharacter Component={Student} startPos={[0, -2, 0]} speed={0.6} />
                <WanderingCharacter Component={Doctor} startPos={[1, -2, 1]} speed={0.3} />

                {/* OrbitControls mostly for debugging, constrained */}
                <OrbitControls enableZoom={true} enableRotate={true} />
            </Canvas>
        </div>
    );
};

export default Scene3D;
