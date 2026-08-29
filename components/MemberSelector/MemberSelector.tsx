import React, { useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { MemberSelectorProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { SpaceMember } from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function MemberSelector({
  spaceName,
  allMembers,
  selectedMembers,
  onUpdateSelectedMembers,
  accentColor,
}: MemberSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [mode, setMode] = useState<'everyone' | 'custom'>('everyone');

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  const handleSelectEveryone = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setMode('everyone');
    onUpdateSelectedMembers([...allMembers]);
  };

  const handleSelectCustom = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setMode('custom');
  };

  const handleToggleMember = (member: SpaceMember) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const isSelected = selectedMembers.some((m) => m.name === member.name);
    if (isSelected) {
      if (selectedMembers.length <= 1) return; // Keep at least one
      onUpdateSelectedMembers(selectedMembers.filter((m) => m.name !== member.name));
    } else {
      onUpdateSelectedMembers([...selectedMembers, member]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.toggleTabsRow}>
        <Pressable
          onPress={handleSelectEveryone}
          style={[
            styles.tabButton,
            {
              backgroundColor:
                mode === 'everyone'
                  ? softTint
                  : isDark
                  ? '#1A1A1E'
                  : '#FFFFFF',
              borderColor:
                mode === 'everyone'
                  ? accentColor
                  : isDark
                  ? '#26262B'
                  : '#EFECE6',
            },
          ]}>
          <ThemedText
            style={[
              styles.tabText,
              {
                color:
                  mode === 'everyone'
                    ? isDark
                      ? '#F4F4F5'
                      : '#18181B'
                    : isDark
                    ? '#A1A1AA'
                    : '#71717A',
              },
            ]}>
            Everyone in {spaceName}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleSelectCustom}
          style={[
            styles.tabButton,
            {
              backgroundColor:
                mode === 'custom'
                  ? softTint
                  : isDark
                  ? '#1A1A1E'
                  : '#FFFFFF',
              borderColor:
                mode === 'custom'
                  ? accentColor
                  : isDark
                  ? '#26262B'
                  : '#EFECE6',
            },
          ]}>
          <ThemedText
            style={[
              styles.tabText,
              {
                color:
                  mode === 'custom'
                    ? isDark
                      ? '#F4F4F5'
                      : '#18181B'
                    : isDark
                    ? '#A1A1AA'
                    : '#71717A',
              },
            ]}>
            Choose people
          </ThemedText>
        </Pressable>
      </View>

      {/* Custom Member Checkbox List */}
      {mode === 'custom' && (
        <View
          style={[
            styles.membersListCard,
            {
              backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
              borderColor: isDark ? '#26262B' : '#EFECE6',
            },
          ]}>
          {allMembers.map((member) => {
            const isChecked = selectedMembers.some((m) => m.name === member.name);
            return (
              <Pressable
                key={member.name}
                onPress={() => handleToggleMember(member)}
                style={({ pressed }) => [
                  styles.memberRow,
                  {
                    backgroundColor: pressed
                      ? isDark
                        ? '#222228'
                        : '#FAF8F5'
                      : 'transparent',
                  },
                ]}>
                <View style={styles.memberLeft}>
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: isDark ? '#26262F' : '#EFECE6',
                      },
                    ]}>
                    <ThemedText style={styles.avatarInitials}>
                      {member.initials}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.memberName}>
                    {member.name}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: isChecked ? accentColor : 'transparent',
                      borderColor: isChecked
                        ? accentColor
                        : isDark
                        ? '#4B4B55'
                        : '#D1CDC7',
                    },
                  ]}>
                  {isChecked ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
