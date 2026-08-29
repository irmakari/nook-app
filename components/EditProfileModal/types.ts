import { User } from '@/services/space-service';

export interface EditProfileModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
  onSave: (updates: Partial<User>) => void;
}
