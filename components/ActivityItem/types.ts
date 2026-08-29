import { Activity } from '@/services/space-service';

export interface ActivityItemProps {
  activity: Activity;
  onPress?: (activity: Activity) => void;
}
