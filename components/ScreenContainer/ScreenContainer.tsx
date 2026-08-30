import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from './styles';
import { ScreenContainerProps } from './types';

const TOP_SPACING = {
  page: 12,
  modal: 8,
  tab: 16,
} as const;

export function ScreenContainer({
  children,
  style,
  variant = 'page',
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const nativeModalHandlesTopInset = variant === 'modal' && Platform.OS === 'ios';
  const safeAreaTop = nativeModalHandlesTopInset ? 0 : insets.top;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme].background,
          paddingTop: safeAreaTop + TOP_SPACING[variant],
        },
        style,
      ]}>
      {children}
    </View>
  );
}
