import React from 'react';

interface HUDProps {
  currentChest: number;
  totalChests: number;
  streak: number;
  totalCorrect: number;
  elapsedTime: number;
  score?: number;
}

const HUD: React.FC<HUDProps> = ({
  currentChest,
  totalChests,
  streak,
  totalCorrect,
  elapsedTime,
  score,
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  return (
    <div className="hud">
      {/* 전기볼 진행률 */}
      <div className="hud-item">
        <div className="hud-label">전기볼</div>
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

      {/* 점수 */}
      <div className="hud-item">
        <div className="hud-label">점수</div>
        <div className="hud-value" style={{ color: '#FF8F00' }}>
          {score ?? 0}
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
