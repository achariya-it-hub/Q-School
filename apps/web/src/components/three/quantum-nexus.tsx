"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface QuantumNexusProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
  colorScheme?: "emerald" | "teal" | "gold" | "white";
  speed?: number;
}

export function QuantumNexus({
  className = "absolute inset-0 pointer-events-none",
  particleCount = 140,
  interactive = true,
  colorScheme = "teal",
  speed = 0.6,
}: QuantumNexusProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 400;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 85;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Color definitions
    const primaryColor =
      colorScheme === "emerald"
        ? new THREE.Color("#0E937E")
        : colorScheme === "gold"
        ? new THREE.Color("#FFC845")
        : colorScheme === "white"
        ? new THREE.Color("#FFFFFF")
        : new THREE.Color("#2BD6B4");

    const secondaryColor =
      colorScheme === "emerald"
        ? new THREE.Color("#054038")
        : colorScheme === "gold"
        ? new THREE.Color("#F29A2E")
        : new THREE.Color("#0E937E");

    // Particles Data
    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const velocities: { x: number; y: number; z: number }[] = [];
    const originalPositions: { x: number; y: number; z: number }[] = [];

    const spreadX = 140;
    const spreadY = 90;
    const spreadZ = 70;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const z = (Math.random() - 0.5) * spreadZ;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions.push({ x, y, z });
      velocities.push({
        x: (Math.random() - 0.5) * 0.15 * speed,
        y: (Math.random() - 0.5) * 0.15 * speed,
        z: (Math.random() - 0.5) * 0.15 * speed,
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Particle Texture (glow circle)
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.3, "rgba(43, 214, 180, 0.8)");
      grad.addColorStop(0.7, "rgba(14, 147, 126, 0.3)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 3.5,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: primaryColor,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Connecting Synaptic Lines
    const maxConnections = count * 6;
    const linePositions = new Float32Array(maxConnections * 6);
    const lineColors = new Float32Array(maxConnections * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // Mouse Interaction
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      mouse.targetX = (clientX / width) * 2 - 1;
      mouse.targetY = -(clientY / height) * 2 + 1;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Visibility observer to pause animation when offscreen
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime() * speed;

      // Mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Subtle scene rotation based on cursor
      scene.rotation.y = mouse.x * 0.3 + Math.sin(time * 0.2) * 0.1;
      scene.rotation.x = -mouse.y * 0.2 + Math.cos(time * 0.15) * 0.08;

      // Update particles
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      let vertexIndex = 0;
      let colorIndex = 0;
      let lineSegments = 0;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        posArray[i3] += velocities[i].x;
        posArray[i3 + 1] += velocities[i].y;
        posArray[i3 + 2] += velocities[i].z;

        // Bounce back into bounds
        if (Math.abs(posArray[i3]) > spreadX / 2) velocities[i].x *= -1;
        if (Math.abs(posArray[i3 + 1]) > spreadY / 2) velocities[i].y *= -1;
        if (Math.abs(posArray[i3 + 2]) > spreadZ / 2) velocities[i].z *= -1;

        // Dynamic connections
        for (let j = i + 1; j < count; j++) {
          const j3 = j * 3;
          const dx = posArray[i3] - posArray[j3];
          const dy = posArray[i3 + 1] - posArray[j3 + 1];
          const dz = posArray[i3 + 2] - posArray[j3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;
          const connectionDist = 28;

          if (distSq < connectionDist * connectionDist) {
            const alpha = 1.0 - Math.sqrt(distSq) / connectionDist;

            linePositions[vertexIndex++] = posArray[i3];
            linePositions[vertexIndex++] = posArray[i3 + 1];
            linePositions[vertexIndex++] = posArray[i3 + 2];

            linePositions[vertexIndex++] = posArray[j3];
            linePositions[vertexIndex++] = posArray[j3 + 1];
            linePositions[vertexIndex++] = posArray[j3 + 2];

            const c = secondaryColor.clone().lerp(primaryColor, alpha);
            lineColors[colorIndex++] = c.r * alpha;
            lineColors[colorIndex++] = c.g * alpha;
            lineColors[colorIndex++] = c.b * alpha;

            lineColors[colorIndex++] = c.r * alpha;
            lineColors[colorIndex++] = c.g * alpha;
            lineColors[colorIndex++] = c.b * alpha;

            lineSegments++;
            if (lineSegments >= maxConnections) break;
          }
        }
      }

      posAttr.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineSegments * 2);
      (lineGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (lineGeometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 400;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [particleCount, interactive, colorScheme, speed]);

  return <div ref={containerRef} className={className} aria-hidden />;
}

