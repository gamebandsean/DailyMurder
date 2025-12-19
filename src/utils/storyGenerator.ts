import { DailyCase, CharacterState, VictimInfo, CrimeDetails, RelationshipDetail, Opinion, Suspicion, CharacterItem, ItemSwap } from '../types';
import { ALL_SUSPECTS, seededRandom, shuffleArray, getTodaySeed } from '../data/suspects';
import { SHARP_ITEMS, OTHER_ITEMS, Item } from '../data/items';

// ============ STORY TEMPLATES ============

const VICTIM_TEMPLATES = [
  {
    name: 'Theodore Blackwood',
    description: 'A wealthy industrialist found stabbed in his study',
    background: 'Theodore made his fortune through ruthless tactics, stepping on anyone in his way.',
  },
  {
    name: 'Margaret Holloway', 
    description: 'A socialite discovered stabbed in the garden',
    background: 'Margaret collected secrets about everyone and wasn\'t afraid to use them.',
  },
  {
    name: 'Dr. Richard Crane',
    description: 'A renowned physician found stabbed in the library',
    background: 'Dr. Crane had a dark side - unethical experiments and buried scandals.',
  },
  {
    name: 'Eleanor Ashford',
    description: 'An aging heiress found stabbed in her bedroom',
    background: 'Eleanor controlled everyone with her money, threatening to cut them off.',
  },
];

const KILLER_MOTIVES = [
  'The victim was blackmailing me about an affair that would destroy my marriage',
  'The victim was about to change their will and cut me out entirely',
  'The victim ruined my career and I\'ve waited years for revenge',
  'The victim knew I embezzled money and was going to expose me',
  'The victim killed someone I loved and got away with it',
];

const MINOR_GRIEVANCES = [
  'The victim could be condescending and difficult',
  'We had some disagreements over the years',
  'The victim owed me money they never repaid',
  'The victim spread rumors about me once',
  'We competed for the same opportunities',
];

const LOCATIONS = ['the study', 'the library', 'the garden', 'the drawing room'];
const TIMES = ['9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM'];

// ============ SECRET INFO TEMPLATES ============

const SECRET_TEMPLATES = [
  '{name} has been having secret meetings with the victim late at night',
  '{name} was seen arguing violently with the victim last week',
  '{name} has gambling debts they\'ve been hiding from everyone',
  '{name} was caught going through the victim\'s private papers',
  '{name} received a large sum of money from the victim recently',
  '{name} threatened the victim at a party two months ago',
  '{name} has been lying about their whereabouts that evening',
  '{name} has a criminal record they\'ve kept hidden',
  '{name} was the last person to see the victim alive',
  '{name} stands to inherit a fortune from the victim\'s death',
];

// ============ ALIBI TEMPLATES ============

const SOLID_ALIBIS = [
  { description: 'I was at the Riverside Restaurant having dinner', isVerifiable: true, witness: 'The waiter saw me' },
  { description: 'I was on a phone call with my accountant', isVerifiable: true, witness: 'Phone records prove it' },
  { description: 'I was at a charity event across town', isVerifiable: true, witness: 'Dozens of people saw me' },
];

const WEAK_ALIBIS = [
  { description: 'I was in my room reading alone', isVerifiable: false },
  { description: 'I was taking a walk in the garden', isVerifiable: false },
  { description: 'I was in the wine cellar selecting bottles', isVerifiable: false },
];

const DAMNING_ALIBIS = [
  { description: 'I was... in the hallway near the study', placesNearCrime: true },
  { description: 'I stepped out for air near the victim\'s room', placesNearCrime: true },
  { description: 'I was looking for the victim to discuss something', placesNearCrime: true },
];

// ============ ITEM SWAP REASONS ============

const ACCIDENTAL_SWAP_REASONS = [
  'picked up the wrong item in the commotion',
  'accidentally swapped when bumping into each other',
  'took it by mistake from the coat room',
  'grabbed the wrong one in the dark hallway',
];

const INTENTIONAL_SWAP_REASONS = [
  'borrowed it earlier and never returned it',
  'took it to examine it more closely',
  'was asked to hold onto it temporarily',
  'confiscated it during an argument',
];

// ============ HELPER FUNCTIONS ============

function pickRandom<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

function generateOpinion(random: () => number): Opinion {
  const r = random();
  if (r < 0.3) return 'positive';
  if (r < 0.6) return 'neutral';
  return 'negative';
}

function getOpinionReason(opinion: Opinion, targetName: string, random: () => number): string {
  const positive = [
    `${targetName} has always been kind to me`,
    `${targetName} and I have been friends for years`,
    `${targetName} helped me through a difficult time`,
  ];
  const neutral = [
    `I don\'t know ${targetName} very well`,
    `${targetName} and I are just acquaintances`,
    `I have no strong feelings about ${targetName}`,
  ];
  const negative = [
    `${targetName} and I have never gotten along`,
    `I don\'t trust ${targetName} at all`,
    `${targetName} has wronged me in the past`,
  ];
  
  const options = opinion === 'positive' ? positive : opinion === 'neutral' ? neutral : negative;
  return pickRandom(options, random);
}

