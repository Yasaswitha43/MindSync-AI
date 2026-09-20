import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  id?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  strength?: number; // max movement in pixels (default 7px)
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  onClick,
  id,
  title,
  type = 'button',
  disabled = false,
  strength = 7,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Motion values for smooth magnetic pull
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Soft spring physics
  const springConfig = { damping: 18, stiffness: 220, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouchDevice(isTouch);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchDevice || disabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    x.set(deltaX * strength);
    y.set(deltaY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      id={id}
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: isTouchDevice ? 0 : springX,
        y: isTouchDevice ? 0 : springY,
      }}
      whileHover={
        !isTouchDevice && !disabled
          ? {
              scale: 1.03,
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
            }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-shadow duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${className}`}
    >
      {children}
    </motion.button>
  );
};
