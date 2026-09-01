import { Space } from '@/services/space-service';

export interface SpaceCardProps {
  space: Space;
  onPress?: (space?: Space) => void;
  onDelete?: (space: Space) => void;
  onLongPress?: (space: Space) => void;
}
