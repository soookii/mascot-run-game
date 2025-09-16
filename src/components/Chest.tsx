import React from 'react';

interface ChestProps {
  x: number;
  worldX: number;
  isOpen: boolean;
  onCollision: () => void;
  forceOpen?: boolean;
  withBurst?: boolean;
}

const Chest: React.FC<ChestProps> = ({ x, worldX, isOpen, onCollision, forceOpen = false, withBurst = false }) => {
  const screenX = x - worldX;
  const isVisible = screenX > -100 && screenX < 1200;
  const opened = isOpen || forceOpen;
  
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: screenX - 30,
        bottom: 120,
        width: '80px',
        height: '60px',
        zIndex: 5,
        pointerEvents: 'none', // 클릭 이벤트 비활성화
      }}
    >
      <svg
        width="80"
        height="60"
        viewBox="0 0 80 60"
        className={opened ? 'chest open' : 'chest'}
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        }}
      >
        {/* 그라데이션 정의 */}
        <defs>
          <linearGradient id="chestBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="50%" stopColor="#654321" />
            <stop offset="100%" stopColor="#4A2C2A" />
          </linearGradient>
          <linearGradient id="chestLid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D2691E" />
            <stop offset="50%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
          <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
          <radialGradient id="gem" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF69B4" />
            <stop offset="100%" stopColor="#8B008B" />
          </radialGradient>
        </defs>
        
        {/* 상자 몸체 (고급스러운 디자인) */}
        <rect
          x="10"
          y="25"
          width="60"
          height="30"
          rx="8"
          ry="8"
          fill="url(#chestBody)"
          stroke="#654321"
          strokeWidth="2"
        />
        
        {/* 상자 뚜껑 (열리는 모션) */}
        <g
          style={{
            transformOrigin: '40px 25px',
            transform: opened ? 'rotateX(-45deg)' : 'rotateX(0deg)',
            transition: 'transform 0.5s ease-in-out',
          }}
        >
          <rect
            x="10"
            y="15"
            width="60"
            height="20"
            rx="8"
            ry="8"
            fill="url(#chestLid)"
            stroke="#8B4513"
            strokeWidth="2"
          />
          
          {/* 뚜껑 장식 라인 */}
          <rect
            x="15"
            y="18"
            width="50"
            height="2"
            fill="url(#goldTrim)"
            rx="1"
          />
          <rect
            x="15"
            y="22"
            width="50"
            height="1"
            fill="url(#goldTrim)"
            rx="0.5"
          />
          <rect
            x="15"
            y="25"
            width="50"
            height="1"
            fill="url(#goldTrim)"
            rx="0.5"
          />
        </g>
        
        {/* 상자 금속 테두리 (고급스러운) */}
        <rect
          x="10"
          y="25"
          width="60"
          height="30"
          rx="8"
          ry="8"
          fill="none"
          stroke="url(#goldTrim)"
          strokeWidth="2"
        />
        
        {/* 상자 모서리 장식 */}
        <circle
          cx="15"
          cy="30"
          r="3"
          fill="url(#goldTrim)"
        />
        <circle
          cx="65"
          cy="30"
          r="3"
          fill="url(#goldTrim)"
        />
        <circle
          cx="15"
          cy="50"
          r="3"
          fill="url(#goldTrim)"
        />
        <circle
          cx="65"
          cy="50"
          r="3"
          fill="url(#goldTrim)"
        />
        
        {/* 상자 자물쇠 (고급스러운) */}
        <circle
          cx="40"
          cy="35"
          r="4"
          fill="url(#goldTrim)"
          stroke="#FF8C00"
          strokeWidth="1"
        />
        <circle
          cx="40"
          cy="35"
          r="2"
          fill="#FFD700"
        />
        
        {/* 보석 (고급스러운 장식) */}
        <polygon
          points="40,20 35,25 40,30 45,25"
          fill="url(#gem)"
          stroke="#8B008B"
          strokeWidth="1"
        />
        
        {/* 상자 내부 빛 (열렸을 때) */}
        {opened && (
          <rect
            x="15"
            y="30"
            width="50"
            height="20"
            rx="5"
            ry="5"
            fill="#FFD700"
            opacity="0.3"
          >
            <animate
              attributeName="opacity"
              values="0.3;0.6;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
        )}

        {/* 정답 버스트 이펙트 */}
        {withBurst && (
          <g>
            {Array.from({ length: 10 }).map((_, i) => (
              <circle
                key={i}
                cx={40}
                cy={28}
                r={2}
                fill="#FFD700"
                opacity={0.9}
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  dur={`${0.6 + (i % 3) * 0.2}s`}
                  values={`0,0; ${(i - 5) * 6}, -${18 + (i % 4) * 6}`}
                  repeatCount="1"
                  fill="freeze"
                />
                <animate
                  attributeName="opacity"
                  values="0.9;0"
                  dur={`${0.6 + (i % 3) * 0.2}s`}
                  repeatCount="1"
                  fill="freeze"
                />
              </circle>
            ))}
            {/* 반짝이 */}
            {Array.from({ length: 6 }).map((_, i) => (
              <polygon
                key={`s-${i}`}
                points="0,3 1,1 3,0 1,-1 0,-3 -1,-1 -3,0 -1,1"
                fill="#FFF8C6"
                transform={`translate(${40 + (i - 3) * 6} 20)`}
                opacity={0.0}
              >
                <animate
                  attributeName="opacity"
                  values="0;1;0"
                  dur="0.8s"
                  repeatCount="1"
                  fill="freeze"
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`${40 + (i - 3) * 6},20; ${40 + (i - 3) * 6},5`}
                  dur="0.8s"
                  repeatCount="1"
                  fill="freeze"
                />
              </polygon>
            ))}
          </g>
        )}
        
        {/* 물음표 (퀴즈 표시) */}
        <text
          x="40"
          y="45"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="white"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            filter: 'drop-shadow(0 0 3px rgba(255,215,0,0.5))',
          }}
        >
          ?
        </text>
        
        {/* 반짝이는 효과 */}
        <circle
          cx="25"
          cy="20"
          r="1"
          fill="white"
          opacity="0.8"
        >
          <animate
            attributeName="opacity"
            values="0.8;0.2;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="55"
          cy="20"
          r="1"
          fill="white"
          opacity="0.8"
        >
          <animate
            attributeName="opacity"
            values="0.8;0.2;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default Chest;