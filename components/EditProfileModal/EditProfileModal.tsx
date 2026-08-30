import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { EditProfileModalProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function EditProfileModal({
  visible,
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onSave({
      name: name.trim(),
      email: email.trim(),
    });
    onClose();
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
            <ThemedText type="title" style={styles.title}>
              Edit Profile
            </ThemedText>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={22}
                color={isDark ? '#A1A1AA' : '#71717A'}
              />
            </Pressable>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <ThemedText type="label" style={styles.label}>
              DISPLAY NAME
            </ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
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
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <ThemedText type="label" style={styles.label}>
              EMAIL ADDRESS
            </ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@nook.app"
              placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? '#222228' : '#FAF8F5',
                  color: isDark ? '#F4F4F5' : '#18181B',
                  borderColor: isDark ? '#2D2D35' : '#EFECE6',
                },
              ]}
            />
          </View>

          <View style={styles.actionRow}>
            <PrimaryButton
              title="Save changes"
              onPress={handleSave}
              disabled={!name.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
