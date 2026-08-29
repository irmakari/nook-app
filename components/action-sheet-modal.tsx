import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  Platform,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './themed-text';
import { SpaceThemeKey, SpaceThemes } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ActionType = 'plan' | 'poll' | 'todo' | 'list' | 'note';

interface ActionSheetModalProps {
  visible: boolean;
  onClose: () => void;
  spaceName: string;
  themeKey: SpaceThemeKey;
  onAddItem: (type: ActionType, data: any) => void;
}

const ACTION_OPTIONS = [
  {
    type: 'plan' as ActionType,
    title: 'Plan',
    subtitle: 'Date, drinks, dinner, or trip',
    iconName: 'calendar-outline' as const,
  },
  {
    type: 'poll' as ActionType,
    title: 'Poll',
    subtitle: 'Decide where to go or what to do',
    iconName: 'bar-chart-outline' as const,
  },
  {
    type: 'todo' as ActionType,
    title: 'To-do',
    subtitle: 'Tasks & apartment responsibilities',
    iconName: 'checkbox-outline' as const,
  },
  {
    type: 'list' as ActionType,
    title: 'List',
    subtitle: 'Wishlist, packing list, or tracks',
    iconName: 'list-outline' as const,
  },
  {
    type: 'note' as ActionType,
    title: 'Note',
    subtitle: 'Door codes, links, reservations',
    iconName: 'document-text-outline' as const,
  },
];

