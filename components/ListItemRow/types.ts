import { ListItem } from '@/services/space-service';

export interface ListItemRowProps {
  item: ListItem;
  accentColor: string;
  onToggle: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
}
