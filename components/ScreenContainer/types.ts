import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type ScreenContainerVariant = 'page' | 'modal' | 'tab';

export interface ScreenContainerProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: ScreenContainerVariant;
}
