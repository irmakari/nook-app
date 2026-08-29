import { SpaceMember } from '@/services/space-service';

export interface MemberRowProps {
  member: SpaceMember;
  isCurrentUser: boolean;
  isOwner: boolean;
  canRemove: boolean;
  accentColor: string;
  onRemove?: (memberName: string) => void;
}
