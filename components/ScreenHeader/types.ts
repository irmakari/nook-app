import { ReactNode } from 'react';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
}
