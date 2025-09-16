import React from 'react';

interface PotionProps {
  x: number;
  worldX: number;
  onCollision: () => void;
}

const Potion: React.FC<PotionProps> = ({ x, worldX, onCollision }) => {
  const screenX = x - worldX;
  const isVisible = screenX > -50 && screenX < 1200;
  
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: screenX,
        bottom: 130,
        width: '30px',
        height: '40px',
        zIndex: 5,
        pointerEvents: 'none', // 클릭 이벤트 비활성화
      }}
    >
      <svg
        width="30"
        height="40"
        viewBox="0 0 30 40"
        style={{
          animation: 'chestBounce 1.5s infinite',
        }}
      >
        {/* 포션 병 */}
        <ellipse
          cx="15"
          cy="35"
          rx="8"
          ry="5"
          fill="#4A4A4A"
        />
        
        {/* 포션 몸체 */}
        <rect
          x="8"
          y="10"
          width="14"
          height="25"
          rx="7"
          ry="7"
          fill="#2A2A2A"
          stroke="#666"
          strokeWidth="1"
        />
        
        {/* 포션 액체 */}
        <rect
          x="10"
          y="15"
          width="10"
          height="15"
          rx="5"
          ry="5"
          fill="#FF4500"
        />
        
        {/* 포션 액체 하이라이트 */}
        <rect
          x="10"
          y="15"
          width="10"
          height="5"
          rx="5"
          ry="5"
          fill="#FFD700"
          opacity="0.6"
        />
        
        {/* 포션 거품 */}
        <circle cx="12" cy="18" r="1" fill="white" opacity="0.8" />
        <circle cx="18" cy="20" r="1" fill="white" opacity="0.8" />
        <circle cx="14" cy="22" r="1" fill="white" opacity="0.8" />
        
        {/* 포션 마개 */}
        <rect
          x="12"
          y="8"
          width="6"
          height="4"
          rx="3"
          ry="3"
          fill="#8B4513"
        />
        
        {/* 포션 마개 하이라이트 */}
        <rect
          x="12"
          y="8"
          width="6"
          height="2"
          rx="3"
          ry="3"
          fill="#A0522D"
        />
      </svg>
      
      {/* 포션 빛 효과 */}
      <div
        style={{
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          width: '40px',
          height: '50px',
          background: 'radial-gradient(circle, rgba(255, 69, 0, 0.4) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite',
        }}
      />
      
      {/* 포션 파티클 효과 */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 20}px`,
            left: `${Math.random() * 20}px`,
            width: '4px',
            height: '4px',
            background: '#FFD700',
            borderRadius: '50%',
            animation: `twinkle ${1 + Math.random()}s infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Potion;
