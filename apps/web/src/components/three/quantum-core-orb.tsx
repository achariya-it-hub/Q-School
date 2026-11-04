"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface QuantumCoreOrbProps {
  className?: string;
  size?: number;
  interactive?: boolean;
}

export function QuantumCoreOrb({
  className = "w-full h-full min-h-[220px]",
  interactive = true,
}: QuantumCoreOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group holding the entire quantum atom system
    const system = new THREE.Group();
    scene.add(system);

    // 1. Central Core: Glowing Icosahedron wireframe + inner glowing sphere
    const coreGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x2bd6b4,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    system.add(coreMesh);

    // Inner pulsing solid nucleus
    const nucleusGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x0e937e,
      wireframe: false,
      transparent: true,
      opacity: 0.9,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    system.add(nucleusMesh);

    // 2. Three Intersecting Quantum Orbital Rings
    const ringRadius = 6.2;
    const ringTube = 0.06;
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2bd6b4,
      transparent: true,
      opacity: 0.7,
    });

    const ring1Geo = new THREE.TorusGeometry(ringRadius, ringTube, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    system.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(ringRadius * 1.08, ringTube, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xffc845,
      transparent: true,
      opacity: 0.75,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    system.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(ringRadius * 1.16, ringTube, 16, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x2bd6b4,
      transparent: true,
      opacity: 0.65,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = -Math.PI / 3;
    ring3.rotation.y = -Math.PI / 4;
    system.add(ring3);

    // 3. Orbiting Quantum Electrons
    const electronMat1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const electronGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const electron1 = new THREE.Mesh(electronGeo, electronMat1);
    system.add(electron1);

    const electronMat2 = new THREE.MeshBasicMaterial({ color: 0xffc845 });
    const electron2 = new THREE.Mesh(electronGeo, electronMat2);
    system.add(electron2);

    const electronMat3 = new THREE.MeshBasicMaterial({ color: 0x2bd6b4 });
    const electron3 = new THREE.Mesh(electronGeo, electronMat3);
    system.add(electron3);

    // 4. Surrounding Quantum Floating Dust Particles
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const r = ringRadius * (0.8 + Math.random() * 1.4);
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      dustPos[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      dustPos[i * 3 + 1] = r * Math.sin(phi);
      dustPos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 1.8,
      color: 0x2bd6b4,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const dustMesh = new THREE.Points(dustGeo, dustMat);
    system.add(dustMesh);

    // Mouse Interaction
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.targetX = (x / width) * 2 - 1;
      mouse.targetY = -(y / height) * 2 + 1;
    };

    if (interactive) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    // Visibility Check
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

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // System rotations
      system.rotation.y = t * 0.4 + mouse.x * 0.8;
      system.rotation.x = t * 0.2 + -mouse.y * 0.6;

      // Inner core counter-rotation & pulsing
      coreMesh.rotation.y = -t * 0.8;
      coreMesh.rotation.z = t * 0.5;
      const pulse = 1 + Math.sin(t * 3) * 0.06;
      coreMesh.scale.set(pulse, pulse, pulse);

      nucleusMesh.scale.set(1 + Math.sin(t * 4) * 0.08, 1 + Math.sin(t * 4) * 0.08, 1 + Math.sin(t * 4) * 0.08);

      // Ring rotations
      ring1.rotation.z = t * 0.6;
      ring2.rotation.z = -t * 0.7;
      ring3.rotation.z = t * 0.5;

      // Orbiting electrons positions along their rings
      const angle1 = t * 1.8;
      electron1.position.set(ringRadius * Math.cos(angle1), ringRadius * Math.sin(angle1), 0);

      const angle2 = t * 2.1;
      const r2X = (ringRadius * 1.08) * Math.cos(angle2);
      const r2Y = (ringRadius * 1.08) * Math.sin(angle2);
      const pos2 = new THREE.Vector3(r2X, r2Y, 0).applyEuler(ring2.rotation);
      electron2.position.copy(pos2);

      const angle3 = t * 1.5;
      const r3X = (ringRadius * 1.16) * Math.cos(angle3);
      const r3Y = (ringRadius * 1.16) * Math.sin(angle3);
      const pos3 = new THREE.Vector3(r3X, r3Y, 0).applyEuler(ring3.rotation);
      electron3.position.copy(pos3);

      dustMesh.rotation.y = t * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 300;
      height = container.clientHeight || 300;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      if (interactive) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      coreGeo.dispose();
      coreMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      ringMat.dispose();
      ring2Mat.dispose();
      ring3Mat.dispose();
      electronGeo.dispose();
      electronMat1.dispose();
      electronMat2.dispose();
      electronMat3.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return <div ref={containerRef} className={className} />;
}

