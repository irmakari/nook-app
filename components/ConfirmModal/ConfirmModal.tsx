import React from 'react';
import {
  Modal,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ConfirmModalProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  accentColor = '#7FB9E6',
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const defaultIcon: keyof typeof Ionicons.glyphMap = isDestructive
    ? 'trash-outline'
    : 'information-circle-outline';

  const finalIcon = icon || defaultIcon;

  const iconTint = isDestructive
    ? 'rgba(242, 97, 156, 0.15)'
    : getAccentTint(accentColor, isDark ? 0.25 : 0.18);

  const iconColor = isDestructive ? '#F2619C' : accentColor;

  const confirmBg = isDestructive
    ? '#F2619C'
    : accentColor;

  const handleConfirm = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        isDestructive
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    onConfirm();
  };

  const handleCancel = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View
          style={[
            styles.dialog,
            {
              backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
              borderColor: isDark ? '#26262B' : '#EFECE6',
            },
          ]}>
          {/* Top Icon Badge */}
          <View style={[styles.iconBox, { backgroundColor: iconTint }]}>
            <Ionicons name={finalIcon} size={26} color={iconColor} />
          </View>

          {/* Title & Message */}
          <ThemedText style={styles.title}>{title}</ThemedText>
          {message ? (
            <ThemedText style={styles.message}>{message}</ThemedText>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.buttonsRow}>
            {cancelText ? (
              <Pressable
                onPress={handleCancel}
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    backgroundColor: pressed
                      ? isDark
                        ? '#2B2B33'
                        : '#EAE6DF'
                      : isDark
                      ? '#222228'
                      : '#FAF8F5',
                    borderColor: isDark ? '#2D2D35' : '#EBE7E0',
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.cancelText,
                    { color: isDark ? '#A1A1AA' : '#71717A' },
                  ]}>
                  {cancelText}
                </ThemedText>
              </Pressable>
            ) : null}

            <Pressable
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                {
                  backgroundColor: confirmBg,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}>
              <ThemedText
                style={[
                  styles.confirmText,
                  { color: isDestructive ? '#FFFFFF' : '#111111' },
                ]}>
                {confirmText}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
