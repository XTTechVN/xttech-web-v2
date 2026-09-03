'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Shield, Cpu } from 'lucide-react';

const DEV_LOGO_PATH =
  'M 196.93 127.16 L 196.51 141.41 L 200.29 141.41 L 200.29 139.31 L 201.54 135.54 L 205.31 131.77 L 206.57 131.35 L 213.28 131.35 L 214.11 132.19 L 214.11 148.95 L 213.7 149.37 L 214.11 149.79 L 214.11 170.74 L 213.7 172.0 L 212.02 173.68 L 207.83 174.1 L 207.41 174.51 L 207.41 177.03 L 230.88 177.03 L 230.88 174.51 L 230.46 174.1 L 227.94 174.1 L 225.85 173.26 L 224.59 172.0 L 224.59 170.74 L 224.17 170.32 L 224.17 132.19 L 225.01 131.35 L 231.3 131.35 L 234.23 132.61 L 237.16 136.38 L 238.0 139.31 L 238.0 140.99 L 238.42 141.41 L 241.35 141.41 L 241.77 140.99 L 241.77 138.48 L 241.35 138.06 L 240.93 127.16 L 233.39 127.16 L 232.97 127.58 L 222.91 127.58 L 222.5 127.16 L 201.96 127.58 L 201.54 127.16 Z ' +
  'M 137.43 127.58 L 137.85 130.51 L 140.36 130.51 L 142.04 131.35 L 145.39 134.7 L 157.12 152.72 L 144.55 170.32 L 140.36 173.68 L 136.59 174.1 L 136.59 177.03 L 155.45 177.03 L 155.45 174.1 L 153.35 174.1 L 151.26 173.26 L 150.42 172.42 L 150.42 170.74 L 160.06 156.91 L 169.7 171.58 L 169.7 172.42 L 168.44 173.68 L 165.5 174.1 L 165.5 177.03 L 189.39 177.03 L 189.39 174.1 L 185.62 173.68 L 182.27 171.16 L 168.02 150.21 L 168.02 149.37 L 178.08 135.12 L 181.85 131.35 L 186.88 130.1 L 186.46 127.16 L 169.28 127.16 L 168.86 130.1 L 172.63 130.93 L 173.47 131.77 L 173.47 133.45 L 165.09 145.6 L 163.83 144.76 L 156.7 133.45 L 156.7 131.77 L 157.54 130.93 L 161.31 130.1 L 160.9 127.16 L 145.39 127.16 L 144.97 127.58 L 137.85 127.16 Z ' +
  'M 144.97 98.67 L 135.33 100.76 L 126.11 104.53 L 117.31 110.82 L 111.45 116.69 L 107.26 122.55 L 101.81 134.29 L 99.71 144.76 L 99.71 156.08 L 102.23 166.55 L 106.42 175.77 L 110.61 182.06 L 116.06 187.92 L 125.28 194.63 L 131.98 197.98 L 141.62 200.5 L 153.35 201.33 L 162.99 199.66 L 170.11 197.14 L 178.08 192.95 L 188.13 184.15 L 172.63 184.15 L 161.31 189.6 L 152.51 191.28 L 141.2 190.02 L 129.89 185.41 L 123.18 180.38 L 118.15 174.93 L 111.87 163.62 L 109.77 153.56 L 109.77 145.6 L 112.7 134.29 L 118.99 123.81 L 126.95 116.27 L 136.17 111.24 L 144.55 109.14 L 152.93 108.72 L 158.8 109.56 L 168.02 112.91 L 173.05 115.85 L 177.66 120.04 L 191.07 119.62 L 182.69 110.4 L 170.95 102.86 L 160.9 99.5 Z ' +
  'M 122.76 42.93 L 117.31 74.36 L 102.65 81.9 L 74.99 69.33 L 62.42 86.1 L 44.82 120.46 L 69.96 140.15 L 69.96 159.01 L 45.24 179.54 L 56.55 203.43 L 74.57 229.83 L 103.49 217.26 L 117.73 226.48 L 121.92 257.49 L 140.78 260.0 L 176.82 257.9 L 183.94 224.8 L 196.93 217.26 L 225.85 229.83 L 237.58 214.32 L 253.5 184.15 L 227.52 184.15 L 218.3 202.59 L 193.16 192.53 L 180.17 203.43 L 164.25 209.71 L 159.64 237.79 L 141.2 237.79 L 135.75 209.71 L 117.73 201.75 L 107.26 192.53 L 82.95 202.59 L 72.06 185.41 L 93.01 168.65 L 89.66 154.82 L 93.01 130.93 L 72.48 113.75 L 82.53 96.57 L 107.26 107.05 L 119.83 96.57 L 135.75 90.29 L 140.36 63.05 L 153.35 61.37 L 160.06 63.05 L 164.25 89.87 L 179.75 96.15 L 193.58 107.05 L 217.89 96.57 L 227.94 112.91 L 221.24 120.46 L 255.18 120.04 L 244.7 97.41 L 225.01 68.91 L 196.93 81.9 L 182.27 73.1 L 177.66 42.51 L 159.64 40.0 Z';

