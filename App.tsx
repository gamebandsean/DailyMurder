import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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

function GameFrame({ children }: { children: React.ReactNode }) {
  // Only wrap in frame on web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.webContainer}>
      <View style={styles.gameFrame}>
        {children}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameFrame>
        <GameNavigator />
      </GameFrame>
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh' as any,
  },
  gameFrame: {
    width: 960,
    height: 875, // Adjusted to fit content
    backgroundColor: '#2C1810',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(212, 165, 116, 0.2)' as any,
  },
});
