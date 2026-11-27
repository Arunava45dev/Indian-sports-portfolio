import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import { useRef, useState } from "react";
import { MathUtils, DoubleSide, TextureLoader, SRGBColorSpace } from "three";

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const planets = [
  { name: "Mercury", radius: 0.72, size: 0.095, color: "#a9a39b", speed: 0.55, phase: 0.4, inclination: 0.12 },
  { name: "Venus", radius: 1.08, size: 0.15, color: "#e5bc82", speed: 0.4, phase: 2.1, inclination: 0.06 },
  { name: "Earth", radius: 1.48, size: 0.17, color: "#4a8bea", speed: 0.32, phase: 3.7, inclination: 0.01 },
  { name: "Mars", radius: 1.88, size: 0.13, color: "#d46c4f", speed: 0.25, phase: 5.2, inclination: 0.03 },
  { name: "Jupiter", radius: 2.65, size: 0.38, color: "#d7a77f", speed: 0.16, phase: 1.15, inclination: 0.02 },
  { name: "Saturn", radius: 3.45, size: 0.31, color: "#8d8165ff", speed: 0.12, phase: 4.45, inclination: 0.04, ring: true },
  { name: "Uranus", radius: 4.2, size: 0.23, color: "#8fd5d8", speed: 0.09, phase: 2.75, inclination: 0.01 },
  { name: "Neptune", radius: 4.85, size: 0.22, color: "#5279e8", speed: 0.07, phase: 5.7, inclination: 0.03 },
];

function Planet({ planet, selected, onSelect }) {
  const orbit = useRef();
  const body = useRef();
  const texture = useLoader(TextureLoader, `/planets/${planet.name.toLowerCase()}.jpg`);
  texture.colorSpace = SRGBColorSpace;
  useFrame((_, delta) => {
    if (!reduceMotion) {
      orbit.current.rotation.y += delta * planet.speed * 0.16;
      body.current.rotation.y += delta * 0.32;
    }
  });

  return (
    <group ref={orbit} rotation={[planet.inclination, planet.phase, 0]}>
      <group position={[planet.radius, 0, 0]}>
        <mesh ref={body} onClick={(event) => { event.stopPropagation(); onSelect(planet.name); }}>
          <sphereGeometry args={[planet.size, 32, 32]} />
          <meshStandardMaterial map={texture} roughness={planet.name === "Earth" ? 0.45 : 0.82} metalness={0.02} />
        </mesh>
        {planet.name === "Earth" && (
          <mesh scale={1.08}>
            <sphereGeometry args={[planet.size, 32, 32]} />
            <meshBasicMaterial color="#72bfff" transparent opacity={0.12} side={DoubleSide} depthWrite={false} />
          </mesh>
        )}
        {planet.ring && (
          <group rotation={[Math.PI / 2.25, 0.15, 0]}>
            <mesh>
              <ringGeometry args={[planet.size * 1.22, planet.size * 1.52, 64]} />
              <meshStandardMaterial color="#dec998" roughness={0.9} transparent opacity={0.9} side={DoubleSide} />
            </mesh>
            <mesh>
              <ringGeometry args={[planet.size * 1.56, planet.size * 2.08, 64]} />
              <meshStandardMaterial color="#a98c60" roughness={0.95} transparent opacity={0.58} side={DoubleSide} />
            </mesh>
          </group>
        )}
        <mesh
          position={[0, 0, planet.size + 0.025]}
          onClick={(event) => { event.stopPropagation(); onSelect(planet.name); }}
        >
          <sphereGeometry args={[planet.size * 1.45, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {selected && (
          <Html position={[0, planet.size + 0.25, 0]} center distanceFactor={9}>
            <div className="planet-name">{planet.name}</div>
          </Html>
        )}
      </group>
    </group>
  );
}

function SolarSystem({ onSelect, selected }) {
  const system = useRef();
  useFrame((state, delta) => {
    const targetX = state.pointer.y * 0.32;
    const targetY = state.pointer.x * 0.5;
    const targetZ = -state.pointer.x * 0.08;
    system.current.rotation.x = MathUtils.damp(system.current.rotation.x, targetX, 3.4, delta);
    system.current.rotation.y = MathUtils.damp(system.current.rotation.y, targetY, 3.4, delta);
    system.current.rotation.z = MathUtils.damp(system.current.rotation.z, targetZ, 3, delta);
  });

  return (
    <group ref={system} position={[2.45, 0, 0]} scale={0.88}>
      {planets.map((planet) => (
        <mesh key={`${planet.name}-orbit`} rotation={[Math.PI / 2 + planet.inclination, 0, 0]}>
          <torusGeometry args={[planet.radius, 0.004, 6, 160]} />
          <meshBasicMaterial color="#a9b9df" transparent opacity={0.22} />
        </mesh>
      ))}
      <mesh onClick={(event) => { event.stopPropagation(); onSelect("Sun"); }}>
        <sphereGeometry args={[0.48, 48, 48]} />
        <meshStandardMaterial color="#ffbd57" emissive="#ff8d25" emissiveIntensity={2.3} roughness={0.72} />
      </mesh>
      <mesh scale={1.5}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshBasicMaterial color="#ff9f42" transparent opacity={0.09} depthWrite={false} />
      </mesh>
      <pointLight color="#ffb84e" intensity={65} distance={11} decay={2} />
      {planets.map((planet) => (
        <Planet key={planet.name} planet={planet} selected={selected === planet.name} onSelect={onSelect} />
      ))}
      {selected === "Sun" && <Html position={[0, 0.75, 0]} center><div className="planet-name">Sun</div></Html>}
    </group>
  );
}

export default function Hero3D() {
  const [selected, setSelected] = useState("");
  return (
    <div className="solar-scene">
      <Canvas camera={{ position: [0, 4.5, 12], fov: 43 }} dpr={[1, 1.5]} aria-label="Interactive 3D solar system">
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 7, 5]} intensity={1.3} />
        <Sparkles count={160} scale={[15, 9, 8]} size={1.8} speed={reduceMotion ? 0 : 0.18} color="#d7def5" opacity={0.62} />
        <SolarSystem selected={selected} onSelect={setSelected} />
      </Canvas>
      {selected && <button className="selected-planet" onClick={() => setSelected("")}>Selected: {selected} <span>×</span></button>}
      {!selected && <div className="solar-hint">CLICK A PLANET TO EXPLORE</div>}
      <a className="solar-credit" href="https://maps.jpl.nasa.gov/tmaps/" target="_blank" rel="noreferrer">Planetary maps: NASA / JPL / Caltech / USGS</a>
    </div>
  );
}
