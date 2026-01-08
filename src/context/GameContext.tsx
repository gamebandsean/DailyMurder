import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, DailyCase, CharacterEvidence, GameSettings } from '../types';
import { generateDailyCase } from '../utils/storyGenerator';
import { generateResponse } from '../utils/characterResponses';
import { generateLLMResponse } from '../services/llmService';

interface GameContextType {
  gameState: GameState;
  initializeGame: () => void;
  askQuestion: (characterId: string, question: string) => string;
  askQuestionLLM: (characterId: string, question: string) => Promise<string>;
  useLLM: boolean;
  setUseLLM: (use: boolean) => void;
  makeAccusation: (suspectId: string) => boolean;
  resetGame: () => void;
  revealItem: (characterId: string) => void;
  dismissReport: () => void;
  updateEvidence: (characterId: string, evidence: Partial<CharacterEvidence>) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  getQuestionsRemaining: () => number;
  canAskQuestions: () => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const defaultSettings: GameSettings = {
  maxQuestions: 24,
  debugMode: false,
};

const createInitialEvidence = (): CharacterEvidence => ({
  nameRevealed: false,
  relationshipRevealed: false,
  itemRevealed: false,
  motiveRevealed: false,
  motiveText: null,
  meansRevealed: false,
  meansText: null,
  opportunityRevealed: false,
  opportunityText: null,
});

const initialGameState: GameState = {
  currentCase: null,
  questionsAsked: 0,
  maxQuestions: 24,
  interrogationHistory: [],
  revealedInfo: [],
  characterEvidence: new Map(),
  revealedItems: [],
  hasAccused: false,
  accusedId: null,
  wasCorrect: null,
  hasSeenReport: false,
  settings: defaultSettings,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [useLLM, setUseLLM] = useState<boolean>(true); // Default to LLM mode

  const initializeGame = () => {
    const dailyCase = generateDailyCase();
    
    // Initialize evidence tracking for each character
    const characterEvidence = new Map<string, CharacterEvidence>();
    dailyCase.characters.forEach(char => {
      characterEvidence.set(char.suspect.id, createInitialEvidence());
    });
    
    setGameState({
      ...initialGameState,
      currentCase: dailyCase,
      characterEvidence,
      maxQuestions: defaultSettings.maxQuestions,
    });
  };

  const dismissReport = () => {
    setGameState(prev => ({
      ...prev,
      hasSeenReport: true,
    }));
  };

  const getQuestionsRemaining = (): number => {
    return gameState.maxQuestions - gameState.questionsAsked;
  };

  const canAskQuestions = (): boolean => {
    return gameState.questionsAsked < gameState.maxQuestions;
  };

  const askQuestion = (characterId: string, question: string): string => {
    if (!gameState.currentCase) return "No case loaded.";
    if (!canAskQuestions()) return "You've run out of time. The case has gone cold.";
    
    const character = gameState.currentCase.characters.find(
      c => c.suspect.id === characterId
    );
    
    if (!character) return "Character not found.";
    
    const { response, revealedInfo: newRevealedInfo, evidenceUpdate } = generateResponse(
      question,
      character,
      gameState.currentCase.characters,
      gameState.currentCase,
      gameState.revealedInfo
    );
    
    // Update state with new info
    setGameState(prev => {
      const newRevealedInfoList = [...prev.revealedInfo];
      const newRevealedItems = [...prev.revealedItems];
      const newCharacterEvidence = new Map(prev.characterEvidence);
      
      // Track revealed info
      if (newRevealedInfo) {
        const alreadyKnown = newRevealedInfoList.some(
          s => s.aboutCharacterId === newRevealedInfo.aboutCharacterId && 
               s.info === newRevealedInfo.info
        );
        if (!alreadyKnown) {
          newRevealedInfoList.push({
            fromCharacterId: characterId,
            aboutCharacterId: newRevealedInfo.aboutCharacterId,
            info: newRevealedInfo.info,
            infoType: newRevealedInfo.infoType,
          });
        }
      }
      
      // Update character evidence
      if (evidenceUpdate) {
        const currentEvidence = newCharacterEvidence.get(characterId) || createInitialEvidence();
        newCharacterEvidence.set(characterId, {
          ...currentEvidence,
          ...evidenceUpdate,
        });
        
        // If item was revealed, track it
        if (evidenceUpdate.itemRevealed && !newRevealedItems.includes(characterId)) {
          newRevealedItems.push(characterId);
        }
      }
      
      return {
        ...prev,
        questionsAsked: prev.questionsAsked + 1,
        revealedInfo: newRevealedInfoList,
        revealedItems: newRevealedItems,
        characterEvidence: newCharacterEvidence,
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

  const askQuestionLLM = async (characterId: string, question: string): Promise<string> => {
    if (!gameState.currentCase) return "No case loaded.";
    if (!canAskQuestions()) return "You've run out of time. The case has gone cold.";
    
    const character = gameState.currentCase.characters.find(
      c => c.suspect.id === characterId
    );
    
    if (!character) return "Character not found.";
    
    // Get conversation history for this character
    const characterHistory = gameState.interrogationHistory
      .filter(h => h.characterId === characterId)
      .flatMap(h => [
        { role: 'user' as const, content: h.question },
        { role: 'assistant' as const, content: h.answer },
      ]);
    
    try {
      const { response, revealedInfo: newRevealedInfo, evidenceUpdate } = await generateLLMResponse(
        question,
        character,
        gameState.currentCase.characters,
        gameState.currentCase,
        characterHistory,
        gameState.revealedInfo
      );
      
      // Update state with new info
      setGameState(prev => {
        const newRevealedInfoList = [...prev.revealedInfo];
        const newRevealedItems = [...prev.revealedItems];
        const newCharacterEvidence = new Map(prev.characterEvidence);
        
        // Track revealed info
        if (newRevealedInfo) {
          const alreadyKnown = newRevealedInfoList.some(
            s => s.aboutCharacterId === newRevealedInfo.aboutCharacterId && 
                 s.info === newRevealedInfo.info
          );
          if (!alreadyKnown) {
            newRevealedInfoList.push({
              fromCharacterId: characterId,
              aboutCharacterId: newRevealedInfo.aboutCharacterId,
              info: newRevealedInfo.info,
              infoType: newRevealedInfo.infoType,
            });
          }
        }
        
        // Update character evidence
        if (evidenceUpdate) {
          const currentEvidence = newCharacterEvidence.get(characterId) || createInitialEvidence();
          newCharacterEvidence.set(characterId, {
            ...currentEvidence,
            ...evidenceUpdate,
          });
          
          // If item was revealed, track it
          if (evidenceUpdate.itemRevealed && !newRevealedItems.includes(characterId)) {
            newRevealedItems.push(characterId);
          }
        }
        
        return {
          ...prev,
          questionsAsked: prev.questionsAsked + 1,
          revealedInfo: newRevealedInfoList,
          revealedItems: newRevealedItems,
          characterEvidence: newCharacterEvidence,
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
    } catch (error) {
      console.error('LLM Error:', error);
      // Fallback to pattern-matching
      return askQuestion(characterId, question);
    }
  };

  const updateEvidence = (characterId: string, evidence: Partial<CharacterEvidence>) => {
    setGameState(prev => {
      const newCharacterEvidence = new Map(prev.characterEvidence);
      const currentEvidence = newCharacterEvidence.get(characterId) || createInitialEvidence();
      newCharacterEvidence.set(characterId, {
        ...currentEvidence,
        ...evidence,
      });
      return {
        ...prev,
        characterEvidence: newCharacterEvidence,
      };
    });
  };

  const revealItem = (characterId: string) => {
    setGameState(prev => {
      if (prev.revealedItems.includes(characterId)) {
        return prev;
      }
      return {
        ...prev,
        revealedItems: [...prev.revealedItems, characterId],
      };
    });
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
    const randomSeed = Date.now();
    const newCase = generateDailyCase(randomSeed);
    
    const characterEvidence = new Map<string, CharacterEvidence>();
    newCase.characters.forEach(char => {
      characterEvidence.set(char.suspect.id, createInitialEvidence());
    });
    
    setGameState({
      ...initialGameState,
      currentCase: newCase,
      characterEvidence,
      maxQuestions: gameState.settings.maxQuestions,
      settings: gameState.settings,
    });
  };

  const updateSettings = (settings: Partial<GameSettings>) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
      maxQuestions: settings.maxQuestions ?? prev.maxQuestions,
    }));
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
        askQuestionLLM,
        useLLM,
        setUseLLM,
        makeAccusation,
        resetGame,
        revealItem,
        dismissReport,
        updateEvidence,
        updateSettings,
        getQuestionsRemaining,
        canAskQuestions,
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
