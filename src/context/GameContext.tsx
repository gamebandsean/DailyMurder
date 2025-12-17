import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, DailyCase } from '../types';
import { generateDailyCase } from '../utils/storyGenerator';
import { generateResponse } from '../utils/characterResponses';

interface GameContextType {
  gameState: GameState;
  initializeGame: () => void;
  askQuestion: (characterId: string, question: string) => string;
  makeAccusation: (suspectId: string) => boolean;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialGameState: GameState = {
  currentCase: null,
  interrogationHistory: [],
  hasAccused: false,
  accusedId: null,
  wasCorrect: null,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const initializeGame = () => {
    const dailyCase = generateDailyCase();
    setGameState({
      ...initialGameState,
      currentCase: dailyCase,
    });
  };

  const askQuestion = (characterId: string, question: string): string => {
    if (!gameState.currentCase) return "No case loaded.";
    
    const character = gameState.currentCase.characters.find(
      c => c.suspect.id === characterId
    );
    
    if (!character) return "Character not found.";
    
    const answer = generateResponse(
      question,
      character,
      gameState.currentCase.characters,
      gameState.currentCase
    );
    
    // Add to history
    setGameState(prev => ({
      ...prev,
      interrogationHistory: [
        ...prev.interrogationHistory,
        {
          characterId,
          question,
          answer,
          timestamp: Date.now(),
        },
      ],
    }));
    
    return answer;
  };

  const makeAccusation = (suspectId: string): boolean => {
    if (!gameState.currentCase) return false;
    
    const isCorrect = suspectId === gameState.currentCase.murdererId;
    
    setGameState(prev => ({
      ...prev,
      hasAccused: true,
      accusedId: suspectId,
      wasCorrect: isCorrect,
    }));
    
    return isCorrect;
  };

  const resetGame = () => {
    initializeGame();
  };

  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        initializeGame,
        askQuestion,
        makeAccusation,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

