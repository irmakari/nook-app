import { SpaceMember } from '@/services/space-service';

export interface InviteMemberSheetProps {
  visible: boolean;
  spaceName: string;
  accentColor: string;
  availableUsers: SpaceMember[];
  onClose: () => void;
  onAddMember: (user: SpaceMember) => void;
}
