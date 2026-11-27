import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Step({ x, count, color, label }) {
  const height = 0.5 + Math.min(count, 10) * 0.3;
  return (
    <group position={[x, height / 2, 0]}>
      <mesh>
        <boxGeometry args={[1.2, height, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.5} />
      </mesh>
      <Html position={[0, height / 2 + 0.45, 0]} center>
        <div className="podium-label">
          <strong>{count}</strong>
          <span>{label}</span>
        </div>
      </Html>
    </group>
  );
}

export default function Podium3D({ medals = {} }) {
  const { gold = 0, silver = 0, bronze = 0 } = medals;
  return (
    <div className="podium" role="img" aria-label={`Medals: ${gold} gold, ${silver} silver, ${bronze} bronze`}>
      <Canvas camera={{ position: [0, 3, 6.5], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 6, 4]} intensity={2.4} />
        <Step x={-1.4} count={silver} color="#C3CAD3" label="silver" />
        <Step x={0} count={gold} color="#E0B04A" label="gold" />
        <Step x={1.4} count={bronze} color="#B87333" label="bronze" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!reduceMotion}
          autoRotateSpeed={1.2}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
