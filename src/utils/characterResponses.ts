import { CharacterState, DailyCase } from '../types';

interface ResponseContext {
  character: CharacterState;
  allCharacters: CharacterState[];
  case_: DailyCase;
  question: string;
}

// Detect what the question is about
function analyzeQuestion(question: string, allCharacters: CharacterState[]): {
  aboutSelf: boolean;
  aboutVictim: boolean;
  aboutCrime: boolean;
  aboutAlibi: boolean;
  aboutItem: boolean;
  aboutWeapon: boolean;
  aboutLocation: boolean;
  aboutTime: boolean;
  aboutOtherCharacter: string | null;
  mentionedCharacter: CharacterState | null;
  askingIfGuilty: boolean;
  aboutRelationship: boolean;
  aboutMotive: boolean;
  askingWhatTheySaw: boolean;
  askingAboutSecrets: boolean;
  askingToConfirm: boolean;
} {
  const q = question.toLowerCase();
  
  // Check if asking about specific character
  let aboutOtherCharacter: string | null = null;
  let mentionedCharacter: CharacterState | null = null;
  
  for (const char of allCharacters) {
    const firstName = char.suspect.name.split(' ')[0].toLowerCase();
    const lastName = char.suspect.name.split(' ').slice(-1)[0].toLowerCase();
    if (q.includes(firstName) || q.includes(lastName)) {
      aboutOtherCharacter = char.suspect.id;
      mentionedCharacter = char;
      break;
    }
  }
  
  return {
    aboutSelf: /\b(you|your|yourself)\b/i.test(q) && !aboutOtherCharacter,
    aboutVictim: /\b(victim|dead|body|deceased|theodore|margaret|richard|eleanor|blackwood|holloway|crane|ashford)\b/i.test(q),
    aboutCrime: /\b(murder|kill|crime|death|happen|incident|night|evening)\b/i.test(q),
    aboutAlibi: /\b(alibi|where were you|where was|doing|at the time|that night|whereabouts|were you)\b/i.test(q),
    aboutItem: /\b(item|carrying|have on|possess|holding|pocket|bag|purse)\b/i.test(q),
    aboutWeapon: /\b(weapon|knife|stab|blood|murder weapon|killed with)\b/i.test(q),
    aboutLocation: /\b(where|location|place|room|study|library|garden|cellar|conservatory|saw)\b/i.test(q),
    aboutTime: /\b(time|when|clock|hour|pm|am|o\'clock|9|10|11)\b/i.test(q),
    aboutOtherCharacter,
    mentionedCharacter,
    askingIfGuilty: /\b(did you (do|kill|murder)|are you (guilty|the (killer|murderer))|you (did|killed|murdered)|confess|admit|you kill)\b/i.test(q),
    aboutRelationship: /\b(relationship|know|friend|enemy|feel about|think of|opinion|get along|trust)\b/i.test(q),
    aboutMotive: /\b(motive|reason|why would|grudge|problem with|issue with|angry|upset|secret|hiding)\b/i.test(q),
    askingWhatTheySaw: /\b(see|saw|notice|witness|observed|spotted)\b/i.test(q),
    askingAboutSecrets: /\b(secret|hiding|truth|really|honest|lying|lie)\b/i.test(q),
    askingToConfirm: /\b(confirm|verify|true|really|certain|sure|honest)\b/i.test(q),
  };
}

// Generate personality-appropriate response prefix
function getPersonalityPrefix(character: CharacterState): string {
  const prefixes: { [key: string]: string[] } = {
    marcus: ['*adjusts blazer* ', '*looks at you directly* ', '*considers the question* ', ''],
    reginald: ['*clears throat* ', '*strokes mustache thoughtfully* ', '*speaks carefully* ', ''],
    sarah: ['*smiles nervously* ', '*fidgets slightly* ', 'Oh! ', 'Well, '],
    victoria: ['*raises an eyebrow* ', '*adjusts hat* ', '*sighs* ', 'Darling, '],
    jerome: ['*pauses thoughtfully* ', '*speaks slowly* ', '*nods* ', ''],
  };
  
  const options = prefixes[character.suspect.id] || [''];
  return options[Math.floor(Math.random() * options.length)];
}

// Get character's alibi response
function getAlibiResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  if (character.alibi.hasAlibi && character.alibi.witness) {
    return `${prefix}At ${case_.murderDetails.timeOfDeath}? ${character.alibi.description}. ${character.alibi.witness} can confirm that.`;
  } else {
    return `${prefix}${character.whereabouts} I know I don't have anyone to confirm that, but it's the truth.`;
  }
}

