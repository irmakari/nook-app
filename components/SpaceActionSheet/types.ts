import { Space } from '@/services/space-service';

export interface SpaceActionSheetProps {
  visible: boolean;
  space: Space | null;
  onClose: () => void;
  onTogglePin: (space: Space) => void;
  onMoveToTop?: (space: Space) => void;
  onOpenReorder?: () => void;
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (space: Space) => void;
}
