import { PlanRSVPStatus } from '@/services/space-service';

export interface RSVPSelectorProps {
  currentStatus?: PlanRSVPStatus;
  accentColor: string;
  onSelectStatus: (status: PlanRSVPStatus) => void;
}
