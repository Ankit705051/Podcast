import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { PropsWithChildren, RefObject } from "react";

export type RealmControls = { entry: number };

type RealmSceneProps = PropsWithChildren<{
  controls: RefObject<RealmControls>;
  map?: boolean;
}>;

const stone = "#171a34";
const stoneLight = "#292647";

function StarField({ controls }: { controls: RefObject<RealmControls> }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(2100);
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (Math.random() - 0.5) * 54;
      values[i + 1] = (Math.random() - 0.5) * 35;
      values[i + 2] = (Math.random() - 0.5) * 40 - 7;
    }
    return values;
  }, []);

  useFrame((_, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * (0.012 + controls.current.entry * 0.42);
    points.current.rotation.z += delta * 0.005;
    const zoom = 1 + controls.current.entry * 1.7;
    points.current.scale.setScalar(zoom);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#c8c6ff"
        size={0.047}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}

function MountainRange() {
  return (
    <group position={[0, -0.4, -12]}>
      {Array.from({ length: 13 }, (_, index) => {
        const x = (index - 6) * 3.5;
        const height = 2.7 + ((index * 17) % 7) * 0.45;
        return (
          <mesh key={index} position={[x, height * 0.42, -((index * 11) % 4)]} castShadow>
            <coneGeometry args={[1.9 + (index % 3) * 0.45, height, 5]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#151a36" : "#1c1936"}
              roughness={0.94}
              flatShading
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Castle({ subtle = false }: { subtle?: boolean }) {
  const scale = subtle ? 0.72 : 1;
  return (
    <group position={[0, -0.3, -8]} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 3.4, 2.6]} />
        <meshStandardMaterial color={stone} roughness={0.72} metalness={0.18} />
      </mesh>
      <mesh position={[0, 3.2, -0.15]} castShadow>
        <boxGeometry args={[2.6, 2.4, 2.2]} />
        <meshStandardMaterial color={stoneLight} roughness={0.68} metalness={0.22} />
      </mesh>
      {[-2.3, 2.3].map((x) => (
        <group key={x} position={[x, 2.8, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.76, 0.9, 3.9, 7]} />
            <meshStandardMaterial color={stoneLight} roughness={0.76} metalness={0.16} />
          </mesh>
          <mesh position={[0, 2.18, 0]} castShadow>
            <coneGeometry args={[1.02, 1.9, 7]} />
            <meshStandardMaterial color="#3a2b63" roughness={0.55} metalness={0.2} />
          </mesh>
        </group>
      ))}
      <group position={[0, 4.4, -0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.72, 0.9, 3.1, 8]} />
          <meshStandardMaterial color="#252340" roughness={0.7} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.86, 0]} castShadow>
          <coneGeometry args={[1.08, 2.1, 8]} />
          <meshStandardMaterial color="#44306f" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 2.95, 0]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#f2c879" />
        </mesh>
      </group>
      {[-1.55, -0.52, 0.52, 1.55].map((x) => (
        <mesh key={x} position={[x, 1.1, 1.32]}>
          <boxGeometry args={[0.16, 0.75, 0.04]} />
          <meshBasicMaterial color="#7c6be8" transparent opacity={0.84} />
        </mesh>
      ))}
    </group>
  );
}

function Portal({ controls }: { controls: RefObject<RealmControls> }) {
  const portal = useRef<THREE.Group>(null);
  const innerRing = useRef<THREE.Mesh>(null);
  const innerMaterial = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();
    const entry = controls.current.entry;
    if (portal.current) {
      portal.current.rotation.z = Math.sin(elapsed * 0.16) * 0.035;
      const breathe = 1 + Math.sin(elapsed * 0.75) * 0.018;
      portal.current.scale.setScalar(breathe * (1 + entry * 0.25));
    }
    if (innerRing.current) innerRing.current.rotation.z += delta * 0.12;
    if (innerMaterial.current) {
      innerMaterial.current.opacity = 0.3 + Math.sin(elapsed * 1.5) * 0.06 + entry * 0.2;
    }
  });

  return (
    <group ref={portal} position={[0, 3.15, -2.1]}>
      <mesh>
        <circleGeometry args={[1.93, 72]} />
        <meshBasicMaterial
          ref={innerMaterial}
          color="#3049a8"
          transparent
          opacity={0.34}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[2.05, 0.16, 18, 96]} />
        <meshStandardMaterial
          color="#8775ff"
          emissive="#5b41f2"
          emissiveIntensity={3.6}
          metalness={0.78}
          roughness={0.22}
        />
      </mesh>
      <mesh ref={innerRing} scale={[0.82, 1.08, 1]}>
        <torusGeometry args={[2.05, 0.035, 8, 96]} />
        <meshBasicMaterial color="#8adfff" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[0, 0, 0.72]} scale={[0.78, 1.12, 1]}>
        <torusGeometry args={[2.05, 0.027, 8, 84, Math.PI * 1.36]} />
        <meshBasicMaterial color="#f472b6" transparent opacity={0.9} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 2.05, Math.sin(angle) * 2.05, 0.03]}
            rotation={[0, 0, angle]}
          >
            <octahedronGeometry args={[0.105, 0]} />
            <meshBasicMaterial color={index % 2 ? "#38bdf8" : "#f2c879"} />
          </mesh>
        );
      })}
    </group>
  );
}

