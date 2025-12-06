import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'
import './App.css'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  )
}

export default App
