import { CharacterState, DailyCase, RelationshipDetail } from '../types';

interface ResponseContext {
  character: CharacterState;
  allCharacters: CharacterState[];
  case_: DailyCase;
  question: string;
  learnedSecrets: { aboutId: string; secret: string; fromId: string }[];
}

// ============ QUESTION ANALYSIS ============

function analyzeQuestion(question: string, ctx: ResponseContext): {
  aboutAlibi: boolean;
  aboutItem: boolean;
  aboutMotive: boolean;
  aboutVictim: boolean;
  aboutSuspicions: boolean;
  aboutOtherCharacter: string | null;
  askingForSecret: boolean;
  askingIfGuilty: boolean;
  presentingEvidence: boolean;
  presentedSecret: string | null;
} {
  const q = question.toLowerCase();
  
  // Check if asking about specific character
  let aboutOtherCharacter: string | null = null;
  for (const char of ctx.allCharacters) {
    if (char.suspect.id === ctx.character.suspect.id) continue;
    const firstName = char.suspect.name.split(' ')[0].toLowerCase();
    const lastName = char.suspect.name.split(' ').slice(-1)[0].toLowerCase();
    if (q.includes(firstName) || q.includes(lastName)) {
      aboutOtherCharacter = char.suspect.id;
      break;
    }
  }
  
  // Check if presenting evidence/secret to this character
  let presentedSecret: string | null = null;
  for (const secret of ctx.learnedSecrets) {
    if (secret.aboutId === ctx.character.suspect.id) {
      // Check if the question contains keywords from the secret
      const secretWords = secret.secret.toLowerCase().split(' ').filter(w => w.length > 4);
      const matchCount = secretWords.filter(w => q.includes(w)).length;
      if (matchCount >= 2) {
        presentedSecret = secret.secret;
        break;
      }
    }
  }
  
  return {
    aboutAlibi: /\b(alibi|where were you|where was|at the time|that night|whereabouts|when)\b/i.test(q),
    aboutItem: /\b(item|carrying|have on|holding|weapon|possess|pocket)\b/i.test(q),
    aboutMotive: /\b(motive|reason|why would|grudge|problem|issue|relationship|feel about)\b/i.test(q),
    aboutVictim: /\b(victim|dead|deceased|murdered|killed)\b/i.test(q),
    aboutSuspicions: /\b(suspect|think|who did|guilty|killer|murderer|trust|suspicious)\b/i.test(q),
    aboutOtherCharacter,
    askingForSecret: /\b(secret|know about|tell me about|hiding|truth about|really know)\b/i.test(q),
    askingIfGuilty: /\b(did you (do|kill|murder)|are you (guilty|the killer)|you killed|confess|admit)\b/i.test(q),
    presentingEvidence: presentedSecret !== null || /\b(someone told me|i heard|i know that you|confronted with)\b/i.test(q),
    presentedSecret,
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

// ============ RESPONSE GENERATORS ============

function getAlibiResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPrefix(character);
  
  if (character.isGuilty) {
    // Killer lies about alibi unless confronted
    const hasBeenConfronted = character.presentedEvidence.length > 0;
    if (hasBeenConfronted) {
      return `${prefix}*sighs heavily* Fine. ${character.alibi.description}. I know how that looks, but I swear I didn't do it.`;
    } else {
      // Lie
      return `${prefix}I was... in my room, resting. I wasn't anywhere near ${case_.crimeDetails.location}.`;
    }
  }
  
  if (character.alibi.isVerifiable) {
    return `${prefix}${character.alibi.description}. ${character.alibi.witness || 'I can prove it.'}`;
  } else {
    return `${prefix}${character.alibi.description}. I know I can't prove it, but it's the truth.`;
  }
}

function getItemResponse(ctx: ResponseContext): string {
  const { character } = ctx;
  const prefix = getPrefix(character);
  
  if (character.isGuilty && character.item.isMurderWeapon) {
    const hasBeenConfronted = character.presentedEvidence.length > 0;
    if (hasBeenConfronted) {
      return `${prefix}*looks away* Yes, I have the ${character.item.name}. ${character.item.description}. But I can explain...`;
    } else {
      // Lie about having a different item
      return `${prefix}I just have my pocket watch with me. Nothing unusual.`;
    }
  }
  
  return `${prefix}I have my ${character.item.name}. ${character.item.description}. Is that relevant?`;
}

function getMotiveResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPrefix(character);
  
  if (character.isGuilty) {
    const hasBeenConfronted = character.presentedEvidence.length > 0;
    if (hasBeenConfronted) {
      return `${prefix}*voice breaks* ${character.motive.description}. I was angry, yes. But I didn't mean for it to go so far...`;
    } else {
      // Downplay motive
      return `${prefix}The victim and I had our differences, like everyone else here. Nothing worth killing over.`;
    }
  }
  
  return `${prefix}${character.motive.description}. But that's hardly a reason to commit murder.`;
}

