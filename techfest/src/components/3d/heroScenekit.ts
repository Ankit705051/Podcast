import * as THREE from 'three';



export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};


export function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}



export class CinematicAudio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private duckGain!: GainNode;
  private noiseBuf!: AudioBuffer;
  private muted = false;

  get ready() {
    return this.ctx !== null;
  }

  init() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const c = new AC();
    this.ctx = c;
    this.duckGain = c.createGain();
    this.duckGain.connect(c.destination);
    this.master = c.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    this.master.connect(this.duckGain);
    const len = c.sampleRate * 2;
    this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.04);
  }

  
  duck(to: number, secs: number) {
    if (!this.ctx) return;
    const g = this.duckGain.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setTargetAtTime(to, this.ctx.currentTime, Math.max(0.01, secs / 3));
  }

  private noise(dur: number, type: BiquadFilterType, f0: number, f1: number, gain: number, q = 1) {
    const c = this.ctx;
    if (!c) return;
    const t0 = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.06, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  private tone(type: OscillatorType, f0: number, f1: number, dur: number, gain: number, attack = 0.02) {
    const c = this.ctx;
    if (!c) return;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(attack, dur * 0.9));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  drone(dur: number) {
    this.tone('sawtooth', 48, 44, dur, 0.08, dur * 0.6);
    this.tone('sine', 96, 90, dur, 0.1, dur * 0.6);
  }
  ping() {
    this.tone('sine', 1500, 1470, 0.55, 0.16);
  }
  radioStatic(dur = 0.6) {
    this.noise(dur, 'bandpass', 2800, 2200, 0.12, 0.8);
  }
  siren(dur: number) {
    const c = this.ctx;
    if (!c) return;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = 720;
    const lfo = c.createOscillator();
    lfo.frequency.value = 1.25;
    const lg = c.createGain();
    lg.gain.value = 240;
    lfo.connect(lg);
    lg.connect(o.frequency);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1600;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.2);
    g.gain.setValueAtTime(0.09, t0 + dur - 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(lp);
    lp.connect(g);
    g.connect(this.master);
    o.start(t0);
    lfo.start(t0);
    o.stop(t0 + dur + 0.05);
    lfo.stop(t0 + dur + 0.05);
  }
  rumble(dur: number) {
    this.noise(dur, 'lowpass', 200, 500, 0.35, 0.7);
    this.tone('sawtooth', 70, 110, dur, 0.12, dur * 0.7);
  }
  whoosh() {
    this.noise(0.9, 'bandpass', 250, 3500, 0.4, 1.6);
  }
  jetPass() {
    this.noise(1.6, 'bandpass', 500, 2200, 0.45, 1.2);
    this.tone('sawtooth', 160, 70, 1.6, 0.14, 0.3);
  }
  laser() {
    this.tone('sawtooth', 2200, 160, 0.16, 0.05, 0.005);
  }
  missile() {
    this.noise(0.7, 'highpass', 1200, 4000, 0.18, 0.7);
    this.tone('triangle', 300, 900, 0.6, 0.05);
  }
  explosion(size: number) {
    const g = Math.min(0.7, 0.25 + size * 0.14);
    this.noise(0.9 + size * 0.4, 'lowpass', 2800, 60, g, 0.8);
    this.tone('sine', 110, 28, 0.9 + size * 0.3, g);
  }
  crash() {
    this.explosion(5);
    this.noise(3, 'lowpass', 900, 40, 0.5, 0.6);
  }
  reveal() {
    this.tone('sine', 70, 28, 3, 0.9, 0.03);
    this.tone('sawtooth', 90, 1400, 1.8, 0.09, 1.2);
    this.noise(2.6, 'highpass', 3000, 9000, 0.18, 0.8);
  }
  dispose() {
    void this.ctx?.close();
    this.ctx = null;
  }
}



export class ParticlePool {
  readonly points: THREE.Points;
  private cap: number;
  private cursor = 0;
  private pos: Float32Array;
  private col: Float32Array;
  private size: Float32Array;
  private alpha: Float32Array;
  private vel: Float32Array;
  private age: Float32Array;
  private life: Float32Array;
  private s0: Float32Array;
  private s1: Float32Array;
  private a0: Float32Array;
  private grav: Float32Array;
  private uniforms = { uScale: { value: 800 } };
  private geo: THREE.BufferGeometry;

