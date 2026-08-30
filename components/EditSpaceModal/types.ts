import { Space } from '@/services/space-service';

export interface EditSpaceModalProps {
  visible: boolean;
  space: Space;
  onClose: () => void;
  onSave: (updates: { name: string; tagline?: string; accentColor: string }) => void;
}