function FloatingIsland({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <Float speed={0.7} rotationIntensity={0.04} floatIntensity={0.25}>
      <group position={position} scale={scale}>
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[1.62, 0.32, 0.65, 7]} />
          <meshStandardMaterial color="#242440" roughness={0.86} flatShading />
        </mesh>
        <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.7, 1.55, 0.22, 7]} />
          <meshStandardMaterial color="#343052" roughness={0.82} flatShading />
        </mesh>
        <mesh position={[0.22, 0.79, -0.08]}>
          <coneGeometry args={[0.38, 0.72, 5]} />
          <meshStandardMaterial color="#3b315d" roughness={0.75} flatShading />
        </mesh>
        <mesh position={[-0.72, -0.42, 0.13]} rotation={[0.2, 0.2, 0.15]}>
          <coneGeometry args={[0.48, 1.15, 5]} />
          <meshStandardMaterial color="#25243f" roughness={0.91} flatShading />
        </mesh>
        <mesh position={[0.8, -0.32, -0.12]} rotation={[-0.2, -0.5, -0.13]}>
          <coneGeometry args={[0.35, 0.9, 5]} />
          <meshStandardMaterial color="#282440" roughness={0.91} flatShading />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <torusGeometry args={[1.58, 0.014, 5, 7]} />
          <meshBasicMaterial color="#8473de" transparent opacity={0.62} />
        </mesh>
      </group>
    </Float>
  );
}

