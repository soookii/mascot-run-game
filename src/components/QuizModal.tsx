import React, { useEffect } from 'react';
import { QuizItem } from '../config';

interface QuizModalProps {
  quiz: QuizItem;
  onAnswer: (answer: boolean) => void;
  onClose: () => void;
  showExplanation: boolean;
}

const QuizModal: React.FC<QuizModalProps> = ({
  quiz,
  onAnswer,
  onClose,
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

  return (
    <div className="quiz-modal">
      <div className="quiz-question">
        {quiz.stem}
      </div>
      
      <div className="quiz-buttons">
        <button
          className="quiz-button o"
          onClick={() => handleAnswer(true)}
          style={{ minWidth: '80px', minHeight: '80px' }}
        >
          O
        </button>
        <button
          className="quiz-button x"
          onClick={() => handleAnswer(false)}
          style={{ minWidth: '80px', minHeight: '80px' }}
        >
          X
        </button>
      </div>
      
      {showExplanation && (
        <div className="quiz-explanation">
          {quiz.explain}
        </div>
      )}
    </div>
  );
};

export default QuizModal;
