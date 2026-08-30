import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { TaskDetailSheetProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { AssigneeSelector } from '@/components/AssigneeSelector';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DUE_OPTIONS = [
  { label: 'No date', value: undefined },
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
];

export function TaskDetailSheet({
  task,
  visible,
  members,
  accentColor,
  onClose,
  onSave,
  onDelete,
}: TaskDetailSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [dueAt, setDueAt] = useState<string | undefined>(undefined);

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNote(task.note || '');
      setAssignedTo(task.assignedTo);
      setDueAt(task.dueAt);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onSave(task.id, {
      title: title.trim(),
      note: note.trim() || undefined,
      assignedTo,
      dueAt,
    });
    onClose();
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    onDelete(task.id);
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

          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Edit To-do
            </ThemedText>

            <Pressable onPress={handleDelete} style={styles.deleteIconBtn}>
              <Ionicons name="trash-outline" size={20} color="#FF5252" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <ThemedText type="label" style={styles.label}>
                TASK TITLE
              </ThemedText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What needs doing?"
                placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
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

            {/* Assignee Selector */}
            <View style={styles.inputGroup}>
              <ThemedText type="label" style={styles.label}>
                {"WHO'S DOING IT?"}
              </ThemedText>
              <AssigneeSelector
                members={members}
                selectedAssignee={assignedTo}
                onSelectAssignee={setAssignedTo}
                accentColor={accentColor}
              />
            </View>

            {/* Due Date Options */}
            <View style={styles.inputGroup}>
              <ThemedText type="label" style={styles.label}>
                WHEN?
              </ThemedText>
              <View style={styles.datePillsRow}>
                {DUE_OPTIONS.map((opt) => {
                  const isSelected = dueAt === opt.value;
                  return (
                    <Pressable
                      key={opt.label}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setDueAt(opt.value);
                      }}
                      style={[
                        styles.datePill,
                        {
                          backgroundColor: isSelected
                            ? softTint
                            : isDark
                            ? '#222228'
                            : '#FAF8F5',
                          borderColor: isSelected
                            ? accentColor
                            : isDark
                            ? '#2D2D35'
                            : '#EFECE6',
                        },
                      ]}>
                      <ThemedText
                        style={[
                          styles.datePillText,
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
                        {opt.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.inputGroup}>
              <ThemedText type="label" style={styles.label}>
                ADD A NOTE (OPTIONAL)
              </ThemedText>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Before guests arrive"
                placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
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

            {/* Save Action Button */}
            <View style={styles.actionRow}>
              <PrimaryButton
                title="Save Changes"
                onPress={handleSave}
                backgroundColor={accentColor}
                disabled={!title.trim()}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
