import { 
  DailyCase, CharacterState, VictimInfo, CrimeDetails, 
  RelationshipDetail, Opinion, Suspicion, CharacterItem, 
  ItemSwap, CauseOfDeath, RelationshipPair 
} from '../types';
import { ALL_SUSPECTS, seededRandom, shuffleArray, getTodaySeed } from '../data/suspects';
import { getWeaponsByCause, INNOCENT_ITEMS, Item } from '../data/items';

// ============ TEMPLATES ============

const VICTIM_TEMPLATES = [
  { name: 'Theodore Blackwood', occupation: 'Wealthy Industrialist', background: 'Made his fortune through ruthless tactics' },
  { name: 'Margaret Holloway', occupation: 'Socialite', background: 'Collected secrets about everyone' },
  { name: 'Dr. Richard Crane', occupation: 'Physician', background: 'Had a dark side - unethical experiments' },
  { name: 'Eleanor Ashford', occupation: 'Aging Heiress', background: 'Controlled everyone with her money' },
  { name: 'William Harrington', occupation: 'Retired Judge', background: 'Sentenced many to harsh fates' },
  { name: 'Catherine Monroe', occupation: 'Art Dealer', background: 'Dealt in forgeries and stolen pieces' },
];

const LOCATIONS = ['the study', 'the library', 'the garden', 'the drawing room', 'the conservatory', 'the wine cellar'];
const TIMES = ['8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM'];

const CAUSES_OF_DEATH: CauseOfDeath[] = ['stabbed', 'poisoned', 'strangled', 'shot'];

// Motive templates - strong motives for killers
const KILLER_MOTIVES = [
  'They were blackmailing me about an affair that would destroy my marriage',
  'They were about to change their will and cut me out entirely',
  'They ruined my career and I\'ve waited years for revenge',
  'They knew I embezzled money and were going to expose me',
  'They killed someone I loved and got away with it',
  'They were threatening to reveal my criminal past',
  'They destroyed my family\'s reputation with lies',
];

// Weak motives (for non-killers who still have a motive)
const WEAK_MOTIVES = [
  'They owed me money they never repaid',
  'They spread rumors about me once',
  'We competed for the same opportunities',
  'They were condescending and difficult',
  'They embarrassed me at a social event',
];

// Relationship types for pairs
const RELATIONSHIP_TYPES = [
  { type: 'siblings', desc: 'brother and sister' },
  { type: 'coworkers', desc: 'colleagues at the same firm' },
  { type: 'married', desc: 'husband and wife' },
  { type: 'old_friends', desc: 'friends since childhood' },
  { type: 'business_partners', desc: 'business partners' },
  { type: 'cousins', desc: 'cousins' },
];

// Secret templates that relate to motive/means/opportunity
const MOTIVE_SECRETS = [
  '{name} had a huge argument with the victim last week about money',
  '{name} was about to be cut from the victim\'s will',
  '{name} was being blackmailed by the victim',
  '{name} blamed the victim for destroying their career',
];

const MEANS_SECRETS = [
  '{name} was seen carrying something suspicious earlier that night',
  '{name} borrowed a {weapon} from the victim\'s collection yesterday',
  '{name} has been asking about {weapon}s lately',
  '{name} has access to the victim\'s gun cabinet',
];

