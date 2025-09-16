import React, { useReducer } from 'react';
import { gameReducer, initialGameState, GameState } from './state/game';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import './styles/global.css';

function App() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const handleSelectMascot = (mascot: 'cat' | 'dog') => {
    dispatch({ type: 'SELECT_MASCOT', payload: mascot });
  };

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME' });
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
            totalQuestions={10}
            elapsedTime={gameState.elapsedTime}
            onPlayAgain={handlePlayAgain}
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

  return (
    <div className="App">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;
