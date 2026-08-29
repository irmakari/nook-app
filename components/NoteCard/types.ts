import { Note } from '@/services/space-service';

export interface NoteCardProps {
  note: Note;
  accentColor: string;
  onPress: (noteId: string) => void;
}
