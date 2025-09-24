import React, { useEffect, useRef, useCallback, useState } from 'react';
import { GameState } from '../state/game';
import { GAME_CONFIG } from '../config';
import { getCurrentSpeed, isStumbleFinished, getChestPositions } from '../state/game';
import Background from './Background';
import Runner from './Runner';
import Chest from './Chest';
import HUD from './HUD';
import QuizModal from './QuizModal';
import Effects from './Effects';
import { soundManager } from '../utils/soundManager';
import questionsData from '../data/questions.json';
// 중복 import 제거됨

interface GameScreenProps {
  gameState: GameState;
  dispatch: React.Dispatch<any>;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameState, dispatch }) => {
  const [stormActive, setStormActive] = useState(false);
  const stormTimerRef = useRef<number | null>(null);
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
    const currentSpeed = getCurrentSpeed(gameState, GAME_CONFIG.baseSpeed);
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


  // 완료 배너 생성 비활성화 (GOAL 제거)

    // 완료 배너 충돌 확인 (더 정확한 충돌 감지)
    if (gameState.finishBannerX) {
      const runnerX = GAME_CONFIG.runnerCenterX;
      const bannerScreenX = gameState.finishBannerX - newWorldX;
      
      if (bannerScreenX <= runnerX + 50 && bannerScreenX >= runnerX - 50) {
        dispatch({ type: 'FINISH_GAME' });
        // 사운드: 승리 전환
        soundManager.transitionToVictory();
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
      soundManager.playCorrectSound(); // 정답 효과음
    } else {
      dispatch({ type: 'STUMBLE' });
      soundManager.playIncorrectSound(); // 오답 효과음
      // 게임 플레이 화면 전면 폭우/번개 시각효과 2.4초간 활성화
      setStormActive(true);
      if (stormTimerRef.current) window.clearTimeout(stormTimerRef.current);
      stormTimerRef.current = window.setTimeout(() => {
        setStormActive(false);
        stormTimerRef.current = null;
      }, 2400);
    }

    // 설명 표시 후 게임 재개 또는 종료
    setTimeout(() => {
      // 마지막 퀴즈 완료 확인 (정답일 때만 다음으로 진행)
      if (answer === gameState.currentQuiz?.answer) {
        if (gameState.currentChestIndex >= GAME_CONFIG.totalChests - 1) {
          dispatch({ type: 'FINISH_GAME' });
        } else {
          dispatch({ type: 'RESUME_RUN' });
        }
      } else {
        // 오답이면 진행하지만 정답 카운트 증가 없음
        if (gameState.currentChestIndex >= GAME_CONFIG.totalChests - 1) {
          dispatch({ type: 'FINISH_GAME' });
        } else {
          dispatch({ type: 'RESUME_RUN' });
        }
      }
    }, GAME_CONFIG.quizExplanationMs);
  }, [dispatch, gameState.currentQuiz, gameState.currentChestIndex]);

  // 완료 배너 관련 로직 삭제됨

  // 상자 충돌 처리
  const handleChestCollision = useCallback(() => {
    if (gameState.currentChestIndex < GAME_CONFIG.totalChests) {
      const quiz = questionsData[gameState.currentChestIndex];
      dispatch({ type: 'TRIGGER_QUIZ', payload: quiz });
    }
  }, [dispatch, gameState.currentChestIndex]);

  const showStorm = stormActive;

  return (
    <div className={`game-container`}>
      <Background worldX={gameState.worldX} />
      
      <div style={{
        position: 'absolute',
        left: '480px', // 꼬리 여백을 고려한 위치 조정
        bottom: '40px', // 땅(도로)에 정확히 붙도록 조정
        zIndex: 9999, // 항상 최상위 레이어
      }}>
        <Runner
          mascot={gameState.selectedMascot || 'yellow'}
          isJumping={gameState.jumpStartTime > 0 && Date.now() - gameState.jumpStartTime < 800}
          isStumbling={gameState.currentState === 'STUMBLE'}
        />
      </div>
      

      {/* 상자들 - 나무보다 위에 배치 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
        {chestPositions.map((x, index) => (
          <Chest
            key={`ch-${index}`}
            x={x}
            worldX={gameState.worldX}
            isOpen={index < gameState.currentChestIndex}
            onCollision={handleChestCollision}
            forceOpen={gameState.quizAnswered && gameState.lastAnswerCorrect === true && index === gameState.currentChestIndex}
            withBurst={gameState.quizAnswered && gameState.lastAnswerCorrect === true && index === gameState.currentChestIndex}
            wasWrong={gameState.quizAnswered && gameState.lastAnswerCorrect === false && index === gameState.currentChestIndex}
            isTrophy={index === GAME_CONFIG.totalChests - 1}
          />
        ))}
      </div>

      {/* 포션/부스터 제거됨 */}

      {/* 완료 배너 제거 */}

      <HUD
        currentChest={gameState.currentChestIndex}
        totalChests={GAME_CONFIG.totalChests}
        streak={gameState.currentStreak}
        totalCorrect={gameState.totalCorrect}
        elapsedTime={gameState.elapsedTime}
        score={gameState.score}
      />

      {/* 오답 시 전체 붉은 오버레이 (최종 렌더) */}
      {showStorm && (
        <div className="wrong-overlay" aria-hidden />
      )}

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
        gameFinished={gameState.gameFinished}
      />

      {/* 축하 모달: 시간 내 도착 시 */}
      {gameState.currentState === 'FINISH' && (
        <div className="victory-modal">
          {gameState.totalCorrect >= 10 ? (
            // 10개 이상 정답시 - 축하 모달 + 불꽃놀이
            <div className="quiz-modal victory-celebration" style={{ background: undefined, borderColor: undefined, fontFamily: 'YourFont, sans-serif' }}>
              <div className="quiz-question" style={{ color: '#E65100', fontSize: '26px', fontWeight: 'bold' }}>
                🎉 대단해요! 🎉
              </div>
              <div className="quiz-question" style={{ color: '#FF8F00', fontSize: '18px', marginBottom: '20px' }}>
                {gameState.totalCorrect}개 문제를 맞췄어요!
              </div>
              
              {/* 웃는 캐릭터 */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <div className="happy-character">
                  <svg width="120" height="120" viewBox="0 0 80 80">
                    {/* 머리 부분 (완전한 원형) */}
                    <circle cx="40" cy="28" r="20" fill="#FFD700" />
                    
                    {/* 몸통 (둥근 형태) */}
                    <ellipse cx="40" cy="57" rx="18" ry="20" fill="#FFD700" />
                    
                    {/* 팔 (더 둥글게) */}
                    <ellipse cx="20" cy="52" rx="10" ry="6" fill="#FFD700" />
                    <ellipse cx="60" cy="52" rx="10" ry="6" fill="#FFD700" />
                    
                    {/* 다리 (더 둥글게) */}
                    <ellipse cx="32" cy="75" rx="8" ry="6" fill="#FFD700" />
                    <ellipse cx="48" cy="75" rx="8" ry="6" fill="#FFD700" />
                    
                    {/* 눈웃음 표정 */}
                    <path d="M30 22 Q32 18 34 22" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M46 22 Q48 18 50 22" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                    
                    {/* 볼 */}
                    <circle cx="24" cy="30" r="4" fill="#FFAB91" />
                    <circle cx="56" cy="30" r="4" fill="#FFAB91" />
                    
                    {/* 큰 미소 */}
                    <path d="M30 36 Q40 44 50 36" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              
              {/* 캐릭터 주변 찌릿찌릿 전기 이펙트 */}
              <div className="victory-electric-container">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className={`victory-electric victory-electric-${i}`}>
                    <div className="electric-spark" />
                  </div>
                ))}
              </div>
              
              {/* 불꽃놀이 이펙트 */}
              <div className="fireworks-container">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className={`firework firework-${i}`}>
                    <div className="firework-explosion">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <div key={j} className={`firework-particle particle-${j}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                className="quiz-button o"
                onClick={() => window.location.reload()}
                style={{ minWidth: '120px', minHeight: '40px', borderRadius: '20px', fontSize: '16px' }}
              >
                다시 하기
              </button>
            </div>
          ) : (
            // 10개 미만 정답시 - 기본 축하 모달
            <div className="quiz-modal" style={{ background: undefined, borderColor: undefined, fontFamily: 'YourFont, sans-serif' }}>
              <div className="quiz-question" style={{ color: '#2E7D32', fontSize: '22px', fontWeight: 'bold' }}>
                수고했어요! 🎉
              </div>
              <div className="quiz-question" style={{ color: '#388E3C', fontSize: '16px', marginBottom: '20px' }}>
                {gameState.totalCorrect}개 문제를 맞췄어요!
              </div>
              
              {/* 웃는 캐릭터 */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <div className="happy-character">
                  <svg width="100" height="100" viewBox="0 0 80 80">
                    {/* 머리 부분 (완전한 원형) */}
                    <circle cx="40" cy="28" r="20" fill="#FFD700" />
                    
                    {/* 몸통 (둥근 형태) */}
                    <ellipse cx="40" cy="57" rx="18" ry="20" fill="#FFD700" />
                    
                    {/* 팔 (더 둥글게) */}
                    <ellipse cx="20" cy="52" rx="10" ry="6" fill="#FFD700" />
                    <ellipse cx="60" cy="52" rx="10" ry="6" fill="#FFD700" />
                    
                    {/* 다리 (더 둥글게) */}
                    <ellipse cx="32" cy="75" rx="8" ry="6" fill="#FFD700" />
                    <ellipse cx="48" cy="75" rx="8" ry="6" fill="#FFD700" />
                    
                    {/* 눈웃음 표정 */}
                    <path d="M30 22 Q32 18 34 22" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M46 22 Q48 18 50 22" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
                    
                    {/* 볼 */}
                    <circle cx="24" cy="30" r="4" fill="#FFAB91" />
                    <circle cx="56" cy="30" r="4" fill="#FFAB91" />
                    
                    {/* 미소 */}
                    <path d="M32 36 Q40 42 48 36" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              
              <div style={{ display:'flex', justifyContent:'center', margin:'10px 0 20px' }}>
                <svg width="120" height="100" viewBox="0 0 120 100">
                  <g transform="translate(20 10)">
                    <rect x="0" y="30" width="80" height="50" rx="8" ry="8" fill="#8B4513" />
                    <rect x="0" y="20" width="80" height="20" rx="8" ry="8" fill="#D2691E" />
                    <rect x="0" y="20" width="80" height="20" rx="8" ry="8" fill="none" stroke="#FFD54F" strokeWidth="2" />
                    {/* 튀어나오는 뚜껑 */}
                    <rect x="0" y="10" width="80" height="10" rx="6" ry="6" fill="#FFB74D">
                      <animate attributeName="y" values="10;0;10" dur="1.2s" repeatCount="indefinite" />
                    </rect>
                    {/* 반짝이 */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <circle key={i} cx={40} cy={20} r={2} fill="#FFD54F">
                        <animateTransform attributeName="transform" type="translate" values={`0,0; ${(i-4)*10}, -${20 + (i%3)*8}`} dur={`${0.9 + (i%3)*0.2}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0" dur={`${0.9 + (i%3)*0.2}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                  </g>
                </svg>
              </div>
              <button
                className="quiz-button o"
                onClick={() => window.location.reload()}
                style={{ minWidth: '120px', minHeight: '40px', borderRadius: '20px', fontSize: '16px' }}
              >
                다시 하기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 오답 시 폭우 + 번개 섬광 (맨 앞 레이어 - 최종 렌더) */}
      {showStorm && (
        <div className="storm-overlay" aria-hidden style={{ position:'absolute', inset:0, zIndex: 11000, pointerEvents:'none' }}>
          <div className="rain-layer" style={{ zIndex: 11000 }}>
            <div className="rain rain-fg" />
            <div className="rain rain-mg" />
            <div className="rain rain-bg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
