import React from 'react';
import { MascotType } from '../config';

interface ResultScreenProps {
  mascot: MascotType;
  totalCorrect: number;
  totalQuestions: number;
  elapsedTime: number;
  onPlayAgain: () => void;
  score?: number;
  onOpenRanking?: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  mascot,
  totalCorrect,
  totalQuestions,
  elapsedTime,
  onPlayAgain,
  onOpenRanking,
}) => {
  // 외부 캐릭터 아트(결과 화면용) 자동 로드 + PNG 투명 처리(리니)
  const [externalAsset, setExternalAsset] = React.useState<string | null>(null);
  const [processedAsset, setProcessedAsset] = React.useState<string | null>(null);
  React.useEffect(() => {
    const candidates = mascot === 'yellow'
      ? ['/mascot-yellow.svg','/mascot-yellow.png','/mascot-yellow@2x.png','/mascot-yellow(2).svg','/mascot-yellow(2).png','/mascot-yellow(2)@2x.png']
      : ['/mascot-blue.svg','/mascot-blue.png','/mascot-blue@2x.png','/mascot-blue(2).svg','/mascot-blue(2).png','/mascot-blue(2)@2x.png'];
    (async () => {
      for (const url of candidates) {
        try { const res = await fetch(url, { method: 'HEAD' }); if (res.ok) { setExternalAsset(url); return; } } catch {}
      }
      setExternalAsset(null);
    })();
  }, [mascot]);

  React.useEffect(() => {
    const makeTransparentAndCropLeft = async (src: string) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); });
        const srcW = img.naturalWidth; const srcH = img.naturalHeight;
        const hasTwoUp = srcW >= srcH * 1.5;
        const leftCropRatio = mascot === 'blue' ? 0.6 : 0.5; // 리니는 번개 여유 포함
        const drawW = hasTwoUp ? Math.floor(srcW * leftCropRatio) : srcW; const drawH = srcH;
        const canvas = document.createElement('canvas');
        canvas.width = drawW; canvas.height = drawH;
        const ctx = canvas.getContext('2d'); if (!ctx) { setProcessedAsset(src); return; }
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
          const p = q[h++]; const di = p * 4; data[di + 3] = 0;
          const x = p % width, y = (p / width) | 0;
          pushIf(x - 1, y); pushIf(x + 1, y); pushIf(x, y - 1); pushIf(x, y + 1);
        }
        ctx.putImageData(imageData, 0, 0);
        setProcessedAsset(canvas.toDataURL('image/png'));
      } catch { setProcessedAsset(src); }
    };
    if (!externalAsset) { setProcessedAsset(null); return; }
    if (externalAsset.endsWith('.png')) { makeTransparentAndCropLeft(externalAsset); } else { setProcessedAsset(externalAsset); }
  }, [externalAsset, mascot]);
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 랭킹은 버튼을 눌렀을 때만 계산/저장
  const [ranking, setRanking] = React.useState<{ list: any[]; rank: number }>({ list: [], rank: 0 });
  const handleShowRanking = () => {
    try {
      const key = 'leaderboard';
      const list: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      // 정렬 보장
      list.sort((a:any,b:any)=>{
        const as = a.score ?? (a.totalCorrect*100);
        const bs = b.score ?? (b.totalCorrect*100);
        if (bs!==as) return bs-as;
        if (a.elapsedTime!==b.elapsedTime) return a.elapsedTime-b.elapsedTime;
        return b.date-a.date;
      });
      setRanking({ list: list.slice(0,10), rank: 0 });
      const el = document.getElementById('ranking-modal');
      if (el) el.style.display = 'block';
    } catch {
      setRanking({ list: [], rank: 0 });
    }
  };

  // 게임 클리어 시 랭킹 자동 저장 (매 플레이 1회만 저장)
  React.useEffect(() => {
    try {
      // 이번 플레이의 고유 키로 중복 저장 방지
      const runKey = (window as any).__runSavedKey as string | undefined;
      if (runKey) {
        return; // 이미 저장됨
      }
      const info = JSON.parse(localStorage.getItem('playerInfo') || 'null') || { schoolName: '', grade: '', classroom: '' };
      const newId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const entry = {
        id: newId,
        schoolName: info.schoolName || '',
        grade: info.grade || '',
        classroom: info.classroom || '',
        totalCorrect,
        totalQuestions,
        elapsedTime,
        score: (typeof (window as any).lastRunScore === 'number' ? (window as any).lastRunScore : undefined) ?? (totalCorrect*100),
        date: Date.now(),
      } as any;
      const key = 'leaderboard';
      const list: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      // 같은 실행 내 중복 방지: 저장 전 윈도우 플래그 설정
      (window as any).__runSavedKey = newId;
      const filtered = [...list, entry];
      filtered.sort((a, b) => {
        const as = a.score ?? (a.totalCorrect * 100);
        const bs = b.score ?? (b.totalCorrect * 100);
        if (bs !== as) return bs - as;
        if (a.elapsedTime !== b.elapsedTime) return a.elapsedTime - b.elapsedTime;
        return b.date - a.date;
      });
      localStorage.setItem(key, JSON.stringify(filtered.slice(0, 50)));
    } catch {}
  }, [elapsedTime, totalCorrect, totalQuestions]);

  const getScoreMessage = () => {
    const percentage = (totalCorrect / totalQuestions) * 100;
    if (percentage === 100) {
      return "완벽해요! 🎉";
    } else if (percentage >= 80) {
      return "훌륭해요! 👏";
    } else if (percentage >= 60) {
      return "잘했어요! 👍";
    } else {
      return "다시 도전해보세요! 💪";
    }
  };

  const renderMascotDance = () => {
    if (processedAsset) {
      return (
        <div style={{ width: 146, height: 146, overflow:'visible', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src={processedAsset} alt="mascot" style={{ width: '146px', height: '146px', objectFit: 'contain', objectPosition: 'center', background: 'transparent', imageRendering: 'pixelated' }} onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }} />
        </div>
      );
    }
    if (mascot === 'yellow') {
      return (
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          className="dance-animation"
        >
          {/* 노랑 드롭 캐릭터 */}
          <path d="M50 12 C 64 22, 72 36, 72 48 C 72 62, 62 72, 50 72 C 38 72, 28 62, 28 48 C 28 36, 36 22, 50 12 Z" fill="#FFC928" />
          <circle cx="42" cy="42" r="6" fill="#111" />
          <circle cx="58" cy="42" r="6" fill="#111" />
          <circle cx="43.5" cy="40.8" r="2" fill="#fff" />
          <circle cx="59.5" cy="40.8" r="2" fill="#fff" />
          <path d="M44 52 Q50 56 56 52" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 꽃 요소 제거, 번개는 캔버스 밖으로 잘리지 않도록 패딩 추가 */}
          <g transform="translate(4,0)">
            {Array.from({ length: 4 }).map((_, i) => (
              <polygon key={i} points="0,0 6,0 4,4 10,4 -2,12 4,6 -2,6" fill="#FFEB3B" transform={`translate(${18 + i*14} ${18 + (i%2)*6})`} />
            ))}
          </g>
        </svg>
      );
    } else {
      return (
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          className="dance-animation"
        >
          {/* 파랑 드롭 캐릭터 */}
          <path d="M50 12 C 64 22, 72 36, 72 48 C 72 62, 62 72, 50 72 C 38 72, 28 62, 28 48 C 28 36, 36 22, 50 12 Z" fill="#9AD8FF" />
          <circle cx="42" cy="42" r="6" fill="#111" />
          <circle cx="58" cy="42" r="6" fill="#111" />
          <circle cx="43.5" cy="40.8" r="2" fill="#fff" />
          <circle cx="59.5" cy="40.8" r="2" fill="#fff" />
          <path d="M44 52 Q50 56 56 52" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          {Array.from({ length: 6 }).map((_, i) => (
            <polygon key={i} points="0,0 6,0 4,4 10,4 -2,12 4,6 -2,6" fill="#BBDEFB" transform={`translate(${20 + i*12} ${18 + (i%2)*6})`} />
          ))}
        </svg>
      );
    }
  };

  // 네온 스파크/버스트 재사용을 위해 StartScreen과 유사한 간단한 스파크 레이어 구현
  const [sparks, setSparks] = React.useState<Array<{ id:number;x:number;y:number;size:number;variant:'green'|'white'|'yellow'|'pink'|'blue'|'purple' }>>([]);
  const [bursts, setBursts] = React.useState<Array<{ id:number;x:number;y:number;variant:'green'|'white'|'yellow'|'pink'|'blue'|'purple';particles:number }>>([]);

  React.useEffect(() => {
    let idSeq = 1;
    const t = setInterval(() => {
      setSparks(prev => {
        const next = prev.slice(-16);
        if (Math.random() < 0.2) return next;
        const size = 8 + Math.random()*14;
        const variants: any = ['green','white','yellow','pink','blue','purple'];
        next.push({ id: idSeq++, x: Math.random()*100, y: Math.random()*100, size, variant: variants[(Math.random()*variants.length)|0] });
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    let idSeq = 1;
    const t = setInterval(() => {
      setBursts(prev => {
        const next = prev.slice(-6);
        if (Math.random() < 0.5) {
          const variants: any = ['green','white','yellow','pink','blue','purple'];
          next.push({ id: idSeq++, x: Math.random()*100, y: Math.random()*100, variant: variants[(Math.random()*variants.length)|0], particles: 10 + ((Math.random()*6)|0) });
        }
        return next;
      });
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="result-screen">
      <h1 className="result-title">게임 클리어!</h1>
      
      <div style={{ transform: 'scale(0.85)', transformOrigin: 'center', display:'flex', justifyContent:'center', alignItems:'center', width:'100%' }} className="dance-animation">
        {renderMascotDance()}
      </div>
      
      <div className="result-stats">
        <div className="result-stat">
          <div className="result-stat-value">{totalCorrect}</div>
          <div className="result-stat-label">정답</div>
        </div>
        
        <div className="result-stat">
          <div className="result-stat-value">{(typeof (window as any).lastRunScore === 'number' ? (window as any).lastRunScore : totalCorrect*100)}</div>
          <div className="result-stat-label">총 점수</div>
        </div>
        
        <div className="result-stat">
          <div className="result-stat-value">{formatTime(elapsedTime)}</div>
          <div className="result-stat-label">소요 시간</div>
        </div>
      </div>
      
      <div style={{ 
        fontSize: '20px', 
        marginBottom: '30px', 
        color: '#FFD700',
        textAlign: 'center'
      }}>
        {getScoreMessage()}
      </div>
      
      <button
        className="play-again-button pixel-button"
        style={{ fontFamily:'YourFont, sans-serif' }}
        onClick={onPlayAgain}
      >
        다시 플레이
      </button>

      <div style={{ marginTop: 12 }}>
        <button className="play-again-button pixel-button" style={{ fontFamily:'YourFont, sans-serif', background: 'linear-gradient(180deg,#4FC3F7,#0288D1)' }} onClick={onOpenRanking || handleShowRanking}>내 순위 확인하기</button>
      </div>
      
      <div id="ranking-modal" style={{ display:'none', 
        marginTop: '20px', 
        fontSize: '14px', 
        color: '#EEE',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: 8, color:'#FFEB3B' }}>전기차와 배터리에 대해 더 많이 배웠나요? 🚗⚡</div>
        {/* 랭킹 보드 재표시 */}
        <div style={{ marginTop: 10, width: 640, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 16, border:'1px solid rgba(255,255,255,0.25)' }}>
          <div style={{ color:'#FFEE58', fontWeight: 'bold', marginBottom: 8 }}>랭킹 TOP 10</div>
          <div>
            {ranking.list.map((r: any, i: number) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', background: i%2? 'rgba(255,255,255,0.08)':'transparent', borderRadius:6, color:'#fff' }}>
                <div style={{ width: 44, display:'flex', alignItems:'center', gap:6 }}>
                  <span>#{i+1}</span>
                  {i===0 && (
                    <svg width="18" height="18" viewBox="0 0 16 16" style={{ imageRendering:'pixelated' }}>
                      <path d="M2 6 L4 4 L6 6 L8 4 L10 6 L12 4 L14 6 L12 12 L4 12 Z" fill="#FFEB3B" stroke="#FBC02D" strokeWidth="1" />
                    </svg>
                  )}
                  {i===1 && (
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ imageRendering:'pixelated' }}>
                      <rect x="4" y="6" width="8" height="6" fill="#B0BEC5" stroke="#90A4AE" />
                      <rect x="6" y="12" width="4" height="2" fill="#90A4AE" />
                    </svg>
                  )}
                  {i===2 && (
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ imageRendering:'pixelated' }}>
                      <rect x="4" y="6" width="8" height="6" fill="#FFCC80" stroke="#FFB74D" />
                      <rect x="6" y="12" width="4" height="2" fill="#FFB74D" />
                    </svg>
                  )}
                </div>
                <div style={{ flex:1 }}>{r.schoolName} {r.grade}-{r.classroom}</div>
                <div style={{ width: 120, textAlign:'right', color:'#FFEE58' }}>{(r.score ?? (r.totalCorrect*100))}</div>
                <div style={{ width: 80, textAlign:'right', color:'#B3E5FC' }}>{formatTime(r.elapsedTime)}</div>
              </div>
            ))}
          </div>
          {ranking.rank > 0 && (
            <div style={{ marginTop: 10, color:'#80DEEA' }}>이번 플레이 순위: #{ranking.rank}</div>
          )}
          <div style={{ marginTop:10 }}>
            <button className="play-again-button" onClick={() => {
              const el = document.getElementById('ranking-modal');
              if (el) el.style.display = 'none';
            }}>닫기</button>
          </div>
        </div>
      </div>
      <div className="neon-layer">
        {sparks.map(s => (
          <div key={s.id} className={`neon-spark neon-${s.variant}`} style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size }} />
        ))}
        {bursts.map(b => (
          <div key={`burst-${b.id}`} className="spark-burst" style={{ left:`${b.x}%`, top:`${b.y}%` }}>
            {Array.from({ length: b.particles }).map((_, i) => {
              const angle = (i / b.particles) * Math.PI * 2 + Math.random() * 0.6;
              const dist = 40 + Math.random() * 90;
              const dx = Math.cos(angle) * dist;
              const dy = Math.sin(angle) * dist;
              const size = 7 + Math.random() * 10;
              return <div key={`bp-${i}`} className={`spark-burst-particle neon-${b.variant}`} style={{ width:size, height:size, ['--dx' as any]: `${dx}px`, ['--dy' as any]: `${dy}px` }} />
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultScreen;
