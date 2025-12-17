import { CharacterState, DailyCase } from '../types';

interface ResponseContext {
  character: CharacterState;
  allCharacters: CharacterState[];
  case_: DailyCase;
  question: string;
}

// Detect what the question is about
function analyzeQuestion(question: string): {
  aboutSelf: boolean;
  aboutVictim: boolean;
  aboutCrime: boolean;
  aboutAlibi: boolean;
  aboutItem: boolean;
  aboutLocation: boolean;
  aboutTime: boolean;
  aboutOtherCharacter: string | null;
  askingIfGuilty: boolean;
  aboutRelationship: boolean;
  aboutMotive: boolean;
} {
  const q = question.toLowerCase();
  
  // Check if asking about specific character
  let aboutOtherCharacter: string | null = null;
  const namePatterns = [
    { pattern: /marcus|chen/i, id: 'marcus' },
    { pattern: /reginald|ashworth/i, id: 'reginald' },
    { pattern: /sarah|mitchell/i, id: 'sarah' },
    { pattern: /victoria|pemberton/i, id: 'victoria' },
    { pattern: /jerome|washington/i, id: 'jerome' },
  ];
  
  for (const { pattern, id } of namePatterns) {
    if (pattern.test(question)) {
      aboutOtherCharacter = id;
      break;
    }
  }
  
  return {
    aboutSelf: /\b(you|your|yourself)\b/i.test(q) && !aboutOtherCharacter,
    aboutVictim: /\b(victim|dead|body|murder|killed|deceased|theodore|margaret|richard|eleanor|blackwood|holloway|crane|ashford)\b/i.test(q),
    aboutCrime: /\b(murder|kill|crime|death|happen|incident|night|evening)\b/i.test(q),
    aboutAlibi: /\b(alibi|where were you|where was|doing|when|at the time|that night|whereabouts)\b/i.test(q),
    aboutItem: /\b(weapon|knife|item|carrying|have on|possess|object|tool)\b/i.test(q),
    aboutLocation: /\b(where|location|place|room|study|library|garden|cellar|conservatory)\b/i.test(q),
    aboutTime: /\b(time|when|clock|hour|pm|am|o\'clock)\b/i.test(q),
    aboutOtherCharacter,
    askingIfGuilty: /\b(did you (do|kill|murder)|are you (guilty|the (killer|murderer))|you (did|killed|murdered)|confess|admit)\b/i.test(q),
    aboutRelationship: /\b(relationship|know|friend|enemy|feel about|think of|opinion|get along)\b/i.test(q),
    aboutMotive: /\b(motive|reason|why would|grudge|problem with|issue with|angry|upset)\b/i.test(q),
  };
}

// Generate personality-appropriate response prefix
function getPersonalityPrefix(character: CharacterState): string {
  const prefixes: { [key: string]: string[] } = {
    marcus: ['*adjusts blazer* ', '*looks at you directly* ', '*considers the question* ', ''],
    reginald: ['*clears throat* ', '*strokes mustache thoughtfully* ', '*speaks carefully* ', 'Hmm, '],
    sarah: ['*smiles nervously* ', '*fidgets slightly* ', 'Oh! ', 'Well, '],
    victoria: ['*raises an eyebrow* ', '*adjusts hat* ', '*sighs* ', 'Darling, '],
    jerome: ['*pauses thoughtfully* ', '*speaks slowly* ', '*nods* ', 'I see. '],
  };
  
  const options = prefixes[character.suspect.id] || [''];
  return options[Math.floor(Math.random() * options.length)];
}

// Get character's response about the victim
function getVictimResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  const responses = [
    `${prefix}${case_.victimName}? ${case_.victimBackground} As for my relationship with them... ${character.victimRelationship.problem.toLowerCase()}. I won't pretend I'm heartbroken.`,
    `${prefix}I'll be honest with you, detective. ${character.victimRelationship.problem}. But that doesn't mean I wanted them dead.`,
    `${prefix}The victim was... complicated. ${case_.victimDescription.toLowerCase()}. And yes, ${character.victimRelationship.problem.toLowerCase()}. I ${character.victimRelationship.feeling} them for it.`,
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Get character's alibi response
function getAlibiResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  if (character.alibi.hasAlibi) {
    return `${prefix}At ${case_.murderDetails.timeOfDeath}, when the murder occurred? ${character.alibi.description}. ${character.alibi.witness}.`;
  } else {
    return `${prefix}${character.alibi.description}. I know that doesn't give me an alibi, but it's the truth.`;
  }
}

// Get response about another character
function getOtherCharacterResponse(ctx: ResponseContext, targetId: string): string {
  const { character, allCharacters } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  const relationship = character.relationships.find(r => r.targetId === targetId);
  const target = allCharacters.find(c => c.suspect.id === targetId);
  
  if (!relationship || !target) {
    return `${prefix}I don't know who you're referring to.`;
  }
  
  if (relationship.feeling === 'dislikes' || relationship.feeling === 'hates') {
    return `${prefix}${target.suspect.name}? ${relationship.reason}. I don't trust them one bit. You should look into their whereabouts more carefully.`;
  } else if (relationship.feeling === 'friendly') {
    return `${prefix}${target.suspect.name}? We've always gotten along well. ${relationship.reason}. I can't imagine they'd be involved in something like this.`;
  } else {
    return `${prefix}${target.suspect.name}? We're acquaintances, nothing more. I don't know them well enough to say much about their character.`;
  }
}

// Get response about their item
function getItemResponse(ctx: ResponseContext): string {
  const { character } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  if (character.isGuilty) {
    // Guilty character has the murder weapon but doesn't lie about having it
    return `${prefix}Yes, I have a ${character.item.name}. ${character.item.description}. I always carry it with me. Is that relevant somehow?`;
  } else {
    return `${prefix}I do have a ${character.item.name} on me. ${character.item.description}. Why do you ask?`;
  }
}

// Get response about secret knowledge
function getSecretKnowledgeResponse(ctx: ResponseContext): string {
  const { character } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  if (character.secretKnowledge.length > 0) {
    const secret = character.secretKnowledge[Math.floor(Math.random() * character.secretKnowledge.length)];
    return `${prefix}Now that you mention it... ${secret}. I didn't think much of it at the time, but perhaps it's significant?`;
  }
  
  return `${prefix}I'm afraid I didn't notice anything unusual that night. I wish I could be more helpful.`;
}

// Get denial response when asked if guilty
function getDenialResponse(ctx: ResponseContext): string {
  const { character } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  const denials = [
    `${prefix}Absolutely not! I had nothing to do with this tragedy. How dare you even suggest such a thing.`,
    `${prefix}I am innocent, detective. I may have had my differences with the victim, but I am not a murderer.`,
    `${prefix}No. I did not kill anyone. Look elsewhere for your culprit.`,
    `${prefix}That's a serious accusation, detective. I am not guilty of this crime.`,
    `${prefix}I understand why you might suspect me, but I swear to you, I did not do this.`,
  ];
  
  return denials[Math.floor(Math.random() * denials.length)];
}

// Get motive response
function getMotiveResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  return `${prefix}My problem with ${case_.victimName}? ${character.victimRelationship.problem}. I ${character.victimRelationship.feeling} them for it. But plenty of people had reasons to want them gone - I'm hardly unique in that regard.`;
}

