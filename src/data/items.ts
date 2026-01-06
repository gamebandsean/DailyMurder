import { ImageSourcePropType } from 'react-native';

export interface Item {
  id: string;
  name: string;
  description: string;
  isSharp: boolean; // Can be used for stabbing
  emoji: string; // Fallback display
}

// Sharp items (potential murder weapons for stabbing)
export const SHARP_ITEMS: Item[] = [
  {
    id: 'letter_opener',
    name: 'antique letter opener',
    description: 'A sharp brass letter opener with an ornate handle',
    isSharp: true,
    emoji: '🗡️',
  },
  {
    id: 'pocket_knife',
    name: 'pocket knife',
    description: 'A well-worn folding pocket knife',
    isSharp: true,
    emoji: '🔪',
  },
  {
    id: 'scissors',
    name: 'tailoring scissors',
    description: 'A pair of sharp tailoring scissors',
    isSharp: true,
    emoji: '✂️',
  },
  {
    id: 'ice_pick',
    name: 'ice pick',
    description: 'A pointed ice pick from the bar',
    isSharp: true,
    emoji: '🪡',
  },
  {
    id: 'hat_pin',
    name: 'decorative hat pin',
    description: 'A long, sharp hat pin with a jeweled top',
    isSharp: true,
    emoji: '📌',
  },
];

// Non-sharp items (innocent objects)
export const OTHER_ITEMS: Item[] = [
  {
    id: 'pocket_watch',
    name: 'pocket watch',
    description: 'An antique gold pocket watch',
    isSharp: false,
    emoji: '⌚',
  },
  {
    id: 'reading_glasses',
    name: 'reading glasses',
    description: 'Wire-rimmed reading glasses',
    isSharp: false,
    emoji: '👓',
  },
  {
    id: 'cigarette_case',
    name: 'cigarette case',
    description: 'A silver cigarette case',
    isSharp: false,
    emoji: '🚬',
  },
  {
    id: 'handkerchief',
    name: 'silk handkerchief',
    description: 'A monogrammed silk handkerchief',
    isSharp: false,
    emoji: '🧣',
  },
  {
    id: 'notebook',
    name: 'leather notebook',
    description: 'A small leather-bound notebook',
    isSharp: false,
    emoji: '📓',
  },
  {
    id: 'fountain_pen',
    name: 'fountain pen',
    description: 'An expensive fountain pen',
    isSharp: false,
    emoji: '🖋️',
  },
  {
    id: 'compact_mirror',
    name: 'compact mirror',
    description: 'A silver compact mirror',
    isSharp: false,
    emoji: '🪞',
  },
  {
    id: 'flask',
    name: 'hip flask',
    description: 'A silver hip flask, half empty',
    isSharp: false,
    emoji: '🫗',
  },
];

// All items combined
export const ALL_ITEMS: Item[] = [...SHARP_ITEMS, ...OTHER_ITEMS];

// Get item by ID
export function getItemById(id: string): Item | undefined {
  return ALL_ITEMS.find(item => item.id === id);
}


