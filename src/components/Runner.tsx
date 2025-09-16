import React from 'react';
import { MascotType } from '../config';

interface RunnerProps {
  mascot: MascotType;
  isJumping: boolean;
  isStumbling: boolean;
  hasBooster: boolean;
}

const Runner: React.FC<RunnerProps> = ({ 
  mascot, 
  isJumping, 
  isStumbling, 
  hasBooster 
}) => {
  const getRunnerClass = () => {
    let className = 'runner';
    if (isJumping) {
      className += ' jumping';
    } else if (isStumbling) {
      className += ' stumbling';
    }
    // 달리기 애니메이션은 기본적으로 항상 적용됨
    return className;
  };

  const renderCat = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* 고양이 몸체 (더 둥글고 귀여운) */}
      <ellipse cx="40" cy="55" rx="28" ry="32" fill="#333" />
      <circle cx="40" cy="30" r="24" fill="#333" />
      
      {/* 고양이 귀 (더 귀여운 모양) */}
      <polygon points="12,18 18,8 24,18" fill="#333" />
      <polygon points="56,18 62,8 68,18" fill="#333" />
      
      {/* 고양이 귀 안쪽 (더 귀여운) */}
      <polygon points="14,16 18,11 22,16" fill="#FF69B4" />
      <polygon points="58,16 62,11 66,16" fill="#FF69B4" />
      
      {/* 고양이 눈 (더 크고 귀여운) */}
      <ellipse cx="30" cy="26" rx="5" ry="7" fill="white" />
      <ellipse cx="50" cy="26" rx="5" ry="7" fill="white" />
      <ellipse cx="30" cy="26" rx="4" ry="6" fill="#87CEEB" />
      <ellipse cx="50" cy="26" rx="4" ry="6" fill="#87CEEB" />
      <circle cx="31" cy="25" r="2" fill="white" />
      <circle cx="51" cy="25" r="2" fill="white" />
      
      {/* 고양이 눈썹 (귀여운 표정) */}
      <path d="M 26 22 Q 30 19 34 22" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 46 22 Q 50 19 54 22" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* 고양이 코 (더 귀여운) */}
      <polygon points="40,33 37,37 43,37" fill="#FF69B4" />
      
      {/* 고양이 입 (웃는 모양) */}
      <path d="M 40 37 Q 36 40 32 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 40 37 Q 44 40 48 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* 고양이 볼 (귀여운 볼) - 입 주변에서 완전 제거 */}
      <circle cx="20" cy="42" r="4" fill="#FFB6C1" opacity="0.7" />
      <circle cx="60" cy="42" r="4" fill="#FFB6C1" opacity="0.7" />
      
      
      {/* 고양이 꼬리 (더 귀여운) */}
      <path d="M 68 50 Q 80 35 85 20 Q 90 10 80 15" stroke="#333" strokeWidth="10" fill="none" strokeLinecap="round" />
    </svg>
  );

  const renderDog = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* 강아지 몸체 (더 둥글고 귀여운) */}
      <ellipse cx="40" cy="55" rx="30" ry="35" fill="#FFF" />
      <circle cx="40" cy="30" r="27" fill="#FFF" />
      
      {/* 강아지 귀 (더 귀여운 모양) */}
      <ellipse cx="18" cy="25" rx="12" ry="20" fill="#FFF" />
      <ellipse cx="62" cy="25" rx="12" ry="20" fill="#FFF" />
      
      {/* 강아지 귀 안쪽 (더 귀여운) */}
      <ellipse cx="18" cy="25" rx="6" ry="12" fill="#FFB6C1" />
      <ellipse cx="62" cy="25" rx="6" ry="12" fill="#FFB6C1" />
      
      {/* 강아지 눈 (더 크고 귀여운) */}
      <circle cx="30" cy="26" r="5" fill="#333" />
      <circle cx="50" cy="26" r="5" fill="#333" />
      
      {/* 강아지 눈 하이라이트 (더 귀여운) */}
      <circle cx="31" cy="25" r="2" fill="white" />
      <circle cx="51" cy="25" r="2" fill="white" />
      
      {/* 강아지 눈썹 (귀여운 표정) */}
      <path d="M 26 23 Q 30 20 34 23" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 46 23 Q 50 20 54 23" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* 강아지 코 (더 귀여운) */}
      <circle cx="40" cy="33" r="3" fill="#333" />
      
      {/* 강아지 입 (웃는 모양) */}
      <path d="M 40 37 Q 36 40 32 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 40 37 Q 44 40 48 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* 강아지 혀 (더 귀여운) */}
      <ellipse cx="40" cy="42" rx="5" ry="4" fill="#FF69B4" />
      
      {/* 강아지 볼 (귀여운 볼) - 입 주변에서 완전 제거 */}
      <circle cx="20" cy="42" r="5" fill="#FFB6C1" opacity="0.8" />
      <circle cx="60" cy="42" r="5" fill="#FFB6C1" opacity="0.8" />
      
      
      {/* 강아지 꼬리 (더 귀여운) */}
      <path d="M 67 50 Q 80 35 85 20 Q 90 10 80 15" stroke="#FFF" strokeWidth="12" fill="none" strokeLinecap="round" />
    </svg>
  );

  return (
    <div style={{ position: 'relative', width: '300px', height: '180px', overflow: 'visible' }}>
      {/* 정교한 캐릭터 */}
      <div
        style={{
          width: '80px',
          height: '80px',
          position: 'relative',
          left: '100px', // 꼬리를 위한 더 큰 여백
          top: '20px', // 땅에 붙도록 조정
        }}
        className={getRunnerClass()}
      >
        {mascot === 'cat' ? renderCat() : renderDog()}
      </div>
      
      {/* 부스터 불꽃 효과 */}
      {hasBooster && (
        <div
          style={{
            position: 'absolute',
            left: -30,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '100px',
            height: '20px',
            zIndex: 5,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flame-trail"
              style={{
                left: i * 15,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Runner;
