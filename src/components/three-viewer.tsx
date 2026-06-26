"use client";

import * as React from "react";
import * as THREE from "three";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const METALS = [
  0xc6cad0, // brushed silver
  0xb8956a, // brass
  0xaeb4b8, // nickel
  0x6a7077, // gunmetal
  0xd4b46a, // gold
];

/** A procedural brushed-metal texture so the object reads as a real material. */
function brushedTexture(base: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const col = new THREE.Color(base);
  ctx.fillStyle = `rgb(${col.r * 255},${col.g * 255},${col.b * 255})`;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) {
    const y = Math.random() * 256;
    const a = Math.random() * 0.06;
    ctx.strokeStyle =
      Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeGeometry(kind: number): THREE.BufferGeometry {
  switch (kind % 5) {
    case 0:
      return new THREE.TorusKnotGeometry(0.62, 0.22, 160, 24);
    case 1:
      return new THREE.IcosahedronGeometry(0.95, 0);
    case 2:
      return new THREE.BoxGeometry(1.1, 1.1, 1.1, 4, 4, 4);
    case 3:
      return new THREE.TorusGeometry(0.72, 0.28, 32, 96);
    default:
      return new THREE.OctahedronGeometry(1.05, 0);
  }
}

export function ThreeViewer({
  seed,
  className,
}: {
  seed: string;
  className?: string;
}) {
  const mountRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const h = hash(seed);
    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const baseColor = METALS[h % METALS.length];
    const tex = brushedTexture(baseColor);
    const geometry = makeGeometry(h >> 3);
    const material = new THREE.MeshStandardMaterial({
      color: baseColor,
      map: tex,
      metalness: 0.92,
      roughness: 0.28,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Lighting — neutral studio setup.
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 4, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x88aaff, 0.6);
    fill.position.set(-4, -2, 2);
    scene.add(fill);
    const rim = new THREE.PointLight(0xffffff, 18, 20);
    rim.position.set(-3, 3, -4);
    scene.add(rim);

    // Drag to rotate + gentle auto-spin.
    let dragging = false;
    let px = 0,
      py = 0;
    let velX = 0.004,
      velY = 0.0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      px = e.clientX;
      py = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      velY = (e.clientX - px) * 0.005;
      velX = (e.clientY - py) * 0.005;
      mesh.rotation.y += velY;
      mesh.rotation.x += velX;
      px = e.clientX;
      py = e.clientY;
    };
    const onUp = () => {
      dragging = false;
      velX = 0;
      velY = 0.004;
    };
    // Scroll to zoom (dolly the camera, clamped).
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.min(7, Math.max(1.8, camera.position.z + e.deltaY * 0.0025));
    };

    const el = renderer.domElement;
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!dragging) {
        mesh.rotation.y += velY;
        mesh.rotation.x += velX * 0.6;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth,
        hh = mount.clientHeight;
      if (!w || !hh) return;
      camera.aspect = w / hh;
      camera.updateProjectionMatrix();
      renderer.setSize(w, hh);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      geometry.dispose();
      material.dispose();
      tex.dispose();
      renderer.dispose();
      mount.removeChild(el);
    };
  }, [seed]);

  return <div ref={mountRef} className={className} />;
}
