import { Space } from '@/services/space-service';

export interface SpaceCardProps {
  space: Space;
  onPress?: (space?: Space) => void;
}
