import React, { useEffect, useState } from 'react';

interface ChestProps {
  x: number;
  worldX: number;
  isOpen: boolean;
  onCollision: () => void;
  forceOpen?: boolean;
  withBurst?: boolean;
  wasWrong?: boolean;
  isTrophy?: boolean;
}

const Chest: React.FC<ChestProps> = ({ x, worldX, isOpen: _isOpen, onCollision: _onCollision, forceOpen: _forceOpen = false, withBurst = false, wasWrong = false, isTrophy = false }) => {
  const screenX = x - worldX;
  // 화면 중간에서 깜빡임 방지를 위해 가시 영역 여유를 넉넉히 확보
  const isVisible = screenX > -200 && screenX < 1400;
  // const opened = isOpen || forceOpen;
  // const isLast = false; // 사용 안 함
  
  if (!isVisible) return null;

  // 외부 트로피 아트 자동 사용
  const [trophyAsset, setTrophyAsset] = useState<string | null>(null);
  useEffect(() => {
    if (!isTrophy) return;
    let mounted = true;
    const candidates = ['/trophy.svg', '/trophy.png', '/trophy@2x.png'];
    (async () => {
      for (const url of candidates) {
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (res.ok) { if (mounted) setTrophyAsset(url); return; }
        } catch {}
      }
      if (mounted) setTrophyAsset(null);
    })();
    return () => { mounted = false; };
  }, [isTrophy]);

  // 외부 전기 에너지(픽셀) 이미지 자동 사용
  const [energyAsset, setEnergyAsset] = useState<string | null>(null);
  const [processedEnergy, setProcessedEnergy] = useState<string | null>(null);
  useEffect(() => {
    if (isTrophy) return; // 트로피일 때는 무시
    let mounted = true;
    // StartScreen에서 사전 처리해둔 스프링클을 우선 사용하여 초기 깜빡임/깨짐 방지
    try {
      const pre = sessionStorage.getItem('pre_sprinkle');
      if (pre) {
        setEnergyAsset(pre);
        return () => { mounted = false; };
      }
    } catch {}
    const candidates = [
      '/sprinkle.png', '/sprinkle.svg', '/sprinkle@2x.png',
      '/energy-pixel.png', '/energy-pixel@2x.png', '/energy-pixel.svg',
      '/electric-energy.png', '/electric-energy.svg', '/energy.png'
    ];
    (async () => {
      for (const url of candidates) {
        try { const res = await fetch(url, { method: 'HEAD' }); if (res.ok) { if (mounted) setEnergyAsset(url); return; } } catch {}
      }
      if (mounted) setEnergyAsset(null);
    })();
    return () => { mounted = false; };
  }, [isTrophy]);

  // 오답 시 영구적으로 검은색(응고) 상태 유지
  const [solidified, setSolidified] = useState<boolean>(false);
  useEffect(() => {
    if (wasWrong) setSolidified(true);
  }, [wasWrong]);

  // 에너지 이미지 배경 투명 처리(거의 흰색 제거)
  useEffect(() => {
    const run = async () => {
      if (!energyAsset) { setProcessedEnergy(null); return; }
      // 우선 원본을 먼저 보여주고(즉시 표시), 투명 처리 결과로 교체
      setProcessedEnergy(energyAsset);
      if (!energyAsset.endsWith('.png')) { return; }
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = energyAsset;
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d'); if (!ctx) { setProcessedEnergy(energyAsset); return; }
        ctx.drawImage(img, 0, 0);
        const { width, height } = canvas;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const visited = new Uint8Array(width * height);
        const q = new Uint32Array(width * height);
        let h = 0, t = 0;
        const idx = (x: number, y: number) => y * width + x;
        // 모서리 기준 배경 색상(스프링클 배경이 아이보리/크림색 등일 수 있어 동적 추정)
        const sample = (x: number, y: number) => {
          const k = (y * width + x) * 4; return [data[k], data[k+1], data[k+2], data[k+3]] as const;
        };
        const c1 = sample(0,0), c2 = sample(width-1,0), c3 = sample(0,height-1), c4 = sample(width-1,height-1);
        const bgR = Math.round((c1[0]+c2[0]+c3[0]+c4[0]) / 4);
        const bgG = Math.round((c1[1]+c2[1]+c3[1]+c4[1]) / 4);
        const bgB = Math.round((c1[2]+c2[2]+c3[2]+c4[2]) / 4);
        const isBg = (i: number) => {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const dr = r - bgR, dg = g - bgG, db = b - bgB;
          const dist2 = dr*dr + dg*dg + db*db;
          return dist2 <= 3600; // 배경과의 색 거리 임계(≈60)
        };
        const pushIf = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= width || y >= height) return;
          const p = idx(x, y); if (visited[p]) return;
          const di = p * 4; if (!isBg(di)) return;
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
        setProcessedEnergy(canvas.toDataURL('image/png'));
      } catch {
        setProcessedEnergy(energyAsset);
      }
    };
    run();
  }, [energyAsset]);

  return (
    <div
      style={{
        position: 'absolute',
        left: screenX - 26,
        bottom: 118,
        width: '72px',
        height: '72px',
        zIndex: 5,
        pointerEvents: 'none', // 클릭 이벤트 비활성화
      }}
    >
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
        <defs>
          <radialGradient id="energyCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFE0" />
            <stop offset="70%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#FFC107" />
          </radialGradient>
          <radialGradient id="energyCoreDark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#555" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <radialGradient id="ring" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF59D" />
            <stop offset="100%" stopColor="#FFB300" />
          </radialGradient>
          <filter id="smokeBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <linearGradient id="sparkGradW" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFAB91" />
            <stop offset="100%" stopColor="#FF3D00" />
          </linearGradient>
          {/* 네온 할로/글로우 */}
          <radialGradient id="neonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF59D" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFEB3B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFC107" stopOpacity="0" />
          </radialGradient>
          <filter id="neonBlurHeavy" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          {/* 검정색으로 변환 (알파 유지) */}
          <filter id="toBlack" x="-50%" y="-50%" width="200%" height="200%">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
          </filter>
        </defs>
        {isTrophy ? (
          trophyAsset ? (
            <image href={trophyAsset} x={4} y={4} width={64} height={64} preserveAspectRatio="xMidYMid meet"/>
          ) : (
          /* 픽셀 트로피 (캔버스 내 안전영역에 맞춰 여백 보강, 잘림 방지) */
          <g transform="translate(4 4)">
            {/* 컵 상단 */}
            <rect x="8" y="2" width="48" height="6" fill="#FFC107" />
            <rect x="10" y="8" width="44" height="22" fill="#FFEB3B" />
            {/* 하이라이트 */}
            <rect x="12" y="12" width="6" height="6" fill="#FFF176" />
            {/* 손잡이 좌/우 */}
            <rect x="0" y="12" width="10" height="8" fill="#FFC107" />
            <rect x="2" y="16" width="6" height="4" fill="#FFB300" />
            <rect x="58" y="12" width="10" height="8" fill="#FFC107" />
            <rect x="60" y="16" width="6" height="4" fill="#FFB300" />
            {/* 중앙 별무늬 */}
            <rect x="32" y="14" width="4" height="4" fill="#E67E22" />
            <rect x="28" y="18" width="12" height="4" fill="#E67E22" />
            <rect x="24" y="22" width="4" height="4" fill="#E67E22" />
            <rect x="40" y="22" width="4" height="4" fill="#E67E22" />
            {/* 목/링 */}
            <rect x="30" y="30" width="8" height="10" fill="#FFC107" />
            <rect x="26" y="38" width="16" height="4" fill="#FFB300" />
            {/* 받침대 */}
            <rect x="16" y="44" width="40" height="8" fill="#FFC107" />
            <rect x="12" y="52" width="48" height="6" fill="#FF9800" />
          </g>
          )
        ) : (
          <>
            {/* 스프링클 뒤 강한 네온 할로 (중심 정렬) */}
            <g style={{ pointerEvents: 'none' as any }}>
              <circle cx={36} cy={40} r={30} fill="url(#neonHalo)" filter="url(#neonBlurHeavy)" opacity={solidified ? 0.28 : 0.85} />
              <circle cx={36} cy={40} r={22} fill="url(#neonHalo)" filter="url(#neonBlurHeavy)" opacity={solidified ? 0.24 : 0.75} />
              <circle cx={36} cy={40} r={14} fill="url(#neonHalo)" filter="url(#neonBlurHeavy)" opacity={solidified ? 0.20 : 0.6} />
            </g>
            {energyAsset ? (
              // 외부 픽셀 전기 에너지 이미지 사용
              <image
                href={processedEnergy || energyAsset}
                x={0}
                y={4}
                width={72}
                height={72}
                preserveAspectRatio="xMidYMid meet"
                style={{ imageRendering: 'pixelated' as any }}
                filter={solidified ? 'url(#toBlack)' : undefined}
                transform="translate(36 40) scale(1.265) translate(-36 -40)"
                onError={(e:any)=>{ try{ e.target.setAttribute('href',''); }catch{} }}
              />
            ) : (
              // 내장 8-bit 픽셀 에너지볼(대체)
              <g shapeRendering="crispEdges" transform="translate(36 40) scale(1.32) translate(-36 -40)">
                {(() => {
                  const px = 4; // 픽셀 크기
                  const cx = 36, cy = 40;
                  const rows = [3,5,6,7,8,7,6,5,3];
                  const rects: JSX.Element[] = [];
                  rows.forEach((w, ri) => {
                    const dy = (ri - Math.floor(rows.length/2)) * px;
                    for (let xi = -w; xi <= w; xi++) {
                      const dx = xi * px;
                      const isEdge = Math.abs(xi) === w || ri===0 || ri===rows.length-1;
                      const active = !solidified;
                      const fill = active ? (isEdge ? '#FFB300' : '#FFC107') : (isEdge ? '#1a1a1a' : '#2b2b2b');
                      rects.push(
                        <rect key={`p-${ri}-${xi}`} x={cx + dx - px/2} y={cy + dy - px/2} width={px} height={px} fill={fill} />
                      );
                    }
                  });
                  return rects;
                })()}
              </g>
            )}
          </>
        )}
        {/* 정답 시 폭발 이펙트 */}
        {withBurst && (
          <g>
            <circle cx={36} cy={40} r={0} fill="none" stroke="#FFE082" strokeWidth="4" opacity={0.9}>
              <animate attributeName="r" values="0;50" dur="0.5s" repeatCount="1" fill="freeze" />
              <animate attributeName="opacity" values="0.9;0" dur="0.5s" repeatCount="1" fill="freeze" />
            </circle>
          </g>
        )}
        {/* 오답 시 폭발(파편/충격파/스파크/연기) 이펙트 */}
        {wasWrong && (
          <g>
            {/* 플래시 */}
            <circle cx={36} cy={40} r={0} fill="#FFFFFF" opacity={0.9}>
              <animate attributeName="r" values="0;22;0" dur="0.18s" repeatCount="1" />
              <animate attributeName="opacity" values="0.9;0.4;0" dur="0.18s" repeatCount="1" />
            </circle>
            {/* 이중 충격파 */}
            {[0,1].map((k) => (
              <circle key={`shock-${k}`} cx={36} cy={40} r={0} fill="none" stroke={k?"#FF6E40":"#FFAB40"} strokeWidth={k?2:3} opacity={0.9}>
                <animate attributeName="r" values="0;100" dur={`${0.55 + k*0.12}s`} repeatCount="1" fill="freeze" />
                <animate attributeName="opacity" values="0.9;0" dur={`${0.55 + k*0.12}s`} repeatCount="1" fill="freeze" />
              </circle>
            ))}
            {/* 파편 (다각형) */}
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const dx = Math.cos(angle) * (60 + (i%3)*14);
              const dy = Math.sin(angle) * (60 + (i%3)*14);
              const rot = (angle * 180) / Math.PI + 90;
              return (
                <polygon key={`poly-${i}`} points="0,0 4,0 3,6 -1,6" fill="url(#sparkGradW)" opacity="0.95">
                  <animateTransform attributeName="transform" type="translate" from={`36 40`} to={`${36 + dx} ${40 + dy}`} dur="0.55s" fill="freeze" />
                  <animateTransform attributeName="transform" additive="sum" type="rotate" from={`0 0 0`} to={`${rot} 0 0`} dur="0.55s" fill="freeze" />
                  <animate attributeName="opacity" values="0.95;0" dur="0.55s" fill="freeze" />
                </polygon>
              );
            })}
            {/* 스파크 라인 */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + Math.PI/8;
              const dx = Math.cos(angle) * 60;
              const dy = Math.sin(angle) * 60;
              return (
                <line key={`line-${i}`} x1={36} y1={40} x2={36} y2={40} stroke="#FFC400" strokeWidth="2" opacity="0.9">
                  <animate attributeName="x2" values={`${36};${36 + dx}`} dur="0.45s" fill="freeze" />
                  <animate attributeName="y2" values={`${40};${40 + dy}`} dur="0.45s" fill="freeze" />
                  <animate attributeName="opacity" values="0.9;0" dur="0.45s" fill="freeze" />
                </line>
              );
            })}
            {/* 연기 (모락모락) */}
            {Array.from({ length: 5 }).map((_, i) => (
              <circle key={`smoke-${i}`} cx={36 + (i-2)*4} cy={40} r={2} fill="rgba(180,180,180,0.7)" filter="url(#smokeBlur)">
                <animate attributeName="cy" values={`${40};${24 - i*2}`} dur="1.5s" fill="freeze" />
                <animate attributeName="r" values="2;7" dur="1.5s" fill="freeze" />
                <animate attributeName="opacity" values="0.7;0" dur="1.5s" fill="freeze" />
              </circle>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};

export default Chest;