function parseSvgSubPathsToShapes(rawPath: string): THREE.Shape[] {
  const subPaths = rawPath.split(/[Zz]/).map((s) => s.trim()).filter(Boolean);
  const shapes: THREE.Shape[] = [];

  for (const sub of subPaths) {
    const shapePath = new THREE.ShapePath();
    const commands = sub.match(/[a-df-z][^a-df-z]*/gi) || [];
    const point = new THREE.Vector2();
    const firstPoint = new THREE.Vector2();

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const type = cmd.charAt(0);
      const data = cmd.slice(1).trim();
      const coords = data.split(/[\s,]+/).filter(Boolean).map(Number);

      if (type === 'M') {
        for (let j = 0; j < coords.length; j += 2) {
          point.set(coords[j], coords[j + 1]);
          if (j === 0) {
            shapePath.moveTo(point.x, point.y);
            firstPoint.copy(point);
          } else {
            shapePath.lineTo(point.x, point.y);
          }
        }
      } else if (type === 'L') {
        for (let j = 0; j < coords.length; j += 2) {
          point.set(coords[j], coords[j + 1]);
          shapePath.lineTo(point.x, point.y);
        }
      }
    }

    if (shapePath.currentPath) {
      shapePath.currentPath.autoClose = true;
    }
    const generated = shapePath.toShapes();
    if (generated.length > 0) {
      shapes.push(...generated);
    }
  }

  return shapes;
}

