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

export interface RelationshipDetail {
  targetId: string;
  opinion: Opinion;
  opinionReason: string;
  // Secret info this character knows about the target
  secretInfo: string;
  // Has this secret been revealed to the player?
  secretRevealed: boolean;
}

export interface CharacterState {
  suspect: Suspect;
  
  // Relationships with all other characters (including victim)
  relationships: RelationshipDetail[];
  
  // What this character thinks about who might be involved
  suspicion: Suspicion;
  suspicionTargets: string[]; // IDs of who they suspect
  suspicionReason: string;
  
  // Their alibi
  alibi: {
    description: string;
    isVerifiable: boolean;
    placesNearCrime: boolean; // If true, this is damning
    witness?: string;
  };
  
  // Item on their person
  item: {
    name: string;
    description: string;
    isMurderWeapon: boolean;
  };
  
  // Their motive (everyone has some grievance, killer's is strongest)
  motive: {
    description: string;
    isKillerMotive: boolean;
  };
  
  // Is this the killer?
  isGuilty: boolean;
  
  // What info has been presented to this character (unlocks truthful responses)
  presentedEvidence: string[];
  
  // Has this character "opened up" after being shown their secret?
  hasOpenedUp: boolean;
}

export interface VictimInfo {
  name: string;
  description: string;
  background: string;
  relationships: RelationshipDetail[]; // Victim's relationships with suspects
}

export interface CrimeDetails {
  timeOfDeath: string;
  location: string;
  murderWeapon: string;
  killerMotive: string;
  howItHappened: string;
}

export interface DailyCase {
  caseNumber: number;
  date: string;
  victim: VictimInfo;
  characters: CharacterState[];
  crimeDetails: CrimeDetails;
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
  // Track what secrets have been learned
  learnedSecrets: { aboutId: string; secret: string; fromId: string }[];
  hasAccused: boolean;
  accusedId: string | null;
  wasCorrect: boolean | null;
}
