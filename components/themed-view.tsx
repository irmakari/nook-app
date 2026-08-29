import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'background' | 'surface' | 'surfaceSubtle' | 'surfaceHighlight';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'background',
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant as 'background' | 'surface' | 'surfaceSubtle' | 'surfaceHighlight'
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
