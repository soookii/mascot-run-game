// @ts-ignore: type provided via custom d.ts
import confetti from 'canvas-confetti';

// 폭죽 효과 함수
export function triggerConfetti() {
  // 중앙에서 폭발하는 폭죽
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  });
  
  // 좌우에서 폭발하는 폭죽
  setTimeout(() => {
    confetti({
      particleCount: 25,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
    });
  }, 200);
  
  setTimeout(() => {
    confetti({
      particleCount: 25,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
    });
  }, 400);
}

// 승리 폭죽 효과
export function triggerVictoryConfetti() {
  // 연속 폭죽 효과
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }
    
    // 랜덤 위치에서 폭죽
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { 
        x: Math.random(),
        y: Math.random() * 0.5 + 0.3 
      },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    });
  }, 100);
}

// 부스터 효과 폭죽
export function triggerBoosterConfetti() {
  confetti({
    particleCount: 20,
    spread: 45,
    origin: { y: 0.8 },
    colors: ['#FF4500', '#FFD700', '#FF6B6B'],
    shapes: ['star']
  });
}
