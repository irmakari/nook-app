import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { PollAddOptionModalProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function PollAddOptionModal({
  visible,
  onClose,
  onAddOption,
  accentColor,
}: PollAddOptionModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [optionText, setOptionText] = useState('');

  const handleAdd = () => {
    if (!optionText.trim()) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onAddOption(optionText.trim());
    setOptionText('');
    onClose();
  };

  const handleClose = () => {
    setOptionText('');
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
          <View
            style={[
              styles.handleBar,
              { backgroundColor: isDark ? '#33333D' : '#D8D4CC' },
            ]}
          />

          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Add an option
            </ThemedText>
            <ThemedText type="caption" style={styles.subtitle}>
              Suggest a new choice for this poll
            </ThemedText>
          </View>

          <TextInput
            value={optionText}
            onChangeText={setOptionText}
            placeholder="e.g. Mürver, Sunset Rooftop"
            placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#222228' : '#FAF8F5',
                color: isDark ? '#F4F4F5' : '#18181B',
                borderColor: isDark ? '#2D2D35' : '#EFECE6',
              },
            ]}
            autoFocus
          />

          <PrimaryButton
            title="Add Option"
            onPress={handleAdd}
            backgroundColor={accentColor}
            disabled={!optionText.trim()}
          />
        </View>
      </View>
    </Modal>
  );
}
