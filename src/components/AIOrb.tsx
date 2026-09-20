import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type OrbState = 'idle' | 'processing' | 'listening' | 'speaking';

interface AIOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  interactive?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const AIOrb: React.FC<AIOrbProps> = ({
  state = 'idle',
  size = 'md',
  interactive = true,
  className = '',
  theme = 'dark',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<OrbState>(state);
  stateRef.current = state;
  const themeRef = useRef<'dark' | 'light'>(theme);
  themeRef.current = theme;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Create central core sphere with custom wireframe / points / glass effect
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // 1. Inner glowing sphere
    const innerGeom = new THREE.IcosahedronGeometry(1.3, 4);
    const innerMat = new THREE.MeshBasicMaterial({
      color: themeRef.current === 'dark' ? 0x6366f1 : 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    orbGroup.add(innerMesh);

    // 2. Translucent core shell
    const shellGeom = new THREE.SphereGeometry(1.22, 32, 32);
    const shellMat = new THREE.MeshStandardMaterial({
      color: themeRef.current === 'dark' ? 0x2563eb : 0x3b82f6,
      emissive: themeRef.current === 'dark' ? 0x1d4ed8 : 0x2563eb,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.65,
    });
    const shellMesh = new THREE.Mesh(shellGeom, shellMat);
    orbGroup.add(shellMesh);

    // 3. Orbital Rings (quantum energy lines)
    const ringGeom = new THREE.TorusGeometry(1.65, 0.018, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
    });
    const ring1 = new THREE.Mesh(ringGeom, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    orbGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(ringGeom, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    orbGroup.add(ring2);

    // 4. Surrounding ambient particles
    const particleCount = 280;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const originalPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.7 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      scales[i] = Math.random() * 0.04 + 0.015;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle sprite using canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(99, 102, 241, 0.8)');
      grad.addColorStop(0.8, 'rgba(6, 182, 212, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.75,
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    orbGroup.add(particles);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2, 20);
    pointLight1.position.set(3, 4, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 1.8, 20);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xa855f7, 1.5, 20);
    pointLight3.position.set(0, 3, -3);
    scene.add(pointLight3);

    // Mouse interaction parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.8;
      targetY = y * 0.8;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentState = stateRef.current;

      // Parallax easing
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Speed & behavior by state
      let speedMult = 1;
      let pulseAmp = 0.04;
      let particleDrift = 1;

      if (currentState === 'processing') {
        speedMult = 2.4;
        pulseAmp = 0.12;
        particleDrift = 2.0;
        ringMat1.opacity = 0.85;
        ringMat2.opacity = 0.85;
        innerMat.color.setHex(0x06b6d4);
      } else if (currentState === 'listening') {
        speedMult = 1.4;
        pulseAmp = 0.15 + Math.sin(elapsedTime * 8) * 0.08;
        particleDrift = 1.6;
        innerMat.color.setHex(0x10b981);
      } else if (currentState === 'speaking') {
        speedMult = 1.2;
        pulseAmp = 0.08 + Math.sin(elapsedTime * 4) * 0.06;
        innerMat.color.setHex(0x8b5cf6);
      } else {
        speedMult = 1;
        pulseAmp = 0.03;
        innerMat.color.setHex(themeRef.current === 'dark' ? 0x6366f1 : 0x4f46e5);
      }

      // Smooth floating motion
      const floatY = Math.sin(elapsedTime * 1.5) * 0.12;
      orbGroup.position.y = floatY + mouseY * 0.3;
      orbGroup.position.x = mouseX * 0.3;

      // Group & mesh rotations
      orbGroup.rotation.y = elapsedTime * 0.25 * speedMult + mouseX * 0.5;
      orbGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.1 + mouseY * 0.5;

      innerMesh.rotation.y = -elapsedTime * 0.4 * speedMult;
      innerMesh.rotation.z = elapsedTime * 0.2 * speedMult;

      ring1.rotation.z = elapsedTime * 0.5 * speedMult;
      ring2.rotation.z = -elapsedTime * 0.4 * speedMult;

      // Scale breathing
      const scale = 1 + Math.sin(elapsedTime * 2.2 * speedMult) * pulseAmp;
      shellMesh.scale.set(scale, scale, scale);

      // Particle orbit animation
      const posAttr = particleGeom.getAttribute('position') as THREE.BufferAttribute;
      const currentPos = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const origX = originalPositions[i3];
        const origY = originalPositions[i3 + 1];
        const origZ = originalPositions[i3 + 2];

        // Orbit rotation around Y axis
        const angle = elapsedTime * 0.2 * particleDrift + i;
        const cos = Math.cos(angle * 0.2);
        const sin = Math.sin(angle * 0.2);

        const wave = Math.sin(elapsedTime * 2 + i) * 0.08 * particleDrift;

        currentPos[i3] = (origX * cos - origZ * sin) * (1 + wave);
        currentPos[i3 + 1] = origY + Math.sin(elapsedTime * 1.2 + i) * 0.1;
        currentPos[i3 + 2] = (origX * sin + origZ * cos) * (1 + wave);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle container resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW === 0 || newH === 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      innerGeom.dispose();
      innerMat.dispose();
      shellGeom.dispose();
      shellMat.dispose();
      ringGeom.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, [interactive, theme]);

  // Size styling
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48 sm:w-60 sm:h-60',
    lg: 'w-72 h-72 sm:w-84 sm:h-84',
    hero: 'w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px]',
  }[size];

  return (
    <div
      id="ai-orb-container"
      ref={mountRef}
      className={`relative flex items-center justify-center pointer-events-none select-none ${sizeClasses} ${className}`}
      aria-label="3D AI Intelligence Orb"
    >
      {/* Background ambient radial glow */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          state === 'processing'
            ? 'opacity-80 bg-gradient-to-tr from-cyan-500/25 via-indigo-500/30 to-purple-500/25'
            : state === 'listening'
            ? 'opacity-80 bg-gradient-to-tr from-emerald-500/25 via-cyan-500/30 to-blue-500/25'
            : state === 'speaking'
            ? 'opacity-80 bg-gradient-to-tr from-purple-500/30 via-indigo-500/25 to-pink-500/20'
            : 'opacity-40 bg-gradient-to-tr from-indigo-500/20 via-blue-500/20 to-purple-500/15'
        }`}
      />
    </div>
  );
};
