import React from 'react';

interface TrophyIconProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export const TrophyIcon: React.FC<TrophyIconProps> = ({ 
  className = "", 
  size = 100,
  animated = true
}) => {
  const animationClass = animated ? 'animate-trophy-float gpu-accelerated' : '';
  
  return (
    <div className={`inline-block ${animationClass} ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
        role="img"
        aria-label="Troféu dourado de conquista"
      >
        <defs>
          <linearGradient id={`trophyGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id={`baseGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id={`shineGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
          </linearGradient>
          <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Glow effect background */}
        <circle
          cx="50"
          cy="45"
          r="35"
          fill="rgba(251, 191, 36, 0.2)"
          className="animate-pulse-glow"
        />
        
        {/* Base do troféu */}
        <rect
          x="25"
          y="75"
          width="50"
          height="15"
          rx="7.5"
          fill={`url(#baseGradient-${size})`}
          filter={`url(#glow-${size})`}
        />
        
        {/* Haste */}
        <rect
          x="47"
          y="65"
          width="6"
          height="15"
          fill={`url(#baseGradient-${size})`}
        />
        
        {/* Corpo principal do troféu */}
        <path
          d="M35 25 C35 20, 40 15, 50 15 C60 15, 65 20, 65 25 L65 50 C65 60, 60 65, 50 65 C40 65, 35 60, 35 50 Z"
          fill={`url(#trophyGradient-${size})`}
          stroke="#d97706"
          strokeWidth="1"
          filter={`url(#glow-${size})`}
        />
        
        {/* Alças laterais */}
        <path
          d="M25 30 C20 30, 15 35, 15 40 C15 45, 20 50, 25 50"
          fill="none"
          stroke={`url(#trophyGradient-${size})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M75 30 C80 30, 85 35, 85 40 C85 45, 80 50, 75 50"
          fill="none"
          stroke={`url(#trophyGradient-${size})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Estrela decorativa central */}
        <path
          d="M50 35 L52 41 L58 41 L53.5 45 L55.5 51 L50 47.5 L44.5 51 L46.5 45 L42 41 L48 41 Z"
          fill="#fef3c7"
          stroke="#f59e0b"
          strokeWidth="0.5"
          className="animate-pulse"
        />
        
        {/* Brilho principal no troféu */}
        <ellipse
          cx="45"
          cy="30"
          rx="8"
          ry="12"
          fill={`url(#shineGradient-${size})`}
          transform="rotate(-15 45 30)"
          className="animate-shimmer"
        />
        
        {/* Brilho adicional */}
        <ellipse
          cx="55"
          cy="40"
          rx="4"
          ry="6"
          fill="rgba(255, 255, 255, 0.6)"
          transform="rotate(20 55 40)"
        />
        
        {/* Reflexo na base */}
        <ellipse
          cx="50"
          cy="82"
          rx="20"
          ry="3"
          fill="rgba(255, 255, 255, 0.3)"
        />
      </svg>
    </div>
  );
};