  constructor(cap: number, additive: boolean) {
    this.cap = cap;
    this.pos = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 3);
    this.size = new Float32Array(cap);
    this.alpha = new Float32Array(cap);
    this.vel = new Float32Array(cap * 3);
    this.age = new Float32Array(cap);
    this.life = new Float32Array(cap);
    this.s0 = new Float32Array(cap);
    this.s1 = new Float32Array(cap);
    this.a0 = new Float32Array(cap);
    this.grav = new Float32Array(cap);

    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader:  `
        attribute vec3 aColor; attribute float aSize; attribute float aAlpha;
        uniform float uScale;
        varying vec3 vColor; varying float vAlpha;
        void main() {
          vColor = aColor; vAlpha = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = min(aSize * uScale / max(-mv.z, 0.1), 300.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader:  `
        varying vec3 vColor; varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = 1.0 - smoothstep(0.0, 1.0, d);
          a *= a;
          gl_FragColor = vec4(vColor, a * vAlpha);
        }`,
    });
    this.points = new THREE.Points(this.geo, mat);
    this.points.frustumCulled = false;
  }

  setScale(v: number) {
    this.uniforms.uScale.value = v;
  }

  emit(
    x: number, y: number, z: number,
    vx: number, vy: number, vz: number,
    life: number, s0: number, s1: number,
    r: number, g: number, b: number,
    a0: number, grav = 0
  ) {
    const i = this.cursor;
    this.cursor = (i + 1) % this.cap;
    const k = i * 3;
    this.pos[k] = x; this.pos[k + 1] = y; this.pos[k + 2] = z;
    this.vel[k] = vx; this.vel[k + 1] = vy; this.vel[k + 2] = vz;
    this.col[k] = r; this.col[k + 1] = g; this.col[k + 2] = b;
    this.age[i] = 0; this.life[i] = life;
    this.s0[i] = s0; this.s1[i] = s1; this.a0[i] = a0; this.grav[i] = grav;
    this.size[i] = s0; this.alpha[i] = 0;
  }

  update(dt: number) {
    const drag = Math.exp(-0.7 * dt);
    for (let i = 0; i < this.cap; i++) {
      if (this.life[i] <= 0) continue;
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) {
        this.life[i] = 0; this.alpha[i] = 0; this.size[i] = 0;
        continue;
      }
      const k = this.age[i] / this.life[i];
      const j = i * 3;
      this.vel[j + 1] += this.grav[i] * dt;
      this.vel[j] *= drag; this.vel[j + 1] *= drag; this.vel[j + 2] *= drag;
      this.pos[j] += this.vel[j] * dt;
      this.pos[j + 1] += this.vel[j + 1] * dt;
      this.pos[j + 2] += this.vel[j + 2] * dt;
      this.size[i] = lerp(this.s0[i], this.s1[i], k);
      this.alpha[i] = this.a0[i] * Math.min(1, k * 12) * (1 - k);
    }
    const a = this.geo.attributes;
    a.position.needsUpdate = true;
    a.aColor.needsUpdate = true;
    a.aSize.needsUpdate = true;
    a.aAlpha.needsUpdate = true;
  }

  clear() {
    this.life.fill(0); this.alpha.fill(0); this.size.fill(0);
  }

  dispose() {
    this.geo.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}



export function createFighter(): THREE.Group {
  const g = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({
    color: 0x2a3556, metalness: 0.85, roughness: 0.32, emissive: 0x06101f, side: THREE.DoubleSide,
  });
  const neon = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x00f0ff).multiplyScalar(2.4) });
  const hot = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff007f).multiplyScalar(2.4) });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x66f0ff, emissive: 0x0b8aa0, emissiveIntensity: 0.9, metalness: 1, roughness: 0.05,
  });

  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.3, 3.0, 14).rotateX(Math.PI / 2), hull));
  g.add(new THREE.Mesh(new THREE.ConeGeometry(0.17, 1.1, 14).rotateX(Math.PI / 2).translate(0, 0, 2.05), hull));

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), glass);
  canopy.scale.set(0.75, 0.6, 2.3);
  canopy.position.set(0, 0.2, 0.55);
  g.add(canopy);

  const delta = (sign: number, span: number, front: number, tip: number, back: number) => {
    const s = new THREE.Shape();
    s.moveTo(0.2 * sign, front);
    s.lineTo(span * sign, tip);
    s.lineTo(span * sign, back);
    s.lineTo(0.2 * sign, back);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }).rotateX(Math.PI / 2);
  };
  for (const sign of [1, -1]) {
    g.add(new THREE.Mesh(delta(sign, 2.0, 0.9, -0.9, -1.3), hull));
    const stab = new THREE.Mesh(delta(sign, 2.0, 0.9, -0.9, -1.3), hull);
    stab.scale.set(0.45, 1, 0.45);
    stab.position.z = -1.0;
    g.add(stab);

    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.7), hull);
    fin.position.set(0.42 * sign, 0.45, -1.2);
    fin.rotation.z = -0.35 * sign;
    g.add(fin);

    const tipLight = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), sign > 0 ? neon : hot);
    tipLight.position.set(2.0 * sign, 0, -0.9);
    g.add(tipLight);
  }

  const flames: THREE.Mesh[] = [];
  const flameMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.35, 1.1, 2.0), transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  for (const sx of [-0.2, 0.2]) {
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.9, 12).rotateX(Math.PI / 2), hull);
    eng.position.set(sx, 0, -1.55);
    g.add(eng);
    const nozzle = new THREE.Mesh(new THREE.CircleGeometry(0.15, 12).rotateY(Math.PI), neon);
    nozzle.position.set(sx, 0, -2.01);
    g.add(nozzle);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.4, 12, 1, true).rotateX(-Math.PI / 2).translate(0, 0, -0.7), flameMat);
    flame.position.set(sx, 0, -2.0);
    g.add(flame);
    flames.push(flame);
  }
  g.userData.flames = flames;
  return g;
}

export function createUFO(): THREE.Group {
  const g = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({
    color: 0x1a1f3d, metalness: 0.95, roughness: 0.22, emissive: 0x1a0933, emissiveIntensity: 0.7, side: THREE.DoubleSide,
  });
  const profile = [
    [0.001, 0.42], [0.55, 0.36], [1.15, 0.22], [1.9, 0.04], [2.0, 0],
    [1.6, -0.14], [0.9, -0.26], [0.5, -0.42], [0.001, -0.46],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(profile, 56), hull));

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0xff4fb0, emissive: 0xff007f, emissiveIntensity: 1.1, transparent: true, opacity: 0.6, metalness: 0.2, roughness: 0.1,
    })
  );
  dome.scale.y = 0.8;
  dome.position.y = 0.4;
  g.add(dome);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.96, 0.06, 8, 64).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff007f).multiplyScalar(2.6) })
  );
  g.add(ring);

  const rim = new THREE.Group();
  const bulbGeo = new THREE.SphereGeometry(0.09, 8, 6);
  const bulbA = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7ffcff).multiplyScalar(2.4) });
  const bulbB = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd27f).multiplyScalar(2.4) });
  for (let i = 0; i < 12; i++) {
    const b = new THREE.Mesh(bulbGeo, i % 2 ? bulbA : bulbB);
    const a = (i / 12) * Math.PI * 2;
    b.position.set(Math.cos(a) * 1.65, -0.14, Math.sin(a) * 1.65);
    rim.add(b);
  }
  g.add(rim);

  const under = new THREE.Mesh(
    new THREE.CircleGeometry(0.7, 24).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff2e93).multiplyScalar(2), transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  under.position.y = -0.47;
  g.add(under);

  g.userData.rim = rim;
  return g;
}



export const terrainHeight = (x: number, z: number) => {
  const ridge = Math.abs(Math.sin(x * 0.045 + 1.1) * Math.cos(z * 0.037) + 0.5 * Math.sin(x * 0.11 + z * 0.07));
  const edge = Math.max(smooth(14, 55, Math.abs(x)), smooth(-70, -120, z));
  const bumps = Math.sin(x * 0.35) * Math.cos(z * 0.3) * 0.25;
  return edge * (4 + ridge * 22) + bumps * (1 - edge * 0.7);
};

export function createTerrain(segments: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(300, 260, segments, segments);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -45);
  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const low = new THREE.Color(0x070b1a);
  const high = new THREE.Color(0x2a2f66);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const h = terrainHeight(p.getX(i), p.getZ(i));
    p.setY(i, h);
    c.copy(low).lerp(high, clamp01(h / 22));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0.05 })
  );
}

export function createSky(): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(600, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader:  `
        varying vec3 vDir;
        void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader:  `
        varying vec3 vDir;
        void main() {
          float h = vDir.y;
          vec3 top = vec3(0.008, 0.012, 0.040);
          vec3 mid = vec3(0.045, 0.030, 0.150);
          vec3 hor = vec3(0.200, 0.050, 0.240);
          vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, h));
          c = mix(c, top, smoothstep(0.12, 0.7, h));
          c = mix(c, vec3(0.03, 0.02, 0.07), 1.0 - smoothstep(-0.15, 0.0, h));
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
  );
}

export function createStars(count: number): THREE.Points {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const palette = [new THREE.Color(0xffffff), new THREE.Color(0x9fd8ff), new THREE.Color(0xffb3e6)];
  for (let i = 0; i < count; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(Math.random() * 0.95 + 0.05); 
    const r = 500;
    pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3);
    const c = palette[Math.floor(Math.random() * palette.length)];
    col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({ size: 1.8, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.85, fog: false, depthWrite: false })
  );
}



export interface TitleVoxels {
  mesh: THREE.InstancedMesh;
  update(ta: number): void;
  reset(): void;
}

export function buildTitle(width: number, step: number, from: THREE.Vector3, rng: () => number): TitleVoxels {
  const W = 1024, H = 260;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2D canvas unavailable');

  const fam = '"Orbitron", "Arial Black", Impact, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `900 100px ${fam}`;
  const s1 = Math.floor((100 * 940) / ctx.measureText('TECHFEST').width);
  ctx.font = `900 ${s1}px ${fam}`;
  const y1 = 30 + s1 * 0.76;
  ctx.fillText('TECHFEST', W / 2, y1);
  const s2 = Math.floor(s1 * 0.46);
  const spacing = Math.floor(s2 * 0.35);
  ctx.font = `900 ${s2}px ${fam}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${spacing}px`;
  const y2 = y1 + 28 + s2 * 0.76;
  ctx.fillText('2026', W / 2 + spacing / 2, y2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const px2w = width / W;
  const cell = step * px2w;
  const pts: number[] = []; 
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      if (data[((y | 0) * W + (x | 0)) * 4 + 3] > 110) {
        pts.push((x - W / 2) * px2w, -(y - H / 2) * px2w, y > y1 + 14 ? 1 : 0, x / W);
      }
    }
  }
  const count = pts.length / 4;

  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.1, metalness: 0.65, roughness: 0.28 });
  
  mat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       #if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
         totalEmissiveRadiance *= vColor.rgb;
       #endif`
    );
  };
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(cell * 0.9, cell * 0.9, cell * 1.8), mat, count);
  mesh.frustumCulled = false;

  const target = new Float32Array(count * 3);
  const start = new Float32Array(count * 3);
  const delay = new Float32Array(count);
  const arc = new Float32Array(count);
  const spin = new Float32Array(count);
  const cyan = new THREE.Color(0x00f0ff), magenta = new THREE.Color(0xff007f), white = new THREE.Color(0xdff8ff);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const [x, y, row, u] = [pts[i * 4], pts[i * 4 + 1], pts[i * 4 + 2], pts[i * 4 + 3]];
    target.set([x, y, 0], i * 3);
    start.set([from.x + (rng() - 0.5) * 10, from.y + rng() * 6, from.z + (rng() - 0.5) * 8], i * 3);
    delay[i] = u * 1.1 + rng() * 0.5;
    arc[i] = 0.6 + rng() * 3;
    spin[i] = (rng() - 0.5) * 12;
    c.copy(cyan).lerp(magenta, u);
    if (row) c.lerp(white, 0.65);
    mesh.setColorAt(i, c);
  }

  const DUR = 1.4;
  const dummy = new THREE.Object3D();
  let settled = false;
  const api: TitleVoxels = {
    mesh,
    update(ta) {
      if (settled) return;
      let done = true;
      for (let i = 0; i < count; i++) {
        const p = clamp01((ta - delay[i]) / DUR);
        if (p < 1) done = false;
        const e = 1 - Math.pow(1 - p, 3);
        const j = i * 3;
        dummy.position.set(
          lerp(start[j], target[j], e),
          lerp(start[j + 1], target[j + 1], e) + Math.sin(p * Math.PI) * arc[i],
          lerp(start[j + 2], target[j + 2], e)
        );
        dummy.rotation.set((1 - e) * spin[i], (1 - e) * spin[i] * 0.7, 0);
        dummy.scale.setScalar(p <= 0 ? 0.0001 : 0.25 + 0.75 * e);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (done) settled = true;
    },
    reset() {
      settled = false;
      api.update(-10);
      settled = false;
    },
  };
  api.update(-10);
  return api;
}