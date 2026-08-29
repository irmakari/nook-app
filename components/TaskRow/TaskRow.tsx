import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { TaskRowProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const getInitials = (name: string) => {
  return name.slice(0, 2).toUpperCase();
};

const formatDueText = (dueAt?: string) => {
  if (!dueAt) return null;
  const lower = dueAt.toLowerCase();
  if (lower === 'today') return 'Today';
  if (lower === 'tomorrow') return 'Tomorrow';
  if (lower === 'overdue' || lower === 'yesterday') return 'Yesterday';
  return dueAt;
};

export function TaskRow({
  task,
  accentColor,
  onToggle,
  onClaim,
  onPress,
}: TaskRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);
  const subtleBorder = getAccentTint(accentColor, isDark ? 0.35 : 0.25);
  const isCompleted = task.status === 'completed';
  const dueText = formatDueText(task.dueAt);

  const handleToggle = (e: any) => {
    e.stopPropagation?.();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(task.id);
  };

  const handleClaim = (e: any) => {
    e.stopPropagation?.();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClaim?.(task.id);
  };

  return (
    <Pressable
      onPress={() => onPress?.(task)}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed
            ? isDark
              ? '#222228'
              : '#F5F2EB'
            : isDark
            ? '#1A1A1E'
            : '#FFFFFF',
          borderColor: isDark ? '#26262B' : '#EFECE6',
          opacity: isCompleted ? 0.7 : 1,
        },
      ]}>
      {/* Checkbox Circle */}
      <Pressable onPress={handleToggle} hitSlop={8}>
        <View
          style={[
            styles.checkCircle,
            {
              backgroundColor: isCompleted ? accentColor : 'transparent',
              borderColor: isCompleted
                ? accentColor
                : isDark
                ? '#3F3F46'
                : '#D4D4D8',
            },
          ]}>
          {isCompleted ? (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          ) : null}
        </View>
      </Pressable>

      {/* Task Content */}
      <View style={styles.content}>
        <ThemedText
          type="body"
          weight="medium"
          style={[
            styles.title,
            isCompleted && styles.completedTitle,
          ]}>
          {task.title}
        </ThemedText>

        {task.note ? (
          <ThemedText style={styles.note}>{task.note}</ThemedText>
        ) : null}

        {/* Metadata Row: Assignee + Due date */}
        <View style={styles.metaRow}>
          {task.assignedTo ? (
            <View style={styles.assigneeBadge}>
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: isDark ? '#26262F' : '#EFECE6' },
                ]}>
                <ThemedText style={styles.avatarInitials}>
                  {getInitials(task.assignedTo)}
                </ThemedText>
              </View>
              <ThemedText style={styles.assigneeText}>
                {task.assignedTo}
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.assigneeText}>Anyone</ThemedText>
          )}

          {dueText && (
            <>
              <ThemedText style={{ color: '#8E8D94', fontSize: 10 }}>
                •
              </ThemedText>
              <ThemedText style={styles.dueDateBadge}>{dueText}</ThemedText>
            </>
          )}
        </View>
      </View>

      {/* "I'll do it" Claim Button for Anyone tasks */}
      {!isCompleted && !task.assignedTo && onClaim && (
        <Pressable
          onPress={handleClaim}
          style={[
            styles.claimBtn,
            {
              backgroundColor: softTint,
              borderColor: subtleBorder,
            },
          ]}>
          <ThemedText style={[styles.claimBtnText, { color: isDark ? '#F4F4F5' : '#18181B' }]}>
            I&apos;ll do it
          </ThemedText>
        </Pressable>
      )}
    </Pressable>
  );
}
