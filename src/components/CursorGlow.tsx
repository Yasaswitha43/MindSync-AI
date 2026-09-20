import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

export const CursorGlow: React.FC = () => {
  const { theme } = useApp();
  const glowRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if device has fine pointer (desktop mouse) and doesn't prefer reduced motion
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasPointer || prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const updatePosition = () => {
      // Smooth lerp easing
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <div
        ref={glowRef}
        className="absolute top-0 left-0 -ml-[250px] -mt-[250px] w-[500px] h-[500px] rounded-full transition-opacity duration-700 ease-out"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.05) 45%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, rgba(168, 85, 247, 0.03) 40%, transparent 65%)',
          willChange: 'transform',
        }}
      />
    </div>
  );
};
