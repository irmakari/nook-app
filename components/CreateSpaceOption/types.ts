export type SpaceType = 'home' | 'friends' | 'partner' | 'trip' | 'blank';

export interface CreateSpaceOptionProps {
  type: SpaceType;
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  accentColor?: string;
  onSelect: (type: SpaceType) => void;
}
