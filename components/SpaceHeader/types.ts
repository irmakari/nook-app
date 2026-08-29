import { Space } from '@/services/space-service';

export interface SpaceHeaderProps {
  space: Space;
  onBackPress: () => void;
  onOptionsPress?: () => void;
  onMembersPress?: () => void;
}
