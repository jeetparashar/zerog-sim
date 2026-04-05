import { Suspense, useEffect, useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei'
import * as ort from 'onnxruntime-web'
import * as THREE from 'three'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'


function WindTunnel({ speed }) {
  const count = 100
  const mesh = useRef()
  
  // Create random starting positions for particles
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        x: Math.random() * 10 - 5,
        y: Math.random() * 2,
        z: Math.random() * 20 - 10,
        speed: 0.1 + Math.random() * 0.2
      })
    }
    return temp
  }, [])

  useFrame(() => {
    particles.forEach((p, i) => {
      // Move particles based on the Speed slider
      p.z -= p.speed * (speed / 20) 
      if (p.z < -10) p.z = 10 // Reset particle to front
      
      dummy.position.set(p.x, p.y, p.z)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} transparent opacity={0.6} />
    </instancedMesh>
  )
}

function F1Car() {
  const { scene } = useGLTF('/f1-car.glb') 
  return <primitive object={scene} />
}

export default function App() {
  const [speed, setSpeed] = useState(50)
  const [gravity, setGravity] = useState(1.0)
  const [prediction, setPrediction] = useState(0)
  const [session, setSession] = useState(null)
  const [history, setHistory] = useState([]) // Stores data for the chart

  useEffect(() => {
    ort.InferenceSession.create('/ZeroG_Fused_Final.onnx').then(setSession)
  }, [])

  useEffect(() => {
    async function runInference() {
      if (!session) return
      const inputData = new Float32Array([speed, gravity])
      const inputTensor = new ort.Tensor('float32', inputData, [1, 2])
      const results = await session.run({ input: inputTensor })
      const val = results.output.data[0]
      setPrediction(val)
      
      // Update the chart history (keep last 20 points)
      setHistory(prev => [...prev.slice(-19), { time: Date.now(), grip: val }])
    }
    runInference()
  }, [speed, gravity, session])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', display: 'flex' }}>
      
      
      <div style={{ width: '350px', padding: '25px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ color: '#00d4ff', margin: 0, fontSize: '24px' }}>Zero-G Lab</h1>
        
        <div>
          <label style={{ color: '#aaa' }}>VELOCITY: <b style={{ color: 'white' }}>{speed} m/s</b></label>
          <input type="range" min="10" max="150" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ width: '100%', marginTop: '10px' }} />
        </div>

        <div>
          <label style={{ color: '#aaa' }}>GRAVITY: <b style={{ color: 'white' }}>{gravity.toFixed(1)}G</b></label>
          <input type="range" min="0" max="2" step="0.1" value={gravity} onChange={(e) => setGravity(parseFloat(e.target.value))} style={{ width: '100%', marginTop: '10px' }} />
        </div>

        <div style={{ padding: '20px', background: '#111', borderRadius: '10px', border: '1px solid #222' }}>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 5px 0' }}>AI GRIP PREDICTION</p>
          <h2 style={{ color: '#00ff88', margin: 0 }}>{prediction.toFixed(2)} <span style={{ fontSize: '14px' }}>Newtons</span></h2>
        </div>

        
        <div style={{ flex: 1, marginTop: '20px' }}>
          <p style={{ color: '#888', fontSize: '12px' }}>LIVE TELEMETRY (Grip Over Time)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} stroke="#444" fontSize={10} />
              <Tooltip contentStyle={{ background: '#111', border: 'none' }} itemStyle={{ color: '#00ff88' }} />
              <Line type="monotone" dataKey="grip" stroke="#00ff88" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🏎️ RIGHT PANEL: 3D VIEW */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [5, 3, 5], fov: 45 }}>
          <color attach="background" args={['#050505']} />
          <Environment preset="night" />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls makeDefault />
          
          <Suspense fallback={null}>
            <F1Car />
            <WindTunnel speed={speed} />
          </Suspense>

          <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.4} far={10} color="#000000" />
        </Canvas>
      </div>
    </div>
  )
}