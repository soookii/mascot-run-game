import React, { useEffect, useState } from 'react';
import { triggerConfetti, triggerVictoryConfetti, triggerBoosterConfetti } from '../lib/confetti';

interface EffectsProps {
  isCorrect: boolean | null;
  isJumping: boolean;
  hasBooster: boolean;
  gameFinished: boolean;
}

const Effects: React.FC<EffectsProps> = ({
  isCorrect,
  isJumping,
  hasBooster,
  gameFinished,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  // 정답 시 폭죽 효과
  useEffect(() => {
    if (isCorrect === true) {
      setShowConfetti(true);
      triggerConfetti();
      
      // 3초 후 폭죽 숨기기
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  // 게임 완료 시 승리 폭죽
  useEffect(() => {
    if (gameFinished) {
      setShowVictory(true);
      triggerVictoryConfetti();
    }
  }, [gameFinished]);

  // 부스터 활성화 시 폭죽
  useEffect(() => {
    if (hasBooster) {
      triggerBoosterConfetti();
    }
  }, [hasBooster]);

  return (
    <div className="effects">
      {/* 정답 폭죽 효과 */}
      {showConfetti && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}

      {/* 승리 폭죽 효과 */}
      {showVictory && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}

      {/* 점프 효과 */}
      {isJumping && (
        <div
          style={{
            position: 'absolute',
            left: '520px', // 캐릭터 위치에 맞춤
            bottom: '80px', // 땅에 맞춤
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'pulse 0.8s ease-out',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* 부스터 효과 */}
      {hasBooster && (
        <div
          style={{
            position: 'absolute',
            left: '470px', // 캐릭터 위치에 맞춤
            bottom: '90px', // 땅에 맞춤
            width: '100px',
            height: '20px',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flame-trail"
              style={{
                position: 'absolute',
                left: i * 12,
                top: Math.random() * 10,
                width: '15px',
                height: '15px',
                background: `radial-gradient(circle, #FF4500 0%, #FFD700 50%, transparent 100%)`,
                borderRadius: '50%',
                animation: `flame ${0.3 + Math.random() * 0.2}s linear infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Effects;
