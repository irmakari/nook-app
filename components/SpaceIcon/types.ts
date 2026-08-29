import { Ionicons } from '@expo/vector-icons';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface SpaceIconProps {
  name: string;
  size?: number;
  color?: string;
}
