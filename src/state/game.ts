import { QuizItem, GAME_CONFIG } from '../config';

// 게임 상태 인터페이스
export interface GameState {
  // 현재 게임 상태
  currentState: 'IDLE' | 'RUN' | 'QUIZ' | 'STUMBLE' | 'BOOST' | 'FINISH';
  
  // 선택된 마스코트
  selectedMascot: 'cat' | 'dog' | null;
  
  // 월드 위치 (카메라 위치)
  worldX: number;
  
  // 게임 진행 상태
  currentChestIndex: number;
  totalCorrect: number;
  currentStreak: number;
  
  // 부스터 상태
  boosterActive: boolean;
  boosterTimeLeft: number;
  potionSpawned: boolean;
  potionX: number | null;
  
  // 시간 관련
  startTime: number;
  elapsedTime: number;
  
  // 퀴즈 상태
  currentQuiz: QuizItem | null;
  quizAnswered: boolean;
  lastAnswerCorrect: boolean | null;
  
  // 애니메이션 상태
  stumbleEndTime: number;
  jumpStartTime: number;
  
  // 게임 종료 상태
  gameFinished: boolean;
  finishBannerX: number | null;
}

// 초기 게임 상태
export const initialGameState: GameState = {
  currentState: 'IDLE',
  selectedMascot: null,
  worldX: 0,
  currentChestIndex: 0,
  totalCorrect: 0,
  currentStreak: 0,
  boosterActive: false,
  boosterTimeLeft: 0,
  potionSpawned: false,
  potionX: null,
  startTime: 0,
  elapsedTime: 0,
  currentQuiz: null,
  quizAnswered: false,
  lastAnswerCorrect: null,
  stumbleEndTime: 0,
  jumpStartTime: 0,
  gameFinished: false,
  finishBannerX: null,
};

// 게임 액션 타입
export type GameAction =
  | { type: 'SELECT_MASCOT'; payload: 'cat' | 'dog' }
  | { type: 'START_GAME' }
  | { type: 'UPDATE_POSITION'; payload: { worldX: number; deltaTime: number } }
  | { type: 'TRIGGER_QUIZ'; payload: QuizItem }
  | { type: 'ANSWER_QUIZ'; payload: boolean }
  | { type: 'RESUME_RUN' }
  | { type: 'ACTIVATE_BOOSTER' }
  | { type: 'DEACTIVATE_BOOSTER' }
  | { type: 'STUMBLE' }
  | { type: 'JUMP' }
  | { type: 'SET_FINISH_BANNER'; payload: number }
  | { type: 'FINISH_GAME' }
  | { type: 'RESET_GAME' };

// 게임 상태 리듀서
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_MASCOT':
      return {
        ...state,
        selectedMascot: action.payload,
      };

    case 'START_GAME':
      return {
        ...state,
        currentState: 'RUN',
        startTime: Date.now(),
        worldX: 0,
        currentChestIndex: 0,
        totalCorrect: 0,
        currentStreak: 0,
        boosterActive: false,
        boosterTimeLeft: 0,
        potionSpawned: false,
        potionX: null,
        gameFinished: false,
        finishBannerX: null,
      };

    case 'UPDATE_POSITION':
      const newWorldX = action.payload.worldX;
      const deltaTime = action.payload.deltaTime;
      
      // 부스터 시간 업데이트
      let newBoosterTimeLeft = state.boosterTimeLeft;
      let newBoosterActive = state.boosterActive;
      
      if (state.boosterActive) {
        newBoosterTimeLeft = Math.max(0, state.boosterTimeLeft - deltaTime);
        if (newBoosterTimeLeft === 0) {
          newBoosterActive = false;
        }
      }
      
      // 경과 시간 업데이트
      const newElapsedTime = state.startTime > 0 ? Date.now() - state.startTime : 0;
      
      return {
        ...state,
        worldX: newWorldX,
        boosterActive: newBoosterActive,
        boosterTimeLeft: newBoosterTimeLeft,
        elapsedTime: newElapsedTime,
      };

    case 'TRIGGER_QUIZ':
      return {
        ...state,
        currentState: 'QUIZ',
        currentQuiz: action.payload,
        quizAnswered: false,
        lastAnswerCorrect: null,
      };

    case 'ANSWER_QUIZ':
      const isCorrect = action.payload === state.currentQuiz?.answer;
      const newTotalCorrect = isCorrect ? state.totalCorrect + 1 : state.totalCorrect;
      const newStreak = isCorrect ? state.currentStreak + 1 : 0;

      // 부스터 해제 조건 확인 (자동 적용)
      const unlockBooster = newTotalCorrect >= GAME_CONFIG.boosterUnlockCorrect;

      return {
        ...state,
        quizAnswered: true,
        lastAnswerCorrect: isCorrect,
        totalCorrect: newTotalCorrect,
        currentStreak: newStreak,
        boosterActive: unlockBooster ? true : state.boosterActive,
        boosterTimeLeft: unlockBooster ? GAME_CONFIG.boosterSeconds * 1000 : state.boosterTimeLeft,
        potionSpawned: unlockBooster ? false : state.potionSpawned,
        potionX: unlockBooster ? null : state.potionX,
      };

    case 'RESUME_RUN':
      return {
        ...state,
        currentState: 'RUN',
        currentQuiz: null,
        quizAnswered: false,
        lastAnswerCorrect: null,
        currentChestIndex: state.currentChestIndex + 1,
      };

    case 'ACTIVATE_BOOSTER':
      return {
        ...state,
        boosterActive: true,
        boosterTimeLeft: GAME_CONFIG.boosterSeconds * 1000,
        potionX: null, // 부스터를 먹었으므로 제거
      };

    case 'DEACTIVATE_BOOSTER':
      return {
        ...state,
        boosterActive: false,
        boosterTimeLeft: 0,
      };

    case 'STUMBLE':
      return {
        ...state,
        currentState: 'STUMBLE',
        stumbleEndTime: Date.now() + 2000, // 2초 후 복구
      };

    case 'JUMP':
      return {
        ...state,
        jumpStartTime: Date.now(),
      };

    case 'SET_FINISH_BANNER':
      return {
        ...state,
        finishBannerX: action.payload,
      };

    case 'FINISH_GAME':
      return {
        ...state,
        currentState: 'FINISH',
        gameFinished: true,
        finishBannerX: state.finishBannerX || state.worldX,
      };

    case 'RESET_GAME':
      return initialGameState;

    default:
      return state;
  }
}

// 헬퍼 함수들
export function getCurrentSpeed(state: GameState, baseSpeed: number, boosterMultiplier: number): number {
  if (state.currentState === 'STUMBLE' || state.currentState === 'QUIZ') {
    return 0;
  }
  
  if (state.boosterActive) {
    return baseSpeed * boosterMultiplier;
  }
  
  return baseSpeed;
}

export function shouldSpawnFinishBanner(state: GameState): boolean {
  return state.currentChestIndex >= 10 && !state.gameFinished;
}

export function isStumbleFinished(state: GameState): boolean {
  return state.currentState === 'STUMBLE' && Date.now() >= state.stumbleEndTime;
}

export function getChestPositions(totalChests: number, chestSpacing: number): number[] {
  const positions: number[] = [];
  for (let i = 0; i < totalChests; i++) {
    positions.push((i + 1) * chestSpacing);
  }
  return positions;
}
