import React, { useMemo } from 'react';
import { GAME_CONFIG } from '../config';

interface BackgroundProps {
  worldX: number;
}

const Background: React.FC<BackgroundProps> = ({ worldX }) => {
  const { parallax } = GAME_CONFIG;
  const buildingWidth = 150;
  const screenWidth = 1200;
  const totalBuildings = Math.ceil(screenWidth / buildingWidth) + 10;
  const cloudsParallax = parallax.sky * 2.5; // 별보다 약간 빠르게
  const farSkylineParallax = parallax.skyline * 0.5; // 빌딩보다 느리게, 하늘보다 빠르게
  
  // 별 생성 (빌딩 위 공간에 집중)
  const starsSvg = useMemo(() => {
    const stars: JSX.Element[] = [];
    const width = 4800;
    const gridX = 90; // 촘촘하되 줄서지 않도록 약간 증가
    const gridY = 14;
    const cellW = width / gridX;
    const yTop = 6;
    const yBottom = 300;
    const cellH = (yBottom - yTop) / gridY;
    let id = 0;

    const hash = (a: number, b: number) => {
      const t = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
      return t - Math.floor(t);
    };

    for (let gx = 0; gx < gridX; gx++) {
      const rowOffset = (gx % 2) ? 0.5 : 0; // 벌집(헥사) 배치로 가로/세로 정렬감 완화
      for (let gy = 0; gy < gridY; gy++) {
        // 밀도 30% 감소: 약 30%의 셀을 비워 둠
        if (hash(gx + 101, gy + 103) < 0.3) {
          continue;
        }
        const cx = gx * cellW + cellW * 0.5;
        const cyBase = yTop + (gy + 0.5 + rowOffset * 0.7) * cellH; // 살짝만 오프셋

        // 곡면 와핑으로 수평선 느낌 제거
        const warp = 12 * Math.sin((cx * 0.01) + gx * 0.15);

        // 셀 내부 지터 (겹침 방지: 셀당 1개)
        const jx = (hash(gx, gy) - 0.5) * cellW * 0.7; // 최대 70%까지 분산
        const jy = (hash(gx + 19, gy + 7) - 0.5) * cellH * 0.7;

        const x = cx + jx;
        const y = cyBase + warp + jy;

        const base = hash(gx + 23, gy + 29);
        const size = 0.8 + base * 2.2; // 0.8~3.0
        const opacity = 0.55 + hash(gx + 3, gy + 11) * 0.45; // 0.55~1.0

        stars.push(
          <circle key={`s-${id++}`} cx={x} cy={y} r={size} fill="white" opacity={opacity} />
        );
      }
    }
    return (
      <svg
        width="100%"
        height="500"
        viewBox={`0 0 1200 500`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '500px',
          pointerEvents: 'none',
        }}
      >
        {stars}
      </svg>
    );
  }, []);

  // 구름 타일 (부드러운 원형 조합으로 묶인 클러스터)
  const cloudsTile = useMemo(() => {
    const clouds: JSX.Element[] = [];
    const tileWidth = 1200;
    const numClouds = 14;
    const hash = (n: number) => {
      const t = Math.sin(n * 127.1) * 43758.5453;
      return t - Math.floor(t);
    };
    for (let i = 0; i < numClouds; i++) {
      const baseX = 80 + (i * (tileWidth - 160)) / (numClouds - 1);
      const jitterX = (hash(i + 3) - 0.5) * 90;
      const x = baseX + jitterX;
      const y = 70 + hash(i + 11) * 140; // 70~210
      const scale = 0.6 + hash(i + 19) * 0.9; // 0.6~1.5
      const alpha = 0.12 + hash(i + 29) * 0.18; // 0.12~0.3
      clouds.push(
        <g key={`c-${i}`} transform={`translate(${x} ${y}) scale(${scale})`} opacity={alpha}>
          <circle cx={0} cy={0} r={32} fill="#FFF" />
          <circle cx={20} cy={-10} r={26} fill="#FFF" />
          <circle cx={42} cy={-2} r={22} fill="#FFF" />
          <circle cx={-18} cy={-8} r={22} fill="#FFF" />
          <rect x={-30} y={-2} width={84} height={28} rx={14} ry={14} fill="#FFF" />
        </g>
      );
    }
    return (
      <svg
        width="1200"
        height="260"
        viewBox="0 0 1200 260"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {clouds}
      </svg>
    );
  }, []);

  // 원경 도시 실루엣 타일 (단색 실루엣)
  const farSkylineTile = useMemo(() => {
    const tileWidth = 1200;
    const baseHeight = 140;
    const peaks = 18;
    const hash = (n: number) => {
      const t = Math.sin(n * 17.77) * 9999.13;
      return t - Math.floor(t);
    };
    let d = `M 0 ${baseHeight}`;
    for (let i = 0; i <= peaks; i++) {
      const x = (i * tileWidth) / peaks;
      const h = baseHeight + 30 + Math.floor(hash(i + 5) * 120); // 170~290
      const w = 20 + Math.floor(hash(i + 9) * 60);
      d += ` L ${x} ${h}`;
      d += ` l ${w} ${-Math.floor(40 + hash(i + 15) * 80)}`; // 옥상 장식
      d += ` l ${Math.floor(10 + hash(i + 21) * 20)} ${Math.floor(30 + hash(i + 25) * 50)}`;
    }
    d += ` L ${tileWidth} ${baseHeight} Z`;
    return (
      <svg
        width="1200"
        height="300"
        viewBox="0 0 1200 300"
        style={{ position: 'absolute', bottom: 120, left: 0 }}
      >
        <path d={d} fill="#1c1a2a" opacity={0.85} />
        {/* 창문 점광 (드문드문) */}
        {Array.from({ length: 120 }).map((_, i) => {
          const x = 20 + (i * 10) + Math.floor(((i * 73) % 7));
          const y = 160 + ((i * 37) % 120);
          const vis = ((i * 97) % 5) === 0; // 희소도
          if (!vis) return null;
          return <rect key={`fw-${i}`} x={x} y={y} width={2} height={5} fill="#FFF1A8" opacity={0.6} />;
        })}
      </svg>
    );
  }, []);

  // 건물 생성 (무한 스크롤)
  // 빌딩 스펙을 고정(메모이제이션)하여 프레임마다 DOM을 재계산하지 않음
  const buildingSpecs = useMemo(() => {
    // 간단한 시드 기반 난수
    const seeded = (seed: number) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: totalBuildings }, (_, i) => {
      const baseRand = seeded(i * 1337.5);
      const height = 150 + Math.floor(baseRand * 200); // 150~350
      const windowRows = Math.floor(height / 30);
      const windowCols = Math.floor(buildingWidth / 20);
      const windows: JSX.Element[] = [];
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
          const r = seeded(i * 97 + row * 31 + col * 17);
          if (r > 0.3) {
            windows.push(
              <div
                key={`${i}-${row}-${col}`}
                style={{
                  position: 'absolute',
                  left: col * 20 + 10,
                  top: row * 30 + 10,
                  width: 12,
                  height: 18,
                  backgroundColor: '#FFF1A8',
                  borderRadius: '2px',
                  boxShadow: '0 0 4px rgba(255, 241, 168, 0.6)',
                }}
              />
            );
          }
        }
      }
      return { height, windows };
    });
  }, [totalBuildings]);

  const generateBuildings = () => {
    const buildings = [];
    for (let i = 0; i < totalBuildings; i++) {
      const x = i * buildingWidth;
      const spec = buildingSpecs[i];
      const screenX = x - (worldX * parallax.skyline) % (buildingWidth * 6);
      buildings.push(
        <div
          key={i}
          className="building"
          style={{
            left: screenX,
            width: buildingWidth,
            height: spec.height,
            position: 'absolute',
            bottom: 0,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          {spec.windows}
        </div>
      );
    }
    return buildings;
  };

  // 가로등 생성 (무한 스크롤)
  const generateLampPosts = () => {
    const lampPosts = [];
    const lampSpacing = 200;
    const screenWidth = 1200;
    const totalLamps = Math.ceil(screenWidth / lampSpacing) + 5; // 더 많은 가로등
    
    for (let i = 0; i < totalLamps; i++) {
      const x = i * lampSpacing;
      // 더 부드러운 무한 스크롤을 위해 모듈로 연산 개선
      const screenX = x - (worldX * parallax.road) % (lampSpacing * 3);
      lampPosts.push(
        <div
          key={i}
          className="lamp-post"
          style={{
            left: screenX,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />
      );
    }
    return lampPosts;
  };

  return (
    <div className="background">
      {/* 하늘 레이어: 별 타일링으로 우측 빈 공간 없이 채움 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '500px',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: -((worldX * parallax.sky) % 1200),
            width: '3600px',
            height: '500px',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '1200px', height: '500px' }}>{starsSvg}</div>
          <div style={{ position: 'absolute', top: 0, left: 1200, width: '1200px', height: '500px' }}>{starsSvg}</div>
          <div style={{ position: 'absolute', top: 0, left: 2400, width: '1200px', height: '500px' }}>{starsSvg}</div>
          {/* 달 1개 (타일 스트립 좌측 타일에 배치되지만, 모듈러 스크롤로 항상 한 개만 보임) */}
          <svg
            width="1200"
            height="500"
            viewBox="0 0 1200 500"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <g>
              <circle cx={920} cy={40} r={18} fill="white" opacity={0.9} />
              <circle cx={912} cy={36} r={14.4} fill="#2C1B4A" />
            </g>
          </svg>
        </div>
        {/* 구름 레이어 (별보다 약간 빠르게) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: -((worldX * cloudsParallax) % 1200),
            width: '3600px',
            height: '260px',
            zIndex: 2,
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0 }}>{cloudsTile}</div>
          <div style={{ position: 'absolute', top: 0, left: 1200 }}>{cloudsTile}</div>
          <div style={{ position: 'absolute', top: 0, left: 2400 }}>{cloudsTile}</div>
        </div>
      </div>

      {/* 원경 도시 실루엣 (건물 앞, 하늘 뒤) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: -((worldX * farSkylineParallax) % 1200),
          width: '3600px',
          height: '300px',
          zIndex: 3,
        }}
      >
        <div style={{ position: 'absolute', bottom: 0, left: 0 }}>{farSkylineTile}</div>
        <div style={{ position: 'absolute', bottom: 0, left: 1200 }}>{farSkylineTile}</div>
        <div style={{ position: 'absolute', bottom: 0, left: 2400 }}>{farSkylineTile}</div>
      </div>

      {/* 건물들 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 4,
        }}
      >
        {generateBuildings()}
      </div>

      {/* 도로 (무한 스크롤 개선) */}
      <div
        className="road"
        style={{
          left: -(worldX * parallax.road) % 2400,
          width: '400%',
          willChange: 'transform',
          transform: 'translateZ(0)',
          zIndex: 5,
        }}
      />

      {/* 가로등들 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 6,
        }}
      >
        {generateLampPosts()}
      </div>
    </div>
  );
};

export default Background;
