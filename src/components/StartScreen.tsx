import React from 'react';
import { MascotType } from '../config';

interface StartScreenProps {
  selectedMascot: MascotType | null;
  onSelectMascot: (mascot: MascotType) => void;
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({
  selectedMascot,
  onSelectMascot,
  onStartGame,
}) => {
  const [schoolName, setSchoolName] = React.useState('');
  const [grade, setGrade] = React.useState('');
  const [classroom, setClassroom] = React.useState('');
  const [phase, setPhase] = React.useState<'intro' | 'select'>('intro');

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('playerInfo') || 'null');
      if (saved) {
        setSchoolName(saved.schoolName || '');
        setGrade(saved.grade || '');
        setClassroom(saved.classroom || '');
      }
    } catch {}
  }, []);
  const [iconYellow, setIconYellow] = React.useState<string | null>(null);
  const [iconBlue, setIconBlue] = React.useState<string | null>(null);
  const [procYellow, setProcYellow] = React.useState<string | null>(null);
  const [procBlue, setProcBlue] = React.useState<string | null>(null);
  const [startLogo, setStartLogo] = React.useState<string | null>(null);
  const [sparks, setSparks] = React.useState<Array<{ id: number; x: number; y: number; size: number; variant: 'green' | 'white' | 'yellow' | 'pink' | 'blue' | 'purple' }>>([]);
  const [bursts, setBursts] = React.useState<Array<{ id: number; x: number; y: number; variant: 'green' | 'white' | 'yellow' | 'pink' | 'blue' | 'purple'; particles: number }>>([]);
  const [logoVersion] = React.useState<string>(() => String(Date.now()));

  // 기존 기록 보존: 더 이상 자동 초기화하지 않음

  React.useEffect(() => {
    const probe = async (variant: 'yellow' | 'blue', setter: (v: string | null) => void) => {
      const candidates = [
        `/mascot-${variant}.svg`,
        `/mascot-${variant}.png`,
        `/mascot-${variant}@2x.png`,
        `/mascot-${variant}(2).svg`,
        `/mascot-${variant}(2).png`,
        `/mascot-${variant}(2)@2x.png`,
      ];
      for (const url of candidates) {
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (res.ok) { setter(url); return; }
        } catch {}
      }
      setter(null);
    };
    probe('yellow', setIconYellow);
    probe('blue', setIconBlue);
  }, []);

  // 인트로/선택 화면 네온 스파크 랜덤 깜빡임
  React.useEffect(() => {
    if (phase !== 'intro' && phase !== 'select') return;
    let idSeq = 1;
    const timer = setInterval(() => {
      setSparks(prev => {
        const next = prev.slice(-18); // 최대 18개 유지
        // 15% 확률로 생성 건너뛰기
        if (Math.random() < 0.15) return next;
        const size = 8 + Math.random() * 16; // 더 큰 스파크 사이즈
        const variants: Array<'green' | 'white' | 'yellow' | 'pink' | 'blue' | 'purple'> = ['green', 'white', 'yellow', 'pink', 'blue', 'purple'];
        next.push({
          id: idSeq++,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size,
          variant: variants[(Math.random() * variants.length) | 0],
        });
        return next;
      });
    }, 900);
    return () => clearInterval(timer);
  }, [phase]);

  // 주기적으로 팡팡 터지는 버스트 스파크
  React.useEffect(() => {
    if (phase !== 'intro' && phase !== 'select') return;
    let idSeq = 1;
    const timer = setInterval(() => {
      setBursts(prev => {
        const next = prev.slice(-6);
        // 50% 확률로 생성
        if (Math.random() < 0.5) {
          const variants: Array<'green' | 'white' | 'yellow' | 'pink' | 'blue' | 'purple'> = ['green', 'white', 'yellow', 'pink', 'blue', 'purple'];
          next.push({
            id: idSeq++,
            x: Math.random() * 100,
            y: Math.random() * 100,
            variant: variants[(Math.random() * variants.length) | 0],
            particles: 10 + ((Math.random() * 6) | 0),
          });
        }
        return next;
      });
    }, 2200);
    return () => clearInterval(timer);
  }, [phase]);

  // 시작 화면 로고 자동 탐지 (사용자가 public에 넣은 파일 우선 사용)
  React.useEffect(() => {
    (async () => {
      const candidates = [
        '/start-logo.png',
        '/start-logo.webp',
        '/start-logo.jpg',
        '/start-logo.jpeg',
        '/start-logo.svg',
        '/logo-start.png',
        '/logo-start.svg',
        '/battery-race-logo.png',
      ];
      for (const url of candidates) {
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (res.ok) { setStartLogo(url); return; }
        } catch {}
      }
      setStartLogo(null);
    })();
  }, []);

  // 배경/마스코트/스프링클 사전 디코드로 첫 진입 렉 방지
  React.useEffect(() => {
    (async () => {
      try {
        const bgCandidates = ['/game-bg.png','/game-bg.jpg','/game-bg.webp','/game-bg.svg'];
        for (const url of bgCandidates) {
          try {
            const res = await fetch(url, { method:'HEAD' });
            if (res.ok) {
              const img = new Image(); img.src = url;
              await new Promise<void>(r => { img.onload = () => r(); img.onerror = () => r(); });
              // 배경은 화이트 보더 크롭 로직과 동일하게 처리해 캐시
              const can = document.createElement('canvas');
              can.width = img.naturalWidth; can.height = img.naturalHeight;
              const ctx = can.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                const w = can.width, h = can.height;
                const data = ctx.getImageData(0, 0, w, h).data;
                const isWhite = (i:number) => { const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3]; const md=Math.max(r,g,b)-Math.min(r,g,b); return a>0 && r>=245 && g>=245 && b>=245 && md<=10; };
                let top=0,bottom=h-1,left=0,right=w-1;
                scanTop: for(; top<h; top++){ for(let x=0;x<w;x++){ if(!isWhite((top*w+x)*4)) break scanTop; } }
                scanBottom: for(; bottom>=0; bottom--){ for(let x=0;x<w;x++){ if(!isWhite((bottom*w+x)*4)) break scanBottom; } }
                scanLeft: for(; left<w; left++){ for(let y=top;y<=bottom;y++){ if(!isWhite((y*w+left)*4)) break scanLeft; } }
                scanRight: for(; right>=0; right--){ for(let y=top;y<=bottom;y++){ if(!isWhite((y*w+right)*4)) break scanRight; } }
                const cw = Math.max(1, right-left+1), ch = Math.max(1, bottom-top+1);
                const out = document.createElement('canvas'); out.width=cw; out.height=ch;
                const octx = out.getContext('2d'); if (octx){ octx.drawImage(can, left, top, cw, ch, 0, 0, cw, ch);
                  try { sessionStorage.setItem('pre_bg_src', url); sessionStorage.setItem('pre_bg', out.toDataURL('image/png')); } catch {}
                }
              }
              break;
            }
          } catch {}
        }
      } catch {}
    })();
  }, []);

  // PNG 배경 투명화(좌측만 쓰더라도 배경이 보일 수 있어 처리) - 특히 리니(blue)
  React.useEffect(() => {
    const clearBg = async (src: string): Promise<string | null> => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('load fail'));
        });
        const srcW = img.naturalWidth; const srcH = img.naturalHeight;
        const hasTwoUp = srcW >= srcH * 1.5; // 좌우로 두 캐릭터가 배치된 형태 추정
        const isBlueSrc = /blue/i.test(src);
        const leftCropRatio = isBlueSrc ? 0.6 : 0.5; // 리니는 우측 번개 여유 포함
        const drawW = hasTwoUp ? Math.floor(srcW * leftCropRatio) : srcW; // 좌측 캐릭터만 사용
        const drawH = srcH;
        const canvas = document.createElement('canvas');
        canvas.width = drawW; canvas.height = drawH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        if (hasTwoUp) {
          ctx.drawImage(img, 0, 0, drawW, drawH, 0, 0, drawW, drawH);
        } else {
          ctx.drawImage(img, 0, 0, drawW, drawH);
        }
        const { width, height } = canvas;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const visited = new Uint8Array(width * height);
        const q = new Uint32Array(width * height);
        let h = 0, t = 0;
        const idx = (x: number, y: number) => y * width + x;
        const nearWhite = (i: number) => {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const maxDiff = Math.max(r, g, b) - Math.min(r, g, b);
          return r >= 248 && g >= 248 && b >= 248 && maxDiff <= 12;
        };
        const pushIf = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= width || y >= height) return;
          const p = idx(x, y); if (visited[p]) return;
          const di = p * 4; if (!nearWhite(di)) return;
          visited[p] = 1; q[t++] = p;
        };
        for (let x = 0; x < width; x++) { pushIf(x, 0); pushIf(x, height - 1); }
        for (let y = 0; y < height; y++) { pushIf(0, y); pushIf(width - 1, y); }
        while (h < t) {
          const p = q[h++];
          const di = p * 4; data[di + 3] = 0;
          const x = p % width, y = (p / width) | 0;
          pushIf(x - 1, y); pushIf(x + 1, y); pushIf(x, y - 1); pushIf(x, y + 1);
        }
        ctx.putImageData(imageData, 0, 0);
        // 콘텐츠 바운딩 박스 계산(알파 > 0)
        let minX = width, minY = height, maxX = -1, maxY = -1;
        for (let yy = 0; yy < height; yy++) {
          for (let xx = 0; xx < width; xx++) {
            const a = data[(yy * width + xx) * 4 + 3];
            if (a > 0) {
              if (xx < minX) minX = xx;
              if (xx > maxX) maxX = xx;
              if (yy < minY) minY = yy;
              if (yy > maxY) maxY = yy;
            }
          }
        }
        if (maxX >= minX && maxY >= minY) {
          const bbW = maxX - minX + 1;
          const bbH = maxY - minY + 1;
          const pad = Math.round(Math.max(bbW, bbH) * (isBlueSrc ? 0.08 : 0.06)); // 리니는 8% 여백
          const outSize = Math.max(bbW, bbH) + pad * 2;
          const out = document.createElement('canvas');
          out.width = outSize; out.height = outSize;
          const octx = out.getContext('2d');
          if (octx) {
            octx.clearRect(0, 0, outSize, outSize);
            const dx = Math.round((outSize - bbW) / 2);
            const dy = Math.round((outSize - bbH) / 2);
            octx.drawImage(canvas, minX, minY, bbW, bbH, dx, dy, bbW, bbH);
            return out.toDataURL('image/png');
          }
        }
        return canvas.toDataURL('image/png');
      } catch {
        return null;
      }
    };
    (async () => {
      if (iconYellow) setProcYellow((await clearBg(iconYellow)) || iconYellow);
      if (iconBlue) setProcBlue((await clearBg(iconBlue)) || iconBlue);
    })();
  }, [iconYellow, iconBlue]);

  // 마스코트 사전 로드: 처리된 이미지가 준비되면 sessionStorage에 저장하여 플레이 화면 진입 시 즉시 사용
  React.useEffect(() => {
    try {
      if (procYellow) sessionStorage.setItem('pre_mascot_yellow', procYellow);
      else if (iconYellow) sessionStorage.setItem('pre_mascot_yellow', iconYellow);
    } catch {}
  }, [procYellow, iconYellow]);
  React.useEffect(() => {
    try {
      if (procBlue) sessionStorage.setItem('pre_mascot_blue', procBlue);
      else if (iconBlue) sessionStorage.setItem('pre_mascot_blue', iconBlue);
    } catch {}
  }, [procBlue, iconBlue]);

  // 스프링클 사전 로드(투명 처리 포함) -> sessionStorage('pre_sprinkle')에 저장
  React.useEffect(() => {
    const preloadSprinkle = async () => {
      try {
        const candidates = ['/sprinkle.png', '/sprinkle.svg', '/sprinkle@2x.png'];
        let found: string | null = null;
        for (const url of candidates) {
          try { const res = await fetch(url, { method: 'HEAD' }); if (res.ok) { found = url; break; } } catch {}
        }
        if (!found) return;
        if (!found.endsWith('.png')) {
          try { sessionStorage.setItem('pre_sprinkle', found); } catch {}
          return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = found;
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); });
        const w = img.naturalWidth, h = img.naturalHeight;
        const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d'); if (!ctx) { sessionStorage.setItem('pre_sprinkle', found); return; }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const visited = new Uint8Array(w * h);
        const q = new Uint32Array(w * h);
        let hq = 0, tq = 0;
        const idx = (x: number, y: number) => y * w + x;
        // 모서리 평균색을 배경으로 간주
        const sample = (x: number, y: number) => { const k = (y * w + x) * 4; return [data[k], data[k+1], data[k+2], data[k+3]] as const; };
        const c1 = sample(0,0), c2 = sample(w-1,0), c3 = sample(0,h-1), c4 = sample(w-1,h-1);
        const bgR = Math.round((c1[0]+c2[0]+c3[0]+c4[0]) / 4);
        const bgG = Math.round((c1[1]+c2[1]+c3[1]+c4[1]) / 4);
        const bgB = Math.round((c1[2]+c2[2]+c3[2]) / 4);
        const isBg = (i: number) => {
          const r = data[i], g = data[i+1], b = data[i+2];
          const dr = r - bgR, dg = g - bgG, db = b - bgB;
          const dist2 = dr*dr + dg*dg + db*db;
          return dist2 <= 3600;
        };
        const pushIf = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= w || y >= h) return;
          const p = idx(x, y); if (visited[p]) return;
          const di = p * 4; if (!isBg(di)) return;
          visited[p] = 1; q[tq++] = p;
        };
        for (let x = 0; x < w; x++) { pushIf(x, 0); pushIf(x, h - 1); }
        for (let y = 0; y < h; y++) { pushIf(0, y); pushIf(w - 1, y); }
        while (hq < tq) { const p = q[hq++]; const di = p * 4; data[di+3] = 0; const x = p % w, y = (p / w) | 0; pushIf(x-1,y); pushIf(x+1,y); pushIf(x,y-1); pushIf(x,y+1); }
        ctx.putImageData(imageData, 0, 0);
        const out = canvas.toDataURL('image/png');
        try { sessionStorage.setItem('pre_sprinkle', out); } catch {}
      } catch {}
    };
    preloadSprinkle();
  }, []);


  const renderMascotIcon = (mascot: MascotType) => {
    const fill = mascot === 'yellow' ? '#FFC928' : '#9AD8FF';
    const cheek = mascot === 'yellow' ? '#FFD88A' : '#FFB6C1';
    // 외부 제공 이미지가 있으면 그대로 사용
    if (mascot === 'yellow' && (procYellow || iconYellow)) {
      const src = procYellow || iconYellow!;
      return (
        <div style={{ width: '99px', height: '99px', overflow: 'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src={src} alt="yellow-mascot" style={{ width: '90px', height: '90px', objectFit: 'contain', objectPosition: 'center', background: 'transparent' }} draggable={false} onError={() => { setProcYellow(null); setIconYellow(null); }} />
        </div>
      );
    }
    if (mascot === 'blue' && (procBlue || iconBlue)) {
      const src = procBlue || iconBlue!;
      return (
        <div style={{ width: '99px', height: '99px', overflow: 'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src={src} alt="blue-mascot" style={{ width: '90px', height: '90px', objectFit: 'contain', objectPosition: 'left center', transform: 'translateX(-5%)', background: 'transparent' }} draggable={false} onError={() => { setProcBlue(null); setIconBlue(null); }} />
        </div>
      );
    }
    return (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <g>
          {/* 물방울 몸체 */}
          <path d="M30 6 C 40 14, 46 24, 46 34 C 46 45, 39 52, 30 52 C 21 52, 14 45, 14 34 C 14 24, 20 14, 30 6 Z" fill={fill} />
          {/* 하이라이트 */}
          <ellipse cx="24" cy="20" rx="6" ry="4" fill="rgba(255,255,255,0.6)" />
          {/* 눈 */}
          <circle cx="24" cy="28" r="5" fill="#111" />
          <circle cx="36" cy="28" r="5" fill="#111" />
          <circle cx="25" cy="27" r="2" fill="#fff" />
          <circle cx="37" cy="27" r="2" fill="#fff" />
          {/* 볼터치 */}
          <circle cx="21" cy="34" r="3" fill={cheek} />
          <circle cx="39" cy="34" r="3" fill={cheek} />
          {/* 입 */}
          <path d="M26 36 Q30 39 34 36" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  };

  return (
    <div className="start-screen">
      {phase === 'intro' ? (
        <>
          {/* 로고: 사용자가 올린 이미지가 있으면 우선 사용, 없으면 기존 네온 SVG */}
          <div style={{ marginBottom: 0, textAlign: 'center' }}>
            {startLogo ? (
              <img
                src={`${startLogo}?v=${logoVersion}`}
                alt="start-logo"
                style={{
                  width: 'min(90vw, 820px)',
                  height: 'auto',
                  imageRendering: 'auto',
                  display: 'inline-block',
                }}
                draggable={false}
                onError={() => setStartLogo(null)}
              />
            ) : (
            <svg width="760" height="240" viewBox="0 0 640 200" className="neon-logo">
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="electric" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="50%" stopColor="#18FFFF" />
                  <stop offset="100%" stopColor="#00E676" />
                </linearGradient>
                <radialGradient id="wheel" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#B0BEC5" />
                </radialGradient>
                <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFEB3B" />
                  <stop offset="100%" stopColor="#FFC107" />
                </linearGradient>
                <radialGradient id="trailGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFE0" />
                  <stop offset="100%" stopColor="#FFC107" />
                </radialGradient>
                <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#18FFFF" />
                  <stop offset="100%" stopColor="#00E5FF" />
                </linearGradient>
              </defs>
              <rect x="10" y="60" width="620" height="120" rx="18" ry="18" fill="rgba(0,0,0,0.25)" stroke="url(#electric)" strokeWidth="3" filter="url(#glow)" />
              {/* 키치한 자동차 아이콘 (텍스트 위쪽, 서서히 이동, 20% 축소) */}
              <g className="logo-car">
                <animateTransform attributeName="transform" type="translate" from="200 -14" to="340 -14" dur="10s" repeatCount="indefinite" />
                <g transform="scale(0.8)" filter="url(#glow)">
                  {/* 에너지 트레일 (차 뒤에서 새어나오는 빛) */}
                  <g opacity={0.95}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <circle key={`trail-${i}`} cx={12} cy={60} r={8} fill="url(#trailGrad)" opacity={0.65}>
                        <animate attributeName="cx" values="12;-140" dur={`${2.4 + i * 0.2}s`} begin={`${i * 0.18}s`} repeatCount="indefinite" />
                        <animate attributeName="r" values="8;0" dur={`${2.4 + i * 0.2}s`} begin={`${i * 0.18}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.65;0" dur={`${2.4 + i * 0.2}s`} begin={`${i * 0.18}s`} repeatCount="indefinite" />
                        <animate attributeName="cy" values="60;62;58;60" dur={`${2.4 + i * 0.2}s`} begin={`${i * 0.18}s`} repeatCount="indefinite" />
                      </circle>
                    ))}
                    {/* 스파크 라인 */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line key={`spark-${i}`} x1={10} y1={58 + (i%3)*6} x2={-10} y2={54 + (i%3)*6} stroke="url(#sparkGrad)" strokeWidth="2" opacity="0.8">
                        <animate attributeName="x1" values="10;-60" dur={`${1.6 + i*0.15}s`} begin={`${i*0.14}s`} repeatCount="indefinite" />
                        <animate attributeName="x2" values="-10;-160" dur={`${1.6 + i*0.15}s`} begin={`${i*0.14}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur={`${1.6 + i*0.15}s`} begin={`${i*0.14}s`} repeatCount="indefinite" />
                      </line>
                    ))}
                    {/* 작은 별 파티클 */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <polygon key={`star-${i}`} points="0,0 2,0 2,2 0,2" fill="#FFF59D" transform={`translate(${0} ${60})`} opacity="0.9">
                        <animateTransform attributeName="transform" type="translate" values={`0,60;-120,${58 + (i%3)*6}`} dur={`${2.2 + i*0.2}s`} begin={`${i*0.2}s`} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0" dur={`${2.2 + i*0.2}s`} begin={`${i*0.2}s`} repeatCount="indefinite" />
                      </polygon>
                    ))}
                  </g>
                  {/* 바닥 그림자 제거 */}
                {/* 차 바디 */}
                  <rect x="0" y="30" width="120" height="38" rx="14" ry="14" fill="url(#carBody)" stroke="#FFEE58" strokeWidth="2" />
                {/* 루프 라인: 창문 전연부와 정확히 접합, 차체 밖으로 안 나가게 조정 */}
                  <path d="M18,32 C34,16 50,16 66,32 L114,32" fill="none" stroke="#FFD54F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {/* 범퍼/라인 디테일 */}
                  <path d="M0,54 L120,54" stroke="#FFECB3" strokeWidth="1" opacity="0.7" />
                {/* 프런트 라인: 차체 밖으로 삐져나오지 않도록 조정 */}
                  <path d="M10,44 L32,44" stroke="#FFECB3" strokeWidth="1" opacity="0.7" />
                {/* 창문(그라데이션 유리) */}
                <defs>
                  <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#B3E5FC" />
                    <stop offset="100%" stopColor="#81D4FA" />
                  </linearGradient>
                </defs>
                {/* 창문: 상부 반타원(아랫부분 컷) */}
                  <path d="M28 31 A 16 9 0 0 1 60 31 L 28 31 Z" fill="url(#glass)" stroke="#80DEEA" strokeWidth="1" />
                {/* 유리 반사 */}
                  <path d="M36 29 Q 44 25 52 29" fill="none" stroke="#E1F5FE" strokeWidth="2" opacity="0.55" />
                {/* 헤드라이트/테일라이트 */}
                  <circle cx="8" cy="50" r="5" fill="#FFF59D" stroke="#FFE082" strokeWidth="1" />
                  <circle cx="112" cy="50" r="5" fill="#FF8A80" stroke="#FF5252" strokeWidth="1" />
                {/* 번개 데칼 (측면) */}
                  <polygon points="56,48 72,36 66,48 84,36 70,52" fill="#FFEE58" stroke="#FFF176" strokeWidth="1" />
                {/* 바퀴(디테일 강화, 초록 요소 제거) */}
                  <g>
                    <circle cx="34" cy="70" r="11" fill="#263238" stroke="#90A4AE" strokeWidth="2" />
                    <circle cx="34" cy="70" r="5" fill="url(#wheel)" />
                    <g>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <line key={`sp1-${i}`} x1="34" y1="70" x2={34 + Math.cos((i*60)*Math.PI/180)*8} y2={70 + Math.sin((i*60)*Math.PI/180)*8} stroke="#CFD8DC" strokeWidth="1" />
                      ))}
                      <animateTransform attributeName="transform" type="rotate" from="0 34 70" to="360 34 70" dur="1.2s" repeatCount="indefinite" />
                    </g>
                  </g>
                  <g>
                    <circle cx="94" cy="70" r="11" fill="#263238" stroke="#90A4AE" strokeWidth="2" />
                    <circle cx="94" cy="70" r="5" fill="url(#wheel)" />
                    <g>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <line key={`sp2-${i}`} x1="94" y1="70" x2={94 + Math.cos((i*60)*Math.PI/180)*8} y2={70 + Math.sin((i*60)*Math.PI/180)*8} stroke="#CFD8DC" strokeWidth="1" />
                      ))}
                      <animateTransform attributeName="transform" type="rotate" from="0 94 70" to="360 94 70" dur="1.2s" repeatCount="indefinite" />
                    </g>
                  </g>
                </g>
              </g>
              {/* 전기 에너지 장식: 텍스트 좌우 대칭 배치 */}
              <g filter="url(#glow)">
                {/* 좌측 작은 번개 (센터 320 기준 좌우대칭) */}
                <polygon points="120,112 132,112 128,120 140,120 118,136 128,124 118,124" fill="#00E5FF" opacity="0.7" />
                {/* 우측 작은 번개 */}
                <polygon points="520,112 532,112 528,120 540,120 518,136 528,124 518,124" fill="#00E676" opacity="0.7" />
                {/* 점광 포인트 */}
                <circle cx="170" cy="120" r="3" fill="#18FFFF" opacity="0.5" />
                <circle cx="470" cy="120" r="3" fill="#00E676" opacity="0.5" />
              </g>
              {/* Neo둥근모로 2줄 타이틀 */}
              <text x="50%" y="108" dominantBaseline="middle" textAnchor="middle" fontFamily="'NeoDunggeunmo','Press Start 2P',monospace" fontSize="46" fill="url(#electric)" stroke="#00FFFF" strokeWidth="1.2" filter="url(#glow)">
                <tspan x="50%" dy="0">찌릿찌릿!</tspan>
                <tspan x="50%" dy="50">배터레이스</tspan>
              </text>
            </svg>
            )}
          </div>
          <div className="start-button-container">
            <button className="start-button pixel-button" onClick={() => setPhase('select')} style={{ minWidth: 220 }}>게임 시작</button>
          </div>
        </>
      ) : (
        <>
          <p className="game-subtitle" style={{ marginBottom: 14 }}>
            학교 정보를 입력하고 마스코트를 선택하세요
          </p>
          {/* 학교 정보 입력 (선택 단계에서 표시) */}
          <div style={{ display:'flex', gap: '10px', marginBottom: '16px' }}>
            <input placeholder="학교명" value={schoolName} onChange={e=>{ setSchoolName(e.target.value); try{localStorage.setItem('playerInfo', JSON.stringify({ schoolName: e.target.value, grade, classroom }));}catch{} }} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid #fff', width:220 }} />
            <input placeholder="학년" value={grade} onChange={e=>{ setGrade(e.target.value); try{localStorage.setItem('playerInfo', JSON.stringify({ schoolName, grade: e.target.value, classroom }));}catch{} }} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid #fff', width:90 }} />
            <input placeholder="반" value={classroom} onChange={e=>{ setClassroom(e.target.value); try{localStorage.setItem('playerInfo', JSON.stringify({ schoolName, grade, classroom: e.target.value }));}catch{} }} style={{ padding:'10px 12px', borderRadius:8, border:'1px solid #fff', width:90 }} />
          </div>
          <div className="mascot-selector">
            <div
              className={`mascot-option ${selectedMascot === 'yellow' ? 'selected' : ''}`}
              onClick={() => { onSelectMascot('yellow'); onStartGame(); }}
            >
              <div className="mascot-icon">
                {renderMascotIcon('yellow')}
              </div>
          <div className="mascot-label">배니</div>
            </div>
            
            <div
              className={`mascot-option blue ${selectedMascot === 'blue' ? 'selected' : ''}`}
              onClick={() => { onSelectMascot('blue'); onStartGame(); }}
            >
              <div className="mascot-icon">
                {renderMascotIcon('blue')}
              </div>
          <div className="mascot-label">리니</div>
            </div>
          </div>
        </>
      )}
      <div className="neon-layer">
        {sparks.map(s => (
          <div
            key={s.id}
            className={`neon-spark neon-${s.variant}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          />
        ))}
        {bursts.map(b => (
          <div key={`burst-${b.id}`} className="spark-burst" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
            {Array.from({ length: b.particles }).map((_, i) => {
              const angle = (i / b.particles) * Math.PI * 2 + Math.random() * 0.6;
              const dist = 40 + Math.random() * 90;
              const dx = Math.cos(angle) * dist;
              const dy = Math.sin(angle) * dist;
              const size = 7 + Math.random() * 10;
              return (
                <div
                  key={`bp-${i}`}
                  className={`spark-burst-particle neon-${b.variant}`}
                  style={{
                    width: size,
                    height: size,
                    // CSS 변수로 비행 벡터 전달
                    ['--dx' as any]: `${dx}px`,
                    ['--dy' as any]: `${dy}px`,
                    animationDelay: `${(Math.random() * 0.2).toFixed(2)}s`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StartScreen;
