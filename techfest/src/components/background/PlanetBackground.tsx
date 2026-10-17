import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const WORLD_WIDTH = 28;

function useReducedMotion() {
  return useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
}

function StarField({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 900;
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      values[i * 3] = (Math.random() - 0.5) * 32;
      values[i * 3 + 1] = Math.random() * 12 - 1;
      values[i * 3 + 2] = -4 - Math.random() * 13;
    }
    return values;
  }, []);

  useFrame(({ clock }) => {
    if (!reducedMotion && ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.025) * 0.025;
  });

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color="#d9f5ff" size={0.035} sizeAttenuation transparent opacity={0.82} depthWrite={false} />
    </points>
  );
}

function Terrain({ reducedMotion }: { reducedMotion: boolean }) {
  const farRef = useRef<THREE.Group>(null);
  const midRef = useRef<THREE.Group>(null);
  const frontRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (farRef.current) farRef.current.position.x = Math.sin(t * 0.07) * 0.12;
    if (midRef.current) midRef.current.position.x = Math.sin(t * 0.1 + 1) * 0.2;
    if (frontRef.current) frontRef.current.position.x = Math.sin(t * 0.14 + 2) * 0.28;
  });

  const mountain = (x: number, z: number, width: number, height: number, color: string) => (
    <mesh key={`${x}-${z}`} position={[x, -2.75 + height / 2, z]}>
      <coneGeometry args={[width, height, 5]} />
      <meshStandardMaterial color={color} roughness={1} flatShading />
    </mesh>
  );

  return (
    <>
      <group ref={farRef}>
        {[-15, -11, -7, -2, 3, 8, 13, 17].map((x, i) => mountain(x, -9, 3.7 + (i % 3), 2.5 + ((i * 7) % 4) * 0.45, '#10172c'))}
        <mesh position={[0, -3.95, -9]}><planeGeometry args={[40, 7]} /><meshStandardMaterial color="#10172c" roughness={1} /></mesh>
      </group>
      <group ref={midRef}>
        {[-14, -10, -5, 1, 6, 11, 15].map((x, i) => mountain(x, -5, 2.8 + (i % 2), 1.6 + ((i * 3) % 4) * 0.35, '#080f20'))}
        <mesh position={[0, -4.45, -5]}><planeGeometry args={[40, 5]} /><meshStandardMaterial color="#080f20" roughness={1} /></mesh>
      </group>
      <group ref={frontRef}>
        <mesh position={[0, -5.35, 0]}><planeGeometry args={[40, 4]} /><meshStandardMaterial color="#050a14" roughness={1} /></mesh>
        {[-13, -9, 10, 14].map((x, i) => mountain(x, -1, 1.1 + (i % 2) * 0.5, 1.4 + (i % 3) * 0.5, '#060b16'))}
      </group>
    </>
  );
}

