import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ActivityItemProps } from './types';
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
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function ActivityItem({ activity, onPress }: ActivityItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const softTint = getAccentTint(activity.spaceAccentColor, isDark ? 0.22 : 0.14);

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onPress?.(activity);
  };

  return (
    <Pressable
      onPress={handlePress}
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
        },
      ]}>
      {/* Actor Avatar */}
      <View
        style={[
          styles.avatarCircle,
          {
            backgroundColor: softTint,
          },
        ]}>
        <ThemedText
          style={[
            styles.avatarInitials,
            { color: isDark ? '#F4F4F5' : '#18181B' },
          ]}>
          {activity.actorInitials}
        </ThemedText>
      </View>

      {/* Content Body */}
      <View style={styles.content}>
        <ThemedText style={styles.headerText}>
          <ThemedText style={styles.actorName}>{activity.actorName} </ThemedText>
          <ThemedText style={styles.actionText}>{activity.actionText}</ThemedText>
        </ThemedText>

        {activity.targetTitle ? (
          <ThemedText numberOfLines={1} style={styles.targetTitle}>
            {activity.targetTitle}
          </ThemedText>
        ) : null}

        <View style={styles.metaRow}>
          <View
            style={[
              styles.spaceDot,
              { backgroundColor: activity.spaceAccentColor },
            ]}
          />
          <ThemedText style={styles.spaceName}>{activity.spaceName}</ThemedText>
          <ThemedText style={{ color: '#8E8D94', fontSize: 10 }}>•</ThemedText>
          <ThemedText style={styles.timeText}>
            {formatRelativeTime(activity.createdAt)}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}
