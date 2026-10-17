
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
}

const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 6500,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const cyan = new THREE.Color('#00eaff');
    const magenta = new THREE.Color('#ff19d8');
    const violet = new THREE.Color('#542cff');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      const x = (Math.random() - 0.5) * 19;
      const z = (Math.random() - 0.5) * 12;

      // A diagonal, flowing wave like the reference image.
      const wave =
        Math.sin(x * 0.48 + z * 0.42) * 1.2 +
        Math.sin(x * 0.22 - z * 0.7) * 0.65;

      positions[i3] = x;
      positions[i3 + 1] = wave + (Math.random() - 0.5) * 2.2;
      positions[i3 + 2] = z;

      const blend = Math.random();
      const color =
        blend > 0.78
          ? magenta
          : blend > 0.55
            ? violet
            : cyan;

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = 0.7 + Math.random() * 2.2;
    }

    return { positions, colors, sizes };
  }, [count]);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;

    const t = clock.getElapsedTime();

    points.rotation.y = Math.sin(t * 0.08) * 0.09;
    points.rotation.x = Math.sin(t * 0.06) * 0.035;

    const material = points.material as THREE.PointsMaterial;
    material.size = 0.035 + Math.sin(t * 1.2) * 0.004;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>

      <pointsMaterial
        vertexColors
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const ParticleWaveBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#03050b]"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 11],
          fov: 55,
        }}
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: 'low-power',
        }}
        fallback={
          <div className="absolute inset-0 bg-[#03050b]" />
        }
      >
        <color attach="background" args={['#03050b']} />
        <fog attach="fog" args={['#03050b', 7, 22]} />

        <ParticleField count={6500} />
      </Canvas>

      {/* Cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(3,5,11,0.4)_70%,#03050b_110%)]" />
    </div>
  );
};

export default ParticleWaveBackground;
