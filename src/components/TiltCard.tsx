import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  id?: string;
  maxTilt?: number; // max tilt degrees (default 3.5 deg - calm, subtle)
  max?: number;
  scale?: number;
  interactive?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  onClick,
  id,
  maxTilt = 3.5,
  max,
  scale = 1.015,
  interactive = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const effectiveMaxTilt = max ?? maxTilt;

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 260, mass: 0.2 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Tilt rotations
  const rotateX = useTransform(smoothMouseY, [0, 1], [effectiveMaxTilt, -effectiveMaxTilt]);
  const rotateY = useTransform(smoothMouseX, [0, 1], [-effectiveMaxTilt, effectiveMaxTilt]);

  useEffect(() => {
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouchDevice(isTouch);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice && interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: isTouchDevice || !interactive ? 0 : rotateX,
        rotateY: isTouchDevice || !interactive ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={
        !isTouchDevice && interactive
          ? {
              y: -3,
              scale: scale,
              transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
            }
          : undefined
      }
      className={`relative transition-colors duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Dynamic border sheen highlight on hover */}
      {!isTouchDevice && interactive && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            boxShadow: '0 0 20px -3px rgba(99, 102, 241, 0.15)',
          }}
        />
      )}
      {children}
    </motion.div>
  );
};
