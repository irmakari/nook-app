import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { CreateSpaceOptionProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpaceIcon } from '@/components/SpaceIcon';

export function CreateSpaceOption({
  type,
  icon,
  title,
  description,
  selected = false,
  onSelect,
}: CreateSpaceOptionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onSelect(type);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.optionCard,
        {
          backgroundColor: selected
            ? isDark
              ? '#1E1E24'
              : '#FFFFFF'
            : isDark
            ? '#16161A'
            : '#FFFFFF',
          borderColor: selected
            ? isDark
              ? '#52525E'
              : '#18181B'
            : isDark
            ? '#26262B'
            : '#EFECE6',
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: selected
              ? isDark
                ? '#2D2D38'
                : '#F3F0EB'
              : isDark
              ? '#222228'
              : '#FAF8F5',
          },
        ]}>
        <SpaceIcon name={icon} size={22} color={isDark ? '#F4F4F5' : '#18181B'} />
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="body" weight="semiBold" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText type="caption" style={styles.description}>
          {description}
        </ThemedText>
      </View>

      <View
        style={[
          styles.radioCircle,
          {
            borderColor: selected
              ? isDark
                ? '#F4F4F5'
                : '#18181B'
              : isDark
              ? '#3F3F46'
              : '#D4D4D8',
          },
        ]}>
        {selected ? (
          <View
            style={[
              styles.radioDot,
              { backgroundColor: isDark ? '#F4F4F5' : '#18181B' },
            ]}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
