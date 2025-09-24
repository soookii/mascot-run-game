import { QuizItem } from '../config';

// 게임 상태 인터페이스
export interface GameState {
  // 현재 게임 상태
  currentState: 'IDLE' | 'RUN' | 'QUIZ' | 'STUMBLE' | 'BOOST' | 'FINISH';
  
  // 선택된 마스코트
  selectedMascot: 'yellow' | 'blue' | null;
  
  // 월드 위치 (카메라 위치)
  worldX: number;
  
  // 게임 진행 상태
  currentChestIndex: number;
  totalCorrect: number;
  currentStreak: number;
  score: number;
  
  
  // 시간 관련
  startTime: number;
  elapsedTime: number;
  // 일시정지(퀴즈) 시작 시각
  pauseStartMs?: number;
  
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

  // 학교 정보
  schoolName: string;
  grade: string;
  classroom: string;
}

// 초기 게임 상태
export const initialGameState: GameState = {
  currentState: 'IDLE',
  selectedMascot: null,
  worldX: 0,
  currentChestIndex: 0,
  totalCorrect: 0,
  currentStreak: 0,
  score: 0,
  startTime: 0,
  elapsedTime: 0,
  pauseStartMs: 0,
  currentQuiz: null,
  quizAnswered: false,
  lastAnswerCorrect: null,
  stumbleEndTime: 0,
  jumpStartTime: 0,
  gameFinished: false,
  finishBannerX: null,
  schoolName: '',
  grade: '',
  classroom: '',
};

// 게임 액션 타입
export type GameAction =
  | { type: 'SELECT_MASCOT'; payload: 'yellow' | 'blue' }
  | { type: 'START_GAME' }
  | { type: 'UPDATE_POSITION'; payload: { worldX: number; deltaTime: number } }
  | { type: 'TRIGGER_QUIZ'; payload: QuizItem }
  | { type: 'ANSWER_QUIZ'; payload: boolean }
  | { type: 'ABSORB_ENERGY' }
  | { type: 'RESUME_RUN' }
  | { type: 'RESUME_RUN_NO_ADVANCE' }
  | { type: 'STUMBLE' }
  | { type: 'JUMP' }
  | { type: 'SET_FINISH_BANNER'; payload: number }
  | { type: 'FINISH_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_SCHOOL_INFO'; payload: { schoolName: string; grade: string; classroom: string } };
  

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
        elapsedTime: 0,
        worldX: 0,
        currentChestIndex: 0,
        totalCorrect: 0,
        currentStreak: 0,
        gameFinished: false,
        finishBannerX: null,
      };

    case 'UPDATE_POSITION':
      const newWorldX = action.payload.worldX;
      
      // 경과 시간 업데이트 (스톱워치 형태)
      const now = Date.now();
      const newElapsedTime = state.startTime > 0 ? now - state.startTime : 0;
      
      return {
        ...state,
        worldX: newWorldX,
        elapsedTime: newElapsedTime,
      };

    case 'TRIGGER_QUIZ':
      return {
        ...state,
        currentState: 'QUIZ',
        currentQuiz: action.payload,
        quizAnswered: false,
        lastAnswerCorrect: null,
        pauseStartMs: Date.now(),
      };

    case 'ANSWER_QUIZ':
      const isCorrect = action.payload === state.currentQuiz?.answer;
      const newTotalCorrect = isCorrect ? state.totalCorrect + 1 : state.totalCorrect;
      const newStreak = isCorrect ? state.currentStreak + 1 : 0;
      // 점수 계산: 난이도 기본 점수 + 연속 보너스(맞춘 개수 * 10점)
      let added = 0;
      if (isCorrect) {
        // 난이도 기본 점수
        const diff = state.currentQuiz?.difficulty;
        const base = diff === 'hard' ? 150 : diff === 'medium' ? 100 : 50;
        added = base;
        // 연속 보너스: 현재 연속 정답 개수 * 10점
        added += newStreak * 10;
      }

      return {
        ...state,
        quizAnswered: true,
        lastAnswerCorrect: isCorrect,
        totalCorrect: newTotalCorrect,
        currentStreak: newStreak,
        score: state.score + added,
      };

    case 'RESUME_RUN':
      return {
        ...state,
        currentState: 'RUN',
        currentQuiz: null,
        quizAnswered: false,
        lastAnswerCorrect: null,
        currentChestIndex: state.currentChestIndex + 1,
        // 퀴즈로 멈춘 시간만큼 시작 시각을 앞으로 당겨 경과시간에서 제외
        startTime: state.pauseStartMs ? state.startTime + (Date.now() - state.pauseStartMs) : state.startTime,
        pauseStartMs: 0,
      };

    case 'RESUME_RUN_NO_ADVANCE':
      return {
        ...state,
        currentState: 'RUN',
        currentQuiz: null,
        quizAnswered: false,
        lastAnswerCorrect: null,
        startTime: state.pauseStartMs ? state.startTime + (Date.now() - state.pauseStartMs) : state.startTime,
        pauseStartMs: 0,
      };


    case 'STUMBLE':
      return {
        ...state,
        currentState: 'STUMBLE',
        stumbleEndTime: Date.now() + 3000, // 3초 후 복구 (1초 증가)
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

    case 'SET_SCHOOL_INFO':
      return {
        ...state,
        schoolName: action.payload.schoolName,
        grade: action.payload.grade,
        classroom: action.payload.classroom,
      };

    default:
      return state;
  }
}

// 헬퍼 함수들
export function getCurrentSpeed(state: GameState, baseSpeed: number): number {
  if (state.currentState === 'STUMBLE' || state.currentState === 'QUIZ') {
    return 0;
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
