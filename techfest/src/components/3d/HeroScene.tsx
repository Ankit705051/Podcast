import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { sound } from '../../utils/audio';
import {
  CinematicAudio, ParticlePool, buildTitle, clamp01, createFighter, createSky, createStars,
  createTerrain, createUFO, lerp, makeRng, smooth,
} from './heroScenekit';
import type { TitleVoxels } from './heroScenekit';
import { createBattle } from './heroBattle';
const V3 = THREE.Vector3;
const T = {
  alert: 2.2,
  intercept: 3.5,
  impact: 9.5,
  reveal: 10.9,
  end: 14.8,
} as const;
const T_JET0 = 3.3;
const T_JET1 = 9.6;
const T_HIT = 8.15;
const T_CRASH = 9.95;
const DRONE_DEATH = [5.3, 6.15, 6.9, 7.6];
const CRASH = new V3(5, 1.0, -36);
const CRASH_LOOK = new V3(5, 4, -36);
const TITLE_POS = new V3(0, 4.7, -13);
const TITLE_LOOK = new V3(0, 4.3, -13);
const TITLE_WIDTH = 18;
const DEBRIS_FIRES = [
  new V3(-9, 0.2, -30), new V3(14, 0.2, -26), new V3(-4, 0.2, -34),
  new V3(11, 0.2, -37), new V3(-14, 0.2, -18),
];

type Stage = 'contact' | 'alert' | 'intercept' | 'impact' | 'reveal' | 'ready';
const stageAt = (t: number): Stage =>
  t < T.alert ? 'contact' : t < T.intercept ? 'alert' : t < T.impact ? 'intercept' : t < T.reveal ? 'impact' : t < T.end ? 'reveal' : 'ready';

const leadCurve = new THREE.CatmullRomCurve3(
  [
    new V3(-16, 0.8, 2), new V3(-8, 3.5, -10), new V3(-3, 8, -26), new V3(-12, 13, -44),
    new V3(-2, 17, -58), new V3(14, 12, -48), new V3(24, 8, -26),
  ],
  false, 'catmullrom', 0.5
);
const JET_OFFS = [new V3(0, 0, 0), new V3(-3.4, 0.6, 3), new V3(3.6, -0.2, 3.6)];

const jetState = (i: number, t: number, pos: THREE.Vector3, fwd: THREE.Vector3) => {
  const u = clamp01((t - T_JET0) / (T_JET1 - T_JET0) - i * 0.01);
  leadCurve.getPointAt(u, pos).add(JET_OFFS[i]);
  leadCurve.getTangentAt(Math.min(u, 0.999), fwd);
};

const hoverAt = (t: number, out: THREE.Vector3) => {
  const k = smooth(0.3, 3.8, t);
  return out.set(
    lerp(-34, -2 + Math.sin(t * 0.7) * 5, k),
    lerp(17, 12 + Math.sin(t * 1.1) * 1.1, k),
    lerp(-95, -50 + Math.cos(t * 0.5) * 3, k)
  );
};
const FALL_FROM = hoverAt(T_HIT, new V3());
const mothPos = (t: number, out: THREE.Vector3) => {
  if (t < T_HIT) return hoverAt(t, out);
  const k = clamp01((t - T_HIT) / (T_CRASH - T_HIT));
  const spiral = (1 - k) * 3.5;
  return out.set(
    lerp(FALL_FROM.x, CRASH.x, k) + Math.cos(k * 9) * spiral,
    lerp(FALL_FROM.y, CRASH.y, k * k),
    lerp(FALL_FROM.z, CRASH.z, k) + Math.sin(k * 9) * spiral
  );
};

const dronePos = (k: number, t: number, out: THREE.Vector3) => {
  const s = t - 2.6, ph = k * 1.9;
  return out.set(
    Math.sin(s * 1.15 + ph) * 15 + (k - 1.5) * 5,
    11 + k * 1.4 + Math.sin(s * 1.6 + ph * 1.3) * 3.5,
    -84 + smooth(0, 3, s) * 34 + Math.cos(s * 0.9 + ph) * 8
  );
};
interface HeroSceneProps {
  sceneMode?: 'core' | 'orb' | 'portal';
  reducedMotion?: boolean;
  onIntroComplete?: () => void;
  onEnter?: () => void;
  onPhaseChange?: (phase: HeroSequencePhase) => void;
  onSkipReady?: (skip: () => void) => void;
}

export type HeroSequencePhase = 'contact' | 'interception' | 'impact' | 'reveal' | 'complete';

interface SceneControls {
  skip(): void;
  replay(): void;
  setMuted(m: boolean): void;
}

const CHAPTERS: Partial<Record<Stage, { n: string; title: string; sub: string }>> = {
  contact: { n: '01', title: 'Alien contact', sub: 'Unidentified object on radar' },
  alert: { n: '01', title: 'Alien contact', sub: 'Hostile craft confirmed — scramble interceptors' },
  intercept: { n: '02', title: 'Interception', sub: 'Weapons free — 4 hostiles' },
  impact: { n: '03', title: 'Impact', sub: 'Mothership down — signal lost' },
  reveal: { n: '03', title: 'Reveal', sub: 'Signal acquired' },
};

