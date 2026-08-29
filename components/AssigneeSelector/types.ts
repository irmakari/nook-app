import { SpaceMember } from '@/services/space-service';

export interface AssigneeSelectorProps {
  members: SpaceMember[];
  selectedAssignee?: string;
  onSelectAssignee: (assigneeName?: string) => void;
  accentColor: string;
}
