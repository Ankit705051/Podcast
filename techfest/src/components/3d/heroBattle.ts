import * as THREE from 'three';
import type { ParticlePool } from './heroScenekit';
import { smooth } from './heroScenekit';



const Z = -40;         
const H = 43;          
const FEET_Y = 0.5;    
const WIDE = 16 / 9;

type UV = [number, number]; 
const RED = { muzzle: [0.39, 0.31] as UV, body: [0.27, 0.5] as UV };
const CYAN = { muzzle: [0.685, 0.34] as UV, body: [0.78, 0.5] as UV };

export interface BattleOpts {
  showCrash: number;  
  showMechs: number;  
  still: boolean;     
  aniso: number;
}
export interface Battle {
  kick: { red: number; cyan: number };
  resize(viewAspect: number): void;
  update(t: number, dt: number): void;
  dispose(): void;
}

interface Layer {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; loaded: boolean;
  aspect: number; ground: number; w: number; h: number; frameH: number;
}

export function createBattle(scene: THREE.Scene, glow: ParticlePool, o: BattleOpts): Battle {
  let view = WIDE;

  const layout = (L: Layer) => {
    const s = Math.max(1, view / WIDE);               
    L.h = Math.max(L.frameH * s, (L.frameH * WIDE * s) / L.aspect);
    L.w = L.h * L.aspect;
    L.mesh.scale.set(L.w, L.h, 1);
    L.mesh.position.y = FEET_Y + (L.ground - 0.5) * L.h; 
  };

  const makeLayer = (url: string, ground: number, z: number, frameH = H): Layer => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false, depthWrite: false, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.visible = false;
    mesh.position.z = z;
    scene.add(mesh);
    const L: Layer = { mesh, mat, loaded: false, aspect: WIDE, ground, w: 1, h: 1, frameH };
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = o.aniso;
        L.aspect = tex.image.width / tex.image.height;
        mat.map = tex;
        mat.needsUpdate = true;
        L.loaded = true;
        layout(L);
      },
      undefined,
      () => console.warn(`[hero] could not load ${url}`)
    );
    layout(L);
    return L;
  };

const alien = makeLayer('/assets/alian.jpg', 0.5, -108, 150);
const jetArt = makeLayer('/assets/jet.jpeg', 0.5, -106, 150);
const crash = makeLayer('/assets/crash.jpeg', 0.78, Z - 0.1);
const mechs = makeLayer('/assets/mesh.jpeg', 0.72, Z);
  const setA = (L: Layer, a: number) => {
    L.mat.opacity = a;
    L.mesh.visible = L.loaded && a > 0.004;
  };
  const at = (L: Layer, [u, v]: UV, z: number, out: THREE.Vector3) =>
    out.set(L.mesh.position.x + (u - 0.5) * L.w, L.mesh.position.y + (0.5 - v) * L.h, z);

  
  const kick = { red: 0, cyan: 0 };
  const A = new THREE.Vector3(), B = new THREE.Vector3(), V = new THREE.Vector3();
  const hits: { at: number; p: THREE.Vector3 }[] = [];
  let acc = 0, last = 0;

  const fire = (t: number, redShoots: boolean) => {
    const src = redShoots ? RED : CYAN, dst = redShoots ? CYAN : RED;
    at(mechs, src.muzzle, Z + 0.3, A);
    at(mechs, dst.body, Z + 0.3, B);
    B.x += (Math.random() - 0.5) * mechs.w * 0.06;
    B.y += (Math.random() - 0.5) * mechs.h * 0.2;
    const life = 0.3 + Math.random() * 0.12;
    V.copy(B).sub(A).multiplyScalar(1.15 / life); 
    const [r, g, b] = redShoots ? [2.3, 0.35, 0.45] : [0.3, 1.3, 2.3];
    glow.emit(A.x, A.y, A.z, 0, 0, 0, 0.14, 2.4, 0.3, r, g, b, 0.9); 
    for (let i = 0; i < 4; i++) {
      glow.emit(A.x + V.x * i * 0.014, A.y + V.y * i * 0.014, A.z, V.x, V.y, 0, life, 0.8 - i * 0.12, 0.25, r, g, b, 0.95);
    }
    hits.push({ at: t + life, p: B.clone() });
    if (redShoots) kick.red = 1; else kick.cyan = 1;
  };

  const spark = (p: THREE.Vector3) => {
    glow.emit(p.x, p.y, p.z, 0, 0, 0, 0.18, 3, 0.4, 2.2, 1.2, 0.5, 1);
    for (let i = 0; i < 9; i++) {
      const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 8;
      glow.emit(p.x, p.y, p.z, Math.cos(a) * s, Math.sin(a) * s + 2, 0, 0.4 + Math.random() * 0.4, 0.35, 0.05, 2.2, 1.2, 0.5, 1, -8);
    }
  };

  return {
    kick,
    resize(a) {
      view = a;
      [alien, jetArt, crash, mechs].forEach(layout);
    },
    update(t, dt) {
      if (t < last) { hits.length = 0; acc = 0; } 
      last = t;

      const toMechs = smooth(o.showMechs, o.showMechs + 1.6, t);
      setA(alien, 1 - smooth(2.5, 3.7, t));
      setA(jetArt, smooth(3.0, 4.0, t) * (1 - smooth(8.8, 9.8, t)));
      setA(crash, smooth(o.showCrash, o.showCrash + 1, t) * (1 - toMechs));
      setA(mechs, toMechs);
      if (!o.still) {
        alien.mesh.position.x = Math.sin(t * 0.12) * 0.18;
        jetArt.mesh.position.x = Math.sin(t * 0.2 + 0.8) * 0.28;
        crash.mesh.position.x = Math.sin(t * 0.25) * 0.5;
        mechs.mesh.position.x = Math.sin(t * 0.25 + 1) * 0.5; 
      }

      const k = Math.exp(-dt * 9);
      kick.red *= k;
      kick.cyan *= k;

      if (!o.still && mechs.loaded && t > o.showMechs + 0.8) {
        acc -= dt;
        if (acc <= 0) {
          acc = 0.07 + Math.random() * 0.2;
          fire(t, Math.random() < 0.5);
        }
      }
      for (let i = hits.length - 1; i >= 0; i--) {
        if (t >= hits[i].at) { spark(hits[i].p); hits.splice(i, 1); }
      }
    },
    dispose() {
      for (const L of [alien, jetArt, crash, mechs]) {
        L.mat.map?.dispose();
        L.mat.dispose();
        L.mesh.geometry.dispose();
        scene.remove(L.mesh);
      }
    },
  };
}
