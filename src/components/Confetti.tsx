import React, { useMemo } from 'react';

interface ConfettiProps {
  particleCount?: number;
  className?: string;
}

export const Confetti: React.FC<ConfettiProps> = ({ 
  particleCount = 50,
  className = ""
}) => {
  // Memoize particles for better performance
  const particles = useMemo(() => {
    // Reduce particles on mobile devices for better performance
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? Math.min(particleCount, 30) : particleCount;
    
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 4,
      animationDuration: 4 + Math.random() * 3,
      color: [
        '#fbbf24', // amber-400
        '#10b981', // emerald-500
        '#3b82f6', // blue-500
        '#fcd34d', // yellow-300
        '#f59e0b', // amber-500
        '#ef4444', // red-500
        '#8b5cf6', // violet-500
        '#06b6d4'  // cyan-500
      ][Math.floor(Math.random() * 8)],
      size: 3 + Math.random() * 6,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.6 ? 'circle' : Math.random() > 0.3 ? 'square' : 'triangle',
    }));
  }, [particleCount]);

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-10 overflow-hidden ${className}`}
      aria-hidden="true"
      role="presentation"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-optimized gpu-accelerated"
          style={{
            left: `${particle.left}%`,
            top: '-20px',
            backgroundColor: particle.shape === 'triangle' ? 'transparent' : particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: particle.shape === 'circle' ? '50%' : '0',
            // Triangle shape using CSS borders
            ...(particle.shape === 'triangle' && {
              width: '0',
              height: '0',
              borderLeft: `${particle.size / 2}px solid transparent`,
              borderRight: `${particle.size / 2}px solid transparent`,
              borderBottom: `${particle.size}px solid ${particle.color}`,
              backgroundColor: 'transparent',
            }),
          }}
        />
      ))}
    </div>
  );
};