/**
 * LLM Service for Daily Murder
 * Provides intelligent character responses using Claude
 */

import { CharacterState, DailyCase } from '../types';

const API_URL = 'http://localhost:3001/api/chat';

interface LLMResponse {
  response: string;
  revealedInfo?: {
    aboutCharacterId: string;
    info: string;
    infoType: 'motive' | 'means' | 'opportunity' | 'general';
  };
  evidenceUpdate?: {
    nameRevealed?: boolean;
    relationshipRevealed?: boolean;
    itemRevealed?: boolean;
    motiveRevealed?: boolean;
    motiveText?: string;
    meansRevealed?: boolean;
    meansText?: string;
    opportunityRevealed?: boolean;
    opportunityText?: string;
  };
}

/**
 * Build a comprehensive system prompt for the character
 */
function buildSystemPrompt(
  character: CharacterState,
  allCharacters: CharacterState[],
  case_: DailyCase,
  revealedInfo: { fromCharacterId: string; aboutCharacterId: string; info: string }[]
): string {
  const victimName = case_.victim.name;
  
  // Build knowledge about other characters
  const otherCharacterInfo = allCharacters
    .filter(c => c.suspect.id !== character.suspect.id)
    .map(c => {
      const rel = character.relationships.find(r => r.targetId === c.suspect.id);
      return `- ${c.suspect.name} (${c.suspect.occupation}): ${rel?.opinionReason || 'You know them casually.'} ${rel?.secretInfo ? `SECRET: ${rel.secretInfo}` : ''}`;
    })
    .join('\n');

  // Check what evidence has been presented against this character
  const evidenceAgainstMe = revealedInfo
    .filter(r => r.aboutCharacterId === character.suspect.id)
    .map(r => {
      const source = allCharacters.find(c => c.suspect.id === r.fromCharacterId);
      return `${source?.suspect.name || 'Someone'} told the detective: "${r.info}"`;
    });

  const hasBeenConfronted = evidenceAgainstMe.length > 0;

  return `You are ${character.suspect.name}, a ${character.suspect.occupation} in a murder mystery game. You are being interrogated by a detective about the murder of ${victimName}.

## YOUR PERSONALITY
${character.suspect.personality}

## YOUR BACKGROUND
- Name: ${character.suspect.name}
- Occupation: ${character.suspect.occupation}
- Relationship to victim: ${character.relationshipToVictim}
- Opinion of victim: ${character.relationships.find(r => r.targetId === 'victim')?.opinionReason || 'Complex.'}

## THE CRIME
- Victim: ${victimName} (${case_.victim.description})
- Cause of death: ${case_.crimeDetails.causeOfDeath}
- Time: ${case_.crimeDetails.timeOfDeath}
- Location: ${case_.crimeDetails.location}

## YOUR ALIBI
${character.alibi.description}
${character.alibi.wasAtCrimeScene ? '⚠️ This places you near the crime scene!' : ''}
${character.alibi.witness ? `Witness: ${character.alibi.witness}` : ''}

## YOUR ITEM
You are carrying: ${character.item.name} (${character.item.emoji})
${character.item.description}
${character.item.isWeaponType ? '⚠️ This could be used as a murder weapon!' : ''}
${character.item.originalOwnerId !== character.suspect.id ? `Originally belonged to someone else - you picked it up by mistake.` : ''}

## YOUR MOTIVE
${character.motive.hasMotive ? `You have a motive: ${character.motive.description}` : 'You have no real motive to kill the victim.'}

## YOUR KNOWLEDGE OF OTHERS
${otherCharacterInfo}

## YOUR SUSPICIONS
${character.suspicion === 'none' ? character.suspicionReason : 
  `You suspect: ${character.suspicionTargets.map(id => allCharacters.find(c => c.suspect.id === id)?.suspect.name).join(', ')}. Reason: ${character.suspicionReason}`}

## ARE YOU THE KILLER?
${character.isGuilty ? `YES - You killed ${victimName}. ${case_.crimeDetails.howItHappened}

LYING RULES FOR THE KILLER:
- You will NEVER admit to the murder directly
- You may lie about your alibi, your motive, or your item to protect yourself
- HOWEVER, if the detective presents VERIFIED evidence from another character (something another character actually told them about you), you MUST reluctantly admit that specific thing
- You can still deny being the killer even when forced to admit incriminating facts
- Act defensive and nervous when questioned about sensitive topics` 
: `NO - You are innocent. You should tell the truth, though you may be nervous or evasive about embarrassing details.`}

${hasBeenConfronted ? `
## EVIDENCE PRESENTED AGAINST YOU
The detective has confronted you with:
${evidenceAgainstMe.join('\n')}

Since this evidence has been verified, you MUST acknowledge it and tell the truth about these specific points. You can no longer lie about what was revealed.
` : ''}

## RESPONSE GUIDELINES
1. Stay in character at all times
2. Keep responses concise (1-3 sentences usually)
3. Use first person ("I", "me", "my")
4. Add personality through mannerisms and speech patterns
5. When asked about other characters, be TRUTHFUL about what you know
6. ${character.isGuilty ? 'As the killer, be evasive about incriminating details unless confronted with evidence' : 'As an innocent person, be cooperative but you may have secrets unrelated to the murder'}
7. If asked directly if you killed the victim, deny it (whether guilty or not - even innocent people deny when accused!)

## EVIDENCE REVELATION
When you reveal certain information, end your response with one of these tags:
- [REVEAL:NAME] - when you state your name
- [REVEAL:RELATIONSHIP] - when you describe your relationship to the victim
- [REVEAL:ITEM] - when you describe what you're carrying
- [REVEAL:MOTIVE] - when you reveal a motive (yours or someone else's)
- [REVEAL:MEANS] - when you reveal access to a weapon
- [REVEAL:OPPORTUNITY] - when you reveal being near the crime scene
- [SECRET:characterId:info] - when you reveal a secret about another character (use their first name in lowercase as the characterId)

Only add ONE tag per response, for the most significant revelation.`;
}

