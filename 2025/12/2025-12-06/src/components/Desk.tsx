export function Desk() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[20, 10]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.6} />
        </mesh>
    )
}
