import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { SpaceCardProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { SpaceIcon } from '@/components/SpaceIcon';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SpaceCard({ space, onPress }: SpaceCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const accentColor = space.accentColor || '#7FB9E6';
  
  // Soft, refined pastel surface for the card
  const cardBg = isDark
    ? getAccentTint(accentColor, 0.22)
    : getAccentTint(accentColor, 0.38);

  const iconBoxBg = isDark
    ? getAccentTint(accentColor, 0.45)
    : getAccentTint(accentColor, 0.65);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onPress?.(space);
  };

  const planTitle = space.upcomingPlan?.title;
  const recentAction = space.recentActivity;
  const timeText = space.recentActivityTime || 'Recently';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}>
      {/* Main Header Row: Icon + Space Title + Tagline + Members */}
      <View style={styles.mainRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBoxBg }]}>
          <SpaceIcon name={space.icon} size={20} color="#111111" />
        </View>

        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.spaceName}>{space.name}</ThemedText>
            <ThemedText style={styles.memberText}>
              {space.memberCount} {space.memberCount === 1 ? 'person' : 'people'}
            </ThemedText>
          </View>

          {space.tagline ? (
            <ThemedText numberOfLines={1} style={styles.tagline}>
              {space.tagline}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {/* Context Footer (Upcoming Plan or Recent Activity) */}
      {(planTitle || recentAction) ? (
        <View style={styles.contextFooter}>
          <View style={styles.contextLeft}>
            <View style={styles.contextDot} />
            <ThemedText numberOfLines={1} style={styles.contextText}>
              {planTitle || recentAction}
            </ThemedText>
          </View>
          <ThemedText style={styles.timeText}>{timeText}</ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}
