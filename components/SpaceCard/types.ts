import { Space } from '@/services/space-service';

export interface SpaceCardProps {
  space: Space;
  onPress?: () => void;
}
