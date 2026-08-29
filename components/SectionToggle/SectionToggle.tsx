import React from 'react';
import { View, Switch, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { SectionToggleProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SectionToggle({
  name,
  description,
  icon,
  enabled,
  onToggle,
  accentColor = '#7FB9E6',
}: SectionToggleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  const handleToggle = (val: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onToggle(name);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
          borderColor: isDark ? '#26262B' : '#EFECE6',
        },
      ]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: enabled
              ? softTint
              : isDark
              ? '#222228'
              : '#F5F2EC',
          },
        ]}>
        <ThemedText style={styles.iconEmoji}>{icon}</ThemedText>
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="body" weight="medium" style={styles.title}>
          {name}
        </ThemedText>
        <ThemedText type="caption" style={styles.description}>
          {description}
        </ThemedText>
      </View>

      <Switch
        value={enabled}
        onValueChange={handleToggle}
        trackColor={{
          false: isDark ? '#3F3F46' : '#D4D4D8',
          true: accentColor,
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
