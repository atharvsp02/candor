import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const SAMPLES = 720;
const TRACK_HALF = 0.8;
const BOWL = 0.36;
const COIN_R = 0.7;
const COIN_T = 0.16;
const GATE_U = 0.47;
const PERIOD = 9;
const SPACING = 0.075;
const GAP = 0.35;
const START_BASE = 0.33;

const VOTERS = [
  { initials: 'AK', color: '#8fa9f6' },
  { initials: 'JS', color: '#e4c79f' },
  { initials: 'MR', color: '#c6b5f1' },
  { initials: 'TP', color: '#f3a2af' },
];

const ANON_COLOR = '#d3dbe8';

type Frames = {
  points: THREE.Vector3[];
  tangents: THREE.Vector3[];
  normals: THREE.Vector3[];
  length: number;
};

const buildFrames = (): Frames => {
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-12, 2.2, -3.4),
      new THREE.Vector3(-7.6, 0.1, -1.4),
      new THREE.Vector3(-3.8, -2.3, 0.5),
      new THREE.Vector3(-0.2, -3.05, 1.3),
      new THREE.Vector3(3.3, -2.2, 0.9),
      new THREE.Vector3(5.4, 0.3, -0.1),
      new THREE.Vector3(6.6, 3.7, -1.2),
      new THREE.Vector3(7.1, 8, -2.4),
    ],
    false,
    'centripetal',
  );

  const points: THREE.Vector3[] = [];
  const tangents: THREE.Vector3[] = [];
  const normals: THREE.Vector3[] = [];

  for (let i = 0; i <= SAMPLES; i++) {
    const u = i / SAMPLES;
    points.push(curve.getPointAt(u));
    tangents.push(curve.getTangentAt(u).normalize());
  }

  const up = new THREE.Vector3(0, 1, 0);
  let normal = up.clone().addScaledVector(tangents[0], -up.dot(tangents[0])).normalize();
  for (let i = 0; i <= SAMPLES; i++) {
    const t = tangents[i];
    normal = normal.clone().addScaledVector(t, -normal.dot(t)).normalize();
    normals.push(normal);
  }

  return { points, tangents, normals, length: curve.getLength() };
};