const OPPORTUNITY_SECRETS = [
  '{name} was seen near {location} around {time}',
  '{name} doesn\'t have a real alibi for when it happened',
  '{name} was the last person to see the victim alive',
  '{name} was lurking around {location} that evening',
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

// ============ MAIN GENERATOR ============

export function generateDailyCase(seed?: number): DailyCase {
  const actualSeed = seed ?? getTodaySeed();
  const random = seededRandom(actualSeed);
  
  // Case number based on days since start
  const baseDate = new Date('2024-01-01');
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const caseNumber = daysDiff + 1;
  
  // Pick victim
  const victimTemplate = pickRandom(VICTIM_TEMPLATES, random);
  const victim: VictimInfo = {
    name: victimTemplate.name,
    description: `The ${victimTemplate.occupation.toLowerCase()}`,
    background: victimTemplate.background,
    occupation: victimTemplate.occupation,
  };
  
  // Pick 5 suspects
  const shuffledSuspects = shuffleArray([...ALL_SUSPECTS], random);
  const selectedSuspects = shuffledSuspects.slice(0, 5);
  
  // Pick killer (always index 0 internally, but shuffled)
  const killerIndex = 0;
  const murdererId = selectedSuspects[killerIndex].id;
  
  // Crime details
  const causeOfDeath = pickRandom(CAUSES_OF_DEATH, random);
  const crimeLocation = pickRandom(LOCATIONS, random);
  const crimeTime = pickRandom(TIMES, random);
  const killerMotive = pickRandom(KILLER_MOTIVES, random);
  
  // ============ CREATE RELATIONSHIP PAIRS ============
  // 2 pairs of 2 characters that know each other well
  // The 5th character may or may not know others
  const relationshipPairs: RelationshipPair[] = [];
  
  // Pair 1: characters 0 and 1 (includes killer)
  const pair1Type = pickRandom(RELATIONSHIP_TYPES, random);
  relationshipPairs.push({
    character1Id: selectedSuspects[0].id,
    character2Id: selectedSuspects[1].id,
    relationshipType: pair1Type.type,
  });
  
  // Pair 2: characters 2 and 3
  const pair2Type = pickRandom(RELATIONSHIP_TYPES.filter(t => t.type !== pair1Type.type), random);
  relationshipPairs.push({
    character1Id: selectedSuspects[2].id,
    character2Id: selectedSuspects[3].id,
    relationshipType: pair2Type.type,
  });
  
  // Character 4 (5th) may know one of the others
  const fifthKnowsOthers = random() > 0.4; // 60% chance they know someone
  if (fifthKnowsOthers) {
    const knownCharacterIndex = Math.floor(random() * 4);
    relationshipPairs.push({
      character1Id: selectedSuspects[4].id,
      character2Id: selectedSuspects[knownCharacterIndex].id,
      relationshipType: 'acquaintances',
    });
  }
  
  // ============ ASSIGN ITEMS ============
  const weaponsForCause = getWeaponsByCause(causeOfDeath);
  const shuffledWeapons = shuffleArray([...weaponsForCause], random);
  const shuffledInnocent = shuffleArray([...INNOCENT_ITEMS], random);
  
  // Murder weapon goes to killer
  const murderWeapon = shuffledWeapons[0];
  
  // One other character gets a weapon of the same type (red herring for MEANS)
  // Remaining get innocent items
  const originalItems: Map<string, CharacterItem> = new Map();
  
  selectedSuspects.forEach((suspect, index) => {
    let item: Item;
    let isMurderWeapon = false;
    let isWeaponType = false;
    
    if (index === killerIndex) {
      item = murderWeapon;
      isMurderWeapon = true;
      isWeaponType = true;
    } else if (index === 2 && shuffledWeapons[1]) {
      // Red herring: another character has a weapon of the same type
      item = shuffledWeapons[1];
      isWeaponType = true;
    } else {
      item = shuffledInnocent[index] || shuffledInnocent[0];
    }
    
    originalItems.set(suspect.id, {
      id: item.id,
      name: item.name,
      description: item.description,
      isWeaponType,
      isMurderWeapon,
      emoji: item.emoji,
      originalOwnerId: suspect.id,
    });
  });
  
  // ============ ITEM SWAPS ============
  const itemSwaps: ItemSwap[] = [];
  const currentItems: Map<string, CharacterItem> = new Map(originalItems);
  
  // 0-2 swaps
  const numSwaps = Math.floor(random() * 3);
  
  for (let i = 0; i < numSwaps; i++) {
    const shuffledForSwap = shuffleArray([...selectedSuspects], random);
    const suspect1 = shuffledForSwap[0];
    const suspect2 = shuffledForSwap[1];
    
    const item1 = currentItems.get(suspect1.id)!;
    const item2 = currentItems.get(suspect2.id)!;
    
    // Swap
    currentItems.set(suspect1.id, { ...item2 });
    currentItems.set(suspect2.id, { ...item1 });
    
    const reason = pickRandom([
      'They accidentally picked up the wrong item',
      'They borrowed it and forgot to return it',
      'They swapped in the confusion',
    ], random);
    
    itemSwaps.push({
      fromCharacterId: suspect1.id,
      toCharacterId: suspect2.id,
      itemId: item1.id,
      reason,
    });
  }
  
  // ============ DETERMINE MOTIVE/MEANS/OPPORTUNITY ============
  // Killer has ALL THREE
  // Other characters have 1 or 2 (never all 3)
  
  const characterTraits: Map<string, { hasMotive: boolean; hasMeans: boolean; hasOpportunity: boolean }> = new Map();
  
  selectedSuspects.forEach((suspect, index) => {
    if (index === killerIndex) {
      // Killer has all three
      characterTraits.set(suspect.id, { hasMotive: true, hasMeans: true, hasOpportunity: true });
    } else {
      // Non-killers have 1 or 2 traits
      const numTraits = random() < 0.5 ? 1 : 2;
      const traits = shuffleArray(['motive', 'means', 'opportunity'], random).slice(0, numTraits);
      
      characterTraits.set(suspect.id, {
        hasMotive: traits.includes('motive'),
        hasMeans: traits.includes('means'),
        hasOpportunity: traits.includes('opportunity'),
      });
    }
  });
  
  // ============ BUILD CHARACTER STATES ============
  const characters: CharacterState[] = selectedSuspects.map((suspect, index) => {
    const isKiller = index === killerIndex;
    const traits = characterTraits.get(suspect.id)!;
    
    // Find relationship pair info
    const pairInfo = relationshipPairs.find(p => 
      p.character1Id === suspect.id || p.character2Id === suspect.id
    );
    
    // Build relationships with other suspects
    const relationships: RelationshipDetail[] = [];
    
    // Relationship with victim
    relationships.push({
      targetId: 'victim',
      targetName: victim.name,
      opinion: isKiller ? 'negative' : generateOpinion(random),
      opinionReason: isKiller ? 'The victim made my life miserable' : getOpinionReason(generateOpinion(random), victim.name, random),
      relationshipType: pickRandom(['employer', 'client', 'friend', 'acquaintance', 'family'], random),
      secretInfo: `The victim ${pickRandom(['was planning something big', 'was afraid of someone', 'received threats recently'], random)}`,
      secretType: 'general',
      secretRevealed: false,
    });
    
    // Relationships with other suspects
    selectedSuspects.forEach((other) => {
      if (other.id === suspect.id) return;
      
      const otherTraits = characterTraits.get(other.id)!;
      const arePaired = pairInfo && (
        (pairInfo.character1Id === suspect.id && pairInfo.character2Id === other.id) ||
        (pairInfo.character2Id === suspect.id && pairInfo.character1Id === other.id)
      );
      
      const opinion = arePaired ? 'positive' : generateOpinion(random);
      
      // Generate secret based on what aspect of the other character it reveals
      let secret: string;
      let secretType: 'motive' | 'means' | 'opportunity' | 'general';
      
      // Each character knows one secret about one other character
      // Secrets should relate to motive/means/opportunity if the target has that trait
      if (otherTraits.hasMotive && random() < 0.4) {
        secret = pickRandom(MOTIVE_SECRETS, random).replace('{name}', other.name);
        secretType = 'motive';
      } else if (otherTraits.hasMeans && random() < 0.4) {
        secret = pickRandom(MEANS_SECRETS, random)
          .replace('{name}', other.name)
          .replace('{weapon}', murderWeapon.name);
        secretType = 'means';
      } else if (otherTraits.hasOpportunity && random() < 0.4) {
        secret = pickRandom(OPPORTUNITY_SECRETS, random)
          .replace('{name}', other.name)
          .replace('{location}', crimeLocation)
          .replace('{time}', crimeTime);
        secretType = 'opportunity';
      } else {
        secret = `${other.name} has been acting suspicious lately`;
        secretType = 'general';
      }
      
      relationships.push({
        targetId: other.id,
        targetName: other.name,
        opinion,
        opinionReason: getOpinionReason(opinion, other.name, random),
        relationshipType: arePaired ? pairInfo!.relationshipType : 'acquaintance',
        secretInfo: secret,
        secretType,
        secretRevealed: false,
      });
    });
    
    // Suspicions
    let suspicion: Suspicion;
    let suspicionTargets: string[] = [];
    let suspicionReason: string;
    
    if (isKiller) {
      // Killer deflects
      suspicion = 'one';
      suspicionTargets = [selectedSuspects[(index + 1) % 5].id];
      suspicionReason = `${selectedSuspects[(index + 1) % 5].name} has been acting very suspicious`;
    } else {
      const r = random();
      if (r < 0.2) {
        suspicion = 'none';
        suspicionReason = 'I can\'t imagine any of us doing this';
      } else if (r < 0.6) {
        suspicion = 'one';
        const suspectIdx = random() < 0.4 ? killerIndex : Math.floor(random() * 5);
        if (suspectIdx !== index) {
          suspicionTargets = [selectedSuspects[suspectIdx].id];
          suspicionReason = `${selectedSuspects[suspectIdx].name} has been acting strange`;
        }
      } else {
        suspicion = 'multiple';
        suspicionTargets = selectedSuspects
          .filter((_, i) => i !== index)
          .slice(0, 2)
          .map(s => s.id);
        suspicionReason = 'Several people had reasons to want the victim dead';
      }
    }
    
    // Alibi (relates to OPPORTUNITY)
    const hasOpportunity = traits.hasOpportunity;
    let alibi;
    
    if (hasOpportunity) {
      // They were near the crime scene
      alibi = {
        description: pickRandom([
          `I was in the hallway near ${crimeLocation}`,
          `I stepped out for air near ${crimeLocation}`,
          `I was looking for someone near ${crimeLocation}`,
        ], random),
        isVerifiable: false,
        wasAtCrimeScene: true,
        timeAccountedFor: crimeTime,
        location: crimeLocation.replace('the ', 'near the '),
      };
    } else {
      // Solid alibi away from crime scene
      alibi = {
        description: pickRandom([
          'I was at the Riverside Restaurant',
          'I was on a phone call',
          'I was in my room reading',
          'I was with other guests in the parlor',
        ], random),
        isVerifiable: random() < 0.6,
        wasAtCrimeScene: false,
        timeAccountedFor: crimeTime,
        location: pickRandom(['the restaurant', 'my room', 'the parlor', 'the kitchen'], random),
        witness: random() < 0.5 ? 'Someone can vouch for me' : undefined,
      };
    }
    
    // Get current item
    const item = currentItems.get(suspect.id)!;
    
    // MEANS: do they have a weapon of the right type?
    const hasMeans = item.isWeaponType || traits.hasMeans;
    
    // Motive
    const motive = traits.hasMotive
      ? { description: isKiller ? killerMotive : pickRandom(WEAK_MOTIVES, random), hasMotive: true }
      : { description: 'I had no issues with the victim', hasMotive: false };
    
    // Relationship to victim
    const relationshipToVictim = pickRandom([
      'business associate', 'family friend', 'employee', 'neighbor', 
      'former partner', 'distant relative', 'social acquaintance'
    ], random);
    
    return {
      suspect,
      relationships,
      suspicion,
      suspicionTargets,
      suspicionReason,
      alibi,
      item,
      motive,
      hasMeans,
      isGuilty: isKiller,
      presentedEvidence: [],
      hasOpenedUp: false,
      relationshipToVictim,
    };
  });
  
  // Crime details
  const crimeDetails: CrimeDetails = {
    timeOfDeath: crimeTime,
    location: crimeLocation,
    causeOfDeath,
    murderWeapon: murderWeapon.name,
    murderWeaponId: murderWeapon.id,
    killerMotive,
    howItHappened: `The killer confronted ${victim.name} in ${crimeLocation} at ${crimeTime}. Using a ${murderWeapon.name}, they committed the murder.`,
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
    relationshipPairs,
  };
}