export const HeroScene: React.FC<HeroSceneProps> = ({ sceneMode = 'core', reducedMotion = false, onIntroComplete, onEnter, onPhaseChange, onSkipReady }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<SceneControls | null>(null);
  const completeRef = useRef(onIntroComplete);
  completeRef.current = onIntroComplete;
  const phaseRef = useRef(onPhaseChange);
  phaseRef.current = onPhaseChange;
  const skipRef = useRef(onSkipReady);
  skipRef.current = onSkipReady;

  const [stage, setStage] = useState<Stage>(reducedMotion ? 'ready' : 'contact');
  const [muted, setMuted] = useState(true); 
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const lite = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 2;
    const getW = () => Math.max(1, container.clientWidth);
    const getH = () => Math.max(1, container.clientHeight);
    const pr = Math.max(1, Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2));
    void document.fonts?.load('900 100px "Orbitron"').catch(() => undefined);
    const scene = new THREE.Scene();
    const fogColor = new THREE.Color(0x0d0a22);
    scene.fog = new THREE.FogExp2(fogColor, 0.008);
    scene.background = fogColor;

    const camera = new THREE.PerspectiveCamera(50, getW() / getH(), 0.1, 1200);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(pr);
    renderer.setSize(getW(), getH());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(
      renderer,
      new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: lite ? 0 : 4 })
    );
    composer.setPixelRatio(pr);
    composer.setSize(getW(), getH());
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(getW(), getH()), 0.5, 0.4, 0.4);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    scene.add(createSky());
    scene.add(createStars(lite ? 700 : 1400));
    scene.add(createTerrain(lite ? 90 : 150));
    const modeTint = sceneMode === 'orb' ? 0xff2e93 : sceneMode === 'portal' ? 0xa855f7 : 0x00f0ff;
    const grid = new THREE.GridHelper(70, 35, modeTint, 0x6a2cff);
    grid.position.set(0, 0.03, -22);
    const gm = grid.material as THREE.LineBasicMaterial;
    gm.transparent = true;
    gm.opacity = 0.13;
    scene.add(grid);
    scene.add(new THREE.HemisphereLight(0x3a4a9a, 0x14081f, 0.9));
    const moon = new THREE.DirectionalLight(0x7fa8ff, 1.1);
    moon.position.set(-30, 40, 20);
    scene.add(moon);
    const motherLight = new THREE.PointLight(0xff2e93, 0, 90, 2);
    const searchSpot = new THREE.SpotLight(0xbff4ff, 0, 140, 0.22, 0.5, 1.2);
    const fireLight = new THREE.PointLight(0xff7a1a, 0, 80, 2);
    fireLight.position.set(CRASH.x, 4, CRASH.z + 5);
    const boomLight = new THREE.PointLight(0xffb060, 0, 70, 2);
    const rimCyan = new THREE.PointLight(modeTint, 0, 40, 2);
    rimCyan.position.set(11, 6, TITLE_POS.z + 4);
    const rimMagenta = new THREE.PointLight(0xff007f, 0, 40, 2);
    rimMagenta.position.set(-11, 6, TITLE_POS.z + 4);
    const cursorLight = new THREE.PointLight(0xffffff, 0, 16, 2);
    scene.add(motherLight, searchSpot, searchSpot.target, fireLight, boomLight, rimCyan, rimMagenta, cursorLight);

    const beamGeo = new THREE.CylinderGeometry(0.2, 1, 1, 32, 1, true).translate(0, -0.5, 0);
    const beam = new THREE.Mesh(
      beamGeo,
      new THREE.MeshBasicMaterial({
        color: 0xaff6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
        depthWrite: false, side: THREE.DoubleSide, fog: false,
      })
    );
    scene.add(beam);

    const mother = createUFO();
    mother.scale.setScalar(4.2);
    mother.visible = false;
    scene.add(mother);

    const drones = Array.from({ length: 4 }, () => {
      const u = createUFO();
      u.scale.setScalar(0.9);
      u.visible = false;
      scene.add(u);
      return u;
    });
    const jets = [0, 1, 2].map(() => {
      const j = createFighter();
      j.scale.setScalar(1.15);
      j.visible = false;
      scene.add(j);
      return j;
    });
    const glow = new ParticlePool(lite ? 2800 : 5500, true);
    const smoke = new ParticlePool(lite ? 800 : 1600, false);
    scene.add(glow.points, smoke.points);
    const battle = createBattle(scene, glow, {
      showCrash: T.reveal,
      showMechs: T.reveal + 3,
      still: reducedMotion,
      aniso: renderer.capabilities.getMaxAnisotropy(),
    });
    const ringMat = (c: THREE.Color) =>
      new THREE.MeshBasicMaterial({
        color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      });
    const ringGeo = new THREE.RingGeometry(0.9, 1, 96).rotateX(-Math.PI / 2);
    const ringA = new THREE.Mesh(ringGeo, ringMat(new THREE.Color(0.2, 1.4, 2.2)));
    const ringB = new THREE.Mesh(ringGeo, ringMat(new THREE.Color(2.2, 0.2, 1.2)));
    ringA.position.set(CRASH.x, 0.2, CRASH.z);
    ringB.position.copy(ringA.position);
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 70, 24, 1, true).translate(0, 35, 0),
      ringMat(new THREE.Color(0.5, 1.6, 2.4))
    );
    pillar.position.set(CRASH.x, 0, CRASH.z);
    scene.add(ringA, ringB, pillar);
    const titleGroup = new THREE.Group();
    titleGroup.position.copy(TITLE_POS);
    scene.add(titleGroup);
    let title: TitleVoxels | null = null;
    const ensureTitle = () => {
      if (title) return title;
      const origin = CRASH.clone().sub(TITLE_POS);
      title = buildTitle(TITLE_WIDTH, lite ? 6 : 4, origin, makeRng(77)); 
      titleGroup.add(title.mesh);
      return title;
    };
    const audio = new CinematicAudio();
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const cursorWorld = new V3(0, TITLE_POS.y, TITLE_POS.z + 2.5);
    const cursorPlane = new THREE.Plane(new V3(0, 0, 1), -(TITLE_POS.z + 2.5));
    const raycaster = new THREE.Raycaster();
    const hit = new V3();

    let t = 0;
    let running = false;
    let started = false;
    let nextCue = 0;
    let shake = 0, flash = 0, boom = 0, pulse = 0;
    let stageRef: Stage | '' = '';
    let titleDist = 19;
    let fov = 50;
    const explode = (p: THREE.Vector3, size: number) => {
      const q = lite ? 0.6 : 1;
      const n = Math.floor(46 * size * q);
      const sp = Math.pow(size, 0.6);
      for (let i = 0; i < n; i++) {
        const d = new V3(Math.random() - 0.5, Math.random() - 0.35, Math.random() - 0.5).normalize().multiplyScalar((2 + Math.random() * 7) * sp);
        glow.emit(p.x, p.y, p.z, d.x, d.y, d.z, 0.35 + Math.random() * 0.7, (0.8 + Math.random()) * size, 0.1, 1.8, 0.55 + Math.random() * 0.4, 0.1, 0.9);
      }
      for (let i = 0; i < n / 2; i++) {
        const d = new V3(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize().multiplyScalar(6 + Math.random() * 12);
        glow.emit(p.x, p.y, p.z, d.x, d.y, d.z, 0.5 + Math.random() * 0.9, 0.25, 0.05, 2.4, 1.6, 0.6, 1, -9);
      }
      for (let i = 0; i < n / 3; i++) {
        smoke.emit(p.x + (Math.random() - 0.5) * size, p.y, p.z + (Math.random() - 0.5) * size,
          (Math.random() - 0.5) * 3, 0.5 + Math.random() * 2, (Math.random() - 0.5) * 3,
          1.5 + Math.random() * 1.8, size * 1.2, size * 5, 0.07, 0.06, 0.08, 0.55, 0.8);
      }
      boom = Math.max(boom, size);
      boomLight.position.copy(p);
      shake = Math.max(shake, 0.1 * size);
    };

    const burn = (p: THREE.Vector3, s: number) => {
      const r = Math.random;
      for (let i = 0; i < 2; i++) {
        glow.emit(p.x + (r() - 0.5) * 3 * s, p.y + 0.4, p.z + (r() - 0.5) * 3 * s, (r() - 0.5) * 0.6, 2.5 + r() * 3, (r() - 0.5) * 0.6,
          0.7 + r() * 0.8, 1.8 * s, 0.2 * s, 1.7, 0.45 + r() * 0.25, 0.08, 0.85, 1.2);
      }
      smoke.emit(p.x, p.y + 1.5 * s, p.z, 1 + r() * 1.5, 1.8 + r(), (r() - 0.5) * 0.6,
        3.5 + r() * 1.5, 1.6 * s, 8 * s, 0.05, 0.045, 0.06, 0.38, 0.25);
      if (r() > 0.5) {
        glow.emit(p.x + (r() - 0.5) * 3 * s, p.y + 1, p.z + (r() - 0.5) * 3 * s, 0.6 + r() * 1.2, 1.5 + r() * 2.5, (r() - 0.5) * 1.2,
          3 + r() * 3, 0.14, 0.05, 1.9, 0.7, 0.2, 1, 0.4);
      }
    };
    interface Bolt { t0: number; dur: number; a: THREE.Vector3; b: THREE.Vector3; missile: boolean; mesh: THREE.Mesh }
    const bolts: Bolt[] = [];
    const laserGeo = new THREE.BoxGeometry(0.07, 0.07, 1.8);
    const missileGeo = new THREE.BoxGeometry(0.16, 0.16, 1.2);
    const alienMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.12, 0.55).multiplyScalar(3), fog: false });
    const jetMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 0.95, 1).multiplyScalar(3), fog: false });
    const addBolt = (t0: number, dur: number, a: THREE.Vector3, b: THREE.Vector3, missile: boolean, alien: boolean) => {
      const mesh = new THREE.Mesh(missile ? missileGeo : laserGeo, alien ? alienMat : jetMat);
      mesh.position.copy(a);
      mesh.lookAt(b);
      mesh.visible = false;
      scene.add(mesh);
      bolts.push({ t0, dur, a: a.clone(), b: b.clone(), missile, mesh });
    };
    const cues: { t: number; fn: () => void }[] = [];
    const cue = (at: number, fn: () => void) => cues.push({ t: at, fn });
    const cut = () => { flash = Math.max(flash, 0.28); shake = Math.max(shake, 0.18); audio.whoosh(); };

    cue(0.0, () => { audio.drone(5); });
    cue(0.15, () => audio.radioStatic(0.5));
    [0.5, 1.15, 1.8].forEach((s) => cue(s, () => audio.ping()));
    cue(T.alert, () => audio.siren(3.6));
    cue(2.6, () => audio.rumble(3));
    cue(T.intercept, () => { flash = 0.3; audio.jetPass(); });
    [4.9, 6.4, 7.9].forEach((s) => cue(s, cut));
    cue(T.impact, cut);

    const rng = makeRng(2026);
    const pA = new V3(), pF = new V3(), pJ = new V3();

    for (let s = 3.95; s < 8.0; s += 0.19) {
      const k = Math.floor(rng() * 4);
      if (s > DRONE_DEATH[k] - 0.1) continue;
      dronePos(k, s, pA);
      jetState(Math.floor(rng() * 3), s + 0.3, pJ, pF);
      pJ.x += (rng() - 0.5) * 6;
      pJ.y += (rng() - 0.5) * 4;
      addBolt(s, 0.3, pA, pJ, false, true);
      if (rng() > 0.55) cue(s, () => audio.laser());
    }
    for (let s = 4.3; s < 7.8; s += 0.14) {
      const alive = DRONE_DEATH.map((d, k) => (d > s + 0.3 ? k : -1)).filter((k) => k >= 0);
      if (!alive.length) break;
      jetState(Math.floor(rng() * 3), s, pJ, pF);
      pJ.addScaledVector(pF, 2.5);
      dronePos(alive[Math.floor(rng() * alive.length)], s + 0.25, pA);
      addBolt(s, 0.25, pJ, pA, false, false);
    }
    DRONE_DEATH.forEach((d, k) => {
      jetState(k % 3, d - 0.55, pJ, pF);
      pJ.addScaledVector(pF, 2);
      const dp = dronePos(k, d, new V3());
      addBolt(d - 0.55, 0.55, pJ, dp, true, false);
      cue(d - 0.55, () => audio.missile());
      cue(d, () => { explode(dp, 1.1); audio.explosion(1.1); });
    });
    const mp = hoverAt(T_HIT, new V3());
    [0, 1, 2].forEach((i) => {
      jetState(i, T_HIT - 0.65, pJ, pF);
      pJ.addScaledVector(pF, 2);
      addBolt(T_HIT - 0.65, 0.65, pJ, mp.clone().add(new V3((i - 1) * 3, -1 + i * 0.5, (i - 1) * 2)), true, false);
      cue(T_HIT - 0.65, () => audio.missile());
      const at = mp.clone().add(new V3((i - 1) * 3, -1 + i * 0.5, (i - 1) * 2));
      cue(T_HIT + i * 0.14, () => { explode(at, 2.2 + i * 0.3); audio.explosion(2.2); });
    });
    cue(T_HIT + 0.8, () => { explode(mothPos(T_HIT + 0.8, new V3()), 2.8); audio.explosion(2.8); });
    cue(T_CRASH, () => { explode(CRASH, 5.5); flash = 1.4; shake = 1.1; audio.crash(); });
    cue(T_CRASH + 0.12, () => explode(new V3(CRASH.x - 5, 0.6, CRASH.z + 3), 3));
    cue(T_CRASH + 0.3, () => audio.duck(0, 0.25));
    cue(T.reveal, () => { audio.duck(1, 0.05); audio.reveal(); flash = 0.9; shake = 0.35; });
    cues.sort((a, b) => a.t - b.t);

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onClick = () => {
      if (stageRef !== 'ready') return;
      sound.playClick();
      pulse = 1;
      flash = Math.max(flash, 0.12);
      for (let i = 0; i < 40; i++) {
        const d = new V3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.2).normalize().multiplyScalar(2 + Math.random() * 6);
        glow.emit(cursorWorld.x, cursorWorld.y, cursorWorld.z, d.x, d.y, d.z, 0.7, 0.3, 0.05, 0.3, 1.6, 2.2, 1, -2);
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    container.addEventListener('click', onClick);

    const resize = () => {
      const w = getW(), h = getH();
      camera.aspect = w / h;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      battle.resize(camera.aspect);
      titleDist = 19 * Math.min(3, Math.max(1, 1.55 / camera.aspect));
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    const resetWorld = () => {
      glow.clear();
      smoke.clear();
      title?.reset();
      flash = 0; shake = 0; boom = 0; pulse = 0;
    };
    ctrlRef.current = {
      skip() {
        if (!started) return;
        nextCue = cues.length;
        ensureTitle();
        resetWorld();
        ensureTitle().update(1e9);
        audio.duck(1, 0.05);
        audio.reveal();
        t = T.end + 0.01;
      },
      replay() {
        resetWorld();
        audio.duck(1, 0.05);
        t = 0; nextCue = 0; started = true; running = true; stageRef = '';
        setStage('contact');
        setFps(60);
      },
      setMuted(m) {
        if (!m) audio.init(); 
        audio.setMuted(m);
      },
    };
    skipRef.current?.(() => ctrlRef.current?.skip());

    if (reducedMotion) {
      started = true; running = true; t = T.end + 0.01; nextCue = cues.length; stageRef = 'ready';
      ensureTitle().update(1e9);
      phaseRef.current?.('complete');
      completeRef.current?.();
    } else {
      audio.setMuted(true);
      started = true; running = true; t = 0; nextCue = 0; stageRef = '';
    }
    const camPos = new V3(), camLook = new V3();
    const a = new V3(), b = new V3(), c = new V3(), d = new V3();
    const CAM_D = new V3(-17, 2, 22);
    const exhaust = new V3();
    const clock = new THREE.Clock();
    let raf = 0, frames = 0, lastFps = performance.now(), frameNo = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      frameNo++;
      frames++;
      const nowMs = performance.now();
      if (nowMs - lastFps >= 1000) {
        if (stageRef === 'ready') setFps(frames);
        frames = 0;
        lastFps = nowMs;
      }

      if (running) t += dt;
      while (nextCue < cues.length && cues[nextCue].t <= t) cues[nextCue++].fn();

      if (started) {
        const s = stageAt(t);
        if (s !== stageRef) {
          stageRef = s;
          setStage(s);
          const phase: HeroSequencePhase = s === 'contact'
            ? 'contact'
            : s === 'alert' || s === 'intercept'
              ? 'interception'
              : s === 'impact'
                ? 'impact'
                : s === 'reveal'
                  ? 'reveal'
                  : 'complete';
          phaseRef.current?.(phase);
          if (s === 'ready' && !reducedMotion) completeRef.current?.();
        }
      }

      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      const showMother = t > 0.3 && t < T.reveal;
      mother.visible = showMother;
      mothPos(t, a);
      mother.position.copy(a);
      const k = clamp01((t - T_HIT) / (T_CRASH - T_HIT));
      mother.rotation.set(t < T_HIT ? 0.05 * Math.sin(t) : k * 0.5, t < T_HIT ? t * 0.4 : t * 0.4 + k * k * 10, t < T_HIT ? 0 : k * 0.55);
      (mother.userData.rim as THREE.Object3D).rotation.y += dt * 2;
      motherLight.position.set(a.x, a.y - 5, a.z);
      motherLight.intensity = showMother && t < T_CRASH ? (t < T_HIT ? 600 : 900 + Math.random() * 500) : 0;

      const beamK = smooth(0.9, 1.5, t) * (1 - smooth(3.5, 4.0, t));
      if (beamK > 0.001) {
        const sweep = smooth(1.5, 3.4, t);
        b.set(Math.sin(t * 0.9) * 14, 0, lerp(-24 + Math.cos(t * 0.6) * 8, 2, sweep));
        d.copy(b).sub(a);
        const len = d.length();
        beam.position.copy(a);
        beam.quaternion.setFromUnitVectors(c.set(0, -1, 0), d.normalize());
        beam.scale.set(len * 0.2, len, len * 0.2);
        searchSpot.position.copy(a);
        searchSpot.target.position.copy(b);
      }
      beam.visible = beamK > 0.001;
      (beam.material as THREE.MeshBasicMaterial).opacity = 0.16 * beamK;
      searchSpot.intensity = 6000 * beamK;

      drones.forEach((u, i) => {
        const alive = t > 3.0 && t < DRONE_DEATH[i];
        u.visible = alive;
        if (!alive) return;
        dronePos(i, t, u.position);
        u.rotation.z = Math.sin((t - 2.6) * 1.6 + i * 2.5) * 0.4;
        (u.userData.rim as THREE.Object3D).rotation.y += dt * 4;
      });
      const flyby = t > T.reveal + 1.2;
      jets.forEach((j, i) => {
        let on = false;
        if (t >= T_JET0 && t < T_JET1) {
          on = true;
          jetState(i, t, a, b);
        } else if (flyby) {
          on = true;
          const s = (((t - T.reveal - 1.2) % 9) + 9) % 9 / 9;
          a.set(lerp(-90, 90, s), 17 + i * 0.8 + Math.sin(t + i) * 0.3, -30 - i * 3 + (i === 0 ? 0 : 1) * 2);
          b.set(1, 0, 0);
        }
        j.visible = on;
        if (!on) return;
        j.position.copy(a);
        j.lookAt(c.copy(a).add(b));
        j.rotateZ(Math.sin(t * 1.7 + i * 2) * 0.6);
        j.updateMatrixWorld(true);
        (j.userData.flames as THREE.Mesh[]).forEach((f) => f.scale.set(1, 1, 0.8 + Math.random() * 0.7));
        for (const sx of [-0.2, 0.2]) {
          exhaust.set(sx, 0, -2.1);
          j.localToWorld(exhaust);
          glow.emit(exhaust.x, exhaust.y, exhaust.z, -b.x * 4, -b.y * 4, -b.z * 4, 0.45, 0.55, 0.05, 0.3, 1.0, 1.9, 0.8);
        }
        if (frameNo % 2 === 0) {
          smoke.emit(exhaust.x, exhaust.y, exhaust.z, 0, 0, 0, 1.4, 0.3, 1.4, 0.35, 0.38, 0.5, 0.22);
        }
      });
      for (const bo of bolts) {
        const u = (t - bo.t0) / bo.dur;
        const on = u >= 0 && u <= 1;
        bo.mesh.visible = on;
        if (!on) continue;
        bo.mesh.position.lerpVectors(bo.a, bo.b, u);
        if (bo.missile) {
          const p = bo.mesh.position;
          glow.emit(p.x, p.y, p.z, 0, 0, 0, 0.4, 0.5, 0.1, 1.8, 0.9, 0.4, 0.8);
          smoke.emit(p.x, p.y, p.z, 0, 0, 0, 1.1, 0.35, 1.2, 0.4, 0.4, 0.45, 0.25);
        }
      }
      if (t > T_HIT && t < T_CRASH) {
        mothPos(t, c);
        for (let i = 0; i < 3; i++) {
          glow.emit(c.x + (Math.random() - 0.5) * 6, c.y + (Math.random() - 0.5) * 2, c.z + (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 2, 1 + Math.random() * 2, (Math.random() - 0.5) * 2, 0.7, 2.2, 0.3, 1.7, 0.5, 0.1, 0.8, 1);
          smoke.emit(c.x, c.y, c.z, (Math.random() - 0.5), 1, (Math.random() - 0.5), 2.5, 2, 8, 0.05, 0.045, 0.06, 0.5, 0.3);
        }
      }
      if (t > T_CRASH) {
        burn(CRASH, 1.6);
        if (!lite || frameNo % 2 === 0) DEBRIS_FIRES.forEach((p, i) => { if (frameNo % 2 === i % 2) burn(p, 0.6); });
      }
      fireLight.intensity = t > T_CRASH ? (700 + Math.sin(t * 23) * 120 + Math.random() * 150) * smooth(T_CRASH, T_CRASH + 0.6, t) : 0;
      boom *= Math.exp(-dt * 5);
      boomLight.intensity = boom * 2500;
      const rk = t - T.reveal;
      const ring = (m: THREE.Mesh, delay: number) => {
        const q = clamp01((rk - delay) / 2.2);
        m.visible = q > 0 && q < 1;
        m.scale.setScalar(1 + q * 75);
        (m.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - q) * (1 - q);
      };
      ring(ringA, 0);
      ring(ringB, 0.25);
      const pk = rk / 1.8;
      pillar.visible = pk > 0 && pk < 1;
      pillar.scale.set(1 + pk * 2, 1, 1 + pk * 2);
      (pillar.material as THREE.MeshBasicMaterial).opacity = smooth(0, 0.1, pk) * (1 - smooth(0.3, 1, pk)) * 0.8;
      battle.update(t, dt);
      const revealK = smooth(T.reveal, T.reveal + 1.5, t);
      rimCyan.intensity = 260 * revealK + battle.kick.cyan * 500;
      rimMagenta.intensity = 260 * revealK + battle.kick.red * 500;
      if (t >= T.reveal - 0.6) ensureTitle();
      if (title) {
        const ta = t - (T.reveal + 0.5);
        title.mesh.visible = ta > 0;
        if (ta > 0) title.update(ta);
      }
      const idle = reducedMotion ? 0 : smooth(T.end - 1.2, T.end + 0.5, t);
      pulse *= Math.exp(-dt * 4);
      titleGroup.position.set(TITLE_POS.x, TITLE_POS.y + Math.sin(t * 0.8) * 0.12 * idle, TITLE_POS.z);
      titleGroup.scale.setScalar(1 + pulse * 0.05);

      if (idle > 0) {
        raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
        if (raycaster.ray.intersectPlane(cursorPlane, hit)) cursorWorld.lerp(hit, 0.15);
        cursorLight.position.copy(cursorWorld);
        cursorLight.intensity = (150 + pulse * 500) * idle;
      } else {
        cursorLight.intensity = 0;
      }
      let baseShake = 0;
      if (t < T.intercept) {
        const q = t / T.intercept;
        camPos.set(0, 1.7, 14 - q * 3);
        mothPos(t, c);
        camLook.set(0, 3, -40).lerp(c, smooth(0.8, 3.4, t));
        fov = lerp(52, 46, q);
      } else if (t < 4.9) {
        jetState(0, t, a, b);
        camPos.set(-1, 1.3, 11);
        camLook.copy(a);
        fov = 62; baseShake = 0.03;
      } else if (t < 6.4) {
        jetState(0, t, a, b);
        camPos.copy(a).addScaledVector(b, -7.5);
        camPos.y += 2.1;
        camLook.copy(a).addScaledVector(b, 22);
        fov = 78; baseShake = 0.07;
      } else if (t < 7.9) {
        jetState(0, t, a, b);
        mothPos(t, c);
        camLook.copy(a).lerp(c, 0.5);
        d.set(b.z, 0, -b.x).normalize();
        camPos.copy(camLook).addScaledVector(d, 17);
        camPos.y += 1.5;
        fov = 44; baseShake = 0.05;
      } else if (t < T.impact) {
        camPos.copy(FALL_FROM).add(CAM_D);
        mothPos(t, camLook);
        fov = 56; baseShake = 0.08;
      } else if (t < T.reveal) {
        camPos.set(17, 1.4, -13 + (t - T.impact) * 0.4);
        camLook.copy(CRASH_LOOK);
        fov = 44;
      } else {
        const q = smooth(T.reveal, T.reveal + 3.9, t);
        camPos.set(lerp(6, 0, q), lerp(1.8, 3.4, q), lerp(-2, TITLE_POS.z + titleDist, q));
        camLook.copy(CRASH_LOOK).lerp(TITLE_LOOK, q);
        fov = lerp(55, 50, q);
      }
      if (!started) {
        camPos.set(Math.sin(nowMs * 0.0002) * 1.5, 1.7, 14);
        camLook.set(0, 3, -40);
        fov = 52;
      }
      camPos.x += mouse.x * 1.6 * idle;
      camPos.y += mouse.y * 0.8 * idle + Math.sin(t * 0.3) * 0.1 * idle;
      camLook.x += mouse.x * 0.6 * idle;

      shake *= Math.exp(-dt * 3.5);
      const sk = reducedMotion ? 0 : shake + baseShake;
      camPos.x += (Math.random() - 0.5) * sk * 2;
      camPos.y += (Math.random() - 0.5) * sk * 2;
      camera.position.copy(camPos);
      camera.lookAt(camLook);
      camera.rotateZ((Math.random() - 0.5) * sk * 0.04);
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
      const pxScale = (renderer.getPixelRatio() * getH()) / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
      glow.setScale(pxScale);
      smoke.setScale(pxScale);
      glow.update(dt);
      smoke.update(dt);
      flash *= Math.exp(-dt * 5);
      bloom.strength = 0.5 + Math.min(1, flash) * 0.9 + Math.min(1, boom * 0.2);
      if (flashRef.current) flashRef.current.style.opacity = String(Math.min(1, flash));
      if (blackRef.current) {
        const black = t >= 10.2 && t < T.reveal + 0.9 ? (t < T.reveal ? smooth(10.2, 10.5, t) : 1 - smooth(T.reveal, T.reveal + 0.9, t)) : 0;
        blackRef.current.style.opacity = String(black);
      }

      composer.render();
    };
    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
      ro.disconnect();
      ctrlRef.current = null;
      audio.dispose();
      glow.dispose();
      smoke.dispose();
      battle.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  const chapter = CHAPTERS[stage];
  const playing = stage !== 'ready';
  const barH = stage === 'ready' ? '0%' : '9%';
  const hoverSfx = () => sound.playHover();

  const toggleMute = () => {
    ctrlRef.current?.setMuted(!muted);
    setMuted(!muted);
  };
  const enter = () => {
    sound.playClick();
    if (onEnter) onEnter();
    else window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  };

  const chip =
    'px-3 py-1.5 rounded-full border border-white/20 bg-[#080d21]/70 backdrop-blur-md text-[11px] font-mono text-slate-200 hover:border-cyan-400/70 hover:text-cyan-300 transition-colors cursor-pointer';

  return (
    <div className="relative w-full h-[720px] flex items-center justify-center overflow-hidden bg-[#050713]">
      <style>{`
        @keyframes tfChapter { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }
        @keyframes tfBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
      `}</style>
      <div
        ref={mountRef}
        className="absolute inset-0 z-0 cursor-crosshair overflow-hidden pointer-events-auto"
        title={stage === 'ready' ? 'Move the mouse to light up the title — click to pulse' : undefined}
      />
      <div ref={flashRef} className="absolute inset-0 z-10 bg-white opacity-0 pointer-events-none mix-blend-screen" />
      <div ref={blackRef} className="absolute inset-0 z-10 bg-black opacity-0 pointer-events-none" />
      {stage === 'alert' && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255,0,60,0.4) 100%)',
            animation: 'tfBlink 0.6s ease-in-out infinite',
          }}
        />
      )}
      <div className="absolute top-0 inset-x-0 z-10 bg-black pointer-events-none transition-all duration-1000" style={{ height: barH }} />
      <div className="absolute bottom-0 inset-x-0 z-10 bg-black pointer-events-none transition-all duration-1000" style={{ height: barH }} />

      {chapter && (
        <div key={chapter.n + chapter.title} className="absolute left-6 md:left-10 bottom-[11%] z-20 pointer-events-none font-mono" style={{ animation: 'tfChapter 0.6s ease-out both' }}>
          <p className="text-[11px] text-cyan-300/80 mb-1">Chapter {chapter.n}</p>
          <p className="text-xl md:text-3xl font-bold text-white tracking-tight">{chapter.title}</p>
          <p className="text-xs md:text-sm text-slate-300/80 mt-1">{chapter.sub}</p>
        </div>
      )}
      {(stage === 'contact' || stage === 'alert') && (
        <div className="absolute right-6 md:right-10 bottom-[11%] z-20 pointer-events-none">
          <div className={`relative w-32 h-32 md:w-44 md:h-44 rounded-full border overflow-hidden backdrop-blur-sm ${stage === 'alert' ? 'border-red-500/70 bg-red-950/30' : 'border-emerald-400/50 bg-emerald-950/30'}`}>
            <div className="absolute inset-[22%] rounded-full border border-emerald-400/25" />
            <div className="absolute inset-[44%] rounded-full border border-emerald-400/25" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/25" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/25" />
            <div
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: '2.4s', background: 'conic-gradient(from 0deg, rgba(52,211,153,0.55), transparent 28%)' }}
            />
            <span
              className={`absolute w-2.5 h-2.5 rounded-full animate-ping ${stage === 'alert' ? 'bg-red-500' : 'bg-emerald-300'}`}
              style={{ left: '64%', top: '26%', animationDuration: '1.2s' }}
            />
          </div>
        </div>
      )}
      {stage === 'intercept' && (
        <svg className="absolute z-20 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 opacity-60" viewBox="0 0 100 100" fill="none" stroke="#00f0ff" strokeWidth="1.5">
          <circle cx="50" cy="50" r="30" />
          <path d="M50 8v22M50 70v22M8 50h22M70 50h22" />
          <circle cx="50" cy="50" r="2" fill="#ff007f" stroke="none" />
        </svg>
      )}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        {playing && !reducedMotion && (
          <button className={chip} onMouseEnter={hoverSfx} onClick={() => ctrlRef.current?.skip()}>
            Skip intro
          </button>
        )}
        {stage === 'ready' && !reducedMotion && (
          <button
            className={chip}
            onMouseEnter={hoverSfx}
            type="button"
            aria-label="Replay the cinematic intro"
            onClick={() => {
              sound.playClick();
              ctrlRef.current?.replay();
            }}
          >
            REPLAY INTRO
          </button>
        )}
        {!reducedMotion && (
          <button
            className={chip}
            onMouseEnter={hoverSfx}
            onClick={toggleMute}
            type="button"
            title={muted ? 'Turn cinematic sound on' : 'Turn cinematic sound off'}
            aria-label={muted ? 'Turn cinematic sound on' : 'Turn cinematic sound off'}
            aria-pressed={!muted}
          >
            SOUND: {muted ? 'OFF' : 'ON'}
          </button>
        )}
      </div>
      {stage === 'ready' && (
        <div className="absolute bottom-10 inset-x-0 z-30 flex flex-col items-center gap-2 pointer-events-none">
          <button
            onClick={enter}
            onMouseEnter={hoverSfx}
            className="pointer-events-auto group relative px-9 py-3.5 rounded-xl bg-[#080d21]/80 backdrop-blur-md border border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_44px_rgba(236,72,153,0.5)] hover:border-pink-400/80 transition-all cursor-pointer"
          >
            <span className="block font-mono text-[10px] text-cyan-300/80 group-hover:text-pink-300 transition-colors">Access pass · TechFest 2026</span>
            <span className="block text-lg font-bold text-white tracking-tight">Enter the festival</span>
          </button>
        </div>
      )}

      {stage === 'ready' && (
        <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-3 bg-[#080d21]/70 backdrop-blur-md border border-slate-700/50 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300 pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">Live render</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>{fps} FPS</span>
        </div>
      )}
    </div>
  );
};
