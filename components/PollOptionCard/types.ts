import { PollOption } from '@/services/space-service';

export interface PollOptionCardProps {
  option: PollOption;
  totalVotes: number;
  isLeading: boolean;
  isSelected: boolean;
  isClosed?: boolean;
  accentColor: string;
  onVote: (optionId: string) => void;
}
