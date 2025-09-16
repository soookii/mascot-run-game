import React from 'react';

interface HUDProps {
  currentChest: number;
  totalChests: number;
  streak: number;
  totalCorrect: number;
  boosterActive: boolean;
  boosterTimeLeft: number;
  elapsedTime: number;
}

const HUD: React.FC<HUDProps> = ({
  currentChest,
  totalChests,
  streak,
  totalCorrect,
  boosterActive,
  boosterTimeLeft,
  elapsedTime,
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBoosterStatus = () => {
    if (boosterActive) {
      return {
        text: 'ACTIVE',
        className: 'booster-indicator booster-active',
        timeLeft: Math.ceil(boosterTimeLeft / 1000),
      };
    } else if (totalCorrect >= 3) {
      return {
        text: 'READY',
        className: 'booster-indicator booster-ready',
        timeLeft: null,
      };
    } else {
      return {
        text: `${3 - totalCorrect} MORE`,
        className: 'booster-indicator',
        timeLeft: null,
      };
    }
  };

  const boosterStatus = getBoosterStatus();

  return (
    <div className="hud">
      {/* 상자 진행률 */}
      <div className="hud-item">
        <div className="hud-label">상자</div>
        <div className="hud-value">
          {currentChest}/{totalChests}
        </div>
      </div>

      {/* 연속 정답 */}
      <div className="hud-item">
        <div className="hud-label">연속</div>
        <div className="hud-value" style={{ color: streak > 0 ? '#4CAF50' : '#CCC' }}>
          {streak}
        </div>
      </div>

      {/* 총 정답 수 */}
      <div className="hud-item">
        <div className="hud-label">정답</div>
        <div className="hud-value" style={{ color: '#4CAF50' }}>
          {totalCorrect}
        </div>
      </div>

      {/* 부스터 상태 */}
      <div className="hud-item">
        <div className="hud-label">부스터</div>
        <div className={boosterStatus.className}>
          {boosterStatus.text}
          {boosterStatus.timeLeft && ` (${boosterStatus.timeLeft}s)`}
        </div>
      </div>

      {/* 경과 시간 */}
      <div className="hud-item">
        <div className="hud-label">시간</div>
        <div className="hud-value">
          {formatTime(elapsedTime)}
        </div>
      </div>
    </div>
  );
};

export default HUD;
