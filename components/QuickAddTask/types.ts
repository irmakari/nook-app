export interface QuickAddTaskProps {
  placeholder?: string;
  accentColor: string;
  onAddTask: (title: string) => void;
  bottomOffset?: number;
}
