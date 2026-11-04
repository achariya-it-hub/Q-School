"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface QuantumBrainMeshProps {
  className?: string;
}

export function QuantumBrainMesh({ className = "w-full h-[260px] sm:h-[300px]" }: QuantumBrainMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Create 3D Dual-Hemisphere Brain particles mathematically
    const particleCount = 650;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const leftAiColor = new THREE.Color("#38BDF8"); // Cyan / AI computation
    const rightHiColor = new THREE.Color("#2BD6B4"); // Emerald / HI consciousness
    const goldSparksColor = new THREE.Color("#FFC845"); // Quantum creative spark

    for (let i = 0; i < particleCount; i++) {
      const isRightHemisphere = i % 2 === 0;
      const side = isRightHemisphere ? 1 : -1;

      // Brain parametric curve approximation (dual lobes)
      const u = Math.random() * Math.PI;
      const v = Math.random() * Math.PI * 2;

      // Lobe ellipsoid coordinates
      const rx = 3.6 + Math.sin(u * 2) * 0.6;
      const ry = 4.4 * Math.sin(u);
      const rz = 5.2 * Math.cos(u * 0.8);

      const x = (Math.sin(u) * Math.cos(v) * rx + 1.2) * side;
      const y = Math.cos(u) * ry;
      const z = Math.sin(u) * Math.sin(v) * rz;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color mapping
      let c = isRightHemisphere ? rightHiColor : leftAiColor;
      if (Math.random() < 0.15) {
        c = goldSparksColor;
      }

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const brainGeo = new THREE.BufferGeometry();
    brainGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    brainGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.3, "rgba(43,214,180,0.85)");
      grad.addColorStop(0.8, "rgba(14,147,126,0.2)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const brainMat = new THREE.PointsMaterial({
      size: 2.2,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const brainPoints = new THREE.Points(brainGeo, brainMat);
    brainGroup.add(brainPoints);

    // Neural Synapse Filament Lines connecting close nodes
    const filamentPairs: number[] = [];
    for (let i = 0; i < particleCount; i += 2) {
      for (let j = i + 1; j < Math.min(i + 8, particleCount); j++) {
        filamentPairs.push(i, j);
      }
    }

    const filamentPositions = new Float32Array(filamentPairs.length * 3);
    for (let k = 0; k < filamentPairs.length; k++) {
      const pIdx = filamentPairs[k] * 3;
      filamentPositions[k * 3] = positions[pIdx];
      filamentPositions[k * 3 + 1] = positions[pIdx + 1];
      filamentPositions[k * 3 + 2] = positions[pIdx + 2];
    }

    const filamentGeo = new THREE.BufferGeometry();
    filamentGeo.setAttribute("position", new THREE.BufferAttribute(filamentPositions, 3));

    const filamentMat = new THREE.LineBasicMaterial({
      color: 0x2bd6b4,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });

    const filamentLines = new THREE.LineSegments(filamentGeo, filamentMat);
    brainGroup.add(filamentLines);

    // Central pulsing consciousness spark
    const sparkGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });
    const centerSpark = new THREE.Mesh(sparkGeo, sparkMat);
    brainGroup.add(centerSpark);

    // Mouse Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.targetX = (x / width) * 2 - 1;
      mouse.targetY = -(y / height) * 2 + 1;
    };
    container.addEventListener("mousemove", handleMouseMove);

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

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // 3D rotation reacting to time and cursor
      brainGroup.rotation.y = t * 0.35 + mouse.x * 0.6;
      brainGroup.rotation.x = Math.sin(t * 0.3) * 0.15 - mouse.y * 0.4;

      // Consciousness breath pulsation
      const pulse = 1 + Math.sin(t * 3) * 0.04;
      brainGroup.scale.set(pulse, pulse, pulse);

      const sparkPulse = 0.8 + Math.sin(t * 6) * 0.3;
      centerSpark.scale.set(sparkPulse, sparkPulse, sparkPulse);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 400;
      height = container.clientHeight || 300;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      brainGeo.dispose();
      brainMat.dispose();
      filamentGeo.dispose();
      filamentMat.dispose();
      sparkGeo.dispose();
      sparkMat.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative mx-auto flex flex-col items-center justify-center">
      <div ref={containerRef} className={className} />
      <div className="mt-1 flex items-center justify-center gap-6 text-[11px] font-bold tracking-wider uppercase">
        <span className="flex items-center gap-1.5 text-[#38BDF8]">
          <span className="h-2 w-2 rounded-full bg-[#38BDF8] animate-ping" />
          AI: Pattern Computation
        </span>
        <span className="text-white/40">✦</span>
        <span className="flex items-center gap-1.5 text-[#2BD6B4]">
          <span className="h-2 w-2 rounded-full bg-[#2BD6B4] shadow-[0_0_8px_#2BD6B4]" />
          HI: Quantum Consciousness
        </span>
      </div>
    </div>
  );
}

