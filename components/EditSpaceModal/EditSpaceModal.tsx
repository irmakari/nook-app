import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { EditSpaceModalProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/PrimaryButton';
import { nookSpaceColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const COLOR_OPTIONS = Object.values(nookSpaceColors);

export function EditSpaceModal({
  visible,
  space,
  onClose,
  onSave,
}: EditSpaceModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState(space.name);
  const [tagline, setTagline] = useState(space.tagline || '');
  const [accentColor, setAccentColor] = useState(space.accentColor || nookSpaceColors.sky);

  useEffect(() => {
    setName(space.name);
    setTagline(space.tagline || '');
    setAccentColor(space.accentColor || nookSpaceColors.sky);
  }, [space, visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave({
      name: name.trim(),
      tagline: tagline.trim() || undefined,
      accentColor,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
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
            <ThemedText style={styles.headerTitle}>Edit Space</ThemedText>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={22}
                color={isDark ? '#A1A1AA' : '#71717A'}
              />
            </Pressable>
          </View>

          {/* Name Field */}
          <ThemedText style={styles.fieldLabel}>Space Name</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Kankiler"
            placeholderTextColor={isDark ? '#52525B' : '#A1A1AA'}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#222228' : '#FAF8F5',
                borderColor: isDark ? '#2D2D35' : '#EFECE6',
                color: isDark ? '#F4F4F5' : '#18181B',
              },
            ]}
          />

          {/* Tagline Field */}
          <ThemedText style={styles.fieldLabel}>Tagline</ThemedText>
          <TextInput
            value={tagline}
            onChangeText={setTagline}
            placeholder="e.g. Weekend plans & night out"
            placeholderTextColor={isDark ? '#52525B' : '#A1A1AA'}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#222228' : '#FAF8F5',
                borderColor: isDark ? '#2D2D35' : '#EFECE6',
                color: isDark ? '#F4F4F5' : '#18181B',
              },
            ]}
          />

          {/* Accent Color Palette */}
          <ThemedText style={styles.fieldLabel}>Space Theme Color</ThemedText>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((c) => (
              <Pressable
                key={c}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setAccentColor(c);
                }}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: c,
                    transform: [{ scale: accentColor === c ? 1.15 : 1 }],
                  },
                ]}>
                {accentColor === c ? (
                  <Ionicons name="checkmark" size={18} color="#18181B" />
                ) : null}
              </Pressable>
            ))}
          </View>

          {/* Save Button */}
          <PrimaryButton
            title="Save Changes"
            onPress={handleSave}
            disabled={!name.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