// Get general/fallback response
function getGeneralResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPersonalityPrefix(character);
  
  const responses = [
    `${prefix}I'm not sure what you're asking, detective. Could you be more specific?`,
    `${prefix}That's an interesting question. ${case_.victimDescription}, and many people had reason to wish them harm. That's all I can say.`,
    `${prefix}I've told you everything I know. Perhaps you should speak with the others.`,
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
  const analysis = analyzeQuestion(question);
  
  // If asking if they're guilty - they always deny (the only lie they tell)
  if (analysis.askingIfGuilty) {
    return getDenialResponse(ctx);
  }
  
  // About another specific character
  if (analysis.aboutOtherCharacter && analysis.aboutOtherCharacter !== character.suspect.id) {
    return getOtherCharacterResponse(ctx, analysis.aboutOtherCharacter);
  }
  
  // About alibi/whereabouts
  if (analysis.aboutAlibi || (analysis.aboutTime && analysis.aboutLocation)) {
    return getAlibiResponse(ctx);
  }
  
  // About their item/weapon
  if (analysis.aboutItem) {
    return getItemResponse(ctx);
  }
  
  // About motive
  if (analysis.aboutMotive) {
    return getMotiveResponse(ctx);
  }
  
  // About the victim
  if (analysis.aboutVictim || (analysis.aboutRelationship && !analysis.aboutOtherCharacter)) {
    return getVictimResponse(ctx);
  }
  
  // About the crime in general
  if (analysis.aboutCrime) {
    if (character.secretKnowledge.length > 0 && Math.random() > 0.3) {
      return getSecretKnowledgeResponse(ctx);
    }
    return getGeneralResponse(ctx);
  }
  
  // Fallback
  return getGeneralResponse(ctx);
}