function getVictimResponse(ctx: ResponseContext): string {
  const { character, case_ } = ctx;
  const prefix = getPrefix(character);
  
  const victimRel = character.relationships.find(r => r.targetId === 'victim');
  if (!victimRel) {
    return `${prefix}I didn't know the victim very well.`;
  }
  
  if (character.hasOpenedUp) {
    // More honest after being shown a secret about them
    return `${prefix}*sighs* Look, ${victimRel.opinionReason}. And I'll tell you something else - ${victimRel.secretInfo}.`;
  }
  
  return `${prefix}${victimRel.opinionReason}. ${case_.victim.background}`;
}

function getSuspicionResponse(ctx: ResponseContext): string {
  const { character, allCharacters } = ctx;
  const prefix = getPrefix(character);
  
  if (character.suspicion === 'none') {
    return `${prefix}${character.suspicionReason}. I truly can't point fingers.`;
  }
  
  if (character.suspicion === 'one' && character.suspicionTargets.length > 0) {
    const suspect = allCharacters.find(c => c.suspect.id === character.suspicionTargets[0]);
    if (suspect) {
      return `${prefix}If you want my honest opinion... ${character.suspicionReason}. You should talk to ${suspect.suspect.name}.`;
    }
  }
  
  if (character.suspicion === 'multiple') {
    return `${prefix}${character.suspicionReason}. I wouldn't rule anyone out.`;
  }
  
  return `${prefix}I have my suspicions, but I'd rather not accuse anyone without proof.`;
}

function getSecretAboutOther(ctx: ResponseContext, targetId: string): { secret: string; revealed: boolean } | null {
  const rel = ctx.character.relationships.find(r => r.targetId === targetId);
  if (rel && !rel.secretRevealed) {
    return { secret: rel.secretInfo, revealed: false };
  }
  return null;
}

function getOtherCharacterResponse(ctx: ResponseContext, targetId: string): string {
  const { character, allCharacters } = ctx;
  const prefix = getPrefix(character);
  
  const target = allCharacters.find(c => c.suspect.id === targetId);
  const rel = character.relationships.find(r => r.targetId === targetId);
  
  if (!target || !rel) {
    return `${prefix}I don't know who you're referring to.`;
  }
  
  // If asking for secrets and character has opened up
  if (character.hasOpenedUp || ctx.learnedSecrets.some(s => s.aboutId === character.suspect.id)) {
    return `${prefix}${rel.opinionReason}. And between us... ${rel.secretInfo}`;
  }
  
  // Standard response based on opinion
  if (rel.opinion === 'positive') {
    return `${prefix}${target.suspect.name}? ${rel.opinionReason}. I can't imagine them doing something like this.`;
  } else if (rel.opinion === 'negative') {
    return `${prefix}${target.suspect.name}? ${rel.opinionReason}. I wouldn't be surprised if they were involved.`;
  }
  
  return `${prefix}${target.suspect.name}? ${rel.opinionReason}. I don't have much to say about them.`;
}

