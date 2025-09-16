import React from 'react';
import { MascotType } from '../config';

interface ResultScreenProps {
  mascot: MascotType;
  totalCorrect: number;
  totalQuestions: number;
  elapsedTime: number;
  onPlayAgain: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  mascot,
  totalCorrect,
  totalQuestions,
  elapsedTime,
  onPlayAgain,
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreMessage = () => {
    const percentage = (totalCorrect / totalQuestions) * 100;
    if (percentage === 100) {
      return "완벽해요! 🎉";
    } else if (percentage >= 80) {
      return "훌륭해요! 👏";
    } else if (percentage >= 60) {
      return "잘했어요! 👍";
    } else {
      return "다시 도전해보세요! 💪";
    }
  };

  const renderMascotDance = () => {
    if (mascot === 'cat') {
      return (
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          className="dance-animation"
        >
          {/* 고양이 몸체 */}
          <ellipse cx="50" cy="60" rx="30" ry="35" fill="#333" />
          <circle cx="50" cy="35" r="25" fill="#333" />
          
          {/* 고양이 귀 */}
          <polygon points="30,25 35,10 40,25" fill="#333" />
          <polygon points="60,25 65,10 70,25" fill="#333" />
          
          {/* 고양이 귀 안쪽 */}
          <polygon points="32,23 35,15 38,23" fill="#FF69B4" />
          <polygon points="62,23 65,15 68,23" fill="#FF69B4" />
          
          {/* 고양이 눈 */}
          <ellipse cx="42" cy="32" rx="4" ry="6" fill="white" />
          <ellipse cx="58" cy="32" rx="4" ry="6" fill="white" />
          <circle cx="42" cy="32" r="3" fill="#333" />
          <circle cx="58" cy="32" r="3" fill="#333" />
          
          {/* 고양이 코 */}
          <polygon points="50,40 47,45 53,45" fill="#FF69B4" />
          
          {/* 고양이 꼬리 */}
          <path d="M 80 60 Q 90 40 85 25" stroke="#333" strokeWidth="8" fill="none" strokeLinecap="round" />
          
          {/* 축하 별들 */}
          <polygon points="20,20 25,10 30,20 20,15 10,20" fill="#FFD700" />
          <polygon points="80,15 85,5 90,15 80,10 70,15" fill="#FFD700" />
        </svg>
      );
    } else {
      return (
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          className="dance-animation"
        >
          {/* 강아지 몸체 */}
          <ellipse cx="50" cy="60" rx="35" ry="35" fill="#FFF" />
          <circle cx="50" cy="35" r="30" fill="#FFF" />
          
          {/* 강아지 귀 */}
          <ellipse cx="35" cy="30" rx="12" ry="20" fill="#FFF" />
          <ellipse cx="65" cy="30" rx="12" ry="20" fill="#FFF" />
          
          {/* 강아지 귀 안쪽 */}
          <ellipse cx="35" cy="30" rx="6" ry="12" fill="#FFB6C1" />
          <ellipse cx="65" cy="30" rx="6" ry="12" fill="#FFB6C1" />
          
          {/* 강아지 눈 */}
          <circle cx="42" cy="32" r="4" fill="#333" />
          <circle cx="58" cy="32" r="4" fill="#333" />
          
          {/* 강아지 눈 하이라이트 */}
          <circle cx="43" cy="31" r="1.5" fill="white" />
          <circle cx="59" cy="31" r="1.5" fill="white" />
          
          {/* 강아지 코 */}
          <circle cx="50" cy="42" r="3" fill="#333" />
          
          {/* 강아지 혀 */}
          <ellipse cx="50" cy="50" rx="4" ry="3" fill="#FF69B4" />
          
          {/* 강아지 꼬리 */}
          <path d="M 85 60 Q 100 40 95 20" stroke="#FFF" strokeWidth="10" fill="none" strokeLinecap="round" />
          
          {/* 축하 별들 */}
          <polygon points="20,20 25,10 30,20 20,15 10,20" fill="#FFD700" />
          <polygon points="80,15 85,5 90,15 80,10 70,15" fill="#FFD700" />
        </svg>
      );
    }
  };

  return (
    <div className="result-screen">
      <h1 className="result-title">게임 완료!</h1>
      
      {renderMascotDance()}
      
      <div className="result-stats">
        <div className="result-stat">
          <div className="result-stat-value">{totalCorrect}</div>
          <div className="result-stat-label">정답</div>
        </div>
        
        <div className="result-stat">
          <div className="result-stat-value">{totalQuestions}</div>
          <div className="result-stat-label">총 문제</div>
        </div>
        
        <div className="result-stat">
          <div className="result-stat-value">{formatTime(elapsedTime)}</div>
          <div className="result-stat-label">소요 시간</div>
        </div>
      </div>
      
      <div style={{ 
        fontSize: '20px', 
        marginBottom: '30px', 
        color: '#FFD700',
        textAlign: 'center'
      }}>
        {getScoreMessage()}
      </div>
      
      <button
        className="play-again-button"
        onClick={onPlayAgain}
      >
        다시 플레이
      </button>
      
      <div style={{ 
        marginTop: '20px', 
        fontSize: '14px', 
        color: '#CCC',
        textAlign: 'center'
      }}>
        전기차와 배터리에 대해 더 많이 배웠나요? 🚗⚡
      </div>
    </div>
  );
};

export default ResultScreen;