/**
 * Parse the response to extract evidence updates
 */
function parseResponse(rawResponse: string): LLMResponse {
  // Extract the tag if present
  const tagMatch = rawResponse.match(/\[(REVEAL:[A-Z]+|SECRET:[a-z]+:.+?)\]/);
  
  let response = rawResponse.replace(/\[(REVEAL:[A-Z]+|SECRET:[a-z]+:.+?)\]/, '').trim();
  let evidenceUpdate: LLMResponse['evidenceUpdate'] = {};
  let revealedInfo: LLMResponse['revealedInfo'] = undefined;

  if (tagMatch) {
    const tag = tagMatch[1];
    
    if (tag === 'REVEAL:NAME') {
      evidenceUpdate.nameRevealed = true;
    } else if (tag === 'REVEAL:RELATIONSHIP') {
      evidenceUpdate.relationshipRevealed = true;
    } else if (tag === 'REVEAL:ITEM') {
      evidenceUpdate.itemRevealed = true;
    } else if (tag === 'REVEAL:MOTIVE') {
      evidenceUpdate.motiveRevealed = true;
    } else if (tag === 'REVEAL:MEANS') {
      evidenceUpdate.meansRevealed = true;
    } else if (tag === 'REVEAL:OPPORTUNITY') {
      evidenceUpdate.opportunityRevealed = true;
    } else if (tag.startsWith('SECRET:')) {
      const parts = tag.split(':');
      if (parts.length >= 3) {
        revealedInfo = {
          aboutCharacterId: parts[1],
          info: parts.slice(2).join(':'),
          infoType: 'general',
        };
      }
    }
  }

  return {
    response,
    evidenceUpdate: Object.keys(evidenceUpdate).length > 0 ? evidenceUpdate : undefined,
    revealedInfo,
  };
}

/**
 * Generate a response using Claude
 */
export async function generateLLMResponse(
  question: string,
  character: CharacterState,
  allCharacters: CharacterState[],
  case_: DailyCase,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  revealedInfo: { fromCharacterId: string; aboutCharacterId: string; info: string }[] = []
): Promise<LLMResponse> {
  
  const systemPrompt = buildSystemPrompt(character, allCharacters, case_, revealedInfo);
  
  // Build messages with history
  const messages = [
    ...conversationHistory,
    { role: 'user' as const, content: question }
  ];

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      return parseResponse(data.content[0].text);
    }

    throw new Error('Invalid response format');

  } catch (error) {
    console.error('LLM Error:', error);
    // Fallback to a generic response
    return {
      response: `*clears throat* I'm not sure how to answer that. Could you rephrase?`,
    };
  }
}

/**
 * Check if the LLM service is available
 */
export async function isLLMAvailable(): Promise<boolean> {
  try {
    const response = await fetch(API_URL.replace('/chat', '/health'), {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

