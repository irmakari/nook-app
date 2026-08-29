import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { UpcomingPlanCardProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { AvatarStack } from '@/components/AvatarStack';
import { getAccentTint, getReadableTextColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function UpcomingPlanCard({
  plan,
  accentColor,
  onPress,
  onAddPlanPress,
}: UpcomingPlanCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const softTint = getAccentTint(accentColor, isDark ? 0.24 : 0.16);
  const subtleBorder = getAccentTint(accentColor, isDark ? 0.38 : 0.28);
  const badgeTextColor = getReadableTextColor(accentColor);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handleCardPress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  if (!plan) {
    return (
      <View
        style={[
          styles.emptyCard,
          {
            backgroundColor: isDark ? '#16161A' : '#FFFFFF',
            borderColor: isDark ? '#2D2D35' : '#E5E1D8',
          },
        ]}>
        <ThemedText type="body" weight="semiBold" style={styles.emptyTitle}>
          Nothing here yet.
        </ThemedText>
        <ThemedText type="caption" style={styles.emptySubtitle}>
          Start this Nook with a plan, list or note.
        </ThemedText>

        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            onAddPlanPress?.();
          }}
          style={({ pressed }) => [
            styles.addPlanBtn,
            {
              backgroundColor: pressed ? softTint : accentColor,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}>
          <Ionicons name="add" size={16} color={badgeTextColor} />
          <ThemedText style={[styles.addPlanText, { color: badgeTextColor }]}>
            Add something
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handleCardPress}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
          borderColor: isDark ? '#26262B' : '#EFECE6',
          shadowColor: isDark ? '#000000' : '#2A2218',
        },
        animatedStyle,
      ]}>
      {/* Header: NEXT UP badge */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: softTint,
              borderColor: subtleBorder,
              borderWidth: 1,
            },
          ]}>
          <View style={[styles.accentDot, { backgroundColor: accentColor }]} />
          <ThemedText style={[styles.badgeText, { color: isDark ? '#E4E4E7' : '#27272A' }]}>
            NEXT UP
          </ThemedText>
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? '#71717A' : '#A1A1AA'}
        />
      </View>

      {/* Plan Title */}
      <ThemedText type="title" style={styles.title} numberOfLines={2}>
        {plan.title}
      </ThemedText>

      {/* Details Row: Date / Time + Location */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={isDark ? '#A1A1AA' : '#71717A'}
          />
          <ThemedText style={styles.detailText}>{plan.date}</ThemedText>
        </View>

        {plan.location ? (
          <View style={styles.detailItem}>
            <Ionicons
              name="location-outline"
              size={14}
              color={isDark ? '#A1A1AA' : '#71717A'}
            />
            <ThemedText style={styles.detailText} numberOfLines={1}>
              {plan.location}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {/* Divider */}
      <View
        style={[
          styles.footerDivider,
          { backgroundColor: isDark ? '#26262B' : '#F0ECE4' },
        ]}
      />

      {/* Footer: Avatars + Attendance Summary */}
      <View style={styles.footerRow}>
        {plan.attendees && plan.attendees.length > 0 ? (
          <AvatarStack
            members={plan.attendees}
            max={3}
            size={24}
            ringColor={isDark ? '#1A1A1E' : '#FFFFFF'}
          />
        ) : (
          <View />
        )}

        <ThemedText style={styles.attendanceText}>
          {plan.goingCount} going
          {plan.maybeCount !== undefined && plan.maybeCount > 0
            ? ` · ${plan.maybeCount} maybe`
            : ''}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}
