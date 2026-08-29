import { SpaceMember } from '@/services/space-service';

export interface AvatarStackProps {
  members: SpaceMember[];
  max?: number;
  size?: number;
  ringColor?: string;
}