const sweep = (frames: Frames, across: number, lift: number, vRepeat: number) => {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const binormal = new THREE.Vector3();

  for (let i = 0; i <= SAMPLES; i++) {
    const p = frames.points[i];
    const n = frames.normals[i];
    binormal.crossVectors(frames.tangents[i], n).normalize();
    for (let j = 0; j <= across; j++) {
      const s = -1 + (2 * j) / across;
      const x = s * TRACK_HALF;
      const y = BOWL * s * s + lift;
      positions.push(p.x + binormal.x * x + n.x * y, p.y + binormal.y * x + n.y * y, p.z + binormal.z * x + n.z * y);
      uvs.push(j / across, (i / SAMPLES) * vRepeat);
    }
  }

  const row = across + 1;
  for (let i = 0; i < SAMPLES; i++) {
    for (let j = 0; j < across; j++) {
      const a = i * row + j;
      const b = a + row;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

const rail = (frames: Frames, side: number) => {
  const binormal = new THREE.Vector3();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= SAMPLES; i += 6) {
    binormal.crossVectors(frames.tangents[i], frames.normals[i]).normalize();
    pts.push(
      frames.points[i]
        .clone()
        .addScaledVector(binormal, side * TRACK_HALF)
        .addScaledVector(frames.normals[i], BOWL + 0.01),
    );
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 520, 0.06, 12, false);
};

const panelTexture = () => {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#eef2f8';
  g.fillRect(0, 0, size, size);

  const panels = 4;
  const cell = size / panels;
  for (let r = 0; r < panels; r++) {
    for (let c = 0; c < panels; c++) {
      const tone = 236 + ((r * 7 + c * 13) % 9);
      g.fillStyle = `rgb(${tone - 4}, ${tone}, ${tone + 8})`;
      g.fillRect(c * cell + 2, r * cell + 2, cell - 4, cell - 4);
    }
  }

  g.strokeStyle = 'rgba(62, 82, 118, 0.45)';
  g.lineWidth = 3;
  for (let k = 0; k <= panels; k++) {
    g.beginPath();
    g.moveTo(k * cell, 0);
    g.lineTo(k * cell, size);
    g.moveTo(0, k * cell);
    g.lineTo(size, k * cell);
    g.stroke();
  }

  g.fillStyle = 'rgba(34, 48, 78, 0.55)';
  for (let y = 6; y < size; y += 14) {
    for (const x of [12, 24, size - 24, size - 12]) {
      g.beginPath();
      g.arc(x, y, 2.4, 0, Math.PI * 2);
      g.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

const faceTextures = (draw: (g: CanvasRenderingContext2D, size: number) => void, color: string) => {
  const size = 512;
  const mid = size / 2;

  const height = document.createElement('canvas');
  height.width = size;
  height.height = size;
  const h = height.getContext('2d')!;
  h.fillStyle = '#6e6e6e';
  h.fillRect(0, 0, size, size);
  h.filter = 'blur(5px)';
  h.strokeStyle = '#ffffff';
  h.lineWidth = size * 0.045;
  h.beginPath();
  h.arc(mid, mid, size * 0.43, 0, Math.PI * 2);
  h.stroke();
  h.fillStyle = '#ffffff';
  h.strokeStyle = '#ffffff';
  draw(h, size);
  h.filter = 'none';

  const pixels = h.getImageData(0, 0, size, size).data;
  const normal = document.createElement('canvas');
  normal.width = size;
  normal.height = size;
  const n = normal.getContext('2d')!;
  const out = n.createImageData(size, size);
  const at = (x: number, y: number) => pixels[(Math.min(size - 1, Math.max(0, y)) * size + Math.min(size - 1, Math.max(0, x))) * 4] / 255;
  const strength = 3.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const o = (y * size + x) * 4;
      out.data[o] = ((-dx / len) * 0.5 + 0.5) * 255;
      out.data[o + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      out.data[o + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      out.data[o + 3] = 255;
    }
  }
  n.putImageData(out, 0, 0);

  const albedo = document.createElement('canvas');
  albedo.width = size;
  albedo.height = size;
  const a = albedo.getContext('2d')!;
  const gradient = a.createRadialGradient(mid * 0.8, mid * 0.7, size * 0.05, mid, mid, size * 0.55);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.35, color);
  gradient.addColorStop(1, color);
  a.fillStyle = gradient;
  a.fillRect(0, 0, size, size);
  a.globalAlpha = 0.22;
  a.fillStyle = '#1b2440';
  a.strokeStyle = '#1b2440';
  draw(a, size);
  a.globalAlpha = 1;

  const map = new THREE.CanvasTexture(albedo);
  map.colorSpace = THREE.SRGBColorSpace;
  const normalMap = new THREE.CanvasTexture(normal);
  return { map, normalMap };
};

const drawInitials = (text: string) => (g: CanvasRenderingContext2D, size: number) => {
  g.font = `900 ${size * 0.34}px "Archivo Variable", "Arial Black", sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, size / 2, size / 2 + size * 0.02);
};

const drawCheck = (g: CanvasRenderingContext2D, size: number) => {
  g.lineWidth = size * 0.085;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(size * 0.3, size * 0.52);
  g.lineTo(size * 0.44, size * 0.66);
  g.lineTo(size * 0.71, size * 0.36);
  g.stroke();
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Track({ frames }: { frames: Frames }) {
  const { inner, outer, left, right, texture } = useMemo(
    () => ({
      inner: sweep(frames, 28, 0, frames.length / 1.7),
      outer: sweep(frames, 28, -0.08, 1),
      left: rail(frames, -1),
      right: rail(frames, 1),
      texture: panelTexture(),
    }),
    [frames],
  );

  return (
    <group>
      <mesh geometry={inner}>
        <meshStandardMaterial map={texture} metalness={0.62} roughness={0.3} side={THREE.DoubleSide} envMapIntensity={1.15} />
      </mesh>
      <mesh geometry={outer}>
        <meshStandardMaterial color="#2a3b60" metalness={0.7} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {[left, right].map((geometry, index) => (
        <mesh key={index} geometry={geometry}>
          <meshStandardMaterial color="#223355" metalness={0.85} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
}

function Gate({ frames }: { frames: Frames }) {
  const { position, quaternion } = useMemo(() => {
    const i = Math.round(GATE_U * SAMPLES);
    const t = frames.tangents[i];
    const n = frames.normals[i];
    const b = new THREE.Vector3().crossVectors(t, n).normalize();
    return {
      position: frames.points[i].clone().addScaledVector(n, 0.04),
      quaternion: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(b, n, t)),
    };
  }, [frames]);

  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <torusGeometry args={[1.64, 0.08, 28, 120, Math.PI]} />
        <meshPhysicalMaterial color="#ff5aa8" emissive="#e0147c" emissiveIntensity={0.45} metalness={0.25} roughness={0.18} clearcoat={1} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.46, 0.022, 16, 120, Math.PI]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffd1e6" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function Coins({ frames, frozen }: { frames: Frames; frozen: boolean }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const spins = useRef<(THREE.Group | null)[]>([]);

  const coins = useMemo(() => {
    const body = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 72);
    body.rotateX(Math.PI / 2);
    const face = new THREE.CircleGeometry(COIN_R * 0.995, 72);
    const anon = faceTextures(drawCheck, ANON_COLOR);
    const anonColor = new THREE.Color(ANON_COLOR);

    return {
      body,
      face,
      items: VOTERS.map((voter) => {
        const identity = faceTextures(drawInitials(voter.initials), voter.color);
        return {
          identityColor: new THREE.Color(voter.color),
          anonColor,
          side: new THREE.MeshPhysicalMaterial({ color: voter.color, metalness: 0.55, roughness: 0.32, clearcoat: 0.5 }),
          cap: new THREE.MeshPhysicalMaterial({
            map: identity.map,
            normalMap: identity.normalMap,
            normalScale: new THREE.Vector2(1.1, 1.1),
            metalness: 0.5,
            roughness: 0.3,
            clearcoat: 0.6,
          }),
          anonFace: new THREE.MeshPhysicalMaterial({
            map: anon.map,
            normalMap: anon.normalMap,
            normalScale: new THREE.Vector2(1.1, 1.1),
            metalness: 0.55,
            roughness: 0.28,
            clearcoat: 0.7,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          }),
        };
      }),
    };
  }, []);

  const scratch = useMemo(
    () => ({
      p: new THREE.Vector3(),
      t: new THREE.Vector3(),
      n: new THREE.Vector3(),
      b: new THREE.Vector3(),
      m: new THREE.Matrix4(),
    }),
    [],
  );

  useFrame((state) => {
    const base = frozen ? START_BASE : (START_BASE + state.clock.elapsedTime / PERIOD) % 1;
    const head = base * (1 + GAP + SPACING * VOTERS.length) - 0.02;

    coins.items.forEach((coin, k) => {
      const group = groups.current[k];
      const spin = spins.current[k];
      if (!group || !spin) return;

      const u = head - k * SPACING;
      if (u < 0 || u > 1) {
        group.visible = false;
        return;
      }
      group.visible = true;

      const f = u * SAMPLES;
      const i0 = Math.min(SAMPLES - 1, Math.floor(f));
      const a = f - i0;
      const { p, t, n, b, m } = scratch;
      p.lerpVectors(frames.points[i0], frames.points[i0 + 1], a);
      t.lerpVectors(frames.tangents[i0], frames.tangents[i0 + 1], a).normalize();
      n.lerpVectors(frames.normals[i0], frames.normals[i0 + 1], a).normalize();
      b.crossVectors(t, n).normalize();

      group.position.copy(p).addScaledVector(n, COIN_R + 0.01);
      group.quaternion.setFromRotationMatrix(m.makeBasis(t, n, b));
      spin.rotation.z = -(u * frames.length) / COIN_R;

      const blend = smoothstep(GATE_U - 0.02, GATE_U + 0.025, u);
      coin.side.color.lerpColors(coin.identityColor, coin.anonColor, blend);
      coin.anonFace.opacity = blend;
      coin.anonFace.visible = blend > 0.002;
    });
  });

  return (
    <>
      {coins.items.map((coin, k) => (
        <group key={k} ref={(el) => void (groups.current[k] = el)}>
          <group ref={(el) => void (spins.current[k] = el)}>
            <mesh geometry={coins.body} material={[coin.side, coin.cap, coin.cap]} />
            <mesh geometry={coins.face} material={coin.anonFace} position={[0, 0, COIN_T / 2 + 0.004]} />
            <mesh geometry={coins.face} material={coin.anonFace} position={[0, 0, -COIN_T / 2 - 0.004]} rotation={[0, Math.PI, 0]} />
          </group>
        </group>
      ))}
    </>
  );
}

function CameraRig({ close }: { close: boolean }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    if (close) {
      camera.position.set(-1.5, -0.85, THREE.MathUtils.clamp(11 / aspect, 9.5, 15));
      camera.lookAt(-1.5, -1.8, 0.8);
    } else {
      camera.position.set(0.4, 0.9, THREE.MathUtils.clamp(25.6 / aspect, 16, 24));
      camera.lookAt(0.4, -0.35, 0);
    }
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, close, size, invalidate]);

  return null;
}

type Props = {
  active: boolean;
  reducedMotion: boolean;
  close: boolean;
};

export default function TrackScene({ active, reducedMotion, close }: Props) {
  const frames = useMemo(buildFrames, []);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let alive = true;
    document.fonts
      .load('900 120px "Archivo Variable"')
      .catch(() => undefined)
      .finally(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0.4, 0.9, 16], fov: 34 }}
      frameloop={reducedMotion ? 'demand' : active ? 'always' : 'never'}
    >
      <CameraRig close={close} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 9, 8]} intensity={1.4} />
      <directionalLight position={[-8, 2, 6]} intensity={0.5} color="#dfe8ff" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.6} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[16, 5, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-8, 1, 5]} rotation-y={Math.PI / 2.4} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[8, 2, 5]} rotation-y={-Math.PI / 2.4} scale={[8, 6, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[0, 0, 12]} scale={8} />
      </Environment>
      <Track frames={frames} />
      <Gate frames={frames} />
      {fontsReady && <Coins frames={frames} frozen={reducedMotion} />}
    </Canvas>
  );
}
