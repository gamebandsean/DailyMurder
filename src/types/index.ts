import { ImageSourcePropType } from 'react-native';

export interface Suspect {
  id: string;
  name: string;
  image: ImageSourcePropType;
  occupation: string;
  personality: string;
}

export type Opinion = 'positive' | 'neutral' | 'negative';
export type Suspicion = 'none' | 'one' | 'multiple';
export type CauseOfDeath = 'stabbed' | 'poisoned' | 'strangled' | 'shot';

export interface RelationshipDetail {
  targetId: string;
  targetName: string;
  opinion: Opinion;
  opinionReason: string;
  relationshipType: string; // "coworker", "sibling", "spouse", "friend", "stranger", etc.
  // Secret info this character knows about the target
  secretInfo: string;
  // What aspect this secret relates to
  secretType: 'motive' | 'means' | 'opportunity' | 'general';
  // Has this secret been revealed to the player?
  secretRevealed: boolean;
}

// Item that a character is carrying
export interface CharacterItem {
  id: string;
  name: string;
  description: string;
  isWeaponType: boolean; // Matches the cause of death (sharp for stab, poison bottle, rope, gun)
  isMurderWeapon: boolean;
  emoji: string;
  originalOwnerId: string;
}

// Record of an item swap
export interface ItemSwap {
  fromCharacterId: string;
  toCharacterId: string;
  itemId: string;
  reason: string;
}

// Character relationship pair (2 characters that know each other well)
export interface RelationshipPair {
  character1Id: string;
  character2Id: string;
  relationshipType: string; // "siblings", "coworkers", "married", "old friends", etc.
}

// Evidence the player has discovered about a character
export interface CharacterEvidence {
  nameRevealed: boolean;
  relationshipRevealed: boolean;
  itemRevealed: boolean;
  motiveRevealed: boolean;
  motiveText: string | null;
  meansRevealed: boolean;
  meansText: string | null;
  opportunityRevealed: boolean;
  opportunityText: string | null;
}

export interface CharacterState {
  suspect: Suspect;
  
  // Relationships with all other characters (including victim)
  relationships: RelationshipDetail[];
  
  // What this character thinks about who might be involved
  suspicion: Suspicion;
  suspicionTargets: string[];
  suspicionReason: string;
  
  // Their alibi / whereabouts during the murder
  alibi: {
    description: string;
    isVerifiable: boolean;
    wasAtCrimeScene: boolean; // OPPORTUNITY: If true at crime time/location
    timeAccountedFor: string; // What time they claim to be where
    location: string; // Where they claim to have been
    witness?: string;
  };
  
  // Item currently on their person
  item: CharacterItem;
  
  // Their motive
  motive: {
    description: string;
    hasMotive: boolean; // MOTIVE: Does this character have a real motive?
  };
  
  // MEANS: Are they holding (or were holding) a weapon that matches the murder method?
  hasMeans: boolean;
  
  // Is this the killer?
  isGuilty: boolean;
  
  // What info has been presented to this character (unlocks truthful responses)
  presentedEvidence: string[];
  
  // Has this character "opened up" after being shown info?
  hasOpenedUp: boolean;
  
  // Relationship to victim
  relationshipToVictim: string;
}

export interface VictimInfo {
  name: string;
  description: string;
  background: string;
  occupation: string;
}

export interface CrimeDetails {
  timeOfDeath: string;
  location: string;
  causeOfDeath: CauseOfDeath;
  murderWeapon: string;
  murderWeaponId: string;
  killerMotive: string;
  howItHappened: string;
}

export interface DailyCase {
  caseNumber: number;
  date: string;
  victim: VictimInfo;
  characters: CharacterState[]; // Now 5 characters
  crimeDetails: CrimeDetails;
  murdererId: string;
  itemSwaps: ItemSwap[];
  relationshipPairs: RelationshipPair[]; // 2 pairs of characters that know each other
}

export interface GameSettings {
  maxQuestions: number; // Default 24 (hours)
  debugMode: boolean;
}

export interface GameState {
  currentCase: DailyCase | null;
  
  // Track questions asked
  questionsAsked: number;
  maxQuestions: number;
  
  // Interrogation history
  interrogationHistory: {
    characterId: string;
    question: string;
    answer: string;
    timestamp: number;
  }[];
  
  // Track what info each character has told the player
  // Used to verify if player can truthfully say "X told me about you"
  revealedInfo: {
    fromCharacterId: string;
    aboutCharacterId: string;
    info: string;
    infoType: 'motive' | 'means' | 'opportunity' | 'general';
  }[];
  
  // Evidence discovered about each character
  characterEvidence: Map<string, CharacterEvidence>;
  
  // Which characters' items have been revealed
  revealedItems: string[];
  
  // Game state
  hasAccused: boolean;
  accusedId: string | null;
  wasCorrect: boolean | null;
  
  // Has the player seen the opening report?
  hasSeenReport: boolean;
  
  // Debug/settings
  settings: GameSettings;
}
