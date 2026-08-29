import { Task } from '@/services/space-service';

export interface TaskRowProps {
  task: Task;
  accentColor: string;
  onToggle: (taskId: string) => void;
  onClaim?: (taskId: string) => void;
  onPress?: (task: Task) => void;
}
