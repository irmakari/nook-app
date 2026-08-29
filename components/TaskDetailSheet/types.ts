import { Task, SpaceMember } from '@/services/space-service';

export interface TaskDetailSheetProps {
  task: Task | null;
  visible: boolean;
  members: SpaceMember[];
  accentColor: string;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}
