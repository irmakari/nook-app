import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { SpaceCardProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { AvatarStack } from '@/components/AvatarStack';
import { getReadableTextColor } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SpaceCard({ space, onPress }: SpaceCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.975, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const accentColor = space.accentColor || '#7FB9E6';
  const textColor = getReadableTextColor(accentColor);
  const isDarkText = textColor === '#18181B';

  const secondaryTextColor = isDarkText
    ? 'rgba(24, 24, 27, 0.65)'
    : 'rgba(255, 255, 255, 0.75)';

  const translucentOverlay = isDarkText
    ? 'rgba(255, 255, 255, 0.42)'
    : 'rgba(0, 0, 0, 0.16)';

  const translucentBorder = isDarkText
    ? 'rgba(255, 255, 255, 0.65)'
    : 'rgba(255, 255, 255, 0.25)';

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: accentColor,
          borderColor: isDarkText ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.18)',
          shadowColor: accentColor,
        },
        animatedStyle,
      ]}>
      {/* Top Row: Identity Icon, Name & Member Count Badge */}
      <View style={styles.topRow}>
        <View style={styles.identityGroup}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: translucentOverlay,
                borderColor: translucentBorder,
              },
            ]}>
            <ThemedText style={styles.iconEmoji}>{space.icon}</ThemedText>
          </View>
          <View style={styles.titleWrapper}>
            <ThemedText
              type="cardTitle"
              style={[styles.spaceName, { color: textColor }]}>
              {space.name}
            </ThemedText>
            {space.tagline ? (
              <ThemedText
                type="caption"
                style={[styles.tagline, { color: secondaryTextColor }]}
                numberOfLines={1}>
                {space.tagline}
              </ThemedText>
            ) : null}
          </View>
        </View>

        <View
          style={[
            styles.memberBadge,
            {
              backgroundColor: translucentOverlay,
              borderColor: translucentBorder,
            },
          ]}>
          <ThemedText
            style={[styles.memberBadgeText, { color: textColor }]}>
            {space.memberCount} {space.memberCount === 1 ? 'member' : 'members'}
          </ThemedText>
        </View>
      </View>

      {/* Activity / Vibe Preview Box */}
      {space.recentActivity ? (
        <View
          style={[
            styles.previewBox,
            {
              backgroundColor: translucentOverlay,
              borderColor: translucentBorder,
            },
          ]}>
          <View
            style={[
              styles.accentDot,
              { backgroundColor: textColor, opacity: 0.5 },
            ]}
          />
          <ThemedText
            style={[styles.activityText, { color: textColor }]}
            numberOfLines={1}>
            {space.recentActivity}
          </ThemedText>
        </View>
      ) : null}

      {/* Bottom Row: Avatar Stack + Enter Indicator */}
      <View style={styles.bottomRow}>
        <AvatarStack
          members={space.members}
          max={3}
          size={26}
          ringColor={accentColor}
        />

        <View style={styles.metaGroup}>
          {space.recentActivityTime ? (
            <ThemedText
              type="caption"
              style={[styles.activityTime, { color: secondaryTextColor }]}>
              {space.recentActivityTime}
            </ThemedText>
          ) : null}
          <View
            style={[
              styles.enterCircle,
              {
                backgroundColor: translucentOverlay,
                borderColor: translucentBorder,
              },
            ]}>
            <Ionicons
              name="arrow-forward"
              size={13}
              color={textColor}
            />
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}
