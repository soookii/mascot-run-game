import React, { useState, useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../config';

interface BackgroundProps {
  worldX: number;
}

const Background: React.FC<BackgroundProps> = ({ worldX }) => {
  const { parallax } = GAME_CONFIG;
  // 외부 배경 이미지 자동 사용: /public/game-bg.(png|jpg|jpeg|svg)
  const [externalBg, setExternalBg] = useState<string | null>(null);
  // const [bgRatio, setBgRatio] = useState<number | null>(null);
  const [processedBg, setProcessedBg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerW, setContainerW] = useState<number>(0);
  // const containerRatio = GAME_CONFIG.screenWidth / GAME_CONFIG.screenHeight; // 1200/600 = 2
  useEffect(() => {
    let mounted = true;
    const candidates = ['/game-bg.png', '/game-bg.jpg', '/game-bg.jpeg', '/game-bg.webp', '/game-bg.svg', '/pastel-minimal-wide-bg.svg'];
    (async () => {
      for (const url of candidates) {
        try { const res = await fetch(url, { method: 'HEAD' }); if (res.ok) { if (mounted) setExternalBg(url); return; } } catch {}
      }
      if (mounted) setExternalBg(null);
    })();
    return () => { mounted = false; };
  }, []);

  // 세션에 미리 처리된 배경이 있으면 즉시 사용하여 첫 렌더 끊김 방지
  useEffect(() => {
    try {
      if (!externalBg) return;
      const preSrc = sessionStorage.getItem('pre_bg_src');
      const preData = sessionStorage.getItem('pre_bg');
      if (preSrc && preData && preSrc === externalBg) {
        setProcessedBg(preData);
      }
    } catch {}
  }, [externalBg]);

  // 컨테이너 폭 추적 (반응형 타일 계산)
  useEffect(() => {
    const onResize = () => {
      if (containerRef.current) {
        setContainerW(containerRef.current.clientWidth || 0);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 외부 배경의 원본 가로세로 비율을 읽어 화면 비율에 맞춰 자동 조정
  // 비율 보정 비활성화 (현재는 cover로 처리)

  // 외곽 흰색 테두리 자동 크롭 (거의 흰색을 여백으로 간주)
  useEffect(() => {
    if (!externalBg) { setProcessedBg(null); return; }
    const run = async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = externalBg;
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); });
      const w = img.naturalWidth, h = img.naturalHeight;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d'); if (!ctx) { setProcessedBg(externalBg); return; }
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, w, h).data;
      const isWhite = (i: number) => {
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        const maxDiff = Math.max(r,g,b) - Math.min(r,g,b);
        return a > 0 && r >= 245 && g >= 245 && b >= 245 && maxDiff <= 10;
      };
      let top = 0, bottom = h-1, left = 0, right = w-1;
      // 위
      scanTop: for (; top < h; top++) {
        for (let x=0; x<w; x++) { if (!isWhite((top*w + x)*4)) break scanTop; }
      }
      // 아래
      scanBottom: for (; bottom >= 0; bottom--) {
        for (let x=0; x<w; x++) { if (!isWhite((bottom*w + x)*4)) break scanBottom; }
      }
      // 좌
      scanLeft: for (; left < w; left++) {
        for (let y=top; y<=bottom; y++) { if (!isWhite((y*w + left)*4)) break scanLeft; }
      }
      // 우
      scanRight: for (; right >= 0; right--) {
        for (let y=top; y<=bottom; y++) { if (!isWhite((y*w + right)*4)) break scanRight; }
      }
      const cw = Math.max(1, right - left + 1);
      const ch = Math.max(1, bottom - top + 1);
      const out = document.createElement('canvas');
      out.width = cw; out.height = ch;
      const octx = out.getContext('2d'); if (!octx) { setProcessedBg(externalBg); return; }
      octx.drawImage(canvas, left, top, cw, ch, 0, 0, cw, ch);
      setProcessedBg(out.toDataURL('image/png'));
    };
    run().catch(() => setProcessedBg(externalBg));
  }, [externalBg]);
  
  // 동물 출현 기능 제거
  
  // 동물 렌더링 제거
  
  // const buildingWidth = 150;
  // const screenWidth = 1200;
  // const totalBuildings = Math.ceil(screenWidth / buildingWidth) + 10;
  // const cloudsParallax = parallax.sky * 2.5;
  // const farSkylineParallax = parallax.skyline * 0.5;
  
  // 낮 하늘: 해와 구름만 사용
  // const skyTile = useMemo(() => null, []);

  // 구름 타일 (부드러운 원형 조합으로 묶인 클러스터)
  // const cloudsTile = useMemo(() => null, []);

  // 원경 숲 실루엣 타일 제거 (외부 배경 사용 시 불필요)
  // 내부 배경 타일 비활성화
  // const farSkylineTile = useMemo(() => null, []);

  // 중경 숲 타일 제거
  // const midForestTile = useMemo(() => null, []);

  // 캐릭터 바로 뒤 근경 숲 타일 제거
  // const nearForestTile = useMemo(() => null, []);

  // 전경 수풀/나무 계산 비활성화 (외부 배경만 사용)

  // const generateBuildings = () => [] as JSX.Element[];

  // 가로등 생성 (무한 스크롤)
  // const generateLampPosts = () => [] as JSX.Element[];

  return (
    <div ref={containerRef} className="background" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {externalBg ? (
        <div style={{ position:'absolute', inset:0, overflow:'hidden', zIndex:0 }}>
          {(() => {
            const cw = containerW || 1200;
            const tileW = cw * 1.3; // 130% 폭으로 안전 여백
            const baseLeft = -cw * 0.15; // 좌측 여백 -15%
            const edgeFade = 60; // 좌우 가장자리 페이드 폭(px)
            const overlap = edgeFade * 2; // 부드러운 블렌딩을 위한 타일 겹침 폭
            const speed = 0.08;
            const offset = ((worldX * speed) % tileW + tileW) % tileW; // 0~tileW
            const left1 = baseLeft - offset;
            const left2 = baseLeft - offset + tileW - overlap; // 겹치도록 좌측 이동
            const commonStyle: React.CSSProperties = {
              position: 'absolute',
              top: 0,
              width: `${tileW}px`,
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              backgroundColor: 'transparent',
              pointerEvents: 'none',
              willChange: 'transform',
            };
            const src = processedBg || externalBg;
            return (
              <>
                {/* 첫 번째 타일: 오른쪽 가장자리만 페이드 아웃 */}
                <img
                  src={src!}
                  alt="bg-1"
                  style={{
                    ...commonStyle,
                    left: `${left1}px`,
                    WebkitMaskImage: `linear-gradient(to right, rgba(0,0,0,1) 0, rgba(0,0,0,1) calc(100% - ${edgeFade}px), rgba(0,0,0,0) 100%)`,
                    maskImage: `linear-gradient(to right, rgba(0,0,0,1) 0, rgba(0,0,0,1) calc(100% - ${edgeFade}px), rgba(0,0,0,0) 100%)`,
                    opacity: 0,
                    transition: 'opacity 300ms ease',
                  }}
                  draggable={false}
                  onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }}
                  onLoad={(e)=>{ (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                />
                {/* 두 번째 타일: 왼쪽 가장자리만 페이드 인 */}
                <img
                  src={src!}
                  alt="bg-2"
                  style={{
                    ...commonStyle,
                    left: `${left2}px`,
                    WebkitMaskImage: `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) ${edgeFade}px, rgba(0,0,0,1) 100%)`,
                    maskImage: `linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) ${edgeFade}px, rgba(0,0,0,1) 100%)`,
                    opacity: 0,
                    transition: 'opacity 300ms ease',
                  }}
                  draggable={false}
                  onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }}
                  onLoad={(e)=>{ (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                />
              </>
            );
          })()}
        </div>
      ) : null}
      {/* 하늘과 구름 추가 */}
      {!externalBg && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: 'transparent',
          zIndex: 1,
        }}
      >
        {/* 해 */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '100px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FFD700 30%, #FFA500 100%)',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
          }}
        />
        
        {/* 구름들 - 실제 구름 형태로 여러 원 조합, 투명도 높임 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: -((worldX * 0.001) % 1200),
            width: '3600px',
            height: '200px',
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i * 450 + 100,
                top: 60 + (i % 3) * 40,
                opacity: 0.98,
                filter: 'contrast(1.1) brightness(1.05)',
              }}
            >
              {/* 구름 메인 덩어리 */}
              <div
                style={{
                  position: 'absolute',
                  left: '0px',
                  top: '8px',
                  width: '60px',
                  height: '35px',
                  background: '#FFFFFF',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              {/* 구름 좌측 */}
              <div
                style={{
                  position: 'absolute',
                  left: '-15px',
                  top: '5px',
                  width: '45px',
                  height: '30px',
                  background: '#FFFFFF',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              {/* 구름 우측 */}
              <div
                style={{
                  position: 'absolute',
                  left: '45px',
                  top: '12px',
                  width: '50px',
                  height: '28px',
                  background: '#FFFFFF',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              {/* 구름 상단 */}
              <div
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '0px',
                  width: '40px',
                  height: '25px',
                  background: '#FFFFFF',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              {/* 구름 하단 보완 */}
              <div
                style={{
                  position: 'absolute',
                  left: '15px',
                  top: '18px',
                  width: '35px',
                  height: '22px',
                  background: '#FFFFFF',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
      )}

      {/* 내부 나무/꽃 레이어 제거: 외부 배경만 사용 */}

      {/* 초원 바닥 */}
      {!externalBg && (
      <div
        className="road"
        style={{
          left: -(worldX * parallax.road) % 2400,
          width: '400%',
          willChange: 'transform',
          transform: 'translateZ(0)',
          zIndex: 6,
        }}
      />
      )}
    </div>
  );
};

export default Background;
