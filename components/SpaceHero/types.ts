import { Space } from '@/services/space-service';

export interface SpaceHeroProps {
  space: Space;
  onBackPress: () => void;
  onOptionsPress?: () => void;
  onAddMemberPress?: () => void;
  onMembersPress?: () => void;
}
