import { Activity } from '@/services/space-service';

export interface ActivityTimelineCardProps {
  activity: Activity;
  onPress: (activity: Activity) => void;
}
