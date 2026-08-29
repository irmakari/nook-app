export interface PollAddOptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddOption: (text: string) => void;
  accentColor: string;
}
