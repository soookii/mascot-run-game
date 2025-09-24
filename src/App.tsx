import React, { useReducer, useEffect } from 'react';
import { gameReducer, initialGameState } from './state/game';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import RankingScreen from './components/RankingScreen';
import { soundManager } from './utils/soundManager';
import './styles/global.css';

function App() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // 앱 최초 진입 시 저장된 기록 초기화
  useEffect(() => {
    try {
      localStorage.removeItem('leaderboard');
      localStorage.removeItem('playerInfo');
    } catch {}
    try {
      sessionStorage.removeItem('pre_mascot_yellow');
      sessionStorage.removeItem('pre_mascot_blue');
      sessionStorage.removeItem('pre_sprinkle');
      sessionStorage.removeItem('pre_bg');
      sessionStorage.removeItem('pre_bg_src');
    } catch {}
  }, []);

  const handleSelectMascot = (mascot: 'yellow' | 'blue') => {
    dispatch({ type: 'SELECT_MASCOT', payload: mascot });
  };

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME' });
    // 게임 시작 시 배경음 재생
    soundManager.startBackgroundMusic();
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
  };

  const renderCurrentScreen = () => {
    switch (gameState.currentState) {
      case 'IDLE':
        return (
          <StartScreen
            selectedMascot={gameState.selectedMascot}
            onSelectMascot={handleSelectMascot}
            onStartGame={handleStartGame}
          />
        );
      
      case 'RUN':
      case 'QUIZ':
      case 'STUMBLE':
      case 'BOOST':
        return (
          <GameScreen
            gameState={gameState}
            dispatch={dispatch}
          />
        );
      
      case 'FINISH':
        return (
          <ResultScreen
            mascot={gameState.selectedMascot!}
            totalCorrect={gameState.totalCorrect}
            totalQuestions={15}
            elapsedTime={gameState.elapsedTime}
            onPlayAgain={handlePlayAgain}
            onOpenRanking={() => setShowRanking(true)}
          />
        );
      
      default:
        return (
          <StartScreen
            selectedMascot={gameState.selectedMascot}
            onSelectMascot={handleSelectMascot}
            onStartGame={handleStartGame}
          />
        );
    }
  };

  const [showRanking, setShowRanking] = React.useState(false);

  return (
    <div className="App">
      {/* 외곽 네온 스파크 오버레이 (게임 컨테이너 바깥만) */}
      <OuterNeonOverlay />
      {showRanking ? (
        <RankingScreen onBack={() => setShowRanking(false)} />
      ) : (
        renderCurrentScreen()
      )}
    </div>
  );
}

export default App;

// 외곽 전용 네온 스파크: 게임 컨테이너(1200x600) 영역을 제외한 4개 영역에 스파크 표시
const OuterNeonOverlay: React.FC = () => {
  const Bar: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
    const [sparks, setSparks] = React.useState<Array<{ id:number;x:number;y:number;size:number;variant:'green'|'white'|'yellow'|'pink'|'blue'|'purple' }>>([]);
    const [bursts, setBursts] = React.useState<Array<{ id:number;x:number;y:number;variant:'green'|'white'|'yellow'|'pink'|'blue'|'purple';particles:number }>>([]);

    useEffect(() => {
      let idSeq = 1;
      const t = setInterval(() => {
        setSparks(prev => {
          const next = prev.slice(-24);
          if (Math.random() < 0.25) return next;
          const size = 6 + Math.random()*14;
          const v:any = ['green','white','yellow','pink','blue','purple'];
          next.push({ id:idSeq++, x: Math.random()*100, y: Math.random()*100, size, variant: v[(Math.random()*v.length)|0] });
          return next;
        });
      }, 900);
      return () => clearInterval(t);
    }, []);

    useEffect(() => {
      let idSeq = 1;
      const t = setInterval(() => {
        setBursts(prev => {
          const next = prev.slice(-8);
          if (Math.random() < 0.5) {
            const v:any = ['green','white','yellow','pink','blue','purple'];
            next.push({ id:idSeq++, x: Math.random()*100, y: Math.random()*100, variant: v[(Math.random()*v.length)|0], particles: 8 + ((Math.random()*6)|0) });
          }
          return next;
        });
      }, 2400);
      return () => clearInterval(t);
    }, []);

    return (
      <div className="neon-layer" style={{ position:'fixed', pointerEvents:'none', ...style }}>
        {sparks.map(s => (
          <div key={s.id} className={`neon-spark neon-${s.variant}`} style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size }} />
        ))}
        {bursts.map(b => (
          <div key={`burst-${b.id}`} className="spark-burst" style={{ left:`${b.x}%`, top:`${b.y}%` }}>
            {Array.from({ length: b.particles }).map((_, i) => {
              const angle = (i / b.particles) * Math.PI * 2 + Math.random()*0.6;
              const dist = 30 + Math.random()*70;
              const dx = Math.cos(angle)*dist; const dy = Math.sin(angle)*dist;
              const size = 5 + Math.random()*8;
              return <div key={`bp-${i}`} className={`spark-burst-particle neon-${b.variant}`} style={{ width:size, height:size, ['--dx' as any]:`${dx}px`, ['--dy' as any]:`${dy}px` }} />
            })}
          </div>
        ))}
      </div>
    );
  };

  // 중심 홀: 1200x600 기준으로 상/하/좌/우 4개 바 영역 생성
  return (
    <>
      {/* 상단 바 */}
      <Bar style={{ top:0, left:0, right:0, height:'calc(50vh - 300px)', zIndex: 2 }} />
      {/* 하단 바 */}
      <Bar style={{ bottom:0, left:0, right:0, height:'calc(50vh - 300px)', zIndex: 2 }} />
      {/* 좌측 바 */}
      <Bar style={{ top:'calc(50vh - 300px)', bottom:'calc(50vh - 300px)', left:0, width:'calc(50vw - 600px)', zIndex: 2 }} />
      {/* 우측 바 */}
      <Bar style={{ top:'calc(50vh - 300px)', bottom:'calc(50vh - 300px)', right:0, width:'calc(50vw - 600px)', zIndex: 2 }} />
    </>
  );
};
