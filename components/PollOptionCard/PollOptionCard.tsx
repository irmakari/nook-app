import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PollOptionCardProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { AvatarStack } from '@/components/AvatarStack';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PollOptionCard({
  option,
  totalVotes,
  isLeading,
  isSelected,
  isClosed = false,
  accentColor,
  onVote,
}: PollOptionCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const votesCount = option.voters.length;
  const percentage = totalVotes > 0 ? (votesCount / totalVotes) * 100 : 0;

  const softTint = getAccentTint(accentColor, isDark ? 0.24 : 0.16);
  const subtleBorder = getAccentTint(accentColor, isDark ? 0.38 : 0.28);
  const progressTint = getAccentTint(accentColor, isDark ? 0.18 : 0.12);

  const handlePress = () => {
    if (isClosed) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onVote(option.id);
  };

  return (
    <AnimatedPressable
      onPressIn={() => {
        if (!isClosed) scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        if (!isClosed) scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPress={handlePress}
      disabled={isClosed}
      style={[
        styles.card,
        {
          backgroundColor: isSelected
            ? softTint
            : isDark
            ? '#1A1A1E'
            : '#FFFFFF',
          borderColor: isSelected
            ? accentColor
            : isDark
            ? '#26262B'
            : '#EFECE6',
        },
        animatedStyle,
      ]}>
      {/* Subtle Proportional Progress Background Fill */}
      {totalVotes > 0 && (
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.08)' : progressTint,
            },
          ]}
        />
      )}

      {/* Top Row: Option Title + Leading Badge + Check Circle */}
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <ThemedText
            type="body"
            weight="semiBold"
            style={[
              styles.optionText,
              isSelected && { color: isDark ? '#F4F4F5' : '#18181B' },
            ]}>
            {option.text}
          </ThemedText>

          {isLeading && votesCount > 0 && (
            <View
              style={[
                styles.leadingBadge,
                {
                  backgroundColor: softTint,
                  borderColor: subtleBorder,
                },
              ]}>
              <ThemedText style={[styles.leadingText, { color: isDark ? '#F4F4F5' : '#18181B' }]}>
                {isClosed ? 'TOP CHOICE' : 'LEADING'}
              </ThemedText>
            </View>
          )}
        </View>

        {!isClosed && (
          <View
            style={[
              styles.checkCircle,
              {
                backgroundColor: isSelected ? accentColor : 'transparent',
                borderColor: isSelected
                  ? accentColor
                  : isDark
                  ? '#3F3F46'
                  : '#D4D4D8',
              },
            ]}>
            {isSelected ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : null}
          </View>
        )}
      </View>

      {/* Bottom Row: Voter Avatars & Live Vote Count */}
      <View style={styles.bottomRow}>
        <View style={styles.votersGroup}>
          {option.voters.length > 0 ? (
            <AvatarStack
              members={option.voters}
              max={3}
              size={22}
              ringColor={
                isSelected
                  ? isDark
                    ? '#22222A'
                    : '#FAF8F5'
                  : isDark
                  ? '#1A1A1E'
                  : '#FFFFFF'
              }
            />
          ) : null}
          <ThemedText style={styles.votesCountText}>
            {votesCount} {votesCount === 1 ? 'vote' : 'votes'}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}
