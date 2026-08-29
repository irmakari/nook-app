import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ListItemRowProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ListItemRow({
  item,
  accentColor,
  onToggle,
  onDelete,
}: ListItemRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(item.id);
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onDelete?.(item.id);
  };

  return (
    <Pressable
      onPress={handleToggle}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed
            ? isDark
              ? '#222228'
              : '#F5F2EB'
            : isDark
            ? '#1A1A1E'
            : '#FFFFFF',
          borderColor: isDark ? '#26262B' : '#EFECE6',
          opacity: item.completed ? 0.75 : 1,
        },
      ]}>
      {/* Checkbox Circle */}
      <View
        style={[
          styles.checkCircle,
          {
            backgroundColor: item.completed ? accentColor : 'transparent',
            borderColor: item.completed
              ? accentColor
              : isDark
              ? '#3F3F46'
              : '#D4D4D8',
          },
        ]}>
        {item.completed ? (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        ) : null}
      </View>

      {/* Text Group: Item text + optional note */}
      <View style={styles.textGroup}>
        <ThemedText
          type="body"
          weight="medium"
          style={[
            styles.itemText,
            item.completed && styles.completedItemText,
          ]}>
          {item.text}
        </ThemedText>

        {item.note ? (
          <ThemedText style={styles.noteText}>{item.note}</ThemedText>
        ) : null}
      </View>

      {/* Delete trigger */}
      {onDelete && (
        <Pressable onPress={handleDelete} style={styles.deleteBtn}>
          <Ionicons
            name="trash-outline"
            size={16}
            color={isDark ? '#52525B' : '#C4C0B8'}
          />
        </Pressable>
      )}
    </Pressable>
  );
}
