import { DailyCase, CharacterState, MurderDetails, Relationship } from '../types';
import { ALL_SUSPECTS, seededRandom, shuffleArray, getTodaySeed } from '../data/suspects';

// Victim templates
const VICTIMS = [
  {
    name: 'Theodore Blackwood',
    description: 'A wealthy industrialist found dead in his study',
    background: 'Theodore built his fortune through ruthless business tactics, making many enemies along the way. He was known for his cold demeanor and willingness to betray anyone for profit.',
  },
  {
    name: 'Margaret Holloway',
    description: 'A socialite discovered lifeless in the garden',
    background: 'Margaret was the heart of high society, but beneath her charming exterior lay a woman who collected secrets and used them as weapons. She knew too much about everyone.',
  },
  {
    name: 'Dr. Richard Crane',
    description: 'A renowned physician found collapsed in the library',
    background: 'Dr. Crane was celebrated publicly but privately conducted unethical experiments. He held damaging information on several prominent families.',
  },
  {
    name: 'Eleanor Ashford',
    description: 'An aging heiress found dead at her vanity',
    background: 'Eleanor controlled her family with an iron fist, threatening to disinherit anyone who displeased her. Her will was about to be changed.',
  },
];

// Murder weapons (all stabbing/piercing for consistency)
const WEAPONS = [
  { name: 'antique letter opener', description: 'A sharp brass letter opener with an ivory handle' },
  { name: 'kitchen knife', description: 'A professional chef\'s knife, wickedly sharp' },
  { name: 'garden shears', description: 'Heavy-duty pruning shears with pointed tips' },
  { name: 'ornate hatpin', description: 'A long, decorative hatpin with a jeweled end' },
  { name: 'ice pick', description: 'A simple but deadly ice pick from the bar' },
  { name: 'scissors', description: 'A pair of sharp sewing scissors' },
];

// Possible items characters can have (all could be stabbing weapons)
const CHARACTER_ITEMS = [
  { name: 'pocket knife', description: 'A well-worn folding pocket knife', couldBeWeapon: true },
  { name: 'letter opener', description: 'A slim silver letter opener', couldBeWeapon: true },
  { name: 'fountain pen', description: 'A sharp-tipped fountain pen with a metal nib', couldBeWeapon: true },
  { name: 'nail file', description: 'A long, pointed metal nail file', couldBeWeapon: true },
  { name: 'screwdriver', description: 'A flathead screwdriver with a sharp tip', couldBeWeapon: true },
  { name: 'knitting needle', description: 'A long steel knitting needle', couldBeWeapon: true },
  { name: 'corkscrew', description: 'A sharp corkscrew from the wine collection', couldBeWeapon: true },
  { name: 'envelope knife', description: 'An antique envelope knife', couldBeWeapon: true },
];

// Alibi templates
const ALIBIS = [
  { description: 'Was on a phone call with their accountant', witness: 'The accountant confirms the call' },
  { description: 'Was having dinner at the Riverside Restaurant', witness: 'The waiter remembers serving them' },
  { description: 'Was attending a charity event downtown', witness: 'Multiple guests saw them there' },
  { description: 'Was at the hospital visiting a sick friend', witness: 'Hospital records confirm the visit' },
  { description: 'Was stuck in traffic after a car accident', witness: 'Police report confirms the delay' },
  { description: 'Was working late at their office', witness: 'Security cameras show them there' },
];

// No alibi reasons
const NO_ALIBI_REASONS = [
  'Claims to have been home alone reading',
  'Says they were taking a long walk to clear their head',
  'Was supposedly in their room with a headache',
  'Claims to have been in the garden, alone',
  'Says they were in the wine cellar selecting bottles',
];

// Problem with victim templates
const VICTIM_PROBLEMS = [
  { problem: 'The victim was threatening to expose their affair', feeling: 'feared' as const },
  { problem: 'The victim owed them a substantial amount of money', feeling: 'resented' as const },
  { problem: 'The victim had ruined their career years ago', feeling: 'hated' as const },
  { problem: 'The victim was planning to write them out of the will', feeling: 'feared' as const },
  { problem: 'The victim knew about their criminal past', feeling: 'feared' as const },
  { problem: 'The victim had stolen their business idea', feeling: 'hated' as const },
  { problem: 'The victim had humiliated them publicly', feeling: 'resented' as const },
  { problem: 'The victim was blackmailing them', feeling: 'hated' as const },
];

// Dislike reasons between characters
const DISLIKE_REASONS = [
  'They had a bitter falling out over money years ago',
  'There\'s romantic jealousy between them',
  'One betrayed the other\'s trust in the past',
  'They competed for the victim\'s favor and attention',
  'Family feud going back generations',
  'One exposed the other\'s secret to the victim',
];

// Times of death
const TIMES_OF_DEATH = [
  '9:00 PM',
  '9:30 PM',
  '10:00 PM',
  '10:30 PM',
  '11:00 PM',
];

// Locations
const MURDER_LOCATIONS = [
  'the study',
  'the library',
  'the garden',
  'the wine cellar',
  'the conservatory',
];

function pickRandom<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

