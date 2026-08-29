import { SpaceMember } from '@/services/space-service';

export interface MemberSelectorProps {
  spaceName: string;
  allMembers: SpaceMember[];
  selectedMembers: SpaceMember[];
  onUpdateSelectedMembers: (members: SpaceMember[]) => void;
  accentColor: string;
}
