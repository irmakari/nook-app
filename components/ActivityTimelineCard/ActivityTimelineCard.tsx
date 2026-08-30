import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ActivityTimelineCardProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const getActivityIcon = (type?: string, entityType?: string): keyof typeof Ionicons.glyphMap => {
  if (entityType === 'plan') return 'calendar';
  if (entityType === 'poll') return 'bar-chart';
  if (entityType === 'list') return 'list';
  if (entityType === 'todo') return 'checkbox';
  if (entityType === 'note') return 'document-text';
  if (entityType === 'member') return 'person-add';
  return 'sparkles';
};

const formatTimeAgo = (isoString: string) => {
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
  return `${diffDays}d ago`;
};

export function ActivityTimelineCard({
  activity,
  onPress,
}: ActivityTimelineCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const accentColor = activity.spaceAccentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.25 : 0.16);

  const iconName = getActivityIcon(activity.type, activity.entityType);
  const timeAgo = formatTimeAgo(activity.createdAt);

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(activity);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed
            ? isDark
              ? '#26262F'
              : '#F5F2EB'
            : isDark
            ? '#1A1A1E'
            : '#FFFFFF',
          borderColor: isDark ? '#26262B' : '#EFECE6',
        },
      ]}>
      {/* Left Icon Badge in Space Soft Tint */}
      <View style={[styles.leftIconBox, { backgroundColor: softTint }]}>
        <Ionicons name={iconName} size={20} color={accentColor} />
      </View>

      {/* Content Column */}
      <View style={styles.contentCol}>
        <View style={styles.timeSpaceRow}>
          <ThemedText type="metadata" style={styles.timeText}>{timeAgo}</ThemedText>
          <View style={[styles.spaceDot, { backgroundColor: accentColor }]} />
          <ThemedText type="metadata" weight="semiBold" style={{ color: accentColor }}>
            {activity.spaceName}
          </ThemedText>
        </View>

        <ThemedText
          type="body"
          weight="semiBold"
          numberOfLines={1}
          style={{ color: isDark ? '#F4F4F5' : '#18181B' }}>
          {activity.targetTitle || activity.actionText}
        </ThemedText>

        <ThemedText type="caption" numberOfLines={1} style={styles.actorSubText}>
          {activity.actorName} {activity.actionText}
        </ThemedText>
      </View>

      {/* Right Navigation Chevron */}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={isDark ? '#52525B' : '#C4C0B8'}
        style={styles.rightChevron}
      />
    </Pressable>
  );
}
