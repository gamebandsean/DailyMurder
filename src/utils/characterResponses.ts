import { CharacterState, DailyCase, CharacterEvidence } from '../types';

interface RevealedInfo {
  fromCharacterId: string;
  aboutCharacterId: string;
  info: string;
  infoType: 'motive' | 'means' | 'opportunity' | 'general';
}

interface ResponseContext {
  character: CharacterState;
  allCharacters: CharacterState[];
  case_: DailyCase;
  question: string;
  revealedInfo: RevealedInfo[];
}

interface ResponseResult {
  response: string;
  revealedInfo?: {
    aboutCharacterId: string;
    info: string;
    infoType: 'motive' | 'means' | 'opportunity' | 'general';
  };
  evidenceUpdate?: Partial<CharacterEvidence>;
}

// ============ QUESTION ANALYSIS ============

function analyzeQuestion(question: string, ctx: ResponseContext): {
  aboutName: boolean;
  aboutAlibi: boolean;
  aboutItem: boolean;
  aboutMotive: boolean;
  aboutVictim: boolean;
  aboutSuspicions: boolean;
  aboutRelationship: boolean;
  aboutOtherCharacter: string | null;
  askingForSecret: boolean;
  askingIfGuilty: boolean;
  presentingEvidence: boolean;
  presentedInfo: RevealedInfo | null;
  mentionedCharacterName: string | null;
} {
  const q = question.toLowerCase();
  
  // Check if asking about specific character
  let aboutOtherCharacter: string | null = null;
  let mentionedCharacterName: string | null = null;
  
  for (const char of ctx.allCharacters) {
    if (char.suspect.id === ctx.character.suspect.id) continue;
    const firstName = char.suspect.name.split(' ')[0].toLowerCase();
    const lastName = char.suspect.name.split(' ').slice(-1)[0].toLowerCase();
    if (q.includes(firstName) || q.includes(lastName)) {
      aboutOtherCharacter = char.suspect.id;
      mentionedCharacterName = char.suspect.name;
      break;
    }
  }
  
  // Check if player is presenting info they learned from another character
  // This is verified by checking if the info exists in revealedInfo
  let presentedInfo: RevealedInfo | null = null;
  
  // Check if they're claiming someone told them something about this character
  const claimPattern = /(\w+)\s+(told|said|mentioned|revealed|confessed)/i;
  const match = q.match(claimPattern);
  
  if (match) {
    const claimedSource = match[1].toLowerCase();
    // Find the source character
    for (const char of ctx.allCharacters) {
      const firstName = char.suspect.name.split(' ')[0].toLowerCase();
      if (claimedSource === firstName) {
        // Check if this character actually told them about the current character
        const info = ctx.revealedInfo.find(
          r => r.fromCharacterId === char.suspect.id && 
               r.aboutCharacterId === ctx.character.suspect.id
        );
        if (info) {
          presentedInfo = info;
        }
        break;
      }
    }
  }
  
  return {
    aboutName: /\b(name|who are you|introduce yourself|call you|what do you do|your job|for a living|occupation|profession|work)\b/i.test(q),
    aboutAlibi: /\b(alibi|where were you|where was|at the time|that night|whereabouts|when|location|seen)\b/i.test(q),
    aboutItem: /\b(item|carrying|have on|holding|weapon|possess|pocket|what do you have|what are you carrying|on your person|show me|object)\b/i.test(q),
    aboutMotive: /\b(motive|reason|why would|grudge|problem|issue|angry|hate)\b/i.test(q),
    aboutVictim: /\b(victim|dead|deceased|murdered|killed|think of|know|relationship)\b/i.test(q),
    aboutRelationship: /\b(relationship|know the victim|connection|how did you know)\b/i.test(q),
    aboutSuspicions: /\b(suspect|think|who did|guilty|killer|murderer|trust|suspicious|theory)\b/i.test(q),
    aboutOtherCharacter,
    askingForSecret: /\b(secret|know about|tell me about|hiding|truth about|really know|between us)\b/i.test(q),
    askingIfGuilty: /\b(did you (do|kill|murder)|are you (guilty|the killer)|you killed|confess|admit|you did it)\b/i.test(q),
    presentingEvidence: presentedInfo !== null,
    presentedInfo,
    mentionedCharacterName,
  };
}