// Get response about their item
function getItemResponse(ctx: ResponseContext): string {
  const { character } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  return `${prefix}I have my ${character.item.name} with me. ${character.item.description}. Is that relevant to your investigation?`;
}

// Response when asked about what they saw
function getWhatTheySawResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  // ALIBI WITNESS - They saw the killer!
  if (character.alibi.sawKiller) {
    const killer = ctx.allCharacters.find(c => c.isGuilty);
    if (killer) {
      return `${prefix}Actually, yes. I saw ${killer.suspect.name} ${character.alibi.sawKillerWhere} ${character.alibi.sawKillerWhen}. They looked nervous, almost frantic. I thought it was strange at the time...`;
    }
  }
  
  // Others didn't see much
  if (character.secretKnowledge.length > 0) {
    return `${prefix}${character.secretKnowledge[0]}`;
  }
  
  return `${prefix}I didn't see anything unusual that night. I was occupied with my own affairs.`;
}

// Response about another character
function getOtherCharacterResponse(ctx: ResponseContext, targetId: string): string {
  const { character, allCharacters } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  const target = allCharacters.find(c => c.suspect.id === targetId);
  const relationship = character.relationships.find(r => r.targetId === targetId);
  
  if (!target || !relationship) {
    return `${prefix}I don't know who you're referring to.`;
  }
  
  // MOTIVE WITNESS knows the killer's secret
  if (character.alibi.knowsKillerSecret && target.isGuilty) {
    return `${prefix}${target.suspect.name}? I know more about them than they'd like. ${character.alibi.killerSecret}. They had every reason to want the victim dead.`;
  }
  
  // ALIBI WITNESS saw the killer
  if (character.alibi.sawKiller && target.isGuilty) {
    return `${prefix}${target.suspect.name}? Funny you should ask. I saw them ${character.alibi.sawKillerWhere} ${character.alibi.sawKillerWhen}. That contradicts what they told you, doesn't it?`;
  }
  
  // RED HERRING confirms alibi witness
  if (character.role === 'redHerring') {
    const alibiWitness = allCharacters.find(c => c.role === 'alibiWitness');
    if (alibiWitness && target.suspect.id === alibiWitness.suspect.id) {
      return `${prefix}${target.suspect.name}? We were together all evening. They're completely trustworthy. Whatever they told you, I can confirm it.`;
    }
  }
  
  // Standard relationship responses
  if (relationship.feeling === 'dislikes') {
    return `${prefix}${target.suspect.name}? ${relationship.reason}. I wouldn't trust them if I were you.`;
  } else if (relationship.feeling === 'friendly') {
    return `${prefix}${target.suspect.name}? ${relationship.reason}. I trust them completely.`;
  }
  
  return `${prefix}${target.suspect.name}? We're acquaintances. I don't know them well enough to say much.`;
}

// Response about secrets/what they know
function getSecretKnowledgeResponse(ctx: ResponseContext): string {
  const { character } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  if (character.secretKnowledge.length > 0) {
    // Reveal one of their secrets
    const secret = character.secretKnowledge[Math.floor(Math.random() * character.secretKnowledge.length)];
    return `${prefix}Well, since you're asking... ${secret}`;
  }
  
  return `${prefix}I'm afraid I don't know any secrets that would help your investigation.`;
}

