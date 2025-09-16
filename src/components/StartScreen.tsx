import React from 'react';
import { MascotType } from '../config';

interface StartScreenProps {
  selectedMascot: MascotType | null;
  onSelectMascot: (mascot: MascotType) => void;
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({
  selectedMascot,
  onSelectMascot,
  onStartGame,
}) => {
  const renderMascotIcon = (mascot: MascotType) => {
    if (mascot === 'cat') {
      return (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* 고양이 몸체 */}
          <ellipse cx="30" cy="40" rx="20" ry="25" fill="#333" />
          <circle cx="30" cy="25" r="18" fill="#333" />
          
          {/* 고양이 귀 */}
          <polygon points="15,15 20,5 25,15" fill="#333" />
          <polygon points="35,15 40,5 45,15" fill="#333" />
          
          {/* 고양이 귀 안쪽 */}
          <polygon points="17,13 20,8 23,13" fill="#FF69B4" />
          <polygon points="37,13 40,8 43,13" fill="#FF69B4" />
          
          {/* 고양이 눈 */}
          <ellipse cx="25" cy="22" rx="3" ry="5" fill="white" />
          <ellipse cx="35" cy="22" rx="3" ry="5" fill="white" />
          <circle cx="25" cy="22" r="2" fill="#333" />
          <circle cx="35" cy="22" r="2" fill="#333" />
          
          {/* 고양이 코 */}
          <polygon points="30,28 28,32 32,32" fill="#FF69B4" />
          
          {/* 고양이 꼬리 */}
          <path d="M 50 40 Q 60 30 55 20" stroke="#333" strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
      );
    } else {
      return (
        <svg width="60" height="60" viewBox="0 0 60 60">
          {/* 강아지 몸체 */}
          <ellipse cx="30" cy="40" rx="22" ry="25" fill="#FFF" />
          <circle cx="30" cy="25" r="20" fill="#FFF" />
          
          {/* 강아지 귀 */}
          <ellipse cx="20" cy="20" rx="8" ry="15" fill="#FFF" />
          <ellipse cx="40" cy="20" rx="8" ry="15" fill="#FFF" />
          
          {/* 강아지 귀 안쪽 */}
          <ellipse cx="20" cy="20" rx="4" ry="8" fill="#FFB6C1" />
          <ellipse cx="40" cy="20" rx="4" ry="8" fill="#FFB6C1" />
          
          {/* 강아지 눈 */}
          <circle cx="25" cy="22" r="3" fill="#333" />
          <circle cx="35" cy="22" r="3" fill="#333" />
          
          {/* 강아지 눈 하이라이트 */}
          <circle cx="26" cy="21" r="1" fill="white" />
          <circle cx="36" cy="21" r="1" fill="white" />
          
          {/* 강아지 코 */}
          <circle cx="30" cy="30" r="2" fill="#333" />
          
          {/* 강아지 혀 */}
          <ellipse cx="30" cy="35" rx="3" ry="2" fill="#FF69B4" />
          
          {/* 강아지 꼬리 */}
          <path d="M 52 40 Q 65 30 60 15" stroke="#FFF" strokeWidth="8" fill="none" strokeLinecap="round" />
        </svg>
      );
    }
  };

  return (
    <div className="start-screen">
      <h1 className="game-title">마스코트 런</h1>
      <p className="game-subtitle">
        전기차와 배터리에 대해 배우는 무한 러너 퀴즈 게임!<br />
        마스코트를 선택하고 10개의 퀴즈를 모두 맞춰보세요!
      </p>
      
      <div className="mascot-selector">
        <div
          className={`mascot-option ${selectedMascot === 'cat' ? 'selected' : ''}`}
          onClick={() => onSelectMascot('cat')}
        >
          <div className="mascot-icon">
            {renderMascotIcon('cat')}
          </div>
          <div className="mascot-label">검은 고양이</div>
        </div>
        
        <div
          className={`mascot-option ${selectedMascot === 'dog' ? 'selected' : ''}`}
          onClick={() => onSelectMascot('dog')}
        >
          <div className="mascot-icon">
            {renderMascotIcon('dog')}
          </div>
          <div className="mascot-label">흰 강아지</div>
        </div>
      </div>
      
      <button
        className="start-button"
        onClick={onStartGame}
        disabled={!selectedMascot}
      >
        게임 시작!
      </button>
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#CCC', textAlign: 'center' }}>
        <p>🎮 조작법: 마우스 클릭 또는 키보드 (O/X, 방향키)</p>
        <p>🏃‍♂️ 3개 정답 시 부스터 획득!</p>
        <p>🎯 10개 퀴즈를 모두 완료하면 승리!</p>
      </div>
    </div>
  );
};

export default StartScreen;
