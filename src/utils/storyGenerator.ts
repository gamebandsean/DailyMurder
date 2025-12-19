import { DailyCase, CharacterState, MurderDetails, Relationship } from '../types';
import { ALL_SUSPECTS, seededRandom, shuffleArray, getTodaySeed } from '../data/suspects';

// Victim templates
const VICTIMS = [
  {
    name: 'Theodore Blackwood',
    description: 'A wealthy industrialist found dead in his study',
    background: 'Theodore built his fortune through ruthless business tactics, making many enemies along the way.',
  },
  {
    name: 'Margaret Holloway',
    description: 'A socialite discovered lifeless in the garden',
    background: 'Margaret was the heart of high society, but beneath her charm she collected secrets as weapons.',
  },
  {
    name: 'Dr. Richard Crane',
    description: 'A renowned physician found collapsed in the library',
    background: 'Dr. Crane was celebrated publicly but privately conducted unethical experiments.',
  },
  {
    name: 'Eleanor Ashford',
    description: 'An aging heiress found dead at her vanity',
    background: 'Eleanor controlled her family with an iron fist, threatening to disinherit anyone who displeased her.',
  },
];

// Murder weapons (what the killer has on them)
const MURDER_WEAPONS = [
  { name: 'antique letter opener', description: 'A sharp brass letter opener with an ivory handle, stained with blood' },
  { name: 'kitchen knife', description: 'A professional chef\'s knife, recently cleaned but with traces of blood' },
  { name: 'garden shears', description: 'Heavy-duty pruning shears with pointed tips' },
  { name: 'ornate hatpin', description: 'A long, decorative hatpin with a jeweled end' },
  { name: 'ice pick', description: 'A simple but deadly ice pick from the bar' },
];

// Innocent items (what non-killers have)
const INNOCENT_ITEMS = [
  { name: 'pocket watch', description: 'An antique gold pocket watch, a family heirloom' },
  { name: 'reading glasses', description: 'Wire-rimmed reading glasses in a leather case' },
  { name: 'cigarette case', description: 'A silver cigarette case, monogrammed' },
  { name: 'handkerchief', description: 'A silk handkerchief with embroidered initials' },
  { name: 'notebook', description: 'A small leather-bound notebook filled with appointments' },
  { name: 'lipstick', description: 'An expensive French lipstick in a gold tube' },
  { name: 'fountain pen', description: 'A fine fountain pen, clearly expensive' },
  { name: 'keys', description: 'A ring of keys to various rooms in the house' },
];

// Real alibis (verifiable)
const REAL_ALIBIS = [
  { location: 'the dining room', activity: 'having dinner', witness: null }, // witness filled dynamically
  { location: 'the parlor', activity: 'playing cards', witness: null },
  { location: 'the veranda', activity: 'smoking a cigar', witness: null },
  { location: 'the music room', activity: 'listening to the gramophone', witness: null },
];

// False alibis (what the killer claims)
const FALSE_ALIBIS = [
  { claimed: 'I was in my room, resting', actualLocation: 'near the study' },
  { claimed: 'I was in the garden, taking a walk', actualLocation: 'in the hallway outside the study' },
  { claimed: 'I was in the library, reading', actualLocation: 'coming from the victim\'s room' },
  { claimed: 'I was in the kitchen, getting a drink', actualLocation: 'leaving the scene quickly' },
];

// Motives
const MOTIVES = [
  { 
    motive: 'The victim was blackmailing me over an affair',
    publicKnowledge: false,
    whoKnows: null, // filled dynamically - another character who knows
  },
  { 
    motive: 'The victim was about to write me out of the will',
    publicKnowledge: false,
    whoKnows: null,
  },
  { 
    motive: 'The victim ruined my career years ago',
    publicKnowledge: true, // everyone might know this
    whoKnows: null,
  },
  { 
    motive: 'The victim knew about my criminal past',
    publicKnowledge: false,
    whoKnows: null,
  },
  {
    motive: 'The victim stole my inheritance',
    publicKnowledge: false,
    whoKnows: null,
  },
];

// Times
const TIMES_OF_DEATH = ['9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM'];
const MURDER_LOCATIONS = ['the study', 'the library', 'the conservatory', 'the drawing room'];

// Dislike reasons
const DISLIKE_REASONS = [
  'We had a bitter falling out over money',
  'They betrayed my trust years ago',
  'We competed for the victim\'s attention',
  'They spread rumors about me',
];

function pickRandom<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

