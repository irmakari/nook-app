import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { NoteCardProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function NoteCard({ note, accentColor, onPress }: NoteCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  // If note has no title, derive the display title from first line of content
  const hasCustomTitle = !!note.title;
  const firstLine = note.content.split('\n')[0].trim();
  const displayTitle = hasCustomTitle ? note.title : firstLine;
  const remainingContent = hasCustomTitle
    ? note.content
    : note.content.slice(firstLine.length).trim();

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onPress(note.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed
            ? isDark
              ? '#222228'
              : '#F5F2EB'
            : isDark
            ? '#1A1A1E'
            : '#FFFFFF',
          borderColor: isDark ? '#26262B' : '#EFECE6',
        },
      ]}>
      <View style={styles.headerRow}>
        <ThemedText
          type="cardTitle"
          numberOfLines={1}
          style={styles.title}>
          {displayTitle}
        </ThemedText>

        {note.isPinned && (
          <View style={[styles.pinBadge, { backgroundColor: softTint }]}>
            <Ionicons name="pin" size={12} color={accentColor} />
          </View>
        )}
      </View>

      {remainingContent ? (
        <ThemedText type="description" numberOfLines={2} style={styles.contentPreview}>
          {remainingContent}
        </ThemedText>
      ) : null}

      <View style={styles.footerRow}>
        <ThemedText type="metadata">
          {note.createdBy}
        </ThemedText>
        <ThemedText type="metadata">
          {formatRelativeTime(note.updatedAt)}
        </ThemedText>
      </View>
    </Pressable>
  );
}