// ============ PERSONALITY PREFIXES ============

function getPrefix(character: CharacterState): string {
  const prefixes: { [key: string]: string[] } = {
    marcus: ['*adjusts blazer* ', '*meets your gaze* ', ''],
    reginald: ['*clears throat* ', '*strokes mustache* ', 'Hmm, '],
    sarah: ['*fidgets nervously* ', 'Oh! ', 'Well... '],
    victoria: ['*raises an eyebrow* ', '*sighs* ', 'Darling, '],
    jerome: ['*pauses thoughtfully* ', '*nods slowly* ', ''],
  };
  const options = prefixes[character.suspect.id] || [''];
  return options[Math.floor(Math.random() * options.length)];
}

// Helper: Determine if character should lie about incriminating info
// They don't ALWAYS lie - sometimes they tell the truth even when it hurts
function shouldLie(character: CharacterState, isIncriminating: boolean): boolean {
  if (!isIncriminating) return false;
  if (!character.isGuilty) return false;
  // Killer lies about incriminating things ~70% of the time
  return Math.random() < 0.7;
}

// ============ RESPONSE GENERATORS ============

function getNameResponse(ctx: ResponseContext): ResponseResult {
  const { character, case_ } = ctx;
  const prefix = getPrefix(character);
  
  // Build occupation string with proper article and victim reference where appropriate
  const occupation = character.suspect.occupation.toLowerCase();
  let occupationText: string;
  
  // Add "the victim's" for roles that imply a direct relationship
  const victimRelatedRoles = ['personal assistant', 'business partner', 'ex-wife', 'ex-husband', 'family lawyer', 'groundskeeper', 'butler', 'maid', 'chef', 'driver'];
  const isVictimRelated = victimRelatedRoles.some(role => occupation.includes(role));
  
  if (isVictimRelated) {
    occupationText = `${case_.victim.name}'s ${occupation}`;
  } else {
    // Add article "a" or "an" as needed
    const startsWithVowel = /^[aeiou]/i.test(occupation);
    occupationText = `${startsWithVowel ? 'an' : 'a'} ${occupation}`;
  }
  
  return {
    response: `${prefix}My name is ${character.suspect.name}. I'm ${occupationText}.`,
    evidenceUpdate: { nameRevealed: true },
  };
}

function getRelationshipResponse(ctx: ResponseContext): ResponseResult {
  const { character, case_ } = ctx;
  const prefix = getPrefix(character);
  
  return {
    response: `${prefix}I was the victim's ${character.relationshipToVictim}. ${character.relationships.find(r => r.targetId === 'victim')?.opinionReason || 'We had a complicated relationship.'}`,
    evidenceUpdate: { relationshipRevealed: true },
  };
}

function getAlibiResponse(ctx: ResponseContext): ResponseResult {
  const { character, case_ } = ctx;
  const prefix = getPrefix(character);
  
  const isIncriminating = character.alibi.wasAtCrimeScene;
  const hasBeenConfronted = character.presentedEvidence.length > 0;
  
  // If guilty and near crime scene, might lie
  if (character.isGuilty && isIncriminating && !hasBeenConfronted && shouldLie(character, true)) {
    return {
      response: `${prefix}I was in my room, resting. Nowhere near ${case_.crimeDetails.location}.`,
    };
  }
  
  // Truth (forced or voluntary)
  let response = `${prefix}${character.alibi.description}.`;
  
  if (character.alibi.wasAtCrimeScene) {
    response += ` I know that places me near the crime scene, but I didn't do anything wrong!`;
    return {
      response,
      evidenceUpdate: {
        opportunityRevealed: true,
        opportunityText: `Was near ${case_.crimeDetails.location} at ${case_.crimeDetails.timeOfDeath}`,
      },
    };
  }
  
  if (character.alibi.witness) {
    response += ` ${character.alibi.witness}`;
  }
  
  return { response };
}

