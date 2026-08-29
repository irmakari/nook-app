export const Colors = {
  light: {
    text: '#18181B',
    textSecondary: '#71717A',
    textMuted: '#A1A1AA',
    background: '#FAF8F5',
    surface: '#FFFFFF',
    surfaceSubtle: '#F3F0EB',
    surfaceHighlight: '#EAE6DF',
    border: '#EBE7E0',
    borderSubtle: '#F0ECE4',
    tint: '#18181B',
    icon: '#71717A',
    tabIconDefault: '#A1A1AA',
    tabIconSelected: '#18181B',
    tabBarBackground: '#FAF8F5',
    cardShadow: 'rgba(24, 24, 27, 0.04)',
    accent: '#18181B',
  },
  dark: {
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    background: '#121214',
    surface: '#1A1A1E',
    surfaceSubtle: '#222227',
    surfaceHighlight: '#2A2A31',
    border: '#26262B',
    borderSubtle: '#1E1E22',
    tint: '#F4F4F5',
    icon: '#A1A1AA',
    tabIconDefault: '#52525B',
    tabIconSelected: '#F4F4F5',
    tabBarBackground: '#121214',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    accent: '#F4F4F5',
  },
};

export const nookSpaceColors = {
  raspberryRose: '#F2619C',
  softLilac: '#E7BEF8',
  blueberryMilk: '#93ABD9',
  lemonCream: '#EDE986',

  sky: '#7FB9E6',
  lavender: '#D6BEEA',
  butter: '#F4D77A',
  matcha: '#B7C96A',
  pink: '#F98BA9',
  tangerine: '#FF8F45',
} as const;

export type NookColorKey = keyof typeof nookSpaceColors;

export interface NookColorOption {
  key: NookColorKey;
  name: string;
  hex: string;
}

export const nookColorPaletteList: NookColorOption[] = [
  { key: 'sky', name: 'Sky', hex: nookSpaceColors.sky },
  { key: 'matcha', name: 'Matcha', hex: nookSpaceColors.matcha },
  { key: 'softLilac', name: 'Soft Lilac', hex: nookSpaceColors.softLilac },
  { key: 'raspberryRose', name: 'Raspberry Rose', hex: nookSpaceColors.raspberryRose },
  { key: 'blueberryMilk', name: 'Blueberry Milk', hex: nookSpaceColors.blueberryMilk },
  { key: 'butter', name: 'Butter', hex: nookSpaceColors.butter },
  { key: 'lemonCream', name: 'Lemon Cream', hex: nookSpaceColors.lemonCream },
  { key: 'lavender', name: 'Lavender', hex: nookSpaceColors.lavender },
  { key: 'pink', name: 'Pink', hex: nookSpaceColors.pink },
  { key: 'tangerine', name: 'Tangerine', hex: nookSpaceColors.tangerine },
];

export const SpaceThemes = {
  lavender: {
    id: 'lavender',
    name: 'Muted Lavender',
    accent: '#7FB9E6',
    accentLight: '#F2EEFA',
    accentBorder: '#DDD5EE',
    accentText: '#554181',
    darkAccentLight: '#262135',
    darkAccentBorder: '#3C3454',
    darkAccentText: '#C3B6E5',
  },
  sage: {
    id: 'sage',
    name: 'Soft Sage',
    accent: '#B7C96A',
    accentLight: '#EEF5F1',
    accentBorder: '#D1E3D8',
    accentText: '#335744',
    darkAccentLight: '#1C2922',
    darkAccentBorder: '#2C4035',
    darkAccentText: '#A7CEB9',
  },
  rose: {
    id: 'rose',
    name: 'Dusty Rose',
    accent: '#E7BEF8',
    accentLight: '#FAF0F3',
    accentBorder: '#F1D2DB',
    accentText: '#8E374D',
    darkAccentLight: '#321C23',
    darkAccentBorder: '#4E2B37',
    darkAccentText: '#E6A5B6',
  },
  terracotta: {
    id: 'terracotta',
    name: 'Warm Terracotta',
    accent: '#FF8F45',
    accentLight: '#FAF1ED',
    accentBorder: '#F2D8CB',
    accentText: '#8E4628',
    darkAccentLight: '#32211A',
    darkAccentBorder: '#503328',
    darkAccentText: '#E8B19B',
  },
  slate: {
    id: 'slate',
    name: 'Slate Teal',
    accent: '#93ABD9',
    accentLight: '#EEF4F6',
    accentBorder: '#CFDFE5',
    accentText: '#2C5261',
    darkAccentLight: '#1A272C',
    darkAccentBorder: '#2B3E46',
    darkAccentText: '#A1C7D5',
  },
} as const;

export type SpaceThemeKey = keyof typeof SpaceThemes;

/**
 * Calculates accessible foreground text color (deep charcoal vs pure white)
 * based on the background color luminance.
 */
export function getReadableTextColor(hex: string): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 165 ? '#18181B' : '#FFFFFF';
}

/**
 * Generates an RGBA tint string for soft accents and card backgrounds.
 */
export function getAccentTint(hex: string, opacity: number = 0.15): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const Typography = {
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
  },
};
