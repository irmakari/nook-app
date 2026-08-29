export type AddSomethingOptionType = 'plan' | 'poll' | 'todo' | 'list' | 'note';

export interface AddSomethingSheetProps {
  visible: boolean;
  onClose: () => void;
  accentColor: string;
  spaceName: string;
  onSelectOption?: (type: AddSomethingOptionType) => void;
}