function CloudBank() {
  const cloud = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (cloud.current) cloud.current.position.x = Math.sin(clock.getElapsedTime() * 0.035) * 0.85;
  });
  return (
    <group ref={cloud}>
      {[[-8, 1.8, -5], [7, 2.8, -7], [-4, 5.7, -12], [9, 4.3, -15]].map(([x, y, z], index) => (
        <group key={index} position={[x, y, z]}>
          {[0, 1, 2, 3].map((_, puff) => (
            <mesh key={puff} position={[puff * 0.48 - 0.68, Math.sin(puff * 4) * 0.16, 0]}>
              <sphereGeometry args={[0.73 + (puff % 2) * 0.15, 12, 10]} />
              <meshBasicMaterial color={index % 2 ? "#7574c5" : "#7489b9"} transparent opacity={0.1} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Horizon({ controls, map }: RealmSceneProps) {
  const ground = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const entry = controls.current.entry;
    if (ground.current) ground.current.position.z = -5 - entry * 1.2 + Math.sin(clock.getElapsedTime() * 0.15) * 0.1;
  });

  return (
    <>
      <color attach="background" args={["#070817"]} />
      <fog attach="fog" args={["#10152d", 12, map ? 43 : 31]} />
      <ambientLight intensity={0.68} color="#b7b2ff" />
      <hemisphereLight args={["#7685e3", "#10101e", 1.05]} />
      <directionalLight position={[-8, 10, 5]} intensity={1.7} color="#a493ff" />
      <pointLight position={[0, 4, 0]} color="#7e55ff" intensity={48} distance={15} />
      <pointLight position={[0, 3, 2]} color="#38bdf8" intensity={16} distance={7} />
      <Stars radius={70} depth={46} count={1250} factor={3.4} saturation={0.28} fade speed={0.15} />
      <StarField controls={controls} />
      <MountainRange />
      <mesh ref={ground} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.1, -5]} receiveShadow>
        <planeGeometry args={[65, 50, 1, 1]} />
        <meshStandardMaterial color="#0b1024" roughness={0.86} metalness={0.12} />
      </mesh>
      <CloudBank />
      <Castle subtle={map} />
      {!map && <Portal controls={controls} />}
      {map && (
        <>
          <FloatingIsland position={[-7, -0.5, -3]} scale={0.83} />
          <FloatingIsland position={[-4, 0.2, 1]} scale={0.72} />
          <FloatingIsland position={[0, -0.6, -1]} scale={0.9} />
          <FloatingIsland position={[4, 0, 1]} scale={0.75} />
          <FloatingIsland position={[7, -0.5, -3]} scale={0.84} />
        </>
      )}
    </>
  );
}

function Scene({ controls, map = false }: RealmSceneProps) {
  const targetCamera = useMemo(() => new THREE.Vector3(0, map ? 1.35 : 2.4, map ? 18 : 14), [map]);
  useFrame(({ camera }, delta) => {
    const entry = controls.current.entry;
    if (map) {
      camera.position.lerp(targetCamera, 1 - Math.exp(-delta * 2.2));
      camera.lookAt(0, 1.3, -1);
      return;
    }
    const targetZ = 14 - entry * 14;
    const targetY = 2.45 + entry * 0.55;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 1.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 1.2, delta);
    camera.position.x = Math.sin(entry * Math.PI) * 0.28;
    camera.lookAt(0, 2.7 + entry * 0.2, -2.5);
  });

  return (
    <>
      <Horizon controls={controls} map={map} />
    </>
  );
}

export default function RealmScene({ controls, map = false, children }: RealmSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 2.45, 14], fov: map ? 48 : 44, near: 0.1, far: 90 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      shadows
      fallback={<p className="scene-fallback">The realm can’t render on this device. The event guide is still available below.</p>}
      aria-label={map ? "Interactive 3D map of the NEXUS festival world" : "Animated 3D NEXUS portal and floating castle"}
    >
      <Scene controls={controls} map={map} />
      {children}
    </Canvas>
  );
}

function Stars({ radius, depth, count, factor, saturation, fade, speed }: {
  radius: number; depth: number; count: number; factor: number; saturation: number; fade: boolean; speed: number;
}) {
  return <StarsImpl radius={radius} depth={depth} count={count} factor={factor} saturation={saturation} fade={fade} speed={speed} />;
}

function StarsImpl({ radius, depth, count, factor, saturation, fade, speed }: {
  radius: number; depth: number; count: number; factor: number; saturation: number; fade: boolean; speed: number;
}) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (Math.random() - 0.5) * radius * 2;
      values[i + 1] = (Math.random() - 0.5) * depth;
      values[i + 2] = (Math.random() - 0.5) * radius * 2;
    }
    return values;
  }, [count, depth, radius]);
  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * speed * 0.025;
  });
  return (
    <points ref={points}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial
        color={saturation > 0 ? "#aaa4ff" : "#d6deff"}
        size={0.04 * factor}
        transparent={fade}
        opacity={0.66}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export { Castle, FloatingIsland, Horizon };
