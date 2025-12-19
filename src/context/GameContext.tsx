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
  learnedSecrets: [],
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
    
    const { response, revealedSecret } = generateResponse(
      question,
      character,
      gameState.currentCase.characters,
      gameState.currentCase,
      gameState.learnedSecrets
    );
    
    // Update state with new info
    setGameState(prev => {
      const newLearnedSecrets = [...prev.learnedSecrets];
      
      // If a secret was revealed, track it
      if (revealedSecret) {
        const alreadyKnown = newLearnedSecrets.some(
          s => s.aboutId === revealedSecret.aboutId && s.secret === revealedSecret.secret
        );
        if (!alreadyKnown) {
          newLearnedSecrets.push({
            aboutId: revealedSecret.aboutId,
            secret: revealedSecret.secret,
            fromId: characterId,
          });
        }
      }
      
      return {
        ...prev,
        learnedSecrets: newLearnedSecrets,
        interrogationHistory: [
          ...prev.interrogationHistory,
          {
            characterId,
            question,
            answer: response,
            timestamp: Date.now(),
          },
        ],
      };
    });
    
    return response;
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
    // Generate a new random case (not daily-seeded for replay)
    const randomSeed = Date.now();
    const newCase = generateDailyCase(randomSeed);
    setGameState({
      ...initialGameState,
      currentCase: newCase,
    });
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
