import React from 'react';
import {
  Modal,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AddSomethingSheetProps, AddSomethingOptionType } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface OptionItem {
  type: AddSomethingOptionType;
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const ADD_OPTIONS: OptionItem[] = [
  {
    type: 'plan',
    title: 'Plan',
    description: 'Get everyone together',
    iconName: 'calendar-outline',
  },
  {
    type: 'poll',
    title: 'Poll',
    description: 'Let the group decide',
    iconName: 'bar-chart-outline',
  },
  {
    type: 'todo',
    title: 'To-do',
    description: 'Get things done',
    iconName: 'checkbox-outline',
  },
  {
    type: 'list',
    title: 'List',
    description: 'Shopping, movies, places...',
    iconName: 'list-outline',
  },
  {
    type: 'note',
    title: 'Note',
    description: 'Write something together',
    iconName: 'document-text-outline',
  },
];

export function AddSomethingSheet({
  visible,
  onClose,
  accentColor,
  onSelectOption,
}: AddSomethingSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  const handleSelect = (type: AddSomethingOptionType) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onSelectOption?.(type);
    onClose();
  };

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
              borderColor: isDark ? '#2B2B33' : '#EAE6DF',
            },
          ]}>
          {/* Subtle drag handle bar */}
          <View
            style={[
              styles.handleBar,
              { backgroundColor: isDark ? '#33333D' : '#D8D4CC' },
            ]}
          />

          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title">
              Add something
            </ThemedText>
            <ThemedText type="description" style={styles.subtitle}>
              What are we doing?
            </ThemedText>
          </View>

          {/* Options Menu */}
          <View style={styles.optionsList}>
            {ADD_OPTIONS.map((opt) => (
              <Pressable
                key={opt.type}
                onPress={() => handleSelect(opt.type)}
                style={({ pressed }) => [
                  styles.optionRow,
                  {
                    backgroundColor: pressed
                      ? isDark
                        ? '#22222A'
                        : '#F5F2EB'
                      : isDark
                      ? '#16161A'
                      : '#FAF8F5',
                    borderColor: isDark ? '#26262F' : '#EFECE6',
                  },
                ]}>
                <View style={[styles.iconBox, { backgroundColor: softTint }]}>
                  <Ionicons
                    name={opt.iconName}
                    size={20}
                    color={isDark ? '#F4F4F5' : '#18181B'}
                  />
                </View>

                <View style={styles.textWrapper}>
                  <ThemedText type="body" weight="semiBold" style={styles.optionTitle}>
                    {opt.title}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.optionDesc}>
                    {opt.description}
                  </ThemedText>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isDark ? '#52525B' : '#C4C0B8'}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
