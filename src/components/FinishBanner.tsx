import React from 'react';

interface FinishBannerProps {
  x: number;
  worldX: number;
  onCollision: () => void;
}

const FinishBanner: React.FC<FinishBannerProps> = ({ x, worldX, onCollision }) => {
  const screenX = x - worldX;
  const isVisible = screenX > -100 && screenX < 1200;
  
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: screenX - 50,
        bottom: 80,
        width: '100px',
        height: '100px',
        zIndex: 5,
        cursor: 'pointer',
      }}
      onClick={onCollision}
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        style={{
          animation: 'portalSpin 3s linear infinite',
        }}
      >
        {/* 포털 외곽 원 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#FFD700"
          strokeWidth="4"
        />
        
        {/* 포털 내부 원 */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="url(#portalGradient)"
          stroke="#FF6B35"
          strokeWidth="3"
        />
        
        {/* 그라데이션 정의 */}
        <defs>
          <radialGradient id="portalGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="50%" stopColor="#4169E1" />
            <stop offset="100%" stopColor="#191970" />
          </radialGradient>
        </defs>
        
        {/* 포털 내부 별들 */}
        <polygon
          points="50,20 52,25 57,25 53,28 55,33 50,30 45,33 47,28 43,25 48,25"
          fill="white"
          opacity="0.8"
        />
        <polygon
          points="50,70 52,75 57,75 53,78 55,83 50,80 45,83 47,78 43,75 48,75"
          fill="white"
          opacity="0.8"
        />
        <polygon
          points="20,50 25,52 25,57 28,53 33,55 30,50 33,45 28,47 25,43 25,48"
          fill="white"
          opacity="0.8"
        />
        <polygon
          points="80,50 85,52 85,57 88,53 93,55 90,50 93,45 88,47 85,43 85,48"
          fill="white"
          opacity="0.8"
        />
        
        {/* 회전하는 파티클들 */}
        <circle
          cx="50"
          cy="15"
          r="2"
          fill="white"
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="50"
          cy="85"
          r="2"
          fill="white"
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* "GOAL" 텍스트 */}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="white"
          style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          GOAL
        </text>
      </svg>
    </div>
  );
};

export default FinishBanner;