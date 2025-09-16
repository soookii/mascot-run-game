// 게임 설정 상수들
export const GAME_CONFIG = {
  // 기본 속도 설정
  baseSpeed: 564, // 픽셀/초 (현 상태 대비 약 20% 가속)
  boosterMultiplier: 1.5, // 부스터 속도 배수
  
  // 상자 관련 설정
  chestSpacing: 800, // 상자 간격 (픽셀)
  totalChests: 10, // 총 상자 개수
  
  // 애니메이션 시간 설정
  stumbleMs: 2000, // 넘어짐 지속 시간 (밀리초)
  boosterSeconds: 2, // 부스터 지속 시간 (초)
  quizExplanationMs: 1500, // 퀴즈 설명 표시 시간 (밀리초)
  
  // 부스터 관련 설정
  boosterUnlockCorrect: 3, // 부스터 해제에 필요한 정답 개수
  boosterSpawnDistance: 400, // 부스터 생성 거리 (픽셀)
  
  // 화면 설정
  screenWidth: 1200,
  screenHeight: 600,
  runnerCenterX: 560, // 러너의 화면상 X 위치 (화면 중앙)
  
  // 패럴랙스 설정 (배경을 더 느리게)
  parallax: {
    sky: 0.002,
    skyline: 0.0054, // 빌딩 레이어 약 40% 감속 (0.009 * 0.6)
    road: 0.045
  },
  
  // 접근성 설정
  minButtonSize: 56, // 최소 버튼 크기 (픽셀)
  
  // 효과 설정
  confettiCount: 50, // 폭죽 파티클 개수
  flameTrailLength: 20, // 불꽃 꼬리 길이
} as const;

// 게임 상태 타입
export type GameState = 'IDLE' | 'RUN' | 'QUIZ' | 'STUMBLE' | 'BOOST' | 'FINISH';

// 마스코트 타입
export type MascotType = 'cat' | 'dog';

// 퀴즈 아이템 타입
export interface QuizItem {
  id: string;
  type: 'ox';
  stem: string;
  answer: boolean; // true = O, false = X
  explain: string;
}
