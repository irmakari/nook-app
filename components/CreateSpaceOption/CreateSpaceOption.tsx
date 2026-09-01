import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { CreateSpaceOptionProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpaceIcon } from '@/components/SpaceIcon';
import { getAccentTint } from '@/constants/theme';

export function CreateSpaceOption({
  type,
  icon,
  title,
  description,
  selected = false,
  accentColor,
  onSelect,
}: CreateSpaceOptionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const defaultAccent = isDark ? '#F4F4F5' : '#18181B';
  const effectiveAccent = accentColor || defaultAccent;

  const cardBg = selected
    ? accentColor
      ? getAccentTint(accentColor, isDark ? 0.18 : 0.12)
      : isDark
      ? '#1E1E24'
      : '#FAF8F5'
    : isDark
    ? '#16161A'
    : '#FFFFFF';

  const cardBorder = selected
    ? accentColor
      ? accentColor
      : isDark
      ? '#52525E'
      : '#18181B'
    : isDark
    ? '#26262B'
    : '#EFECE6';

  const iconBg = selected
    ? accentColor
      ? getAccentTint(accentColor, isDark ? 0.28 : 0.20)
      : isDark
      ? '#2D2D38'
      : '#F3F0EB'
    : isDark
    ? '#222228'
    : '#FAF8F5';

  const activeIconColor = selected && accentColor ? accentColor : (isDark ? '#F4F4F5' : '#18181B');

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
          backgroundColor: cardBg,
          borderColor: cardBorder,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: iconBg,
          },
        ]}>
        <SpaceIcon name={icon} size={22} color={activeIconColor} />
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
              ? effectiveAccent
              : isDark
              ? '#3F3F46'
              : '#D4D4D8',
          },
        ]}>
        {selected ? (
          <View
            style={[
              styles.radioDot,
              { backgroundColor: effectiveAccent },
            ]}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
