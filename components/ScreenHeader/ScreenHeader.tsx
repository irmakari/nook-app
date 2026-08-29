import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ScreenHeaderProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ScreenHeader({
  title,
  subtitle,
  action,
  showBackButton = false,
  onBackPress,
}: ScreenHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onBackPress?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        {showBackButton && (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: pressed
                  ? isDark
                    ? '#26262D'
                    : '#EAE6DF'
                  : isDark
                  ? '#1A1A1E'
                  : '#FFFFFF',
                borderColor: isDark ? '#26262B' : '#EFECE6',
              },
            ]}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={isDark ? '#F4F4F5' : '#18181B'}
            />
          </Pressable>
        )}
        <ThemedText type="hero" style={styles.title}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="muted" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      {action ? <View style={styles.actionContainer}>{action}</View> : null}
    </View>
  );
}
