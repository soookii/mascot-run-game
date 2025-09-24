import React from 'react';

interface RankingScreenProps {
  onBack: () => void;
}

const RankingScreen: React.FC<RankingScreenProps> = ({ onBack }) => {
  const [list, setList] = React.useState<any[]>([]);

  React.useEffect(() => {
    try {
      const key = 'leaderboard';
      const l = JSON.parse(localStorage.getItem(key) || '[]');
      // 이미 저장된 순위 리스트를 정렬해 최신 기준을 보장
      l.sort((a:any,b:any)=>{
        const as = a.score ?? (a.totalCorrect*100);
        const bs = b.score ?? (b.totalCorrect*100);
        if (bs!==as) return bs-as;
        if (a.elapsedTime!==b.elapsedTime) return a.elapsedTime-b.elapsedTime;
        return b.date-a.date;
      });
      setList(l.slice(0, 50));
    } catch {
      setList([]);
    }
  }, []);

  return (
    <div className="result-screen" style={{ fontFamily: 'YourFont, sans-serif' }}>
      <h1 className="result-title">랭킹</h1>
      <div style={{ marginTop: 10, width: 680, background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 16, border:'1px solid rgba(255,255,255,0.25)' }}>
        <div style={{ color:'#FFEE58', fontWeight: 'bold', marginBottom: 8 }}>전체 기록</div>
        <div>
          {list.length === 0 && <div style={{ color:'#B3E5FC' }}>기록이 없습니다.</div>}
          {list.map((r: any, i: number) => (
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
              <div style={{ width: 80, textAlign:'right', color:'#B3E5FC' }}>{Math.floor((r.elapsedTime||0)/60)}:{String(Math.floor((r.elapsedTime||0)%60)).padStart(2,'0')}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <button className="play-again-button pixel-button" style={{ fontFamily:'YourFont, sans-serif', background:'#1976D2' }} onClick={onBack}>돌아가기</button>
      </div>
    </div>
  );
};

export default RankingScreen;


