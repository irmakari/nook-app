import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AssigneeSelectorProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AssigneeSelector({
  members,
  selectedAssignee,
  onSelectAssignee,
  accentColor,
}: AssigneeSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  const isAnyoneSelected = !selectedAssignee;

  const handleSelectAnyone = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onSelectAssignee(undefined);
  };

  const handleSelectMember = (name: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onSelectAssignee(name);
  };

  return (
    <View style={styles.container}>
      {/* Anyone Chip */}
      <Pressable
        onPress={handleSelectAnyone}
        style={[
          styles.chip,
          {
            backgroundColor: isAnyoneSelected
              ? softTint
              : isDark
              ? '#1A1A1E'
              : '#FFFFFF',
            borderColor: isAnyoneSelected
              ? accentColor
              : isDark
              ? '#26262B'
              : '#EFECE6',
          },
        ]}>
        <Ionicons
          name="people-outline"
          size={16}
          color={
            isAnyoneSelected
              ? isDark
                ? '#F4F4F5'
                : '#18181B'
              : isDark
              ? '#A1A1AA'
              : '#71717A'
          }
        />
        <ThemedText
          style={[
            styles.chipText,
            {
              color: isAnyoneSelected
                ? isDark
                  ? '#F4F4F5'
                  : '#18181B'
                : isDark
                ? '#A1A1AA'
                : '#71717A',
            },
          ]}>
          Anyone
        </ThemedText>
      </Pressable>

      {/* Member Chips */}
      {members.map((m) => {
        const isSelected = selectedAssignee === m.name;
        return (
          <Pressable
            key={m.name}
            onPress={() => handleSelectMember(m.name)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? softTint
                  : isDark
                  ? '#1A1A1E'
                  : '#FFFFFF',
                borderColor: isSelected
                  ? accentColor
                  : isDark
                  ? '#26262B'
                  : '#EFECE6',
              },
            ]}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: isSelected
                    ? accentColor
                    : isDark
                    ? '#2A2A33'
                    : '#EFECE6',
                },
              ]}>
              <ThemedText
                style={[
                  styles.avatarInitials,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : isDark
                      ? '#D4D4D8'
                      : '#52525B',
                  },
                ]}>
                {m.initials}
              </ThemedText>
            </View>

            <ThemedText
              style={[
                styles.chipText,
                {
                  color: isSelected
                    ? isDark
                      ? '#F4F4F5'
                      : '#18181B'
                    : isDark
                    ? '#A1A1AA'
                    : '#71717A',
                },
              ]}>
              {m.name}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