export function generateDailyCase(seed?: number): DailyCase {
  const actualSeed = seed ?? getTodaySeed();
  const random = seededRandom(actualSeed);
  
  // Get case number from seed
  const baseDate = new Date('2024-01-01');
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const caseNumber = daysDiff + 1;
  
  // Pick victim
  const victim = pickRandom(VICTIMS, random);
  
  // Pick 4 suspects
  const shuffledSuspects = shuffleArray([...ALL_SUSPECTS], random);
  const selectedSuspects = shuffledSuspects.slice(0, 4);
  
  // Pick murderer (first one after shuffle)
  const murdererIndex = Math.floor(random() * 4);
  const murdererId = selectedSuspects[murdererIndex].id;
  
  // Pick murder details
  const timeOfDeath = pickRandom(TIMES_OF_DEATH, random);
  const murderWeapon = pickRandom(WEAPONS, random);
  const murderLocation = pickRandom(MURDER_LOCATIONS, random);
  
  // Shuffle problems and alibis
  const shuffledProblems = shuffleArray([...VICTIM_PROBLEMS], random);
  const shuffledAlibis = shuffleArray([...ALIBIS], random);
  const shuffledNoAlibis = shuffleArray([...NO_ALIBI_REASONS], random);
  const shuffledItems = shuffleArray([...CHARACTER_ITEMS], random);
  
  // Pick two characters who dislike each other (not the murderer for more complexity)
  const nonMurdererIndices = selectedSuspects
    .map((_, i) => i)
    .filter(i => i !== murdererIndex);
  const dislikeIndex1 = nonMurdererIndices[Math.floor(random() * nonMurdererIndices.length)];
  const remainingIndices = nonMurdererIndices.filter(i => i !== dislikeIndex1);
  const dislikeIndex2 = remainingIndices.length > 0 
    ? remainingIndices[Math.floor(random() * remainingIndices.length)]
    : (murdererIndex + 1) % 4;
  const dislikeReason = pickRandom(DISLIKE_REASONS, random);
  
  // Determine who gets alibis (at least 2 non-murderers)
  // Murderer NEVER has alibi, at least 2 others DO have alibis
  const alibiAssignments: boolean[] = [false, false, false, false];
  let alibiCount = 0;
  for (let i = 0; i < 4; i++) {
    if (i !== murdererIndex) {
      if (alibiCount < 2) {
        alibiAssignments[i] = true;
        alibiCount++;
      } else {
        alibiAssignments[i] = random() > 0.5;
      }
    }
  }
  
  // Build character states
  const characters: CharacterState[] = selectedSuspects.map((suspect, index) => {
    const isGuilty = index === murdererIndex;
    
    // Build relationships with other characters
    const relationships: Relationship[] = selectedSuspects
      .filter(s => s.id !== suspect.id)
      .map(other => {
        const otherIndex = selectedSuspects.findIndex(s => s.id === other.id);
        
        // Check if these two dislike each other
        if ((index === dislikeIndex1 && otherIndex === dislikeIndex2) ||
            (index === dislikeIndex2 && otherIndex === dislikeIndex1)) {
          return {
            targetId: other.id,
            feeling: 'dislikes' as const,
            reason: dislikeReason,
          };
        }
        
        // Random relationship
        const feelings: Array<'friendly' | 'neutral'> = ['friendly', 'neutral'];
        return {
          targetId: other.id,
          feeling: pickRandom(feelings, random),
          reason: pickRandom(['We get along fine', 'We\'re acquaintances', 'We\'ve known each other for years'], random),
        };
      });
    
    // Victim relationship
    const victimProblem = shuffledProblems[index % shuffledProblems.length];
    
    // Alibi
    const hasAlibi = alibiAssignments[index];
    const alibiData = hasAlibi 
      ? shuffledAlibis[index % shuffledAlibis.length]
      : { description: shuffledNoAlibis[index % shuffledNoAlibis.length], witness: undefined };
    
    // Item - murderer gets the murder weapon, others get random items
    const item = isGuilty
      ? { name: murderWeapon.name, description: murderWeapon.description, couldBeWeapon: true }
      : shuffledItems[index % shuffledItems.length];
    
    // Whereabouts at time of murder
    const whereabouts = hasAlibi
      ? alibiData.description
      : isGuilty
        ? `Was in ${murderLocation} - claims they were just passing through`
        : shuffledNoAlibis[index % shuffledNoAlibis.length];
    
    // Secret knowledge - what each character might have seen/heard
    const secretKnowledge: string[] = [];
    if (!isGuilty && random() > 0.5) {
      secretKnowledge.push(`Heard footsteps near ${murderLocation} around ${timeOfDeath}`);
    }
    if (!isGuilty && random() > 0.6) {
      const murderer = selectedSuspects[murdererIndex];
      secretKnowledge.push(`Noticed ${murderer.name} acting strangely that evening`);
    }
    if (random() > 0.7) {
      secretKnowledge.push(`Knows the victim was planning something big`);
    }
    
    return {
      suspect,
      relationships,
      victimRelationship: {
        problem: victimProblem.problem,
        feeling: victimProblem.feeling,
      },
      alibi: {
        hasAlibi,
        description: alibiData.description,
        witness: alibiData.witness,
      },
      item,
      isGuilty,
      whereabouts,
      secretKnowledge,
    };
  });
  
  // Build murder details
  const murderer = selectedSuspects[murdererIndex];
  const murdererState = characters[murdererIndex];
  
  const murderDetails: MurderDetails = {
    timeOfDeath,
    weapon: murderWeapon.name,
    location: murderLocation,
    motive: murdererState.victimRelationship.problem,
    howItHappened: `${murderer.name} confronted ${victim.name} in ${murderLocation} at approximately ${timeOfDeath}. An argument ensued about ${murdererState.victimRelationship.problem.toLowerCase()}. In a moment of rage, ${murderer.name} grabbed the ${murderWeapon.name} and struck. The ${murderWeapon.description.toLowerCase()} was found nearby, wiped clean but with traces of blood.`,
  };
  
  return {
    caseNumber,
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    victimName: victim.name,
    victimDescription: victim.description,
    victimBackground: victim.background,
    characters,
    murderDetails,
    murdererId,
  };
}

