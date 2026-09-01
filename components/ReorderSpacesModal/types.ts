import { Space } from '@/services/space-service';

export interface ReorderSpacesModalProps {
  visible: boolean;
  spaces: Space[];
  onClose: () => void;
  onSave: (reorderedSpaces: Space[]) => void;
}
