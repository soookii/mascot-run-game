import React, { useEffect } from 'react';
import { QuizItem } from '../config';

interface QuizModalProps {
  quiz: QuizItem;
  onAnswer: (answer: boolean) => void;
  onClose?: () => void; // 내부에서 미사용이므로 선택적 처리
  showExplanation: boolean;
}

const QuizModal: React.FC<QuizModalProps> = ({
  quiz,
  onAnswer,
  onClose: _onClose,
  showExplanation,
}) => {
  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'o':
        case 'enter':
          onAnswer(true);
          break;
        case 'x':
        case 'escape':
          onAnswer(false);
          break;
        case 'arrowleft':
          onAnswer(false);
          break;
        case 'arrowright':
          onAnswer(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onAnswer]);

  const handleAnswer = (answer: boolean) => {
    onAnswer(answer);
  };

  const PixelO: React.FC = () => (
    <svg viewBox="0 0 16 16" className="pixel-icon" shapeRendering="crispEdges">
      <rect x="3" y="3" width="10" height="10" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter" />
    </svg>
  );

  const PixelX: React.FC = () => (
    <svg viewBox="0 0 16 16" className="pixel-icon" shapeRendering="crispEdges">
      <path d="M3 3 L13 13 M13 3 L3 13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="butt" strokeLinejoin="miter" fill="none" />
    </svg>
  );

  return (
    <div className="quiz-modal" role="dialog" aria-modal="true" style={{ fontFamily: 'YourFont, sans-serif' }}>
      <div className="quiz-question">
        {quiz.stem}
      </div>
      
      <div className="quiz-buttons">
        <button
          className="quiz-button o"
          onClick={() => handleAnswer(true)}
          style={{ minWidth: '86px', minHeight: '86px' }}
        >
          <PixelO />
        </button>
        <button
          className="quiz-button x"
          onClick={() => handleAnswer(false)}
          style={{ minWidth: '86px', minHeight: '86px' }}
        >
          <PixelX />
        </button>
      </div>
      
      {showExplanation && (
        <div className="quiz-explanation">
          {quiz.explain}
        </div>
      )}

      {/* 난이도 표시 */}
      {quiz.difficulty && (
        <div style={{ position:'absolute', right: 12, bottom: 10, fontSize: 12, color: '#666' }}>
          난이도: {quiz.difficulty === 'easy' ? '하' : quiz.difficulty === 'medium' ? '중' : '상'}
        </div>
      )}
    </div>
  );
};

export default QuizModal;
