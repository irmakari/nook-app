import { SpaceActivity } from '@/services/space-service';

export interface SpaceActivityItemProps {
  activity: SpaceActivity;
  accentColor: string;
  isLast?: boolean;
}
