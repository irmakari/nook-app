export type PlanMode = 'know' | 'vote';

export interface PlanModeSelectorProps {
  selectedMode: PlanMode;
  onSelectMode: (mode: PlanMode) => void;
  accentColor: string;
}
