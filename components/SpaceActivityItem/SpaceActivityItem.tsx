import React from 'react';
import { View } from 'react-native';

import { SpaceActivityItemProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SpaceActivityItem({
  activity,
  accentColor,
}: SpaceActivityItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.dotBox}>
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.mainText}>
          <ThemedText
            style={[
              styles.userText,
              { color: isDark ? '#F4F4F5' : '#18181B' },
            ]}>
            {activity.user}
          </ThemedText>{' '}
          <ThemedText
            style={[
              styles.actionText,
              { color: isDark ? '#A1A1AA' : '#71717A' },
            ]}>
            {activity.action}
          </ThemedText>
          {activity.target ? (
            <ThemedText
              style={[
                styles.targetText,
                { color: isDark ? '#E4E4E7' : '#27272A' },
              ]}>
              {' '}
              {activity.target}
            </ThemedText>
          ) : null}
        </ThemedText>

        <ThemedText style={styles.timeText}>{activity.timeAgo}</ThemedText>
      </View>
    </View>
  );
}
