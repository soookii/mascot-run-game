class SoundManager {
  private audioContext: AudioContext | null = null;
  private backgroundMusic: { source: AudioBufferSourceNode | null; gainNode: GainNode | null } = { source: null, gainNode: null };
  private isBackgroundPlaying = false;
  private isVictoryPlaying = false;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // 더 신나는 배경음악 (8초 루프, 120BPM, 신나는 신스/킥/클랩 패턴)
  private createBackgroundMusic() {
    if (!this.audioContext) return;
    const duration = 8; // 8초 루프
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    // 120BPM, 4/4, 코드 진행: C -> Am -> F -> G (2초씩)
    const chords: number[][] = [
      [261.63, 329.63, 392.0],   // C4,E4,G4
      [220.0, 261.63, 329.63],   // A3,C4,E4
      [349.23, 440.0, 523.25],   // F4,A4,C5
      [392.0, 493.88, 587.33],   // G4,B4,D5
    ];
    const sectionDur = duration / chords.length; // 2초

    // 펌핑 신스 패드
    for (let j = 0; j < data.length; j++) {
      const t = j / sampleRate;
      const section = Math.floor(t / sectionDur) % chords.length;
      const chord = chords[section];
      const local = t % (60/120); // 0.5s (8분음표)마다 펌핑
      const pump = Math.exp(-local * 6);
      let v = 0;
      for (const f of chord) {
        const saw = 2 * ((t * f) - Math.floor(0.5 + t * f));
        v += 0.18 * saw + 0.1 * Math.sin(2 * Math.PI * f * t);
      }
      data[j] += v * pump * 0.35;
    }

    // 리드/플럭 멜로디 (신나는 싱코페이션)
    const bpm = 120; const spb = 60 / bpm;
    for (let step = 0; step < Math.floor(duration / (spb/2)); step++) {
      const t0 = step * (spb/2); // 8분음표
      const chord = chords[Math.floor(t0 / sectionDur) % chords.length];
      const note = chord[2];
      const detunes = [0, 7, 12, 7, 0, 5, 9, 5];
      const freq = note * Math.pow(2, detunes[step % detunes.length] / 12);
      const start = Math.floor(t0 * sampleRate);
      const len = Math.floor(0.25 * sampleRate);
      for (let j = 0; j < len && start + j < data.length; j++) {
        const t = j / sampleRate; const env = Math.exp(-t * 10);
        const tone = 0.4 * Math.sin(2 * Math.PI * freq * t) + 0.15 * Math.sin(2 * Math.PI * freq * 2 * t);
        data[start + j] += tone * env * 0.6;
      }
    }
    
    // 루프 경계가 0으로 수렴하도록 페이드 처리(클릭 방지)
    const fadeSamples = Math.floor(0.01 * sampleRate);
    for (let k = 0; k < fadeSamples; k++) {
      const w = k / fadeSamples;
      data[k] *= w;
      data[data.length - 1 - k] *= w;
    }
    return buffer;
  }

  // 정답 효과음 (띠리링)
  private createCorrectSound() {
    if (!this.audioContext) return;

    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // 상승하는 아르페지오 (도미솔도)
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const noteLength = duration / frequencies.length;

    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      const start = i * noteLength * sampleRate;
      const end = (i + 1) * noteLength * sampleRate;

      for (let j = start; j < end && j < data.length; j++) {
        const t = (j - start) / sampleRate;
        const envelope = Math.exp(-t * 3); // 감쇠 엔벨로프
        data[j] = 0.2 * envelope * Math.sin(2 * Math.PI * freq * t);
      }
    }

    return buffer;
  }

  // 오답 효과음 (흑흑)
  private createIncorrectSound() {
    if (!this.audioContext) return;

    const duration = 1.0;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // 하강하는 슬픈 멜로디
    const frequencies = [329.63, 293.66, 261.63, 246.94]; // E4, D4, C4, B3
    const noteLength = duration / frequencies.length;

    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      const start = i * noteLength * sampleRate;
      const end = (i + 1) * noteLength * sampleRate;

      for (let j = start; j < end && j < data.length; j++) {
        const t = (j - start) / sampleRate;
        const envelope = Math.exp(-t * 2); // 천천히 감쇠
        data[j] = 0.15 * envelope * Math.sin(2 * Math.PI * freq * t);
      }
    }

    return buffer;
  }

  // 승리용 경쾌한 루프(브라스/신스 느낌)
  private createVictoryMusic() {
    if (!this.audioContext) return;
    const duration = 4; // 4초 루프
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    // 코드 진행: C -> F -> G -> C (각 1초)
    const chords: number[][] = [
      [261.63, 329.63, 392.0],     // C4, E4, G4
      [349.23, 440.0, 523.25],     // F4, A4, C5
      [392.0, 493.88, 587.33],     // G4, B4, D5
      [261.63, 329.63, 523.25],    // C4, E4, C5
    ];
    const steps = 16; // 16분음표 기준
    const stepDur = duration / steps; // 0.25s
    for (let i = 0; i < steps; i++) {
      const chord = chords[Math.floor((i / 4)) % chords.length];
      const start = Math.floor(i * stepDur * sampleRate);
      const end = Math.min(Math.floor((i + 1) * stepDur * sampleRate), data.length);
      const accent = (i % 4 === 0) ? 1.0 : 0.7; // 강세
      for (let j = start; j < end; j++) {
        const t = (j - start) / sampleRate;
        const attack = 0.008;
        const release = 0.22;
        const env = Math.min(t / attack, 1) * Math.exp(-Math.max(0, t - attack) / release);
        // 소톱(Saw) + 사인 혼합으로 브라스 느낌
        let v = 0;
        for (const f of chord) {
          const saw = 2 * ((t * f) - Math.floor(0.5 + t * f));
          const sine = Math.sin(2 * Math.PI * f * t);
          v += 0.25 * saw + 0.15 * sine;
        }
        // 킥 느낌의 펄스(루프마다 처음 10ms)
        const kickEnv = (t < 0.01) ? Math.exp(-t * 120) : 0;
        const kick = 0.2 * kickEnv * Math.sin(2 * Math.PI * 80 * t);
        data[j] += Math.tanh((v * 0.4 * accent + kick) * env);
      }
    }
    // 클릭 방지 페이드
    const fade = Math.floor(sampleRate * 0.01);
    for (let k = 0; k < fade; k++) {
      const w = k / fade;
      data[k] *= w;
      data[data.length - 1 - k] *= w;
    }
    return buffer;
  }

  // 팬파레/휘슬 "빰빠바밤"
  private createVictoryFanfare() {
    if (!this.audioContext) return;
    const pattern = [
      { freq: 784.0, dur: 0.18 },  // G5 (빰)
      { freq: 880.0, dur: 0.12 },  // A5 (빠)
      { freq: 988.0, dur: 0.12 },  // B5 (바)
      { freq: 1046.5, dur: 0.28 }, // C6 (밤~)
    ];
    const totalDur = pattern.reduce((a, b) => a + b.dur, 0) + 0.12;
    const sr = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, Math.ceil(totalDur * sr), sr);
    const data = buffer.getChannelData(0);
    let cursor = 0;
    for (let i = 0; i < pattern.length; i++) {
      const { freq, dur } = pattern[i];
      const start = Math.floor(cursor * sr);
      const end = Math.min(Math.floor((cursor + dur) * sr), data.length);
      for (let j = start; j < end; j++) {
        const t = (j - start) / sr;
        // 휘슬 느낌의 글라이드 살짝 추가 (상승)
        const glide = freq * (1 + 0.03 * (t / dur));
        // 노이즈 섞인 소리(휘슬 호흡감)
        const breath = 0.03 * (Math.random() * 2 - 1);
        const env = Math.min(t / 0.01, 1) * Math.exp(-t * 6);
        const tone = 0.6 * Math.sin(2 * Math.PI * glide * t) + 0.25 * Math.sign(Math.sin(2 * Math.PI * glide * t));
        data[j] += (tone + breath) * env;
      }
      cursor += dur;
    }
    return buffer;
  }

  async startBackgroundMusic() {
    if (!this.audioContext || this.isBackgroundPlaying) return;

    await this.resumeAudioContext();
    
    const buffer = this.createBackgroundMusic();
    if (!buffer) return;

    // 무지연 루프: loop=true 사용
    this.backgroundMusic.source = this.audioContext.createBufferSource();
    this.backgroundMusic.gainNode = this.audioContext.createGain();
    this.backgroundMusic.source.buffer = buffer;
    this.backgroundMusic.source.loop = true;
    this.backgroundMusic.source.loopStart = 0;
    this.backgroundMusic.source.loopEnd = buffer.duration;
    this.backgroundMusic.gainNode.gain.value = 0.24; // 교실 시연용으로 더 부드럽게
    this.backgroundMusic.source.connect(this.backgroundMusic.gainNode);
    this.backgroundMusic.gainNode.connect(this.audioContext.destination);
    this.isBackgroundPlaying = true;
    this.backgroundMusic.source.start(0);
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic.source) {
      this.backgroundMusic.source.onended = null; // 루프 중지
      this.backgroundMusic.source.stop();
      this.backgroundMusic.source = null;
    }
    this.isBackgroundPlaying = false;
  }

  async startVictoryMusic() {
    if (!this.audioContext || this.isVictoryPlaying) return;
    await this.resumeAudioContext();
    const buffer = this.createVictoryMusic();
    if (!buffer) return;
    // 기존 배경음은 중지
    this.stopBackgroundMusic();
    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = buffer.duration;
    gain.gain.value = 0.32;
    source.connect(gain);
    gain.connect(this.audioContext.destination);
    source.start(0);
    this.backgroundMusic.source = source;
    this.backgroundMusic.gainNode = gain;
    this.isVictoryPlaying = true;
    this.isBackgroundPlaying = true;
  }

  async playVictoryFanfare() {
    if (!this.audioContext) return;
    await this.resumeAudioContext();
    const buffer = this.createVictoryFanfare();
    if (!buffer) return;
    const source = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    source.buffer = buffer;
    gain.gain.value = 0.6;
    source.connect(gain);
    gain.connect(this.audioContext.destination);
    source.start(0);
  }

  async transitionToVictory() {
    // 배경음 멈추고 팬파레 후 승리 루프 재생
    this.stopBackgroundMusic();
    await this.playVictoryFanfare();
    // 약간의 텀 후 루프 시작
    setTimeout(() => {
      this.startVictoryMusic();
    }, 600);
  }

  async playCorrectSound() {
    if (!this.audioContext) return;

    await this.resumeAudioContext();
    
    const buffer = this.createCorrectSound();
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = 0.4;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }

  async playIncorrectSound() {
    if (!this.audioContext) return;

    await this.resumeAudioContext();
    
    const buffer = this.createIncorrectSound();
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = 0.4;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }

  // 천둥 효과음 (노이즈+저음 롤/램블)
  private createThunder() {
    if (!this.audioContext) return;
    const sr = this.audioContext.sampleRate;
    const dur = 1.2; // 1.2s
    const buffer = this.audioContext.createBuffer(1, Math.floor(sr * dur), sr);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 3.2);
      const rumble = Math.sin(2 * Math.PI * (40 + Math.random() * 6) * t) * Math.exp(-t * 2.0);
      const crack = (Math.random() < 0.003 ? 1 : 0) * Math.exp(-t * 16);
      data[i] = 0.6 * noise + 0.5 * rumble + 0.8 * crack;
    }
    // 짧은 페이드
    const fade = Math.floor(sr * 0.01);
    for (let k = 0; k < fade; k++) { const w = k / fade; data[k] *= w; data[data.length-1-k] *= w; }
    return buffer;
  }

  async playThunder() {
    if (!this.audioContext) return;
    await this.resumeAudioContext();
    const buffer = this.createThunder(); if (!buffer) return;
    // 요청에 따라 번개 소리는 비활성화
  }

  setMasterVolume(volume: number) {
    if (this.backgroundMusic.gainNode) {
      this.backgroundMusic.gainNode.gain.value = volume * 0.3;
    }
  }
}

export const soundManager = new SoundManager();