// Response about the victim
function getVictimResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  // Killer tries to hide their true motive if it's a secret
  if (character.isGuilty && character.victimRelationship.isSecret) {
    return `${prefix}The victim? We had a... professional relationship. ${case_.victimBackground}. I didn't have any particular issue with them.`;
  }
  
  return `${prefix}${case_.victimName}? ${character.victimRelationship.problem}. But I certainly didn't kill them over it.`;
}

// Response about motive
function getMotiveResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  // Killer with secret motive tries to hide it
  if (character.isGuilty && character.victimRelationship.isSecret) {
    return `${prefix}Motive? I had no reason to want ${case_.victimName} dead. We got along fine. You should look elsewhere, detective.`;
  }
  
  return `${prefix}My issue with the victim? ${character.victimRelationship.problem}. But that's hardly a reason to kill someone.`;
}

// Denial response when accused
function getDenialResponse(ctx: ResponseContext): string {
  const { character } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  const denials = [
    `${prefix}Absolutely not! I am innocent. How dare you suggest such a thing.`,
    `${prefix}I did not kill anyone. You're wasting your time with me.`,
    `${prefix}No. I am not the murderer. Look elsewhere for your culprit.`,
    `${prefix}That's absurd. I had nothing to do with this tragedy.`,
  ];
  
  return denials[Math.floor(Math.random() * denials.length)];
}

// General/fallback response
function getGeneralResponse(ctx: ResponseContext): string {
  const { character } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  const responses = [
    `${prefix}I'm not sure what you're asking. Could you be more specific?`,
    `${prefix}I've told you what I know. Perhaps you should speak with the others.`,
    `${prefix}Is there something specific you'd like to know? I'm trying to cooperate.`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Main response generator
export function generateResponse(
  question: string,
  character: CharacterState,
  allCharacters: CharacterState[],
  case_: DailyCase
): string {
  const ctx: ResponseContext = { character, allCharacters, case_, question };
  const analysis = analyzeQuestion(question, allCharacters);
  
  // If asking if they're guilty - they always deny
  if (analysis.askingIfGuilty) {
    return getDenialResponse(ctx);
  }
  
  // Asking what they saw - KEY for alibi witness
  if (analysis.askingWhatTheySaw) {
    return getWhatTheySawResponse(ctx);
  }
  
  // About another specific character - KEY for getting evidence
  if (analysis.aboutOtherCharacter && analysis.aboutOtherCharacter !== character.suspect.id) {
    return getOtherCharacterResponse(ctx, analysis.aboutOtherCharacter);
  }
  
  // Asking about secrets - reveals hidden knowledge
  if (analysis.askingAboutSecrets || (analysis.aboutMotive && analysis.mentionedCharacter)) {
    // If asking about another character's secrets/motive
    if (analysis.mentionedCharacter && analysis.mentionedCharacter.suspect.id !== character.suspect.id) {
      return getOtherCharacterResponse(ctx, analysis.mentionedCharacter.suspect.id);
    }
    return getSecretKnowledgeResponse(ctx);
  }
  
  // About alibi/whereabouts
  if (analysis.aboutAlibi || analysis.aboutTime) {
    return getAlibiResponse(ctx);
  }
  
  // About their item or weapon
  if (analysis.aboutItem || analysis.aboutWeapon) {
    return getItemResponse(ctx);
  }
  
  // About motive
  if (analysis.aboutMotive) {
    return getMotiveResponse(ctx);
  }
  
  // About the victim
  if (analysis.aboutVictim || analysis.aboutRelationship) {
    return getVictimResponse(ctx);
  }
  
  // About the crime in general
  if (analysis.aboutCrime) {
    if (character.secretKnowledge.length > 0) {
      return getSecretKnowledgeResponse(ctx);
    }
  }
  
  // Fallback
  return getGeneralResponse(ctx);
}
