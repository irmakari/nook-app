import { ListTemplateConfig } from '@/constants/list-templates';

export interface ListTemplateOptionProps {
  template: ListTemplateConfig;
  isSelected: boolean;
  accentColor: string;
  onSelect: (id: ListTemplateConfig['id']) => void;
}
