import React, { useEffect, useRef, useCallback } from 'react';
import { GameState } from '../state/game';
import { GAME_CONFIG } from '../config';
import { getCurrentSpeed, isStumbleFinished, shouldSpawnFinishBanner, getChestPositions } from '../state/game';
import Background from './Background';
import Runner from './Runner';
import Chest from './Chest';
import Potion from './Potion';
import FinishBanner from './FinishBanner';
import HUD from './HUD';
import QuizModal from './QuizModal';
import Effects from './Effects';
import questionsData from '../data/questions.json';

interface GameScreenProps {
  gameState: GameState;
  dispatch: React.Dispatch<any>;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameState, dispatch }) => {
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const chestPositions = getChestPositions(GAME_CONFIG.totalChests, GAME_CONFIG.chestSpacing);

  // 게임 루프
  const gameLoop = useCallback((currentTime: number) => {
    if (gameState.currentState === 'IDLE' || gameState.currentState === 'QUIZ') {
      // QUIZ/IDLE 상태에서는 프레임을 계속 스케줄하지 않고 정지
      return;
    }

    // 프레임 급변시 과도한 이동을 방지하기 위해 델타타임 클램핑
    let deltaTime = currentTime - lastTimeRef.current;
    deltaTime = Math.min(34, Math.max(0, deltaTime)); // 최대 ~34ms (약 30FPS 구간)로 제한
    lastTimeRef.current = currentTime;

    // 속도 계산
    const currentSpeed = getCurrentSpeed(gameState, GAME_CONFIG.baseSpeed, GAME_CONFIG.boosterMultiplier);
    const newWorldX = gameState.worldX + (currentSpeed * deltaTime / 1000);

    // 위치 업데이트
    dispatch({
      type: 'UPDATE_POSITION',
      payload: { worldX: newWorldX, deltaTime }
    });

    // 넘어짐 상태 확인
    if (gameState.currentState === 'STUMBLE' && isStumbleFinished(gameState)) {
      dispatch({ type: 'RESUME_RUN' });
    }

    // 상자 충돌 확인 (정확한 충돌 감지)
    if (gameState.currentState === 'RUN' && gameState.currentChestIndex < GAME_CONFIG.totalChests) {
      const currentChestX = chestPositions[gameState.currentChestIndex];
      const runnerX = GAME_CONFIG.runnerCenterX; // 러너의 화면상 위치
      const chestScreenX = currentChestX - newWorldX; // 상자의 화면상 위치
      
      // 러너가 상자를 지나칠 때만 퀴즈 트리거 (상자가 화면에 보이고 러너와 충돌할 때)
      if (chestScreenX > -50 && chestScreenX < 1200 && 
          chestScreenX <= runnerX + 30 && chestScreenX >= runnerX - 30) {
        const quiz = questionsData[gameState.currentChestIndex];
        dispatch({ type: 'TRIGGER_QUIZ', payload: quiz });
      }
    }

    // 부스터 포션 충돌 확인 (자동으로 먹기)
    if (gameState.potionX) {
      const runnerX = GAME_CONFIG.runnerCenterX;
      const potionScreenX = gameState.potionX - newWorldX;
      
      // 더 넓은 범위로 자동으로 부스터 획득
      if (potionScreenX <= runnerX + 50 && potionScreenX >= runnerX - 50) {
        dispatch({ type: 'ACTIVATE_BOOSTER' });
      }
    }

    // 완료 배너 생성
    if (shouldSpawnFinishBanner(gameState) && !gameState.finishBannerX) {
      dispatch({
        type: 'SET_FINISH_BANNER',
        payload: newWorldX + 200
      });
    }

    // 완료 배너 충돌 확인 (더 정확한 충돌 감지)
    if (gameState.finishBannerX) {
      const runnerX = GAME_CONFIG.runnerCenterX;
      const bannerScreenX = gameState.finishBannerX - newWorldX;
      
      if (bannerScreenX <= runnerX + 50 && bannerScreenX >= runnerX - 50) {
        dispatch({ type: 'FINISH_GAME' });
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, dispatch]);

  // 게임 루프 시작/중지
  useEffect(() => {
    if (gameState.currentState === 'RUN' || gameState.currentState === 'STUMBLE' || gameState.currentState === 'BOOST') {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.currentState, gameLoop]);

  // 퀴즈 답변 처리
  const handleQuizAnswer = useCallback((answer: boolean) => {
    dispatch({ type: 'ANSWER_QUIZ', payload: answer });
    
    // 정답/오답 효과
    if (answer === gameState.currentQuiz?.answer) {
      dispatch({ type: 'JUMP' });
    } else {
      dispatch({ type: 'STUMBLE' });
    }

    // 설명 표시 후 게임 재개
    setTimeout(() => {
      dispatch({ type: 'RESUME_RUN' });
    }, GAME_CONFIG.quizExplanationMs);
  }, [dispatch, gameState.currentQuiz]);

  // 부스터 포션 충돌 처리
  const handlePotionCollision = useCallback(() => {
    dispatch({ type: 'ACTIVATE_BOOSTER' });
  }, [dispatch]);

  // 완료 배너 충돌 처리
  const handleFinishCollision = useCallback(() => {
    dispatch({ type: 'FINISH_GAME' });
  }, [dispatch]);

  // 상자 충돌 처리
  const handleChestCollision = useCallback(() => {
    if (gameState.currentChestIndex < GAME_CONFIG.totalChests) {
      const quiz = questionsData[gameState.currentChestIndex];
      dispatch({ type: 'TRIGGER_QUIZ', payload: quiz });
    }
  }, [dispatch, gameState.currentChestIndex]);

  return (
    <div className="game-container">
      <Background worldX={gameState.worldX} />
      
      <div style={{
        position: 'absolute',
        left: '480px', // 꼬리 여백을 고려한 위치 조정
        bottom: '40px', // 땅(도로)에 정확히 붙도록 조정
        zIndex: 10,
      }}>
        <Runner
          mascot={gameState.selectedMascot || 'cat'}
          isJumping={gameState.jumpStartTime > 0 && Date.now() - gameState.jumpStartTime < 800}
          isStumbling={gameState.currentState === 'STUMBLE'}
          hasBooster={gameState.boosterActive}
        />
      </div>
      

      {/* 상자들 */}
      {chestPositions.map((x, index) => (
        <Chest
          key={index}
          x={x}
          worldX={gameState.worldX}
          isOpen={index < gameState.currentChestIndex}
          onCollision={handleChestCollision}
          forceOpen={gameState.quizAnswered && gameState.lastAnswerCorrect === true && index === gameState.currentChestIndex - 1}
          withBurst={gameState.quizAnswered && gameState.lastAnswerCorrect === true && index === gameState.currentChestIndex - 1}
        />
      ))}

      {/* 부스터 포션 */}
      {gameState.potionX && (
        <Potion
          x={gameState.potionX}
          worldX={gameState.worldX}
          onCollision={handlePotionCollision}
        />
      )}

      {/* 완료 배너 */}
      {gameState.finishBannerX && (
        <FinishBanner
          x={gameState.finishBannerX}
          worldX={gameState.worldX}
          onCollision={handleFinishCollision}
        />
      )}

      <HUD
        currentChest={gameState.currentChestIndex}
        totalChests={GAME_CONFIG.totalChests}
        streak={gameState.currentStreak}
        totalCorrect={gameState.totalCorrect}
        boosterActive={gameState.boosterActive}
        boosterTimeLeft={gameState.boosterTimeLeft}
        elapsedTime={gameState.elapsedTime}
      />

      {/* 퀴즈 모달 */}
      {gameState.currentState === 'QUIZ' && gameState.currentQuiz && (
        <QuizModal
          quiz={gameState.currentQuiz}
          onAnswer={handleQuizAnswer}
          onClose={() => {}}
          showExplanation={gameState.quizAnswered}
        />
      )}

      {/* 효과 */}
      <Effects
        isCorrect={gameState.lastAnswerCorrect}
        isJumping={gameState.jumpStartTime > 0 && Date.now() - gameState.jumpStartTime < 800}
        hasBooster={gameState.boosterActive}
        gameFinished={gameState.gameFinished}
      />
    </div>
  );
};

export default GameScreen;
