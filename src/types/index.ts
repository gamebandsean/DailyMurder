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
    isSecret?: boolean;
  };
  alibi: {
    hasAlibi: boolean;
    description: string;
    witness?: string;
    // For the killer's false alibi
    isFalse?: boolean;
    falseClaimLocation?: string;
    actualLocation?: string;
    // For the alibi witness who saw the killer
    sawKiller?: boolean;
    sawKillerWhere?: string;
    sawKillerWhen?: string;
    // For the motive witness
    knowsKillerSecret?: boolean;
    killerSecret?: string;
  };
  item: {
    name: string;
    description: string;
    couldBeWeapon: boolean;
  };
  isGuilty: boolean;
  whereabouts: string;
  secretKnowledge: string[];
  role?: 'killer' | 'alibiWitness' | 'motiveWitness' | 'redHerring';
}

export interface MurderDetails {
  timeOfDeath: string;
  weapon: string;
  location: string;
  motive: string;
  howItHappened: string;
  keyEvidence?: {
    alibiWitness: string;
    alibiContradiction: string;
    motiveWitness: string;
    motiveSecret: string;
    murderWeapon: string;
  };
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
