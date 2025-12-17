import { Suspect } from '../types';

// Import character images
const suspect1 = require('../../assets/characters/suspect1.png');
const suspect2 = require('../../assets/characters/suspect2.png');
const suspect3 = require('../../assets/characters/suspect3.png');
const suspect4 = require('../../assets/characters/suspect4.png');
const suspect5 = require('../../assets/characters/suspect5.png');

export const ALL_SUSPECTS: Suspect[] = [
  {
    id: 'marcus',
    name: 'Marcus Chen',
    image: suspect1,
    occupation: 'Business Partner',
    personality: 'Ambitious and calculating, always looking for an advantage',
  },
  {
    id: 'reginald',
    name: 'Reginald Ashworth',
    image: suspect2,
    occupation: 'Family Lawyer',
    personality: 'Dignified and secretive, knows everyone\'s dirty laundry',
  },
  {
    id: 'sarah',
    name: 'Sarah Mitchell',
    image: suspect3,
    occupation: 'Personal Assistant',
    personality: 'Cheerful on the surface, but harbors deep resentments',
  },
  {
    id: 'victoria',
    name: 'Victoria Pemberton',
    image: suspect4,
    occupation: 'Ex-Wife',
    personality: 'Elegant and bitter, feels she was wronged in the divorce',
  },
  {
    id: 'jerome',
    name: 'Jerome Washington',
    image: suspect5,
    occupation: 'Groundskeeper',
    personality: 'Quiet and observant, has worked the estate for decades',
  },
];

// Seeded random number generator for consistent daily cases
export function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Get today's seed based on date
export function getTodaySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

// Fisher-Yates shuffle with seeded random
export function shuffleArray<T>(array: T[], random: () => number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get 4 random suspects for the daily case
export function getRandomSuspects(seed?: number): Suspect[] {
  const random = seededRandom(seed ?? getTodaySeed());
  const shuffled = shuffleArray(ALL_SUSPECTS, random);
  return shuffled.slice(0, 4);
}