export function ActionSheetModal({
  visible,
  onClose,
  spaceName,
  themeKey,
  onAddItem,
}: ActionSheetModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = SpaceThemes[themeKey] || SpaceThemes.lavender;

  const [activeForm, setActiveForm] = useState<ActionType | null>(null);
  const [inputText, setInputText] = useState('');
  const [subText, setSubText] = useState('');

  const handleSelect = (type: ActionType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveForm(type);
    setInputText('');
    setSubText('');
  };

  const handleClose = () => {
    setActiveForm(null);
    setInputText('');
    setSubText('');
    onClose();
  };

  const handleSubmit = () => {
    if (!inputText.trim() || !activeForm) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (activeForm === 'plan') {
      onAddItem('plan', {
        title: inputText.trim(),
        date: subText.trim() || 'This weekend',
        location: spaceName,
        attendeesCount: 2,
      });
    } else if (activeForm === 'poll') {
      onAddItem('poll', {
        question: inputText.trim(),
        options: [
          { id: 'opt1', text: subText.trim() || 'Option A', votes: 1 },
          { id: 'opt2', text: 'Option B', votes: 0 },
        ],
        totalVotes: 1,
      });
    } else if (activeForm === 'todo') {
      onAddItem('todo', {
        text: inputText.trim(),
        completed: false,
        assignedTo: 'Irmak',
      });
    } else if (activeForm === 'list') {
      onAddItem('list', {
        title: inputText.trim(),
        itemCount: 1,
        preview: [subText.trim() || 'First item'],
      });
    } else if (activeForm === 'note') {
      onAddItem('note', {
        title: inputText.trim(),
        content: subText.trim() || 'Saved notes for ' + spaceName,
        updatedAt: 'Just now',
      });
    }

    handleClose();
  };

  const accentLight = isDark ? theme.darkAccentLight : theme.accentLight;
  const accentText = isDark ? theme.darkAccentText : theme.accentText;

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
              backgroundColor: isDark ? '#1C1C20' : '#FFFFFF',
              borderColor: isDark ? '#2B2B33' : '#EAE6DF',
            },
          ]}>
          {/* Header handle */}
          <View style={styles.handleBar} />

          {!activeForm ? (
            <>
              <View style={styles.header}>
                <ThemedText type="subtitle" style={styles.sheetTitle}>
                  Add to {spaceName}
                </ThemedText>
                <ThemedText type="caption" style={styles.sheetSubtitle}>
                  Choose what you want to share with the group
                </ThemedText>
              </View>

              <View style={styles.optionsList}>
                {ACTION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.type}
                    onPress={() => handleSelect(opt.type)}
                    style={({ pressed }) => [
                      styles.optionRow,
                      {
                        backgroundColor: pressed
                          ? isDark
                            ? '#26262E'
                            : '#F5F2EB'
                          : isDark
                          ? '#222227'
                          : '#FAF8F5',
                        borderColor: isDark ? '#2C2C34' : '#EFECE6',
                      },
                    ]}>
                    <View
                      style={[
                        styles.optionIconBox,
                        { backgroundColor: accentLight },
                      ]}>
                      <Ionicons
                        name={opt.iconName}
                        size={20}
                        color={accentText}
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <ThemedText type="body" weight="medium">
                        {opt.title}
                      </ThemedText>
                      <ThemedText type="caption" style={styles.optionSubtitle}>
                        {opt.subtitle}
                      </ThemedText>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isDark ? '#71717A' : '#A1A1AA'}
                    />
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Pressable
                  onPress={() => setActiveForm(null)}
                  style={styles.backButton}>
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={isDark ? '#F4F4F5' : '#18181B'}
                  />
                </Pressable>
                <ThemedText type="subtitle" style={styles.formTitle}>
                  New {activeForm.charAt(0).toUpperCase() + activeForm.slice(1)}
                </ThemedText>
                <View style={{ width: 24 }} />
              </View>

              <View style={styles.inputWrapper}>
                <ThemedText type="caption" style={styles.inputLabel}>
                  {activeForm === 'poll'
                    ? 'Question'
                    : activeForm === 'plan'
                    ? 'Plan Title'
                    : 'Title / Item'}
                </ThemedText>
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={
                    activeForm === 'plan'
                      ? 'e.g., Saturday Sunset Drinks'
                      : activeForm === 'poll'
                      ? 'e.g., Where to eat dinner?'
                      : activeForm === 'todo'
                      ? 'e.g., Buy espresso beans'
                      : 'e.g., Playlist or Packing item'
                  }
                  placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#24242A' : '#F5F3EE',
                      color: isDark ? '#F4F4F5' : '#18181B',
                      borderColor: isDark ? '#303038' : '#EBE7E0',
                    },
                  ]}
                  autoFocus
                />
              </View>

              {activeForm !== 'todo' && (
                <View style={styles.inputWrapper}>
                  <ThemedText type="caption" style={styles.inputLabel}>
                    {activeForm === 'plan'
                      ? 'Date / Time'
                      : activeForm === 'poll'
                      ? 'First option'
                      : 'Details / First entry'}
                  </ThemedText>
                  <TextInput
                    value={subText}
                    onChangeText={setSubText}
                    placeholder={
                      activeForm === 'plan'
                        ? 'e.g., Sat, 20:00'
                        : activeForm === 'poll'
                        ? 'e.g., Lucca Bebek'
                        : 'e.g., Notes or items'
                    }
                    placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#24242A' : '#F5F3EE',
                        color: isDark ? '#F4F4F5' : '#18181B',
                        borderColor: isDark ? '#303038' : '#EBE7E0',
                      },
                    ]}
                  />
                </View>
              )}

              <Pressable
                onPress={handleSubmit}
                disabled={!inputText.trim()}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: inputText.trim()
                      ? theme.accent
                      : isDark
                      ? '#2C2C34'
                      : '#E5E2DC',
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.submitButtonText,
                    {
                      color: inputText.trim()
                        ? '#FFFFFF'
                        : isDark
                        ? '#71717A'
                        : '#9C9890',
                    },
                  ]}>
                  Create {activeForm.charAt(0).toUpperCase() + activeForm.slice(1)}
                </ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1CDC7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 19,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 24,
  },
  sheetSubtitle: {
    color: '#8E8D94',
    marginTop: 2,
  },
  optionsList: {
    gap: 10,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionSubtitle: {
    color: '#8E8D94',
    marginTop: 1,
  },
  formContainer: {
    paddingBottom: 10,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    padding: 4,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'Poppins_500Medium',
    color: '#71717A',
    marginBottom: 6,
  },
  textInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
  },
  submitButton: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
  },
});
