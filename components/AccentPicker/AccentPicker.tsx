import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AccentPickerProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import {
  nookColorPaletteList,
  getReadableTextColor,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AccentPicker({
  selectedColor,
  onSelectColor,
  onCustomPress,
}: AccentPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const selectedOption = nookColorPaletteList.find(
    (c) => c.hex.toLowerCase() === selectedColor.toLowerCase()
  );

  const handleSelect = (hex: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onSelectColor(hex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.paletteGrid}>
        {nookColorPaletteList.map((item) => {
          const isSelected = item.hex.toLowerCase() === selectedColor.toLowerCase();
          const checkColor = getReadableTextColor(item.hex);
          const ringColor = isDark ? '#FFFFFF' : '#18181B';

          return (
            <Pressable
              key={item.key}
              onPress={() => handleSelect(item.hex)}
              style={({ pressed }) => [
                styles.colorSwatch,
                {
                  backgroundColor: item.hex,
                  borderColor: isSelected ? ringColor : 'transparent',
                  transform: [{ scale: isSelected ? 1.06 : pressed ? 0.95 : 1 }],
                },
                isSelected && styles.selectedRing,
              ]}>
              {isSelected ? (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={checkColor}
                  style={styles.checkIcon}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.customRow}>
        <ThemedText style={styles.selectedLabel}>
          {selectedOption ? selectedOption.name : 'Custom Color'}
        </ThemedText>

        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            onCustomPress?.();
          }}
          style={({ pressed }) => [
            styles.customButton,
            {
              backgroundColor: pressed
                ? isDark
                  ? '#26262E'
                  : '#EAE6DF'
                : isDark
                ? '#1A1A1E'
                : '#FAF8F5',
              borderColor: isDark ? '#26262B' : '#EFECE6',
            },
          ]}>
          <Ionicons
            name="color-palette-outline"
            size={14}
            color={isDark ? '#D4D4D8' : '#71717A'}
          />
          <ThemedText
            style={[
              styles.customText,
              { color: isDark ? '#D4D4D8' : '#71717A' },
            ]}>
            Custom +
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
