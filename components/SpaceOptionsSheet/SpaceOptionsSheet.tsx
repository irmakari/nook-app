import React from 'react';
import {
  Modal,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SpaceOptionsSheetProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SpaceOptionsSheet({
  visible,
  space,
  isOwner,
  onClose,
  onOpenMembers,
  onEditSpace,
  onDeleteOrLeaveSpace,
}: SpaceOptionsSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const accentColor = space.accentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.15);

  const handleAction = (callback: () => void) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onClose();
    setTimeout(() => {
      callback();
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
              borderColor: isDark ? '#2B2B33' : '#EAE6DF',
            },
          ]}>
          <View
            style={[
              styles.handleBar,
              { backgroundColor: isDark ? '#33333D' : '#D8D4CC' },
            ]}
          />

          <View style={styles.headerRow}>
            <ThemedText style={styles.headerTitle}>
              {space.name}
            </ThemedText>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={22}
                color={isDark ? '#A1A1AA' : '#71717A'}
              />
            </Pressable>
          </View>

          <View style={styles.optionsList}>
            {/* Space Members */}
            <Pressable
              onPress={() => handleAction(onOpenMembers)}
              style={({ pressed }) => [
                styles.optionRow,
                {
                  backgroundColor: pressed
                    ? isDark
                      ? '#26262F'
                      : '#F5F2EB'
                    : isDark
                    ? '#222228'
                    : '#FAF8F5',
                  borderColor: isDark ? '#2D2D35' : '#EFECE6',
                },
              ]}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: softTint },
                ]}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={isDark ? '#F4F4F5' : '#18181B'}
                />
              </View>
              <View style={styles.optionTextCol}>
                <ThemedText style={styles.optionTitle}>Space Members</ThemedText>
                <ThemedText style={styles.optionSubtitle}>
                  {space.memberCount} {space.memberCount === 1 ? 'person' : 'people'} in this Space
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? '#52525B' : '#C4C0B8'}
              />
            </Pressable>

            {/* Edit Space Info */}
            <Pressable
              onPress={() => handleAction(onEditSpace)}
              style={({ pressed }) => [
                styles.optionRow,
                {
                  backgroundColor: pressed
                    ? isDark
                      ? '#26262F'
                      : '#F5F2EB'
                    : isDark
                    ? '#222228'
                    : '#FAF8F5',
                  borderColor: isDark ? '#2D2D35' : '#EFECE6',
                },
              ]}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: softTint },
                ]}>
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={isDark ? '#F4F4F5' : '#18181B'}
                />
              </View>
              <View style={styles.optionTextCol}>
                <ThemedText style={styles.optionTitle}>Edit Space Details</ThemedText>
                <ThemedText style={styles.optionSubtitle}>
                  Change name, tagline & theme color
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? '#52525B' : '#C4C0B8'}
              />
            </Pressable>

            {/* Leave / Delete Space */}
            <Pressable
              onPress={() => handleAction(onDeleteOrLeaveSpace)}
              style={({ pressed }) => [
                styles.optionRow,
                {
                  backgroundColor: pressed
                    ? isDark
                      ? '#2C1D21'
                      : '#FDF2F4'
                    : isDark
                    ? '#22191D'
                    : '#FFF8F9',
                  borderColor: isDark ? '#42242B' : '#FCDADF',
                },
              ]}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: 'rgba(242, 97, 156, 0.15)' },
                ]}>
                <Ionicons
                  name={isOwner ? 'trash-outline' : 'log-out-outline'}
                  size={20}
                  color="#F2619C"
                />
              </View>
              <View style={styles.optionTextCol}>
                <ThemedText style={[styles.optionTitle, { color: '#F2619C' }]}>
                  {isOwner ? 'Delete Space' : 'Leave Space'}
                </ThemedText>
                <ThemedText style={styles.optionSubtitle}>
                  {isOwner
                    ? 'Permanently delete this Space'
                    : 'Leave and remove from your spaces'}
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#F2619C"
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