function getItemResponse(ctx: ResponseContext): ResponseResult {
  const { character, case_ } = ctx;
  const prefix = getPrefix(character);
  const item = character.item;
  
  const isIncriminating = item.isWeaponType;
  const hasBeenConfronted = character.presentedEvidence.length > 0;
  
  // Guilty person with murder weapon might lie
  if (character.isGuilty && item.isMurderWeapon && !hasBeenConfronted && shouldLie(character, true)) {
    return {
      response: `${prefix}I just have my pocket watch with me. Nothing unusual.`,
    };
  }
  
  // Truth
  let response = `${prefix}I have my ${item.name}. ${item.emoji} ${item.description}`;
  
  // Check if it was swapped
  const wasSwapped = item.originalOwnerId !== character.suspect.id;
  const originalOwner = ctx.allCharacters.find(c => c.suspect.id === item.originalOwnerId);
  
  if (wasSwapped && originalOwner) {
    response += ` Actually, this originally belonged to ${originalOwner.suspect.name}. We must have swapped at some point.`;
  }
  
  const evidenceUpdate: Partial<CharacterEvidence> = {
    itemRevealed: true,
  };
  
  // If it's a weapon type, this reveals MEANS
  if (item.isWeaponType) {
    evidenceUpdate.meansRevealed = true;
    evidenceUpdate.meansText = `Has ${item.name} (${case_.crimeDetails.causeOfDeath} weapon)`;
  }
  
  return {
    response: response + '. Is that relevant?',
    evidenceUpdate,
  };
}

function getMotiveResponse(ctx: ResponseContext): ResponseResult {
  const { character } = ctx;
  const prefix = getPrefix(character);
  
  const hasBeenConfronted = character.presentedEvidence.length > 0;
  
  // Guilty person might lie about motive
  if (character.isGuilty && !hasBeenConfronted && shouldLie(character, true)) {
    return {
      response: `${prefix}The victim and I had our differences, like everyone. Nothing worth killing over.`,
    };
  }
  
  // Truth
  if (character.motive.hasMotive) {
    return {
      response: `${prefix}${character.motive.description}. But I didn't kill anyone!`,
      evidenceUpdate: {
        motiveRevealed: true,
        motiveText: character.motive.description,
      },
    };
  }
  
  return {
    response: `${prefix}I had no reason to want the victim dead. We got along fine.`,
  };
}

function getVictimResponse(ctx: ResponseContext): ResponseResult {
  const { character, case_ } = ctx;
  const prefix = getPrefix(character);
  
  const victimRel = character.relationships.find(r => r.targetId === 'victim');
  
  return {
    response: `${prefix}${victimRel?.opinionReason || 'I knew the victim somewhat.'}`,
    evidenceUpdate: { relationshipRevealed: true },
  };
}

function getSuspicionResponse(ctx: ResponseContext): ResponseResult {
  const { character, allCharacters } = ctx;
  const prefix = getPrefix(character);
  
  if (character.suspicion === 'none') {
    return { response: `${prefix}${character.suspicionReason}` };
  }
  
  if (character.suspicionTargets.length > 0) {
    const suspect = allCharacters.find(c => c.suspect.id === character.suspicionTargets[0]);
    if (suspect) {
      return {
        response: `${prefix}If you want my honest opinion... ${character.suspicionReason}. You should talk to ${suspect.suspect.name}.`,
      };
    }
  }
  
  return { response: `${prefix}I have my suspicions, but I'd rather not accuse without proof.` };
}

function getOtherCharacterResponse(ctx: ResponseContext, targetId: string): ResponseResult {
  const { character, allCharacters } = ctx;
  const prefix = getPrefix(character);
  
  const target = allCharacters.find(c => c.suspect.id === targetId);
  const rel = character.relationships.find(r => r.targetId === targetId);
  
  if (!target || !rel) {
    return { response: `${prefix}I don't know who you're referring to.` };
  }
  
  // Characters ALWAYS tell the truth about OTHER characters
  // This is key to the game mechanic
  let response = `${prefix}${target.suspect.name}? ${rel.opinionReason}`;
  
  // If they know a secret about this person, they might share it
  if (rel.secretInfo && (character.hasOpenedUp || Math.random() < 0.4)) {
    response += ` Between us... ${rel.secretInfo}`;
    
    return {
      response,
      revealedInfo: {
        aboutCharacterId: targetId,
        info: rel.secretInfo,
        infoType: rel.secretType,
      },
    };
  }
  
  return { response };
}