function createLogoMesh(theme: 'cyan' | 'gold'): {
  mesh: THREE.Mesh;
  geometry: THREE.ExtrudeGeometry;
  material: THREE.MeshPhysicalMaterial;
} {
  const shapes = parseSvgSubPathsToShapes(DEV_LOGO_PATH);
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 14,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 1.5,
    bevelThickness: 1.5,
    curveSegments: 24,
  });

  geometry.rotateX(Math.PI);
  geometry.center();
  geometry.computeVertexNormals();

  const isGold = theme === 'gold';
  const material = new THREE.MeshPhysicalMaterial({
    color: isGold ? new THREE.Color('#d97706') : new THREE.Color('#0a8a9a'),
    emissive: isGold ? new THREE.Color('#451a03') : new THREE.Color('#023842'),
    metalness: isGold ? 0.92 : 0.88,
    roughness: isGold ? 0.22 : 0.18,
    clearcoat: 0.75,
    clearcoatRoughness: 0.15,
    reflectivity: 0.9,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(0.96);
  return { mesh, geometry, material };
}

function createOrbitRing(theme: 'cyan' | 'gold'): { ring: THREE.Mesh; ringGeo: THREE.TorusGeometry; ringMat: THREE.MeshBasicMaterial } {
  const isGold = theme === 'gold';
  const ringGeo = new THREE.TorusGeometry(96, 1.1, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: isGold ? 0xf59e0b : 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    wireframe: true,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  ring.rotation.y = Math.PI / 6;
  return { ring, ringGeo, ringMat };
}

function createParticleField(theme: 'cyan' | 'gold'): { particles: THREE.Points; particleGeo: THREE.BufferGeometry; particleMat: THREE.PointsMaterial } {
  const isGold = theme === 'gold';
  const count = 55;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 85 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 2.6,
    color: isGold ? 0xfbbf24 : 0x67e8f9,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  return { particles, particleGeo, particleMat };
}

export function InteractiveLogo3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [themeColor, setThemeColor] = useState<'cyan' | 'gold'>('cyan');

  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.2, y: -0.3, vx: 0.001, vy: 0.005 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
    camera.position.set(0, 0, 420);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const { mesh: logoMesh, geometry: logoGeo, material: logoMat } = createLogoMesh(themeColor);
    rootGroup.add(logoMesh);

    const { ring: orbitRing, ringGeo, ringMat } = createOrbitRing(themeColor);
    rootGroup.add(orbitRing);

    const { particles, particleGeo, particleMat } = createParticleField(themeColor);
    rootGroup.add(particles);

    const ambientLight = new THREE.AmbientLight(0x0a1c2e, 2.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(60, 80, 100);
    scene.add(keyLight);

    const isGold = themeColor === 'gold';
    const rimLight = new THREE.DirectionalLight(isGold ? 0xf59e0b : 0x06b6d4, 3.5);
    rimLight.position.set(-70, -50, -40);
    scene.add(rimLight);

    const cursorLight = new THREE.PointLight(isGold ? 0xfbbf24 : 0x38bdf8, 3.0, 350);
    cursorLight.position.set(0, 0, 120);
    scene.add(cursorLight);

    const handlePointerDown = (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      const dx = clientX - prevMouseRef.current.x;
      const dy = clientY - prevMouseRef.current.y;
      rotRef.current.y += dx * 0.007;
      rotRef.current.x += dy * 0.007;
      rotRef.current.vx = dy * 0.0004;
      rotRef.current.vy = dx * 0.0004;
      prevMouseRef.current = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const onMouseDown = (e: MouseEvent) => handlePointerDown(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handlePointerUp();

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    let clock = 0;

    const animate = () => {
      clock += 0.016;

      if (!isDraggingRef.current) {
        rotRef.current.y += rotRef.current.vy || 0.004;
        rotRef.current.x += rotRef.current.vx || 0.001;
        rotRef.current.vx *= 0.96;
        rotRef.current.vy = (rotRef.current.vy - 0.004) * 0.96 + 0.004;
      }

      rotRef.current.x = Math.max(-0.8, Math.min(0.8, rotRef.current.x));

      rootGroup.rotation.x = rotRef.current.x;
      rootGroup.rotation.y = rotRef.current.y;
      rootGroup.position.y = Math.sin(clock * 1.5) * 3;

      orbitRing.rotation.z += 0.008;
      particles.rotation.y -= 0.002;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      cancelAnimationFrame(animId);

      logoGeo.dispose();
      logoMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
      if (dom.parentElement === container) {
        container.removeChild(dom);
      }
    };
  }, [themeColor]);

  return (
    <div className="relative flex w-full flex-col items-center justify-center">
      <div className="relative h-[420px] w-full max-w-[500px] md:h-[500px]">
        <div
          ref={containerRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          title="Kéo thả chuột để xoay 360° biểu trưng 3D XTTech"
        />
      </div>

      {/* Tùy chọn chất liệu mạ cao cấp */}
      <div className="mt-2 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setThemeColor('cyan')}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-all ${
            themeColor === 'cyan'
              ? 'border-cyan-400/80 bg-cyan-500/20 text-cyan-200 shadow-lg shadow-cyan-500/20'
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-white'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          Titanium Cyan
        </button>

        <button
          type="button"
          onClick={() => setThemeColor('gold')}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-all ${
            themeColor === 'gold'
              ? 'border-amber-400/80 bg-amber-500/20 text-amber-200 shadow-lg shadow-amber-500/20'
              : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/25 hover:text-white'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Royal Gold
        </button>
      </div>
    </div>
  );
}

