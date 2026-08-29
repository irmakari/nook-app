export interface QuickAddItemProps {
  placeholder?: string;
  accentColor: string;
  onAddItem: (text: string) => void;
  bottomOffset?: number;
}
