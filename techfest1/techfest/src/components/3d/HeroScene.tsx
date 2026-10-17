import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sound } from '../../utils/audio';

interface HeroSceneProps {
  reducedMotion?: boolean;
  sceneMode: 'core' | 'orb' | 'portal';
}

export const HeroScene: React.FC<HeroSceneProps> = ({ reducedMotion = false, sceneMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState<number>(60);
  const modeRef = useRef(sceneMode);
  modeRef.current = sceneMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050713, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Lighting setup (Neon Cyan, Electric Magenta, Soft Indigo)
    const ambientLight = new THREE.AmbientLight(0x0c1022, 2.0);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x00f0ff, 4, 15);
    cyanPointLight.position.set(4, 3, 3);
    scene.add(cyanPointLight);

    const magentaPointLight = new THREE.PointLight(0xff007f, 4, 15);
    magentaPointLight.position.set(-4, -3, 3);
    scene.add(magentaPointLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 3, 12);
    purpleLight.position.set(0, 4, -2);
    scene.add(purpleLight);

    // 4. Central Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Mode A: Cybernetic Quantum Core (JunctionX style)
    // Inner glowing Wireframe Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const wireCore = new THREE.Mesh(icoGeo, wireMat);
    coreGroup.add(wireCore);

    // Inner Glowing Core Node
    const innerNodeGeo = new THREE.OctahedronGeometry(0.7, 0);
    const innerNodeMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9
    });
    const innerNode = new THREE.Mesh(innerNodeGeo, innerNodeMat);
    coreGroup.add(innerNode);

    // Mode B: Iridescent Chrome Orb (Monogrid style)
    const orbGeo = new THREE.SphereGeometry(1.4, 64, 64);
    const orbMat = new THREE.MeshPhysicalMaterial({
      color: 0x111633,
      metalness: 0.95,
      roughness: 0.1,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      ior: 1.8,
      sheen: 1.0,
      sheenColor: new THREE.Color(0x00f0ff),
      emissive: 0x1a0933,
      emissiveIntensity: 0.2
    });
    const iridescentOrb = new THREE.Mesh(orbGeo, orbMat);
    iridescentOrb.visible = false;
    coreGroup.add(iridescentOrb);

    // Orbiting Gimbal Rings
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.4, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    coreGroup.add(ring2);

    const portalGroup = new THREE.Group();
    const portalOuter = new THREE.Mesh(
      new THREE.TorusGeometry(1.45, 0.09, 16, 120),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.9 })
    );
    const portalInner = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.025, 12, 120),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 })
    );
    const portalCore = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 64),
      new THREE.MeshBasicMaterial({ color: 0x30105f, transparent: true, opacity: 0.58, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    portalCore.position.z = -0.08;
    portalGroup.add(portalOuter, portalInner, portalCore);
    coreGroup.add(portalGroup);

    // Floating Geometric Shards (JunctionX shattered shards)
    const shardGroup = new THREE.Group();
    coreGroup.add(shardGroup);

    const shardCount = 38;
    const shardMeshes: THREE.Mesh[] = [];
    const shardSpeeds: { rotX: number; rotY: number; orbitSpeed: number; radius: number; angle: number; yOffset: number }[] = [];

    const shardGeo = new THREE.TetrahedronGeometry(0.18, 0);
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0xa855f7,
      emissiveIntensity: 0.4,
      metalness: 0.85,
      roughness: 0.15,
      wireframe: false
    });

    for (let i = 0; i < shardCount; i++) {
      const mesh = new THREE.Mesh(shardGeo, shardMat);
      const radius = 2.2 + Math.random() * 1.8;
      const angle = (i / shardCount) * Math.PI * 2 + Math.random() * 0.5;
      const yOffset = (Math.random() - 0.5) * 2.5;

      mesh.position.set(
        Math.cos(angle) * radius,
        yOffset,
        Math.sin(angle) * radius
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      const scale = 0.5 + Math.random() * 0.9;
      mesh.scale.set(scale, scale, scale);

      shardGroup.add(mesh);
      shardMeshes.push(mesh);
      shardSpeeds.push({
        rotX: (Math.random() - 0.5) * 0.02,
        rotY: (Math.random() - 0.5) * 0.02,
        orbitSpeed: (0.003 + Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1),
        radius,
        angle,
        yOffset
      });
    }

    // 5. Starfield / Cyber Dust Particles (AIJ quantum ribbon style)
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x00f0ff);
    const magentaColor = new THREE.Color(0xff007f);
    const purpleColor = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount; i++) {
      const pRadius = 3 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i * 3] = pRadius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = pRadius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = pRadius * Math.cos(phi);

      const mixVal = Math.random();
      const chosenColor = mixVal < 0.4 ? cyanColor : mixVal < 0.75 ? magentaColor : purpleColor;
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. 3D Cursor Follower Object (The "Wow Factor" prompt requirement)
    // A high-tech energy probe that glides to cursor in 3D space
    const cursorFollowerGroup = new THREE.Group();
    scene.add(cursorFollowerGroup);

    const followerCoreGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const followerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true
    });
    const followerCore = new THREE.Mesh(followerCoreGeo, followerCoreMat);
    cursorFollowerGroup.add(followerCore);

    const followerRingGeo = new THREE.RingGeometry(0.2, 0.23, 24);
    const followerRingMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const followerRing = new THREE.Mesh(followerRingGeo, followerRingMat);
    cursorFollowerGroup.add(followerRing);

    // 7. Mouse and Raycasting
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0, worldX: 0, worldY: 0 };
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const planeIntersect = new THREE.Vector3();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouse.targetX = x;
      mouse.targetY = y;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      raycaster.ray.intersectPlane(plane, planeIntersect);
      if (planeIntersect) {
        mouse.worldX = planeIntersect.x;
        mouse.worldY = planeIntersect.y;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Click pulse
    const handleClick = () => {
      sound.playClick();
      // Temporarily expand shards
      shardMeshes.forEach(mesh => {
        mesh.scale.multiplyScalar(1.4);
        setTimeout(() => {
          mesh.scale.multiplyScalar(1 / 1.4);
        }, 300);
      });
      // Flash lighting
      cyanPointLight.intensity = 8;
      magentaPointLight.intensity = 8;
      setTimeout(() => {
        cyanPointLight.intensity = 4;
        magentaPointLight.intensity = 4;
      }, 250);
    };

    container.addEventListener('click', handleClick);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastTime = performance.now();
    let activeMode = modeRef.current;
    let previousMode = activeMode;
    let transitionStartedAt = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // FPS calculation
      frameCount++;
      const now = performance.now();
      if (activeMode !== modeRef.current) {
        previousMode = activeMode;
        activeMode = modeRef.current;
        transitionStartedAt = now;
      }
      const transitionProgress = transitionStartedAt
        ? Math.min((now - transitionStartedAt) / 520, 1)
        : 1;
      const transitionScale = transitionProgress < 0.5
        ? 1 - transitionProgress * 0.7
        : 0.65 + (transitionProgress - 0.5) * 0.7;
      coreGroup.scale.setScalar(transitionScale);
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Parallax effect on entire scene and camera
      if (!reducedMotion) {
        camera.position.x = mouse.x * 0.8;
        camera.position.y = mouse.y * 0.6;
        camera.lookAt(0, 0, 0);
      }

      // 3D Cursor Follower Lerp
      cursorFollowerGroup.position.x += (mouse.worldX - cursorFollowerGroup.position.x) * 0.08;
      cursorFollowerGroup.position.y += (mouse.worldY - cursorFollowerGroup.position.y) * 0.08;
      cursorFollowerGroup.position.z = 1.0 + Math.sin(time * 3) * 0.2;
      followerRing.rotation.z += 0.03;
      followerCore.rotation.y += 0.02;

      // Mode Visibility Update
      const curMode = transitionProgress < 0.5 ? previousMode : activeMode;
      wireCore.visible = curMode === 'core';
      innerNode.visible = curMode === 'core';
      iridescentOrb.visible = curMode === 'orb';
      ring1.visible = curMode !== 'portal';
      ring2.visible = curMode !== 'portal';
      portalGroup.visible = curMode === 'portal';
      if (curMode === 'portal') {
        portalGroup.rotation.z = time * 0.22;
        portalInner.rotation.z = -time * 0.55;
      }

      // Rotate central objects
      if (!reducedMotion) {
        wireCore.rotation.x = time * 0.2 + mouse.y * 0.5;
        wireCore.rotation.y = time * 0.3 + mouse.x * 0.5;

        innerNode.rotation.x = -time * 0.4;
        innerNode.rotation.y = -time * 0.5;

        iridescentOrb.rotation.y = time * 0.15 + mouse.x * 0.3;
        iridescentOrb.rotation.x = time * 0.1 + mouse.y * 0.3;

        ring1.rotation.x = Math.PI / 3 + Math.sin(time * 0.8) * 0.2;
        ring1.rotation.y = time * 0.4;

        ring2.rotation.y = Math.PI / 4 + Math.cos(time * 0.7) * 0.2;
        ring2.rotation.x = -Math.PI / 6 + time * 0.3;

        // Animate floating shards
        shardMeshes.forEach((mesh, idx) => {
          const speed = shardSpeeds[idx];
          speed.angle += speed.orbitSpeed;
          mesh.position.x = Math.cos(speed.angle) * speed.radius;
          mesh.position.z = Math.sin(speed.angle) * speed.radius;
          mesh.position.y = speed.yOffset + Math.sin(time * 1.5 + idx) * 0.25;

          mesh.rotation.x += speed.rotX;
          mesh.rotation.y += speed.rotY;
        });

        // Rotate particles
        particles.rotation.y = time * 0.03;
        particles.rotation.x = Math.sin(time * 0.02) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleClick);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  return (
    <div className="relative w-full h-full min-h-[550px] md:min-h-[700px] flex items-center justify-center">
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 z-0 cursor-crosshair overflow-hidden pointer-events-auto"
        title="Interactive 3D Quantum Space — Move mouse to orbit, click to pulse"
      />

      {/* Floating HUD Telemetry Badge */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-3 bg-[#080d21]/70 backdrop-blur-md border border-slate-700/50 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold">LIVE RENDER</span>
        </div>
        <span className="text-slate-600">|</span>
        <span>{fps} FPS</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400">3D PROBE: TRACKING</span>
      </div>
    </div>
  );
};