export function generateDailyCase(seed?: number): DailyCase {
  const actualSeed = seed ?? getTodaySeed();
  const random = seededRandom(actualSeed);
  
  // Case number
  const baseDate = new Date('2024-01-01');
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const caseNumber = daysDiff + 1;
  
  // Pick victim
  const victim = pickRandom(VICTIMS, random);
  
  // Pick 4 suspects
  const shuffledSuspects = shuffleArray([...ALL_SUSPECTS], random);
  const selectedSuspects = shuffledSuspects.slice(0, 4);
  
  // Assign roles:
  // Index 0 = KILLER
  // Index 1 = ALIBI WITNESS (saw the killer somewhere they shouldn't be)
  // Index 2 = MOTIVE WITNESS (knows about the killer's secret motive)
  // Index 3 = RED HERRING (has alibi with index 1 or 2)
  
  const killerIndex = 0;
  const alibiWitnessIndex = 1;
  const motiveWitnessIndex = 2;
  const redHerringIndex = 3;
  
  const murdererId = selectedSuspects[killerIndex].id;
  
  // Pick murder details
  const timeOfDeath = pickRandom(TIMES_OF_DEATH, random);
  const murderLocation = pickRandom(MURDER_LOCATIONS, random);
  const murderWeapon = pickRandom(MURDER_WEAPONS, random);
  
  // The killer's false alibi
  const falseAlibi = pickRandom(FALSE_ALIBIS, random);
  
  // The killer's motive (secret, known by motive witness)
  const killerMotive = pickRandom(MOTIVES, random);
  
  // Shuffle innocent items
  const shuffledItems = shuffleArray([...INNOCENT_ITEMS], random);
  const shuffledRealAlibis = shuffleArray([...REAL_ALIBIS], random);
  
  // Two characters who dislike each other (for complexity)
  const dislikeReason = pickRandom(DISLIKE_REASONS, random);
  
  // Build character states
  const characters: CharacterState[] = selectedSuspects.map((suspect, index) => {
    const isKiller = index === killerIndex;
    const isAlibiWitness = index === alibiWitnessIndex;
    const isMotiveWitness = index === motiveWitnessIndex;
    const isRedHerring = index === redHerringIndex;
    
    // ITEM: Killer has murder weapon, others have innocent items
    const item = isKiller
      ? { name: murderWeapon.name, description: murderWeapon.description, couldBeWeapon: true }
      : { name: shuffledItems[index].name, description: shuffledItems[index].description, couldBeWeapon: false };
    
    // ALIBI
    let alibi: CharacterState['alibi'];
    let whereabouts: string;
    
    if (isKiller) {
      // Killer lies about alibi
      alibi = {
        hasAlibi: false,
        description: falseAlibi.claimed,
        witness: undefined,
        isFalse: true,
        falseClaimLocation: falseAlibi.claimed,
        actualLocation: falseAlibi.actualLocation,
      };
      whereabouts = falseAlibi.claimed;
    } else if (isAlibiWitness) {
      // This witness was somewhere and SAW the killer
      const realAlibi = shuffledRealAlibis[0];
      alibi = {
        hasAlibi: true,
        description: `I was in ${realAlibi.location}, ${realAlibi.activity}`,
        witness: selectedSuspects[redHerringIndex].name, // confirmed by red herring
        sawKiller: true,
        sawKillerWhere: falseAlibi.actualLocation,
        sawKillerWhen: `around ${timeOfDeath}`,
      };
      whereabouts = `I was in ${realAlibi.location}, ${realAlibi.activity}. ${selectedSuspects[redHerringIndex].name} was with me.`;
    } else if (isRedHerring) {
      // Red herring was with alibi witness
      const realAlibi = shuffledRealAlibis[0];
      alibi = {
        hasAlibi: true,
        description: `I was in ${realAlibi.location}, ${realAlibi.activity}`,
        witness: selectedSuspects[alibiWitnessIndex].name,
      };
      whereabouts = `I was in ${realAlibi.location}, ${realAlibi.activity} with ${selectedSuspects[alibiWitnessIndex].name}.`;
    } else if (isMotiveWitness) {
      // Motive witness was alone but knows the killer's secret
      const realAlibi = shuffledRealAlibis[1];
      alibi = {
        hasAlibi: false,
        description: `I was in ${realAlibi.location}, ${realAlibi.activity}, alone`,
        witness: undefined,
        knowsKillerSecret: true,
        killerSecret: killerMotive.motive,
      };
      whereabouts = `I was in ${realAlibi.location}, ${realAlibi.activity}. I was alone, unfortunately.`;
    } else {
      alibi = {
        hasAlibi: false,
        description: 'I was in my room',
        witness: undefined,
      };
      whereabouts = 'I was in my room.';
    }
    
    // VICTIM RELATIONSHIP
    let victimRelationship: CharacterState['victimRelationship'];
    if (isKiller) {
      victimRelationship = {
        problem: killerMotive.motive,
        feeling: 'hated' as const,
        isSecret: !killerMotive.publicKnowledge,
      };
    } else {
      // Other characters have minor grievances
      const minorProblems = [
        { problem: 'The victim could be difficult to work with', feeling: 'resented' as const },
        { problem: 'The victim and I had some disagreements', feeling: 'resented' as const },
        { problem: 'The victim owed me a favor they never repaid', feeling: 'resented' as const },
        { problem: 'The victim was sometimes dismissive of me', feeling: 'resented' as const },
      ];
      victimRelationship = { ...minorProblems[index % minorProblems.length], isSecret: false };
    }
    
    // RELATIONSHIPS with other characters
    const relationships: Relationship[] = selectedSuspects
      .filter(s => s.id !== suspect.id)
      .map(other => {
        const otherIndex = selectedSuspects.findIndex(s => s.id === other.id);
        
        // Alibi witness and red herring are friendly (they alibi each other)
        if ((index === alibiWitnessIndex && otherIndex === redHerringIndex) ||
            (index === redHerringIndex && otherIndex === alibiWitnessIndex)) {
          return {
            targetId: other.id,
            feeling: 'friendly' as const,
            reason: 'We spent the evening together',
          };
        }
        
        // Motive witness dislikes the killer (knows their secret)
        if (index === motiveWitnessIndex && otherIndex === killerIndex) {
          return {
            targetId: other.id,
            feeling: 'dislikes' as const,
            reason: 'I know things about them that would shock you',
          };
        }
        
        // Random other relationships
        return {
          targetId: other.id,
          feeling: 'neutral' as const,
          reason: 'We\'re acquaintances',
        };
      });
    
    // SECRET KNOWLEDGE - what each character knows
    const secretKnowledge: string[] = [];
    
    if (isAlibiWitness) {
      // This is the KEY EVIDENCE - they saw the killer!
      secretKnowledge.push(
        `I saw ${selectedSuspects[killerIndex].name} ${falseAlibi.actualLocation} around ${timeOfDeath}. They looked agitated.`
      );
      secretKnowledge.push(
        `${selectedSuspects[killerIndex].name} wasn't where they claim to have been. I saw them myself.`
      );
    }
    
    if (isMotiveWitness) {
      // They know the killer's secret motive
      secretKnowledge.push(
        `I know that ${selectedSuspects[killerIndex].name} had a serious problem with the victim. ${killerMotive.motive}.`
      );
      secretKnowledge.push(
        `${selectedSuspects[killerIndex].name} had more reason to want the victim dead than they're letting on.`
      );
    }
    
    if (isRedHerring) {
      // They confirm the alibi witness's story
      secretKnowledge.push(
        `${selectedSuspects[alibiWitnessIndex].name} and I were together all evening. They're telling the truth.`
      );
    }
    
    return {
      suspect,
      relationships,
      victimRelationship,
      alibi,
      item,
      isGuilty: isKiller,
      whereabouts,
      secretKnowledge,
      role: isKiller ? 'killer' : isAlibiWitness ? 'alibiWitness' : isMotiveWitness ? 'motiveWitness' : 'redHerring',
    };
  });
  
  // Build murder details
  const killer = selectedSuspects[killerIndex];
  const killerState = characters[killerIndex];
  
  const murderDetails: MurderDetails = {
    timeOfDeath,
    weapon: murderWeapon.name,
    location: murderLocation,
    motive: killerMotive.motive,
    howItHappened: `${killer.name} confronted the victim in ${murderLocation} at ${timeOfDeath}. ${killerMotive.motive}. In a fit of rage, ${killer.name} used their ${murderWeapon.name} to commit the murder. They then attempted to establish a false alibi, claiming "${falseAlibi.claimed}" - but ${selectedSuspects[alibiWitnessIndex].name} saw them ${falseAlibi.actualLocation}.`,
    keyEvidence: {
      alibiWitness: selectedSuspects[alibiWitnessIndex].name,
      alibiContradiction: `${killer.name} claims "${falseAlibi.claimed}" but ${selectedSuspects[alibiWitnessIndex].name} saw them ${falseAlibi.actualLocation}`,
      motiveWitness: selectedSuspects[motiveWitnessIndex].name,
      motiveSecret: killerMotive.motive,
      murderWeapon: murderWeapon.name,
    },
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
