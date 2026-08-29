import { UpcomingPlan } from '@/services/space-service';

export interface UpcomingPlanCardProps {
  plan?: UpcomingPlan;
  accentColor: string;
  onPress?: () => void;
  onAddPlanPress?: () => void;
}