function getConfrontedResponse(ctx: ResponseContext, presentedInfo: RevealedInfo): ResponseResult {
  const { character, case_ } = ctx;
  const prefix = getPrefix(character);
  
  // Player has presented verified info that another character told them
  // This FORCES truthful responses
  
  character.presentedEvidence.push(presentedInfo.info);
  character.hasOpenedUp = true;
  
  if (character.isGuilty) {
    // Killer must admit things when confronted with evidence
    return {
      response: `${prefix}*face goes pale* Someone told you that? I... *sighs heavily* Fine. You caught me in some lies. ${character.motive.description}. And yes, I was ${character.alibi.description}. But I swear I didn't kill anyone!`,
      evidenceUpdate: {
        motiveRevealed: true,
        motiveText: character.motive.description,
        opportunityRevealed: character.alibi.wasAtCrimeScene,
        opportunityText: character.alibi.wasAtCrimeScene ? `Was near ${case_.crimeDetails.location}` : null,
      },
    };
  }
  
  // Non-killer opens up
  return {
    response: `${prefix}*looks surprised* So someone told you about that. Yes, it's true. I'll be completely honest with you from now on. What do you want to know?`,
  };
}

function getGuiltyDenialResponse(ctx: ResponseContext): ResponseResult {
  const { character } = ctx;
  const prefix = getPrefix(character);
  
  const denials = [
    `${prefix}Absolutely not! How dare you accuse me of such a thing!`,
    `${prefix}I am innocent. Look elsewhere for your murderer.`,
    `${prefix}No. I did not do this.`,
    `${prefix}You're making a serious mistake accusing me.`,
  ];
  
  return { response: denials[Math.floor(Math.random() * denials.length)] };
}

function getGeneralResponse(ctx: ResponseContext): ResponseResult {
  const prefix = getPrefix(ctx.character);
  const responses = [
    `${prefix}I'm not sure what you're asking. Could you be more specific?`,
    `${prefix}Can you clarify what you mean?`,
    `${prefix}I don't understand the question.`,
  ];
  return { response: responses[Math.floor(Math.random() * responses.length)] };
}

// ============ MAIN RESPONSE GENERATOR ============

export function generateResponse(
  question: string,
  character: CharacterState,
  allCharacters: CharacterState[],
  case_: DailyCase,
  revealedInfo: RevealedInfo[] = []
): ResponseResult {
  
  const ctx: ResponseContext = { character, allCharacters, case_, question, revealedInfo };
  const analysis = analyzeQuestion(question, ctx);
  
  // If presenting VERIFIED evidence from another character
  if (analysis.presentingEvidence && analysis.presentedInfo) {
    return getConfrontedResponse(ctx, analysis.presentedInfo);
  }
  
  // If asking if guilty
  if (analysis.askingIfGuilty) {
    return getGuiltyDenialResponse(ctx);
  }
  
  // About their name
  if (analysis.aboutName) {
    return getNameResponse(ctx);
  }
  
  // About item
  if (analysis.aboutItem) {
    return getItemResponse(ctx);
  }
  
  // About relationship to victim
  if (analysis.aboutRelationship) {
    return getRelationshipResponse(ctx);
  }
  
  // About another character (always truthful about others!)
  if (analysis.aboutOtherCharacter) {
    return getOtherCharacterResponse(ctx, analysis.aboutOtherCharacter);
  }
  
  // About suspicions
  if (analysis.aboutSuspicions) {
    return getSuspicionResponse(ctx);
  }
  
  // About alibi
  if (analysis.aboutAlibi) {
    return getAlibiResponse(ctx);
  }
  
  // About motive/victim
  if (analysis.aboutMotive) {
    return getMotiveResponse(ctx);
  }
  
  if (analysis.aboutVictim) {
    return getVictimResponse(ctx);
  }
  
  return getGeneralResponse(ctx);
}

