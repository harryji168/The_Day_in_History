import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Reusable material colors
const materials = {
    red: "crimson",
    green: "seagreen",
    white: "white",
    skin: "#f5cca0",
    blue: "royalblue",
    black: "#222",
    gold: "gold",
    visor: "#333",
    glass: "#88ccff"
};

// --- Animations ---
const useWalkAnimation = (ref, speed = 1, offset = 0) => {
    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.getElapsedTime() * speed + offset;
            // Bobbing
            ref.current.position.y = Math.sin(time * 5) * 0.1;
            // Rotation (waddle)
            ref.current.rotation.z = Math.sin(time * 5) * 0.05;
        }
    });
};

const useLimbAnimation = (leftRef, rightRef, speed = 5) => {
    useFrame((state) => {
        const time = state.clock.getElapsedTime() * speed;
        if (leftRef.current) leftRef.current.rotation.x = Math.sin(time) * 0.5;
        if (rightRef.current) rightRef.current.rotation.x = Math.sin(time + Math.PI) * 0.5;
    });
};


// --- Characters ---

export const Astronaut = ({ color = "crimson", ...props }) => {
    const group = useRef();
    const leftArm = useRef();
    const rightArm = useRef();
    const leftLeg = useRef();
    const rightLeg = useRef();

    useWalkAnimation(group, 1, Math.random());
    useLimbAnimation(leftArm, rightArm, 8);
    useLimbAnimation(leftLeg, rightLeg, 8);

    return (
        <group ref={group} {...props} scale={[0.9, 0.9, 0.9]}>
            {/* Body */}
            <mesh position={[0, 0.75, 0]}>
                <boxGeometry args={[0.8, 1, 0.5]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Backpack */}
            <mesh position={[0, 0.8, -0.4]}>
                <boxGeometry args={[0.6, 0.8, 0.3]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1.6, 0]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color="white" />
            </mesh>
            {/* Visor */}
            <mesh position={[0, 1.6, 0.35]}>
                <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <meshStandardMaterial color={materials.visor} roughness={0.2} metalness={0.8} />
            </mesh>

            {/* Arms */}
            <group position={[-0.5, 1.1, 0]} ref={leftArm}>
                <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.6]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0, -0.65, 0]}>
                    <sphereGeometry args={[0.15]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                {/* Shoulder Joint */}
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.12]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>
            <group position={[0.5, 1.1, 0]} ref={rightArm}>
                <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.6]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                <mesh position={[0, -0.65, 0]}>
                    <sphereGeometry args={[0.15]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                {/* Shoulder Joint */}
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.12]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>

            {/* Legs */}
            <group position={[-0.25, 0.2, 0]} ref={leftLeg}>
                <mesh position={[0, -0.4, 0]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.85, 0.1]}>
                    <boxGeometry args={[0.15, 0.1, 0.3]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>
            <group position={[0.25, 0.2, 0]} ref={rightLeg}>
                <mesh position={[0, -0.4, 0]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -0.85, 0.1]}>
                    <boxGeometry args={[0.15, 0.1, 0.3]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>
        </group>
    );
};


export const Student = (props) => {
    const group = useRef();
    const leftArm = useRef();
    const rightArm = useRef();
    const leftLeg = useRef();
    const rightLeg = useRef();

    useWalkAnimation(group, 1.2, Math.random());
    useLimbAnimation(leftArm, rightArm, 10);
    useLimbAnimation(leftLeg, rightLeg, 10);

    return (
        <group ref={group} {...props} scale={[0.9, 0.9, 0.9]}>
            {/* Skirt/Body */}
            <mesh position={[0, 0.5, 0]}>
                <coneGeometry args={[0.5, 1, 32]} />
                <meshStandardMaterial color={materials.blue} />
            </mesh>

            {/* Shirt */}
            <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[0.6, 0.6, 0.4]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1.7, 0]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color={materials.skin} />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.1, 1.75, 0.3]}>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.1, 1.75, 0.3]}>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color="black" />
            </mesh>
            {/* Hair */}
            <mesh position={[0, 1.8, -0.05]}>
                <sphereGeometry args={[0.38, 32, 32, 0, 6.3, 0, 1.5]} />
                <meshStandardMaterial color="gold" />
            </mesh>

            {/* Arms */}
            <group position={[-0.4, 1.3, 0]} ref={leftArm}>
                <mesh position={[0, -0.25, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.5]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>
            <group position={[0.4, 1.3, 0]} ref={rightArm}>
                <mesh position={[0, -0.25, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.5]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>

            {/* Legs */}
            <group position={[-0.2, 0, 0]} ref={leftLeg}>
                <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.6]} />
                    <meshStandardMaterial color={materials.skin} />
                </mesh>
            </group>
            <group position={[0.2, 0, 0]} ref={rightLeg}>
                <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.6]} />
                    <meshStandardMaterial color={materials.skin} />
                </mesh>
            </group>

        </group>
    );
};

export const Doctor = (props) => {
    const group = useRef();
    const leftArm = useRef();
    const rightArm = useRef();
    const leftLeg = useRef();
    const rightLeg = useRef();

    useWalkAnimation(group, 0.9, Math.random());
    useLimbAnimation(leftArm, rightArm, 7);
    useLimbAnimation(leftLeg, rightLeg, 7);

    return (
        <group ref={group} {...props} scale={[0.9, 0.9, 0.9]}>
            {/* Coat Body */}
            <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[0.7, 1.2, 0.4]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1.6, 0]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color={materials.skin} />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.1, 1.65, 0.3]}>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.1, 1.65, 0.3]}>
                <sphereGeometry args={[0.05]} />
                <meshStandardMaterial color="black" />
            </mesh>
            {/* Hair */}
            <mesh position={[0, 1.7, 0]}>
                <sphereGeometry args={[0.38, 32, 32, 0, 6.3, 0, 1.2]} />
                <meshStandardMaterial color="#4a3020" />
            </mesh>

            {/* Arms */}
            <group position={[-0.45, 1.2, 0]} ref={leftArm} rotation={[0, 0, -0.2]}>
                <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.6]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>
            <group position={[0.45, 1.2, 0]} ref={rightArm} rotation={[0, 0, 0.2]}>
                <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.6]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                {/* Laptop */}
                <mesh position={[0, -0.7, 0.2]} rotation={[0.5, 0, 0]}>
                    <boxGeometry args={[0.4, 0.05, 0.3]} />
                    <meshStandardMaterial color="silver" />
                </mesh>
            </group>

            {/* Legs */}
            <group position={[-0.2, 0.2, 0]} ref={leftLeg}>
                <mesh position={[0, -0.4, 0]}>
                    <cylinderGeometry args={[0.11, 0.11, 0.8]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            </group>
            <group position={[0.2, 0.2, 0]} ref={rightLeg}>
                <mesh position={[0, -0.4, 0]}>
                    <cylinderGeometry args={[0.11, 0.11, 0.8]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            </group>
        </group>
    );
};