function Saucer({ reducedMotion }: { reducedMotion: boolean }) {
  const craftRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Mesh>(null);
  const engineRef = useRef<THREE.PointLight>(null);
  const beams = useRef<(THREE.Group | null)[]>([]);
  const spots = useRef<(THREE.SpotLight | null)[]>([]);
  const beamTargets = useRef<THREE.Object3D[]>([]);
  useFrame(({ clock }) => {
    const craft = craftRef.current;
    if (!craft) return;
    const t = clock.elapsedTime;
    if (!reducedMotion) {
      
      const cycle = (t % 30) / 30;
      const travel = cycle < 0.76 ? cycle / 0.76 : 1;
      const smoothTravel = travel * travel * (3 - 2 * travel);
      craft.position.x = THREE.MathUtils.lerp(-10.5, 10.5, smoothTravel);
      craft.position.y = 3.15 + Math.sin(t * 0.42) * 0.4 + Math.sin(t * 0.18) * 0.18;
      craft.position.z = 0.7 + Math.sin(t * 0.22) * 0.45;
      craft.rotation.z = Math.sin(t * 0.42) * 0.055 - Math.cos(t * 0.16) * 0.035;
      craft.rotation.y = Math.sin(t * 0.25) * 0.12;
      craft.rotation.x = Math.sin(t * 0.33) * 0.035;
      if (dishRef.current) dishRef.current.rotation.y = Math.sin(t * 0.7) * 0.035;
      if (engineRef.current) engineRef.current.intensity = 4.2 + (Math.sin(t * 3.8) + 1) * 1.6;
    }

    const scanTime = reducedMotion ? 0 : t;
    const centers = [-0.7, 0.15, 0.88];
    beams.current.forEach((beam, i) => {
      if (!beam) return;
      const angle = centers[i] + Math.sin(scanTime * (0.36 + i * 0.08) + i * 2.2) * (0.52 + i * 0.08);
      beam.rotation.z = angle;
      const target = beamTargets.current[i];
      const local = new THREE.Vector3(Math.sin(angle) * 8, -Math.cos(angle) * 8, -0.45);
      craft.localToWorld(local);
      target.position.copy(local);
      spots.current[i]?.target.updateMatrixWorld();
    });
  });

  const beamColors = ['#6bf7ff', '#d95cff', '#70dfff'];

  return (
    <group ref={craftRef} position={[-10.5, 3.2, 0.7]}>
      <group ref={dishRef}>
        {}
        <mesh position={[0, 0.28, 0]} scale={[0.56, 0.42, 0.56]}>
          <sphereGeometry args={[1, 32, 20]} />
          <meshPhysicalMaterial color="#5e8295" metalness={0.82} roughness={0.22} clearcoat={0.8} clearcoatRoughness={0.18} />
        </mesh>
        {}
        <mesh scale={[1.55, 0.22, 0.86]}>
          <sphereGeometry args={[1, 48, 24]} />
          <meshPhysicalMaterial color="#8396a2" metalness={0.94} roughness={0.28} clearcoat={0.55} />
        </mesh>
        <mesh position={[0, -0.1, 0]} scale={[1.25, 0.16, 0.72]}>
          <cylinderGeometry args={[0.95, 1.1, 0.16, 48]} />
          <meshStandardMaterial color="#253b4a" metalness={0.88} roughness={0.32} />
        </mesh>
        {}
        <mesh position={[0, -0.015, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.32, 0.74, 1]}>
          <torusGeometry args={[0.87, 0.025, 8, 64]} />
          <meshBasicMaterial color="#ed4cff" />
        </mesh>
        {}
        <mesh position={[0, -0.25, 0]} scale={[0.62, 0.09, 0.4]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#72fbff" />
        </mesh>
        <pointLight ref={engineRef} position={[0, -0.45, 0]} color="#08dfff" intensity={5} distance={7} />
        {Array.from({ length: 10 }, (_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          return <mesh key={i} position={[Math.cos(angle) * 1.17, -0.12, Math.sin(angle) * 0.64]}><sphereGeometry args={[0.055, 10, 8]} /><meshBasicMaterial color={i % 3 === 0 ? '#ff69db' : '#8afaff'} /></mesh>;
        })}
      </group>

      {beamColors.map((color, i) => (
        <group key={color} ref={(node) => { beams.current[i] = node; }} position={[i === 0 ? -0.48 : i === 1 ? 0 : 0.48, -0.24, 0]}>
          <mesh position={[0, -4, -0.35]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[1.2, 8, 24, 1, true]} />
            <meshBasicMaterial color={color} transparent opacity={0.045} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[0, -7.98, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.45, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
      <spotLight
            ref={(node) => { spots.current[i] = node; }}
            color={color}
            intensity={9}
            distance={13}
            angle={0.2}
            penumbra={0.8}
            decay={1.5}
            target={beamTargets.current[i] ?? (beamTargets.current[i] = new THREE.Object3D())}
          />
          <primitive object={beamTargets.current[i]} />
        </group>
      ))}
    </group>
  );
}

function Dust({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 260;
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      data[i * 3] = (Math.random() - 0.5) * 26;
      data[i * 3 + 1] = -3.2 + Math.random() * 4.2;
      data[i * 3 + 2] = -3 + Math.random() * 4;
    }
    return data;
  }, []);
  useFrame(({ clock }) => {
    if (!reducedMotion && ref.current) {
      ref.current.position.x = Math.sin(clock.elapsedTime * 0.08) * 0.25;
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.06) * 0.025;
    }
  });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#91dce5" size={0.025} transparent opacity={0.32} depthWrite={false} /></points>;
}

function Scene() {
  const reducedMotion = useReducedMotion();
  const { viewport } = useThree();
  const scale = Math.min(1.2, Math.max(0.62, viewport.width / WORLD_WIDTH));

  return (
    <group scale={scale}>
      <color attach="background" args={['#030817']} />
      <fog attach="fog" args={['#071020', 12, 32]} />
      <ambientLight intensity={0.42} color="#9ebbd8" />
      <directionalLight position={[-5, 8, 4]} intensity={0.6} color="#b9d7ff" />
      <StarField reducedMotion={reducedMotion} />
      <Terrain reducedMotion={reducedMotion} />
      <Dust reducedMotion={reducedMotion} />
      <Saucer reducedMotion={reducedMotion} />
    </group>
  );
}

export default function PlanetBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#030817]">
      <Canvas
        dpr={[1, 1.35]}
        camera={{ position: [0, 0, 20], fov: 42 }}
        gl={{ alpha: false, antialias: false, powerPreference: 'low-power' }}
        frameloop="always"
        fallback={<div className="absolute inset-0 bg-[#030817]" />}
      >
        <Scene />
      </Canvas>
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,8,23,0.08)_0%,rgba(3,8,23,0.08)_42%,rgba(3,8,23,0.32)_72%,rgba(3,8,23,0.66)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_18%,rgba(3,8,23,0.2)_65%,rgba(3,8,23,0.48)_100%)]" />
    </div>
  );
}
