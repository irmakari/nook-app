import { Space } from '@/services/space-service';

export interface SpaceOptionsSheetProps {
  visible: boolean;
  space: Space;
  isOwner: boolean;
  onClose: () => void;
  onOpenMembers: () => void;
  onEditSpace: () => void;
  onDeleteOrLeaveSpace: () => void;
}
