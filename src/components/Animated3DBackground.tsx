import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useApp } from '../context/AppContext';
import { AppPage } from '../types';

interface Animated3DBackgroundProps {
  page?: AppPage;
  className?: string;
}

interface FloatingObject {
  mesh: THREE.Object3D;
  initialPos: THREE.Vector3;
  floatSpeed: { x: number; y: number; z: number };
  rotSpeed: { x: number; y: number; z: number };
  amplitude: { x: number; y: number; z: number };
  phase: number;
  depthParallaxMultiplier: number;
}

export const Animated3DBackground: React.FC<Animated3DBackgroundProps> = ({
  page: propPage,
  className = '',
}) => {
  const { page: contextPage, theme } = useApp();
  const page = propPage || contextPage;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const pageRef = useRef(page);
  pageRef.current = page;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Accessibility check: prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const isDark = themeRef.current === 'dark';

    // Background color strictly adhering to user requirements
    const darkBgColor = new THREE.Color(0x05070d);
    const lightBgColor = new THREE.Color(0xf7f9fc);
    scene.background = isDark ? darkBgColor : lightBgColor;

    // Subtle atmospheric fog for 3D depth falloff
    scene.fog = new THREE.FogExp2(isDark ? 0x05070d : 0xf7f9fc, 0.014);

    // 2. Camera with real perspective depth
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 38;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: !isMobile,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.05 : 0.95;

    // 4. Balanced Lighting
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x1e293b : 0xf8fafc,
      isDark ? 1.2 : 1.8
    );
    scene.add(ambientLight);

    // Dynamic color accent lights
    const lightIndigo = new THREE.PointLight(isDark ? 0x6366f1 : 0x818cf8, isDark ? 2.6 : 1.4, 60);
    lightIndigo.position.set(-15, 12, 10);
    scene.add(lightIndigo);

    const lightCyan = new THREE.PointLight(isDark ? 0x06b6d4 : 0x38bdf8, isDark ? 2.2 : 1.2, 50);
    lightCyan.position.set(16, -10, 8);
    scene.add(lightCyan);

    const lightViolet = new THREE.PointLight(isDark ? 0xa855f7 : 0xc084fc, isDark ? 1.8 : 1.0, 50);
    lightViolet.position.set(0, 15, -10);
    scene.add(lightViolet);

    // 5. Floating 3D Objects Collection
    const floatingObjects: FloatingObject[] = [];
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // Circular sprite texture generator for particles
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 64;
      pCanvas.height = 64;
      const ctx = pCanvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.25, isDark ? 'rgba(129, 140, 248, 0.85)' : 'rgba(99, 102, 241, 0.7)');
        gradient.addColorStop(0.65, isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(147, 197, 253, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(pCanvas);
    };

    const particleTexture = createParticleTexture();

    // Material helpers for Dark and Light themes
    const createGlassMaterial = (colorHex: number, emissiveHex: number, opacity: number) => {
      return new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: isDark ? emissiveHex : 0x000000,
        emissiveIntensity: isDark ? 0.35 : 0,
        roughness: isDark ? 0.25 : 0.15,
        metalness: isDark ? 0.3 : 0.1,
        transparent: true,
        opacity: isDark ? opacity : opacity * 0.75,
        wireframe: false,
      });
    };

    const createWireframeMaterial = (colorHex: number, opacity: number) => {
      return new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
        transparent: true,
        opacity: isDark ? opacity : opacity * 0.7,
      });
    };

    // Object 1: Top-Left Floating Glowing Sphere
    const sphereGeom = new THREE.SphereGeometry(1.6, 32, 32);
    const sphereMat = createGlassMaterial(isDark ? 0x4f46e5 : 0xa5b4fc, 0x312e81, 0.65);
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
    // Add inner wireframe core for digital AI depth
    const sphereInnerGeom = new THREE.IcosahedronGeometry(1.2, 2);
    const sphereInnerMat = createWireframeMaterial(isDark ? 0x06b6d4 : 0x6366f1, 0.4);
    const sphereInnerMesh = new THREE.Mesh(sphereInnerGeom, sphereInnerMat);
    sphereMesh.add(sphereInnerMesh);

    sphereMesh.position.set(-18, 11, -2);
    objectsGroup.add(sphereMesh);
    floatingObjects.push({
      mesh: sphereMesh,
      initialPos: new THREE.Vector3(-18, 11, -2),
      floatSpeed: { x: 0.0006, y: 0.0012, z: 0.0005 },
      rotSpeed: { x: 0.002, y: 0.003, z: 0.001 },
      amplitude: { x: 1.2, y: 2.2, z: 1.0 },
      phase: 0,
      depthParallaxMultiplier: 1.2,
    });

    // Object 2: Top-Right Slow Rotating Energy Ring
    const torusGeom = new THREE.TorusGeometry(2.3, 0.09, 16, 64);
    const torusMat = createGlassMaterial(isDark ? 0x06b6d4 : 0x818cf8, 0x0891b2, 0.7);
    const torusMesh = new THREE.Mesh(torusGeom, torusMat);
    torusMesh.position.set(19, 10, -5);
    torusMesh.rotation.x = Math.PI / 3;
    objectsGroup.add(torusMesh);
    floatingObjects.push({
      mesh: torusMesh,
      initialPos: new THREE.Vector3(19, 10, -5),
      floatSpeed: { x: 0.0008, y: 0.0009, z: 0.0006 },
      rotSpeed: { x: 0.003, y: 0.004, z: 0.002 },
      amplitude: { x: 1.5, y: 1.8, z: 1.2 },
      phase: Math.PI / 4,
      depthParallaxMultiplier: 0.9,
    });

    // Object 3: Bottom-Right Transparent Glass Geometric Object (Icosahedron)
    const icoGeom = new THREE.IcosahedronGeometry(1.8, 0);
    const icoMat = createGlassMaterial(isDark ? 0x818cf8 : 0xc7d2fe, 0x4338ca, 0.55);
    const icoMesh = new THREE.Mesh(icoGeom, icoMat);
    icoMesh.position.set(17, -11, 2);
    objectsGroup.add(icoMesh);
    floatingObjects.push({
      mesh: icoMesh,
      initialPos: new THREE.Vector3(17, -11, 2),
      floatSpeed: { x: 0.0007, y: 0.0011, z: 0.0008 },
      rotSpeed: { x: 0.0025, y: 0.0035, z: 0.0018 },
      amplitude: { x: 1.6, y: 2.0, z: 1.5 },
      phase: Math.PI / 2,
      depthParallaxMultiplier: 1.4,
    });

    // Object 4: Bottom-Left Tiny Geometric Cube
    const cubeGeom = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const cubeMat = createGlassMaterial(isDark ? 0x38bdf8 : 0x93c5fd, 0x0284c7, 0.5);
    const cubeMesh = new THREE.Mesh(cubeGeom, cubeMat);
    const cubeEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(cubeGeom),
      new THREE.LineBasicMaterial({
        color: isDark ? 0x7dd3fc : 0x6366f1,
        transparent: true,
        opacity: isDark ? 0.45 : 0.25,
      })
    );
    cubeMesh.add(cubeEdges);
    cubeMesh.position.set(-16, -10, -4);
    objectsGroup.add(cubeMesh);
    floatingObjects.push({
      mesh: cubeMesh,
      initialPos: new THREE.Vector3(-16, -10, -4),
      floatSpeed: { x: 0.0009, y: 0.0008, z: 0.0004 },
      rotSpeed: { x: 0.004, y: 0.002, z: 0.003 },
      amplitude: { x: 1.4, y: 1.6, z: 1.0 },
      phase: Math.PI * 0.75,
      depthParallaxMultiplier: 0.8,
    });

    // Object 5: Middle Ambient Floating Crystal / Octahedron
    const octGeom = new THREE.OctahedronGeometry(1.4, 0);
    const octMat = createGlassMaterial(isDark ? 0xa855f7 : 0xe0e7ff, 0x7e22ce, 0.5);
    const octMesh = new THREE.Mesh(octGeom, octMat);
    octMesh.position.set(-2, 13, -12);
    objectsGroup.add(octMesh);
    floatingObjects.push({
      mesh: octMesh,
      initialPos: new THREE.Vector3(-2, 13, -12),
      floatSpeed: { x: 0.0005, y: 0.0007, z: 0.0003 },
      rotSpeed: { x: 0.002, y: 0.0015, z: 0.0025 },
      amplitude: { x: 1.0, y: 1.4, z: 0.8 },
      phase: Math.PI * 1.2,
      depthParallaxMultiplier: 0.6,
    });

    // Object 6: Secondary Subtle Orbiting Ring
    const torus2Geom = new THREE.TorusGeometry(3.2, 0.04, 16, 80);
    const torus2Mat = createWireframeMaterial(isDark ? 0x6366f1 : 0x818cf8, 0.35);
    const torus2Mesh = new THREE.Mesh(torus2Geom, torus2Mat);
    torus2Mesh.position.set(0, -2, -8);
    torus2Mesh.rotation.x = Math.PI / 2.5;
    objectsGroup.add(torus2Mesh);
    floatingObjects.push({
      mesh: torus2Mesh,
      initialPos: new THREE.Vector3(0, -2, -8),
      floatSpeed: { x: 0.0003, y: 0.0005, z: 0.0002 },
      rotSpeed: { x: 0.001, y: 0.0015, z: 0.0008 },
      amplitude: { x: 0.8, y: 1.0, z: 0.6 },
      phase: Math.PI * 1.5,
      depthParallaxMultiplier: 0.5,
    });

    // 6. Neural Network Effect (Connected Nodes & Thin Dynamic Lines)
    const neuralNodeCount = isMobile ? 30 : 55;
    const neuralSpreadX = 52;
    const neuralSpreadY = 32;
    const neuralSpreadZ = 22;

    const neuralPositions = new Float32Array(neuralNodeCount * 3);
    const neuralVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < neuralNodeCount; i++) {
      neuralPositions[i * 3] = (Math.random() - 0.5) * neuralSpreadX;
      neuralPositions[i * 3 + 1] = (Math.random() - 0.5) * neuralSpreadY;
      neuralPositions[i * 3 + 2] = (Math.random() - 0.5) * neuralSpreadZ - 3;

      neuralVelocities.push({
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.008,
      });
    }

    const neuralGeometry = new THREE.BufferGeometry();
    neuralGeometry.setAttribute('position', new THREE.BufferAttribute(neuralPositions, 3));

    const neuralPointMat = new THREE.PointsMaterial({
      size: isDark ? 1.6 : 1.3,
      map: particleTexture,
      transparent: true,
      opacity: isDark ? 0.65 : 0.45,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      color: isDark ? 0x93c5fd : 0x6366f1,
    });
    const neuralPointsMesh = new THREE.Points(neuralGeometry, neuralPointMat);
    scene.add(neuralPointsMesh);

    // Neural Dynamic Lines
    const maxLineConnections = neuralNodeCount * 2;
    const linePositions = new Float32Array(maxLineConnections * 6);
    const lineColors = new Float32Array(maxLineConnections * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: isDark ? 0.24 : 0.14,
      vertexColors: true,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });
    const neuralLinesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(neuralLinesMesh);

    // 7. Background Tiny Dust/Particle Cloud (50–120 particles)
    const ambientParticleCount = isMobile ? 40 : 90;
    const ambientPositions = new Float32Array(ambientParticleCount * 3);
    const ambientVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < ambientParticleCount; i++) {
      ambientPositions[i * 3] = (Math.random() - 0.5) * 60;
      ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      ambientVelocities.push({
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.005,
      });
    }

    const ambientGeom = new THREE.BufferGeometry();
    ambientGeom.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));

    const ambientMat = new THREE.PointsMaterial({
      size: isDark ? 1.2 : 0.9,
      map: particleTexture,
      transparent: true,
      opacity: isDark ? 0.45 : 0.28,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      color: isDark ? 0xe0e7ff : 0x818cf8,
    });
    const ambientParticlesMesh = new THREE.Points(ambientGeom, ambientMat);
    scene.add(ambientParticlesMesh);

    // 8. Desktop Cursor Parallax Handling
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion || isMobile) return;
      // Parallax: cursor moves left -> scene moves slightly right
      targetX = -(e.clientX / window.innerWidth - 0.5) * 3.2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2.5;
    };

    if (!prefersReducedMotion && !isMobile) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
    }

    // 9. Resize Handling
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 10. Document Visibility Handling (pause when tab is inactive)
    let isVisible = true;
    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 11. Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      // If user prefers reduced motion, render fixed frame with static subtle beauty
      if (prefersReducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      // Smooth camera parallax interpolation (easing)
      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      camera.position.x = mouseX;
      camera.position.y = mouseY;
      camera.lookAt(0, 0, 0);

      // Page responsiveness speed factor
      const currentPage = pageRef.current;
      let speedFactor = 0.5; // Calm default
      if (currentPage === 'landing') speedFactor = 0.85;
      else if (currentPage === 'processing') speedFactor = 1.7; // energetic AI computation
      else if (currentPage === 'results') speedFactor = 0.25; // calm reading environment
      else if (currentPage === 'dashboard') speedFactor = 0.5;

      // Update floating 3D objects with organic sine-wave drift and rotations
      floatingObjects.forEach((obj, idx) => {
        const t = elapsed * speedFactor + obj.phase;

        // Continuous smooth vertical and sideways floating
        obj.mesh.position.x =
          obj.initialPos.x +
          Math.sin(t * 0.8 + idx) * obj.amplitude.x +
          mouseX * 0.4 * obj.depthParallaxMultiplier;

        obj.mesh.position.y =
          obj.initialPos.y +
          Math.cos(t * 0.9 + idx * 1.5) * obj.amplitude.y +
          mouseY * 0.4 * obj.depthParallaxMultiplier;

        obj.mesh.position.z =
          obj.initialPos.z + Math.sin(t * 0.5 + idx) * obj.amplitude.z;

        // Gentle continuous rotation
        obj.mesh.rotation.x += obj.rotSpeed.x * speedFactor;
        obj.mesh.rotation.y += obj.rotSpeed.y * speedFactor;
        obj.mesh.rotation.z += obj.rotSpeed.z * speedFactor;
      });

      // Update neural network nodes
      const nPos = neuralGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < neuralNodeCount; i++) {
        const i3 = i * 3;
        nPos[i3] += neuralVelocities[i].x * speedFactor;
        nPos[i3 + 1] += neuralVelocities[i].y * speedFactor;
        nPos[i3 + 2] += neuralVelocities[i].z * speedFactor;

        // Soft volume boundaries
        if (Math.abs(nPos[i3]) > neuralSpreadX / 2) neuralVelocities[i].x *= -1;
        if (Math.abs(nPos[i3 + 1]) > neuralSpreadY / 2) neuralVelocities[i].y *= -1;
        if (Math.abs(nPos[i3 + 2]) > neuralSpreadZ / 2) neuralVelocities[i].z *= -1;
      }
      neuralGeometry.attributes.position.needsUpdate = true;

      // Update dynamic neural lines between close nodes
      let lineIdx = 0;
      const maxDistance = currentPage === 'processing' ? 12 : 9.5;
      const isDarkTheme = themeRef.current === 'dark';

      for (let i = 0; i < neuralNodeCount; i++) {
        for (let j = i + 1; j < neuralNodeCount; j++) {
          const dx = nPos[i * 3] - nPos[j * 3];
          const dy = nPos[i * 3 + 1] - nPos[j * 3 + 1];
          const dz = nPos[i * 3 + 2] - nPos[j * 3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < maxDistance * maxDistance && lineIdx < maxLineConnections) {
            linePositions[lineIdx * 6] = nPos[i * 3];
            linePositions[lineIdx * 6 + 1] = nPos[i * 3 + 1];
            linePositions[lineIdx * 6 + 2] = nPos[i * 3 + 2];

            linePositions[lineIdx * 6 + 3] = nPos[j * 3];
            linePositions[lineIdx * 6 + 4] = nPos[j * 3 + 1];
            linePositions[lineIdx * 6 + 5] = nPos[j * 3 + 2];

            // Color gradient along line: indigo to cyan
            if (isDarkTheme) {
              lineColors[lineIdx * 6] = 0.39;
              lineColors[lineIdx * 6 + 1] = 0.4;
              lineColors[lineIdx * 6 + 2] = 0.95;

              lineColors[lineIdx * 6 + 3] = 0.02;
              lineColors[lineIdx * 6 + 4] = 0.71;
              lineColors[lineIdx * 6 + 5] = 0.83;
            } else {
              lineColors[lineIdx * 6] = 0.55;
              lineColors[lineIdx * 6 + 1] = 0.58;
              lineColors[lineIdx * 6 + 2] = 0.92;

              lineColors[lineIdx * 6 + 3] = 0.4;
              lineColors[lineIdx * 6 + 4] = 0.65;
              lineColors[lineIdx * 6 + 5] = 0.9;
            }

            lineIdx++;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIdx * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Update ambient background dust particles
      const ambPos = ambientGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < ambientParticleCount; i++) {
        const i3 = i * 3;
        ambPos[i3] += ambientVelocities[i].x * speedFactor;
        ambPos[i3 + 1] += ambientVelocities[i].y * speedFactor;
        ambPos[i3 + 2] += ambientVelocities[i].z * speedFactor;

        if (ambPos[i3] > 30) ambPos[i3] = -30;
        if (ambPos[i3] < -30) ambPos[i3] = 30;
        if (ambPos[i3 + 1] > 20) ambPos[i3 + 1] = -20;
        if (ambPos[i3 + 1] < -20) ambPos[i3 + 1] = 20;
      }
      ambientGeom.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 12. Complete Cleanup & Resource Disposal on unmount or theme change
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      // Dispose geometries
      sphereGeom.dispose();
      sphereInnerGeom.dispose();
      torusGeom.dispose();
      icoGeom.dispose();
      cubeGeom.dispose();
      octGeom.dispose();
      torus2Geom.dispose();
      neuralGeometry.dispose();
      lineGeometry.dispose();
      ambientGeom.dispose();

      // Dispose materials
      sphereMat.dispose();
      sphereInnerMat.dispose();
      torusMat.dispose();
      icoMat.dispose();
      cubeMat.dispose();
      octMat.dispose();
      torus2Mat.dispose();
      neuralPointMat.dispose();
      lineMaterial.dispose();
      ambientMat.dispose();

      // Dispose textures & renderer
      particleTexture.dispose();
      renderer.dispose();
    };
  }, [theme]); // Cleanly rebuilds shaders and materials when theme changes

  return (
    <canvas
      ref={canvasRef}
      id="global-3d-animated-background"
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 w-full h-full transition-opacity duration-700 ${className}`}
    />
  );
};
