"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface DimensionPoint {
  code: string;
  name: string;
  subtitle: string;
  color: string;
  position: [number, number, number];
}

const DIMENSIONS_5D: DimensionPoint[] = [
  { code: "X", name: "Conscious", subtitle: "Focus & Understand", color: "#0E937E", position: [0, 5.5, 0] },
  { code: "Y", name: "Deep Learning", subtitle: "Practise & Internalise", color: "#5B6CF0", position: [-5, 1.5, 3] },
  { code: "Z", name: "Flow & App", subtitle: "Apply & Express", color: "#F29A2E", position: [5, 1.5, 3] },
  { code: "T", name: "Time Dynamic", subtitle: "48-Class Journey", color: "#E05375", position: [-3.5, -4.5, -3] },
  { code: "P", name: "Peak Human", subtitle: "Quantum Potential", color: "#2BD6B4", position: [3.5, -4.5, -3] },
];

export function Quantum5DVisualizer({ className = "w-full h-[400px]" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCode, setActiveCode] = useState<string>("X");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Center Quantum Core Wireframe
    const coreGeo = new THREE.DodecahedronGeometry(2.2, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x2bd6b4,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // 2. Nodes for each of the 5 dimensions
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeSpheres: THREE.SphereGeometry[] = [];
    const nodeMaterials: THREE.MeshBasicMaterial[] = [];

    DIMENSIONS_5D.forEach((dim) => {
      const geo = new THREE.SphereGeometry(1.1, 24, 24);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(dim.color),
        transparent: true,
        opacity: 0.95,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...dim.position);
      mesh.userData = { code: dim.code };
      group.add(mesh);

      // Outer glow ring
      const ringGeo = new THREE.RingGeometry(1.3, 1.45, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(dim.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      mesh.add(ring);

      nodeMeshes.push(mesh);
      nodeSpheres.push(geo);
      nodeMaterials.push(mat);
    });

    // 3. Connect each node to every other node with glowing lines
    const linePairs: [number, number][] = [];
    for (let i = 0; i < DIMENSIONS_5D.length; i++) {
      for (let j = i + 1; j < DIMENSIONS_5D.length; j++) {
        linePairs.push([i, j]);
      }
    }

    const linePositions = new Float32Array(linePairs.length * 6);
    const lineColors = new Float32Array(linePairs.length * 6);

    linePairs.forEach(([i, j], idx) => {
      const posI = DIMENSIONS_5D[i].position;
      const posJ = DIMENSIONS_5D[j].position;
      const colI = new THREE.Color(DIMENSIONS_5D[i].color);
      const colJ = new THREE.Color(DIMENSIONS_5D[j].color);

      linePositions[idx * 6] = posI[0];
      linePositions[idx * 6 + 1] = posI[1];
      linePositions[idx * 6 + 2] = posI[2];

      linePositions[idx * 6 + 3] = posJ[0];
      linePositions[idx * 6 + 4] = posJ[1];
      linePositions[idx * 6 + 5] = posJ[2];

      lineColors[idx * 6] = colI.r;
      lineColors[idx * 6 + 1] = colI.g;
      lineColors[idx * 6 + 2] = colI.b;

      lineColors[idx * 6 + 3] = colJ.r;
      lineColors[idx * 6 + 4] = colJ.g;
      lineColors[idx * 6 + 5] = colJ.b;
    });

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    linesGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const linesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const linesMesh = new THREE.LineSegments(linesGeo, linesMat);
    group.add(linesMesh);

    // Mouse / Touch Drag to Rotate in 3D
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const rotationVelocity = { x: 0.003, y: 0.006 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      group.rotation.y += deltaX * 0.008;
      group.rotation.x += deltaY * 0.008;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouse.x;
      const deltaY = e.touches[0].clientY - prevMouse.y;
      group.rotation.y += deltaX * 0.008;
      group.rotation.x += deltaY * 0.008;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Visibility Observer
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const t = clock.getElapsedTime();

      // Continuous gentle idle spin when not dragging
      if (!isDragging) {
        group.rotation.y += rotationVelocity.y;
        group.rotation.x = Math.sin(t * 0.4) * 0.2;
      }

      // Pulse core
      coreMesh.rotation.y = -t * 0.5;
      const p = 1 + Math.sin(t * 2.5) * 0.08;
      coreMesh.scale.set(p, p, p);

      // Pulse active dimension node
      nodeMeshes.forEach((mesh) => {
        mesh.quaternion.copy(camera.quaternion); // billboard rings towards camera
        if (mesh.userData.code === activeCode) {
          const s = 1.25 + Math.sin(t * 5) * 0.12;
          mesh.scale.set(s, s, s);
        } else {
          mesh.scale.set(1, 1, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 500;
      height = container.clientHeight || 400;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      nodeSpheres.forEach((g) => g.dispose());
      nodeMaterials.forEach((m) => m.dispose());
      linesGeo.dispose();
      linesMat.dispose();
      renderer.dispose();
    };
  }, [activeCode]);

  const activeDim = DIMENSIONS_5D.find((d) => d.code === activeCode) || DIMENSIONS_5D[0];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#CFE3DD] bg-gradient-to-b from-[#054038] via-[#04332D] to-[#02241F] p-6 text-white shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="chip !px-2.5 !py-0.5 !text-[10px] !bg-[#2BD6B4] !text-brand-deep font-black">
            INTERACTIVE 3D XYZTP
          </span>
          <h4 className="mt-1 text-lg font-bold text-white">The 5D Architectural Model</h4>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {DIMENSIONS_5D.map((d) => (
            <button
              key={d.code}
              type="button"
              onClick={() => setActiveCode(d.code)}
              className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                activeCode === d.code
                  ? "bg-white text-brand-deep shadow-md scale-105"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              Dimension {d.code}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative">
        <div ref={containerRef} className={className} />
        <div className="pointer-events-none absolute bottom-3 left-3 text-[11px] font-semibold text-white/60 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
          ✦ Click &amp; Drag in 3D Space to Rotate
        </div>

        {/* Selected Dimension Badge */}
        <div className="pointer-events-none absolute top-3 right-3 max-w-[220px] rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md text-right shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2BD6B4]">Dimension {activeDim.code}</p>
          <p className="text-base font-extrabold text-white">{activeDim.name}</p>
          <p className="text-xs font-semibold text-[#2BD6B4] mt-0.5">{activeDim.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

