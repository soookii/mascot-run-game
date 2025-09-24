import React, { useEffect, useState } from 'react';
import { triggerConfetti, triggerVictoryConfetti } from '../lib/confetti';

interface EffectsProps {
  isCorrect: boolean | null;
  isJumping: boolean;
  gameFinished: boolean;
}

const Effects: React.FC<EffectsProps> = ({
  isCorrect,
  isJumping,
  gameFinished,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  // 전기 이펙트 사용 안 함

  // 정답 시 폭죽 효과만
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
    if (isCorrect === false) {
      // 오답 시 화면 흔들림 클래스 잠깐 추가
      const container = document.querySelector('.game-container');
      if (container) {
        container.classList.add('shake-screen');
        setTimeout(() => container.classList.remove('shake-screen'), 600);
      }
    }
  }, [isCorrect]);

  // 게임 완료 시 승리 폭죽
  useEffect(() => {
    if (gameFinished) {
      setShowVictory(true);
      triggerVictoryConfetti();
    }
  }, [gameFinished]);

  // 부스터 제거됨

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

    </div>
  );
};

export default Effects;
