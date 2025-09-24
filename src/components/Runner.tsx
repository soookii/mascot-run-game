import React, { useEffect, useState } from 'react';
import { MascotType } from '../config';

interface RunnerProps {
  mascot: MascotType;
  isJumping: boolean;
  isStumbling: boolean;
}

const Runner: React.FC<RunnerProps> = ({ 
  mascot, 
  isJumping, 
  isStumbling 
}) => {
  const getRunnerClass = () => {
    let className = 'runner';
    if (isJumping) {
      className += ' jumping';
    } else if (isStumbling) {
      className += ' stumbling';
    }
    // 달리기 애니메이션은 기본적으로 항상 적용됨
    return className;
  };

  const renderDroplet = (variant: 'yellow' | 'blue') => {
    if (variant === 'yellow') {
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ width: '100%', height: '100%' }}>
          {/* 노란색 캐릭터 - 첨부 이미지에 더 가깝게 */}
          
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
          
          {/* 얼굴 */}
          {/* 눈 (더 크고 둥글게, 10% 더 벌어짐) */}
          <circle cx="32" cy="22" r="4" fill="#000" />
          <circle cx="48" cy="22" r="4" fill="#000" />
          {/* 눈 하이라이트 (더 크게) */}
          <circle cx="33.5" cy="20.5" r="1.8" fill="white" />
          <circle cx="49.5" cy="20.5" r="1.8" fill="white" />
          <circle cx="34.2" cy="19.8" r="0.8" fill="white" />
          <circle cx="50.2" cy="19.8" r="0.8" fill="white" />
          
          {/* 볼 (더 크고 자연스럽게) */}
          <circle cx="24" cy="30" r="4" fill="#FFAB91" />
          <circle cx="56" cy="30" r="4" fill="#FFAB91" />
          
          {/* 입 (미소) */}
          <path d="M35 34 Q40 38 45 34" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* 주변 번개 이펙트 */}
          <g opacity="0.8">
            {/* 좌측 상단 */}
            <polygon points="8,6 16,6 13,12 22,12 6,25 13,18 6,18" fill="#FFEB3B" />
            <polygon points="10,16 16,16 14,20 20,20 8,28 14,24 8,24" fill="#FFEB3B" />
            
            {/* 우측 중간 */}
            <polygon points="63,33 72,33 69,39 78,39 60,53 69,46 60,46" fill="#FFEB3B" />
            <polygon points="66,43 72,43 70,47 76,47 64,55 70,51 64,51" fill="#FFEB3B" />
            
            {/* 우측 상단 */}
            <polygon points="58,8 66,8 64,12 70,12 56,22 64,18 56,18" fill="#FFEB3B" />
          </g>
        </svg>
      );
    } else {
      return (
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ width: '100%', height: '100%' }}>
          {/* 파란색 캐릭터 - 첨부 이미지에 더 가깝게 */}
          
          {/* 머리 부분 (완전한 원형) */}
          <circle cx="40" cy="28" r="20" fill="#64B5F6" />
          
          {/* 몸통 (둥근 형태) */}
          <ellipse cx="40" cy="57" rx="18" ry="20" fill="#64B5F6" />
          
          {/* 팔 (더 둥글게) */}
          <ellipse cx="20" cy="52" rx="10" ry="6" fill="#64B5F6" />
          <ellipse cx="60" cy="52" rx="10" ry="6" fill="#64B5F6" />
          
          {/* 다리 (더 둥글게) */}
          <ellipse cx="32" cy="75" rx="8" ry="6" fill="#64B5F6" />
          <ellipse cx="48" cy="75" rx="8" ry="6" fill="#64B5F6" />
          
          {/* 얼굴 */}
          {/* 눈 (더 크고 둥글게, 10% 더 벌어짐) */}
          <circle cx="32" cy="22" r="4" fill="#000" />
          <circle cx="48" cy="22" r="4" fill="#000" />
          {/* 눈 하이라이트 (더 크게) */}
          <circle cx="33.5" cy="20.5" r="1.8" fill="white" />
          <circle cx="49.5" cy="20.5" r="1.8" fill="white" />
          <circle cx="34.2" cy="19.8" r="0.8" fill="white" />
          <circle cx="50.2" cy="19.8" r="0.8" fill="white" />
          
          {/* 볼 (더 크고 자연스럽게) */}
          <circle cx="26" cy="30" r="4" fill="#FFB6C1" />
          <circle cx="54" cy="30" r="4" fill="#FFB6C1" />
          
          {/* 입 (미소) */}
          <path d="M35 34 Q40 38 45 34" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* 주변 번개 이펙트 (파란색 테마) */}
          <g opacity="0.8">
            {/* 좌측 상단 */}
            <polygon points="8,8 16,8 13,14 22,14 6,26 13,20 6,20" fill="#42A5F5" stroke="#1976D2" strokeWidth="0.5" />
            <polygon points="10,18 16,18 14,22 20,22 8,30 14,26 8,26" fill="#42A5F5" stroke="#1976D2" strokeWidth="0.5" />
            
            {/* 우측 중간 */}
            <polygon points="63,35 72,35 69,41 78,41 60,55 69,48 60,48" fill="#42A5F5" stroke="#1976D2" strokeWidth="0.5" />
            <polygon points="66,45 72,45 70,49 76,49 64,57 70,53 64,53" fill="#42A5F5" stroke="#1976D2" strokeWidth="0.5" />
            
            {/* 우측 상단 */}
            <polygon points="58,10 66,10 64,14 70,14 56,24 64,20 56,20" fill="#42A5F5" stroke="#1976D2" strokeWidth="0.5" />
          </g>
          
          {/* 우측 하단 장식 제거 */}
        </svg>
      );
    }
  };

  // 외부 아트(.svg/.png) 자동 사용: /public/mascot-yellow.(svg|png), /public/mascot-blue.(svg|png)
  const [externalAsset, setExternalAsset] = useState<string | null>(null);
  const [processedAsset, setProcessedAsset] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const variant = mascot === 'yellow' ? 'yellow' : 'blue';
    const sessionKey = variant === 'yellow' ? 'pre_mascot_yellow' : 'pre_mascot_blue';
    const sessionCached = typeof window !== 'undefined' ? sessionStorage.getItem(sessionKey) : null;
    // 사전 처리된 데이터 URL이 있으면 즉시 사용하여 전환 시 깜빡임/깨짐 방지
    if (sessionCached) {
      setExternalAsset(sessionCached);
      return () => { mounted = false; };
    }
    const candidates = [
      sessionCached || '',
      `/mascot-${variant}.svg`,
      `/mascot-${variant}.png`,
      `/mascot-${variant}@2x.png`,
      `/mascot-${variant}(2).svg`,
      `/mascot-${variant}(2).png`,
      `/mascot-${variant}(2)@2x.png`,
    ];
    (async () => {
      for (const url of candidates) {
        if (!url) continue;
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (res.ok) {
            if (mounted) setExternalAsset(url);
            return;
          }
        } catch {}
      }
      if (mounted) setExternalAsset(null);
    })();
    return () => { mounted = false; };
  }, [mascot]);

  // 왼쪽 캐릭터만 사용하도록 필요 시 좌측 절반 크롭 + (리니 PNG는 흰 배경 투명화)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!externalAsset) {
        setProcessedAsset(null);
        return;
      }
      try {
        const img = new Image();
        img.src = externalAsset;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('failed to load'));
        });
        if (cancelled) return;
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;
        const hasTwoUp = srcW >= srcH * 1.5; // 가로로 2인 배치로 추정 시 좌측만 사용
        const leftCropRatio = mascot === 'blue' ? 0.6 : 0.5; // 리니는 번개 여유 포함
        const drawW = hasTwoUp ? Math.floor(srcW * leftCropRatio) : srcW;
        const drawH = srcH;
        const canvas = document.createElement('canvas');
        canvas.width = drawW;
        canvas.height = drawH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setProcessedAsset(externalAsset);
          return;
        }
        // 좌측 중심 + 우측 아이콘 여유 포함하여 크롭(좌표는 0에서 시작)
        if (hasTwoUp) {
          ctx.drawImage(img, 0, 0, drawW, drawH, 0, 0, drawW, drawH);
        } else {
          ctx.drawImage(img, 0, 0, drawW, drawH);
        }

        // 리니(blue) PNG/투명화 필요 시 배경 정리
        if (mascot === 'blue') {
          const { width, height } = canvas;
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          const total = width * height;
          const visited = new Uint8Array(total);
          const queue = new Uint32Array(total);
          let qh = 0, qt = 0;
          const idx = (x: number, y: number) => y * width + x;
          const nearWhite = (i: number) => {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const maxDiff = Math.max(r, g, b) - Math.min(r, g, b);
            return r >= 248 && g >= 248 && b >= 248 && maxDiff <= 10;
          };
          const pushIf = (x: number, y: number) => {
            if (x < 0 || y < 0 || x >= width || y >= height) return;
            const p = idx(x, y);
            if (visited[p]) return;
            const di = p * 4;
            if (!nearWhite(di)) return;
            visited[p] = 1; queue[qt++] = p;
          };
          for (let x = 0; x < width; x++) { pushIf(x, 0); pushIf(x, height - 1); }
          for (let y = 0; y < height; y++) { pushIf(0, y); pushIf(width - 1, y); }
          while (qh < qt) {
            const p = queue[qh++];
            const x = p % width; const y = (p / width) | 0;
            const di = p * 4; data[di + 3] = 0;
            pushIf(x - 1, y); pushIf(x + 1, y); pushIf(x, y - 1); pushIf(x, y + 1);
          }
          ctx.putImageData(imageData, 0, 0);
        }
        const url = canvas.toDataURL('image/png');
        if (!cancelled) setProcessedAsset(url);
      } catch {
        setProcessedAsset(externalAsset);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [externalAsset, mascot]);

  return (
    <div style={{ position: 'relative', width: '300px', height: '180px', overflow: 'visible' }}>
      {/* 정교한 캐릭터 */}
      <div
        style={{
          width: '150px',
          height: '150px',
          position: 'relative',
          left: '64px', // 기존 위치 유지(필요 시 추후 미세 보정)
          top: '0px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        className={getRunnerClass()}
      >
        {/* 외부 제공 캐릭터가 있으면 그대로 사용, 없으면 기존 드로잉 사용 */}
        {externalAsset ? (
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <img
              src={processedAsset || externalAsset}
              alt="mascot"
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'contain',
                objectPosition: 'center',
                imageRendering: 'pixelated',
                background: 'transparent'
              }}
              draggable={false}
              onError={(e) => {
                // 외부 리소스 로딩 실패 시 내장 SVG로 폴백
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                const container = (e.currentTarget.parentElement as HTMLElement);
                if (container) {
                  const fallback = document.createElement('div');
                  fallback.style.width = '150px';
                  fallback.style.height = '150px';
                  container.appendChild(fallback);
                }
              }}
            />
          </div>
        ) : (
          mascot === 'yellow' ? renderDroplet('yellow') : renderDroplet('blue')
        )}
      </div>
      
    </div>
  );
};

export default Runner;
