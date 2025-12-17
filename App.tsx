import React, { useState } from 'react';
import { GameProvider, useGame } from './src/context/GameContext';
import GameScreen from './src/screens/GameScreen';
import AccusationScreen from './src/screens/AccusationScreen';
import ResultScreen from './src/screens/ResultScreen';

type Screen = 'game' | 'accusation' | 'result';

function GameNavigator() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('game');
  const { makeAccusation, resetGame, gameState } = useGame();

  const handleNavigateToAccusation = () => {
    setCurrentScreen('accusation');
  };

  const handleBackToGame = () => {
    setCurrentScreen('game');
  };

  const handleAccuse = (suspectId: string) => {
    makeAccusation(suspectId);
    setCurrentScreen('result');
  };

  const handlePlayAgain = () => {
    resetGame();
    setCurrentScreen('game');
  };

  // If already accused, show result
  if (gameState.hasAccused && currentScreen !== 'result') {
    setCurrentScreen('result');
  }

  switch (currentScreen) {
    case 'game':
      return <GameScreen onNavigateToAccusation={handleNavigateToAccusation} />;
    case 'accusation':
      return <AccusationScreen onBack={handleBackToGame} onAccuse={handleAccuse} />;
    case 'result':
      return <ResultScreen onPlayAgain={handlePlayAgain} />;
    default:
      return <GameScreen onNavigateToAccusation={handleNavigateToAccusation} />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <GameNavigator />
    </GameProvider>
  );
}
