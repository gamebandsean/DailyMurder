import { CauseOfDeath } from '../types';

export interface Item {
  id: string;
  name: string;
  description: string;
  weaponType: CauseOfDeath | null; // What type of murder this could be used for
  emoji: string;
}

// Sharp items (for stabbing)
export const STABBING_WEAPONS: Item[] = [
  {
    id: 'letter_opener',
    name: 'antique letter opener',
    description: 'A sharp brass letter opener with an ornate handle',
    weaponType: 'stabbed',
    emoji: '🗡️',
  },
  {
    id: 'pocket_knife',
    name: 'pocket knife',
    description: 'A well-worn folding pocket knife',
    weaponType: 'stabbed',
    emoji: '🔪',
  },
  {
    id: 'ice_pick',
    name: 'ice pick',
    description: 'A pointed ice pick from the bar',
    weaponType: 'stabbed',
    emoji: '🪡',
  },
];

// Poison items
export const POISON_WEAPONS: Item[] = [
  {
    id: 'poison_vial',
    name: 'vial of poison',
    description: 'A small glass vial with a suspicious liquid',
    weaponType: 'poisoned',
    emoji: '🧪',
  },
  {
    id: 'medicine_bottle',
    name: 'medicine bottle',
    description: 'A bottle of prescription pills',
    weaponType: 'poisoned',
    emoji: '💊',
  },
  {
    id: 'rat_poison',
    name: 'rat poison',
    description: 'A container of household rat poison',
    weaponType: 'poisoned',
    emoji: '☠️',
  },
];

// Strangulation items
export const STRANGLING_WEAPONS: Item[] = [
  {
    id: 'silk_scarf',
    name: 'silk scarf',
    description: 'A long silk scarf',
    weaponType: 'strangled',
    emoji: '🧣',
  },
  {
    id: 'rope',
    name: 'length of rope',
    description: 'A sturdy length of rope',
    weaponType: 'strangled',
    emoji: '🪢',
  },
  {
    id: 'necktie',
    name: 'necktie',
    description: 'A silk necktie',
    weaponType: 'strangled',
    emoji: '👔',
  },
];

// Guns
export const SHOOTING_WEAPONS: Item[] = [
  {
    id: 'revolver',
    name: 'revolver',
    description: 'A small caliber revolver',
    weaponType: 'shot',
    emoji: '🔫',
  },
  {
    id: 'pistol',
    name: 'pistol',
    description: 'A semi-automatic pistol',
    weaponType: 'shot',
    emoji: '🔫',
  },
];

// Non-weapon items (innocent objects)
export const INNOCENT_ITEMS: Item[] = [
  {
    id: 'pocket_watch',
    name: 'pocket watch',
    description: 'An antique gold pocket watch',
    weaponType: null,
    emoji: '⌚',
  },
  {
    id: 'reading_glasses',
    name: 'reading glasses',
    description: 'Wire-rimmed reading glasses',
    weaponType: null,
    emoji: '👓',
  },
  {
    id: 'cigarette_case',
    name: 'cigarette case',
    description: 'A silver cigarette case',
    weaponType: null,
    emoji: '🚬',
  },
  {
    id: 'handkerchief',
    name: 'silk handkerchief',
    description: 'A monogrammed silk handkerchief',
    weaponType: null,
    emoji: '🧻',
  },
  {
    id: 'notebook',
    name: 'leather notebook',
    description: 'A small leather-bound notebook',
    weaponType: null,
    emoji: '📓',
  },
  {
    id: 'fountain_pen',
    name: 'fountain pen',
    description: 'An expensive fountain pen',
    weaponType: null,
    emoji: '🖋️',
  },
  {
    id: 'compact_mirror',
    name: 'compact mirror',
    description: 'A silver compact mirror',
    weaponType: null,
    emoji: '🪞',
  },
  {
    id: 'flask',
    name: 'hip flask',
    description: 'A silver hip flask, half empty',
    weaponType: null,
    emoji: '🫗',
  },
  {
    id: 'keys',
    name: 'set of keys',
    description: 'A heavy key ring with several keys',
    weaponType: null,
    emoji: '🔑',
  },
  {
    id: 'wallet',
    name: 'leather wallet',
    description: 'A worn leather wallet',
    weaponType: null,
    emoji: '👛',
  },
];

// Get weapons by cause of death
export function getWeaponsByCause(cause: CauseOfDeath): Item[] {
  switch (cause) {
    case 'stabbed': return STABBING_WEAPONS;
    case 'poisoned': return POISON_WEAPONS;
    case 'strangled': return STRANGLING_WEAPONS;
    case 'shot': return SHOOTING_WEAPONS;
  }
}

// All weapons
export const ALL_WEAPONS: Item[] = [
  ...STABBING_WEAPONS,
  ...POISON_WEAPONS,
  ...STRANGLING_WEAPONS,
  ...SHOOTING_WEAPONS,
];

// All items
export const ALL_ITEMS: Item[] = [...ALL_WEAPONS, ...INNOCENT_ITEMS];

// Get item by ID
export function getItemById(id: string): Item | undefined {
  return ALL_ITEMS.find(item => item.id === id);
}

// For backwards compatibility
export const SHARP_ITEMS = STABBING_WEAPONS;
export const OTHER_ITEMS = INNOCENT_ITEMS;
