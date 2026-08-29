export interface AccentPickerProps {
  selectedColor: string;
  onSelectColor: (colorHex: string) => void;
  onCustomPress?: () => void;
}
