import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Html } from '@react-three/drei';
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

// Obstacles defined based on the diorama image
const OBSTACLES = [
    { x: 0, z: 0, r: 2.5 }, // Central Monument
    { x: 6, z: -2, r: 1.5 }, // Right tables
    { x: -7, z: 3, r: 2.0 }, // Left stage area
];

const CHAT_MESSAGES = [
    "Hello there!", "Nice day!", "History is cool.", "Walk with me?", "Did you know?",
    "Abolish slavery!", "Peace.", "Mars is next.", "Beep boop.", "Any updates?",
    "Looking good!", "Where to?", "Nice suit.", "Space is big.", "Hello world."
];

// Component to handle character pathing - Smart Wander with Collision & Chat
const WanderingCharacter = ({ Component, color, startPos, speed = 1, id, allCharacters }) => {
    const ref = useRef();
    const [chatMsg, setChatMsg] = useState("");
    const [isChatting, setIsChatting] = useState(false);

    const state = useRef({
        mode: 'walking', // walking, chatting, cooldown
        direction: { x: (Math.random() - 0.5), z: (Math.random() - 0.5) },
        changeDirTimer: 0,
        chatTimer: 0,
        cooldownTimer: 0
    });

    // Helper: Register/Update position in shared ref
    useFrame(() => {
        if (ref.current && allCharacters.current) {
            allCharacters.current[id] = {
                pos: ref.current.position,
                mode: state.current.mode
            };
        }
    });

    useFrame((_, delta) => {
        if (!ref.current) return;

        const s = state.current;

        // --- CHATTING LOGIC ---
        if (s.mode === 'chatting') {
            s.chatTimer -= delta;
            // Face the chat partner logic is tricky without explicit target ref, 
            // simpler to just Bob up/down excitedly
            ref.current.position.y = Math.sin(Date.now() / 200) * 0.1;

            if (s.chatTimer <= 0) {
                s.mode = 'cooldown';
                s.cooldownTimer = 5; // Must walk for 5s before chatting again
            }
            return; // Don't move while chatting
        }

        // --- WALKING LOGIC ---

        // Cooldown tick
        if (s.mode === 'cooldown') {
            s.cooldownTimer -= delta;
            if (s.cooldownTimer <= 0) s.mode = 'walking';
        }

        // 1. Social Scan (if walking)
        if (s.mode === 'walking') {
            Object.entries(allCharacters.current).forEach(([otherId, otherData]) => {
                if (otherId !== id && otherData.mode === 'walking') {
                    const dist = ref.current.position.distanceTo(otherData.pos);
                    if (dist < 1.5 && Math.random() > 0.95) { // Close & lucky frame
                        // START CHAT
                        s.mode = 'chatting';
                        s.chatTimer = 4; // Chat for 4 seconds
                        // Make them look at each other (approx)
                        ref.current.lookAt(otherData.pos.x, ref.current.position.y, otherData.pos.z);

                        // Pick random message
                        const msg = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
                        setChatMsg(msg);
                        setIsChatting(true);

                        // Clear chat after timer
                        setTimeout(() => setIsChatting(false), 4000);
                    }
                }
            });
        }

        // 2. Movement
        s.changeDirTimer -= delta;

        // Change direction randomly
        if (s.changeDirTimer <= 0) {
            const angle = Math.random() * Math.PI * 2;
            s.direction = { x: Math.sin(angle), z: Math.cos(angle) };
            s.changeDirTimer = Math.random() * 3 + 2;
        }

        // Proposed new position
        let nextX = ref.current.position.x + s.direction.x * speed * delta;
        let nextZ = ref.current.position.z + s.direction.z * speed * delta;

        // 3. Collision Detection (Obstacles)
        let hit = false;
        for (const obs of OBSTACLES) {
            const dist = Math.sqrt((nextX - obs.x) ** 2 + (nextZ - obs.z) ** 2);
            if (dist < obs.r) {
                hit = true;
                // Bounce
                const angleToObs = Math.atan2(obs.z - nextZ, obs.x - nextX);
                // Reflect roughly
                s.direction = { x: -Math.cos(angleToObs), z: -Math.sin(angleToObs) };
                // Also force a bit away
                nextX = ref.current.position.x + s.direction.x * 0.2;
                nextZ = ref.current.position.z + s.direction.z * 0.2;
                break;
            }
        }

        // 4. Bounds Check
        if (nextX > 10 || nextX < -10) s.direction.x *= -1;
        if (nextZ > 6 || nextZ < -8) s.direction.z *= -1;

        if (!hit) {
            ref.current.position.x = nextX;
            ref.current.position.z = nextZ;

            // Rotation smoothing
            const targetRot = Math.atan2(s.direction.x, s.direction.z);
            // Simple lerp for rotation could go here, but hard set is stable
            ref.current.rotation.y = targetRot;
        }
    });

    return (
        <group ref={ref} position={startPos}>
            <Component color={color} />
            {isChatting && (
                <Html position={[0, 2.5, 0]} center>
                    <div style={{
                        background: 'white',
                        padding: '5px 10px',
                        borderRadius: '10px',
                        border: '2px solid black',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'black',
                        whiteSpace: 'nowrap',
                        boxShadow: '2px 2px 0px rgba(0,0,0,0.2)',
                        fontFamily: "'Fredoka One', cursive"
                    }}>
                        {chatMsg}
                    </div>
                </Html>
            )}
        </group>
    )
}


const Scene3D = () => {
    // Shared state for all characters positions
    const allCharacters = useRef({});

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

                {/* Debug Obstacles (Optional: set visible to true to see where they are) */}
                {OBSTACLES.map((obs, i) => (
                    <mesh key={i} position={[obs.x, -1, obs.z]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
                        <circleGeometry args={[obs.r, 32]} />
                        <meshBasicMaterial color="red" wireframe />
                    </mesh>
                ))}

                {/* Characters Wandering - Slow Speed but Smart */}
                <WanderingCharacter
                    id="c1" allCharacters={allCharacters}
                    Component={Astronaut} color="crimson" startPos={[-2, -2, 2]} speed={0.5}
                />
                <WanderingCharacter
                    id="c2" allCharacters={allCharacters}
                    Component={Astronaut} color="seagreen" startPos={[2, -2, -2]} speed={0.4}
                />
                <WanderingCharacter
                    id="c3" allCharacters={allCharacters}
                    Component={Student} startPos={[0, -2, 4]} speed={0.6}
                />
                <WanderingCharacter
                    id="c4" allCharacters={allCharacters}
                    Component={Doctor} startPos={[4, -2, 1]} speed={0.3}
                />

                {/* OrbitControls mostly for debugging, constrained */}
                <OrbitControls enableZoom={true} enableRotate={true} />
            </Canvas>
        </div>
    );
};

export default Scene3D;
