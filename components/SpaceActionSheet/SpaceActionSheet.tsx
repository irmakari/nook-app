import React from 'react';
import { Modal, View, Pressable, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SpaceActionSheetProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { SpaceIcon } from '@/components/SpaceIcon';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Space } from '@/services/space-service';

export function SpaceActionSheet({
  visible,
  space,
  onClose,
  onTogglePin,
  onMoveToTop,
  onOpenReorder,
  onEditSpace,
  onDeleteSpace,
}: SpaceActionSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!space) return null;

  const accentColor = space.accentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.15);

  const handleAction = (callback: (s: Space) => void) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onClose();
    setTimeout(() => {
      callback(space);
    }, 150);
  };

  const isPinned = !!space.isPinned;

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
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconBox, { backgroundColor: softTint }]}>
                <SpaceIcon name={space.icon} size={18} color={isDark ? '#F4F4F5' : '#18181B'} />
              </View>
              <ThemedText type="title" numberOfLines={1}>
                {space.name}
              </ThemedText>
            </View>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={22}
                color={isDark ? '#A1A1AA' : '#71717A'}
              />
            </Pressable>
          </View>

          <View style={styles.optionsList}>
            {/* Move to Top */}
            {onMoveToTop ? (
              <Pressable
                onPress={() => handleAction(onMoveToTop)}
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
                <View style={[styles.iconBox, { backgroundColor: softTint }]}>
                  <Ionicons
                    name="arrow-up-circle-outline"
                    size={20}
                    color={isDark ? '#F4F4F5' : '#18181B'}
                  />
                </View>
                <View style={styles.optionTextCol}>
                  <ThemedText type="body" weight="semiBold">
                    Move to Top
                  </ThemedText>
                  <ThemedText type="caption">
                    Bring this space card to the top
                  </ThemedText>
                </View>
              </Pressable>
            ) : null}

            {/* Reorder Spaces */}
            {onOpenReorder ? (
              <Pressable
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  onClose();
                  setTimeout(() => {
                    onOpenReorder();
                  }, 150);
                }}
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
                <View style={[styles.iconBox, { backgroundColor: softTint }]}>
                  <Ionicons
                    name="reorder-two-outline"
                    size={20}
                    color={isDark ? '#F4F4F5' : '#18181B'}
                  />
                </View>
                <View style={styles.optionTextCol}>
                  <ThemedText type="body" weight="semiBold">
                    Reorder Spaces
                  </ThemedText>
                  <ThemedText type="caption">
                    Customise the order of your spaces
                  </ThemedText>
                </View>
              </Pressable>
            ) : null}

            {/* Pin / Unpin Space */}
            <Pressable
              onPress={() => handleAction(onTogglePin)}
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
                <MaterialCommunityIcons
                  name={isPinned ? 'pin' : 'pin-outline'}
                  size={20}
                  color={isDark ? '#F4F4F5' : '#18181B'}
                />
              </View>
              <View style={styles.optionTextCol}>
                <ThemedText type="body" weight="semiBold">
                  {isPinned ? 'Unpin Space' : 'Pin Space to Top'}
                </ThemedText>
                <ThemedText type="caption">
                  {isPinned
                    ? 'Remove from top of your spaces'
                    : 'Keep this space at the top of your list'}
                </ThemedText>
              </View>
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
                <ThemedText type="body" weight="semiBold">Edit Details</ThemedText>
                <ThemedText type="caption">
                  Change space name or color theme
                </ThemedText>
              </View>
            </Pressable>

            {/* Delete Space */}
            <Pressable
              onPress={() => handleAction(onDeleteSpace)}
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
                  name="trash-outline"
                  size={20}
                  color="#F2619C"
                />
              </View>
              <View style={styles.optionTextCol}>
                <ThemedText type="body" weight="semiBold" style={{ color: '#F2619C' }}>
                  Delete Space
                </ThemedText>
                <ThemedText type="caption">
                  Permanently delete this space
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
