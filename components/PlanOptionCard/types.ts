import { PlanOption } from '@/services/space-service';

export interface PlanOptionCardProps {
  option: PlanOption;
  isSelected: boolean;
  accentColor: string;
  onToggleVote: (optionId: string) => void;
  canFinalize?: boolean;
  onFinalize?: (optionId: string) => void;
}