function generateSecret(targetName: string, random: () => number): string {
  const template = pickRandom(SECRET_TEMPLATES, random);
  return template.replace('{name}', targetName);
}

// ============ MAIN GENERATOR ============

export function generateDailyCase(seed?: number): DailyCase {
  const actualSeed = seed ?? getTodaySeed();
  const random = seededRandom(actualSeed);
  
  // Case number
  const baseDate = new Date('2024-01-01');
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const caseNumber = daysDiff + 1;
  
  // Pick victim
  const victimTemplate = pickRandom(VICTIM_TEMPLATES, random);
  
  // Pick 4 suspects
  const shuffledSuspects = shuffleArray([...ALL_SUSPECTS], random);
  const selectedSuspects = shuffledSuspects.slice(0, 4);
  
  // Pick killer (index 0)
  const killerIndex = 0;
  const murdererId = selectedSuspects[killerIndex].id;
  
  // Crime details
  const crimeLocation = pickRandom(LOCATIONS, random);
  const crimeTime = pickRandom(TIMES, random);
  const killerMotive = pickRandom(KILLER_MOTIVES, random);
  
  // ============ ASSIGN ITEMS ============
  // Pick murder weapon (must be sharp for stabbing)
  const shuffledSharpItems = shuffleArray([...SHARP_ITEMS], random);
  const murderWeapon = shuffledSharpItems[0];
  const secondSharpItem = shuffledSharpItems[1];
  
  // Pick non-sharp items for the other characters
  const shuffledOtherItems = shuffleArray([...OTHER_ITEMS], random);
  
  // Assign items to characters BEFORE swaps
  // Killer gets the murder weapon, one other person gets a sharp item, rest get non-sharp
  const originalItems: Map<string, CharacterItem> = new Map();
  
  selectedSuspects.forEach((suspect, index) => {
    let item: Item;
    let isMurderWeapon = false;
    
    if (index === killerIndex) {
      // Killer gets the murder weapon
      item = murderWeapon;
      isMurderWeapon = true;
    } else if (index === 1) {
      // One other person gets a sharp item (red herring)
      item = secondSharpItem;
    } else {
      // Rest get non-sharp items
      item = shuffledOtherItems[index - 2] || shuffledOtherItems[0];
    }
    
    originalItems.set(suspect.id, {
      id: item.id,
      name: item.name,
      description: item.description,
      isSharp: item.isSharp,
      isMurderWeapon,
      emoji: item.emoji,
      originalOwnerId: suspect.id,
    });
  });
  
  // ============ ITEM SWAPS ============
  // Perform 1-2 random swaps before the crime
  const itemSwaps: ItemSwap[] = [];
  const currentItems: Map<string, CharacterItem> = new Map(originalItems);
  
  const numSwaps = random() < 0.5 ? 1 : 2;
  
  for (let i = 0; i < numSwaps; i++) {
    // Pick two different suspects to swap items
    const shuffledForSwap = shuffleArray([...selectedSuspects], random);
    const suspect1 = shuffledForSwap[0];
    const suspect2 = shuffledForSwap[1];
    
    const item1 = currentItems.get(suspect1.id)!;
    const item2 = currentItems.get(suspect2.id)!;
    
    // Swap items
    currentItems.set(suspect1.id, { ...item2, originalOwnerId: item2.originalOwnerId });
    currentItems.set(suspect2.id, { ...item1, originalOwnerId: item1.originalOwnerId });
    
    // Record the swap
    const isAccidental = random() < 0.6;
    const reason = isAccidental 
      ? pickRandom(ACCIDENTAL_SWAP_REASONS, random)
      : pickRandom(INTENTIONAL_SWAP_REASONS, random);
    
    itemSwaps.push({
      fromCharacterId: suspect1.id,
      toCharacterId: suspect2.id,
      itemId: item1.id,
      reason: `${suspect2.name} ${reason}`,
    });
    
    itemSwaps.push({
      fromCharacterId: suspect2.id,
      toCharacterId: suspect1.id,
      itemId: item2.id,
      reason: `${suspect1.name} ${reason}`,
    });
  }
  
  // Shuffle minor grievances
  const shuffledGrievances = shuffleArray([...MINOR_GRIEVANCES], random);
  
  // Build victim relationships with each suspect
  const victimRelationships: RelationshipDetail[] = selectedSuspects.map((suspect, idx) => ({
    targetId: suspect.id,
    opinion: idx === killerIndex ? 'negative' : generateOpinion(random),
    opinionReason: idx === killerIndex 
      ? 'We had serious conflicts that couldn\'t be resolved'
      : getOpinionReason(generateOpinion(random), suspect.name, random),
    secretInfo: generateSecret(suspect.name, random),
    secretRevealed: false,
  }));
  
  const victim: VictimInfo = {
    ...victimTemplate,
    relationships: victimRelationships,
  };
  
  // Build character states
  const characters: CharacterState[] = selectedSuspects.map((suspect, index) => {
    const isKiller = index === killerIndex;
    
    // Build relationships with other suspects AND victim
    const relationships: RelationshipDetail[] = [];
    
    // Relationship with victim
    const victimOpinion: Opinion = isKiller ? 'negative' : generateOpinion(random);
    relationships.push({
      targetId: 'victim',
      opinion: victimOpinion,
      opinionReason: isKiller 
        ? 'The victim made my life miserable'
        : getOpinionReason(victimOpinion, victim.name, random),
      secretInfo: `The victim ${pickRandom([
        'was planning something big before they died',
        'had been acting strangely lately',
        'received a mysterious letter recently',
        'was afraid of someone',
      ], random)}`,
      secretRevealed: false,
    });
    
    // Relationships with other suspects
    selectedSuspects.forEach((other, otherIdx) => {
      if (other.id === suspect.id) return;
      
      const opinion = generateOpinion(random);
      relationships.push({
        targetId: other.id,
        opinion,
        opinionReason: getOpinionReason(opinion, other.name, random),
        secretInfo: generateSecret(other.name, random),
        secretRevealed: false,
      });
    });
    
    // Suspicions
    let suspicion: Suspicion;
    let suspicionTargets: string[] = [];
    let suspicionReason: string;
    
    if (isKiller) {
      // Killer deflects suspicion to others
      suspicion = 'one';
      const otherIdx = (index + 1) % 4;
      suspicionTargets = [selectedSuspects[otherIdx].id];
      suspicionReason = `${selectedSuspects[otherIdx].name} has been acting very suspicious`;
    } else {
      const r = random();
      if (r < 0.2) {
        suspicion = 'none';
        suspicionTargets = [];
        suspicionReason = 'I can\'t imagine any of us doing something so horrible';
      } else if (r < 0.6) {
        suspicion = 'one';
        // Might suspect the killer or someone else
        const suspectIdx = random() < 0.4 ? killerIndex : Math.floor(random() * 4);
        if (suspectIdx !== index) {
          suspicionTargets = [selectedSuspects[suspectIdx].id];
          suspicionReason = `${selectedSuspects[suspectIdx].name} has been acting strange lately`;
        }
      } else {
        suspicion = 'multiple';
        suspicionTargets = selectedSuspects
          .filter((_, i) => i !== index)
          .slice(0, 2)
          .map(s => s.id);
        suspicionReason = 'Several people here had reasons to want the victim dead';
      }
    }
    
    // Alibi
    let alibi;
    if (isKiller) {
      const damningAlibi = pickRandom(DAMNING_ALIBIS, random);
      alibi = {
        description: damningAlibi.description,
        isVerifiable: false,
        placesNearCrime: true,
      };
    } else if (random() < 0.6) {
      const solidAlibi = pickRandom(SOLID_ALIBIS, random);
      alibi = {
        description: solidAlibi.description,
        isVerifiable: solidAlibi.isVerifiable,
        placesNearCrime: false,
        witness: solidAlibi.witness,
      };
    } else {
      const weakAlibi = pickRandom(WEAK_ALIBIS, random);
      alibi = {
        description: weakAlibi.description,
        isVerifiable: false,
        placesNearCrime: false,
      };
    }
    
    // Get current item (after swaps)
    const item = currentItems.get(suspect.id)!;
    
    // Motive
    const motive = isKiller
      ? { description: killerMotive, isKillerMotive: true }
      : { description: shuffledGrievances[index % shuffledGrievances.length], isKillerMotive: false };
    
    return {
      suspect,
      relationships,
      suspicion,
      suspicionTargets,
      suspicionReason,
      alibi,
      item,
      motive,
      isGuilty: isKiller,
      presentedEvidence: [],
      hasOpenedUp: false,
    };
  });
  
  // Crime details
  const killer = selectedSuspects[killerIndex];
  const crimeDetails: CrimeDetails = {
    timeOfDeath: crimeTime,
    location: crimeLocation,
    murderWeapon: murderWeapon.name,
    murderWeaponId: murderWeapon.id,
    killerMotive,
    howItHappened: `${killer.name} confronted ${victim.name} in ${crimeLocation} at ${crimeTime}. ${killerMotive}. Using the ${murderWeapon.name}, they committed the murder and attempted to cover their tracks.`,
  };
  
  return {
    caseNumber,
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    victim,
    characters,
    crimeDetails,
    murdererId,
    itemSwaps,
  };
}
