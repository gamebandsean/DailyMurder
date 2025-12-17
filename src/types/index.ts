import { ImageSourcePropType } from 'react-native';

export interface Suspect {
  id: string;
  name: string;
  image: ImageSourcePropType;
  occupation: string;
  personality: string;
}

export interface Relationship {
  targetId: string;
  feeling: 'friendly' | 'neutral' | 'dislikes' | 'hates';
  reason: string;
}

export interface CharacterState {
  suspect: Suspect;
  relationships: Relationship[];
  victimRelationship: {
    problem: string;
    feeling: 'resented' | 'hated' | 'feared' | 'envied';
  };
  alibi: {
    hasAlibi: boolean;
    description: string;
    witness?: string;
  };
  item: {
    name: string;
    description: string;
    couldBeWeapon: boolean;
  };
  isGuilty: boolean;
  whereabouts: string;
  secretKnowledge: string[];
}

export interface MurderDetails {
  timeOfDeath: string;
  weapon: string;
  location: string;
  motive: string;
  howItHappened: string;
}

export interface DailyCase {
  caseNumber: number;
  date: string;
  victimName: string;
  victimDescription: string;
  victimBackground: string;
  characters: CharacterState[];
  murderDetails: MurderDetails;
  murdererId: string;
}

export interface GameState {
  currentCase: DailyCase | null;
  interrogationHistory: {
    characterId: string;
    question: string;
    answer: string;
    timestamp: number;
  }[];
  hasAccused: boolean;
  accusedId: string | null;
  wasCorrect: boolean | null;
}
