// TTS (Text-to-Speech) 유틸리티
class TTSService {
  private synth: SpeechSynthesis | null = null;
  private isEnabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isEnabled = true;
    }
  }

  // TTS 활성화 여부 확인
  isAvailable(): boolean {
    return this.isEnabled && this.synth !== null;
  }

  // 텍스트 읽기
  speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
  }): void {
    if (!this.isAvailable()) {
      console.warn('TTS is not available');
      return;
    }

    // 기존 음성 중지
    this.synth!.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;
    utterance.lang = options?.lang || 'ko-KR';

    this.synth!.speak(utterance);
  }

  // 음성 중지
  stop(): void {
    if (this.isAvailable()) {
      this.synth!.cancel();
    }
  }

  // 퀴즈 문제 읽기
  speakQuiz(question: string): void {
    this.speak(question, {
      rate: 0.8,
      pitch: 1.1,
      volume: 0.8
    });
  }

  // 정답 피드백 읽기
  speakFeedback(isCorrect: boolean, explanation: string): void {
    const feedback = isCorrect ? '정답이에요!' : '틀렸어요.';
    this.speak(feedback, {
      rate: 0.9,
      pitch: isCorrect ? 1.2 : 0.9,
      volume: 0.7
    });

    // 설명 읽기
    setTimeout(() => {
      this.speak(explanation, {
        rate: 0.7,
        pitch: 1.0,
        volume: 0.6
      });
    }, 1000);
  }

  // 게임 시작 안내
  speakGameStart(): void {
    this.speak('게임을 시작해요!', {
      rate: 0.8,
      pitch: 1.1,
      volume: 0.8
    });
  }

  // 게임 종료 안내
  speakGameEnd(correctCount: number, totalCount: number): void {
    const message = `게임이 끝났어요! ${correctCount}개 중 ${totalCount}개를 맞췄어요!`;
    this.speak(message, {
      rate: 0.8,
      pitch: 1.0,
      volume: 0.8
    });
  }
}

// 싱글톤 인스턴스
export const tts = new TTSService();

// TTS 토글 함수
export function toggleTTS(): boolean {
  if (!tts.isAvailable()) {
    return false;
  }
  
  // 간단한 토글 로직 (실제로는 상태 관리 필요)
  return true;
}