function getConfrontedResponse(ctx: ResponseContext, presentedSecret: string): string {
  const { character } = ctx;
  const prefix = getPrefix(character);
  
  if (character.isGuilty) {
    // Killer breaks down when confronted
    return `${prefix}*face goes pale* How do you... where did you hear that? *sighs heavily* Fine. You want the truth? ${character.motive.description}. I was at ${character.alibi.description}. And yes, I have the ${character.item.name}. But I'm telling you, I didn't do it! You have to believe me!`;
  }
  
  // Non-killer opens up
  return `${prefix}*looks surprised* Someone told you that? I... yes, it's true. I suppose I should be more honest with you. What else do you want to know? I'll tell you everything I know.`;
}

function getGuiltyDenialResponse(ctx: ResponseContext): string {
  const { character } = ctx;
  const prefix = getPrefix(character);
  
  const hasBeenConfronted = character.presentedEvidence.length > 0;
  
  if (character.isGuilty && hasBeenConfronted) {
    return `${prefix}*voice shaking* I know how this looks. Everything points to me. But I swear on my life, I did not kill them. Someone is framing me!`;
  }
  
  const denials = [
    `${prefix}Absolutely not! How dare you accuse me of such a thing!`,
    `${prefix}I am innocent. Look elsewhere for your murderer.`,
    `${prefix}No. I did not do this. You're wasting your time with me.`,
  ];
  
  return denials[Math.floor(Math.random() * denials.length)];
}

function getGeneralResponse(ctx: ResponseContext): string {
  const prefix = getPrefix(ctx.character);
  return `${prefix}I'm not sure what you're asking. Could you be more specific?`;
}

// ============ MAIN RESPONSE GENERATOR ============

export function generateResponse(
  question: string,
  character: CharacterState,
  allCharacters: CharacterState[],
  case_: DailyCase,
  learnedSecrets: { aboutId: string; secret: string; fromId: string }[] = []
): { response: string; revealedSecret?: { aboutId: string; secret: string } } {
  
  const ctx: ResponseContext = { character, allCharacters, case_, question, learnedSecrets };
  const analysis = analyzeQuestion(question, ctx);
  
  // If presenting evidence about this character
  if (analysis.presentingEvidence && analysis.presentedSecret) {
    character.presentedEvidence.push(analysis.presentedSecret);
    character.hasOpenedUp = true;
    return { response: getConfrontedResponse(ctx, analysis.presentedSecret) };
  }
  
  // If asking if guilty
  if (analysis.askingIfGuilty) {
    return { response: getGuiltyDenialResponse(ctx) };
  }
  
  // If asking about another character (might reveal a secret)
  if (analysis.aboutOtherCharacter) {
    const response = getOtherCharacterResponse(ctx, analysis.aboutOtherCharacter);
    
    // Check if a secret was revealed
    const rel = character.relationships.find(r => r.targetId === analysis.aboutOtherCharacter);
    if (rel && !rel.secretRevealed && (character.hasOpenedUp || analysis.askingForSecret)) {
      rel.secretRevealed = true;
      return {
        response,
        revealedSecret: { aboutId: analysis.aboutOtherCharacter, secret: rel.secretInfo }
      };
    }
    
    return { response };
  }
  
  // About suspicions
  if (analysis.aboutSuspicions) {
    return { response: getSuspicionResponse(ctx) };
  }
  
  // About alibi
  if (analysis.aboutAlibi) {
    return { response: getAlibiResponse(ctx) };
  }
  
  // About item
  if (analysis.aboutItem) {
    return { response: getItemResponse(ctx) };
  }
  
  // About motive/victim
  if (analysis.aboutMotive || analysis.aboutVictim) {
    if (analysis.aboutVictim) {
      return { response: getVictimResponse(ctx) };
    }
    return { response: getMotiveResponse(ctx) };
  }
  
  return { response: getGeneralResponse(ctx) };
}
