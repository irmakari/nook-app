export interface SectionToggleProps {
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  onToggle: (name: string) => void;
  accentColor?: string;
}
