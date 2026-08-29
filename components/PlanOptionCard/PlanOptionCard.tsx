import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PlanOptionCardProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { AvatarStack } from '@/components/AvatarStack';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PlanOptionCard({
  option,
  isSelected,
  accentColor,
  onToggleVote,
  canFinalize = false,
  onFinalize,
}: PlanOptionCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleVote(option.id);
  };

  const handleFinalizePress = (e: any) => {
    e.stopPropagation?.();
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onFinalize?.(option.id);
  };

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.98, { damping: 15, stiffness: 300 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 300 }))}
      onPress={handlePress}
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
      {/* Top Row: Date/Time + Check selection */}
      <View style={styles.topRow}>
        <View style={styles.dateTimeBox}>
          <Ionicons
            name="time-outline"
            size={18}
            color={isSelected ? accentColor : isDark ? '#A1A1AA' : '#71717A'}
          />
          <ThemedText
            type="body"
            weight="semiBold"
            style={[
              styles.timeTitle,
              isSelected && { color: isDark ? '#F4F4F5' : '#18181B' },
            ]}>
            {option.title}
          </ThemedText>
        </View>

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
      </View>

      {/* Divider */}
      <View
        style={[
          styles.divider,
          { backgroundColor: isDark ? '#26262B' : '#F0ECE4' },
        ]}
      />

      {/* Bottom Row: Voter Avatars & Finalize Button */}
      <View style={styles.bottomRow}>
        <View style={styles.votersGroup}>
          {option.voters.length > 0 ? (
            <AvatarStack
              members={option.voters}
              max={3}
              size={22}
              ringColor={isSelected ? (isDark ? '#22222A' : '#FAF8F5') : (isDark ? '#1A1A1E' : '#FFFFFF')}
            />
          ) : null}
          <ThemedText style={styles.votesCountText}>
            {option.voters.length} {option.voters.length === 1 ? 'vote' : 'votes'}
          </ThemedText>
        </View>

        {canFinalize ? (
          <Pressable
            onPress={handleFinalizePress}
            style={[
              styles.finalizeLink,
              { backgroundColor: isDark ? '#222228' : '#FAF8F5' },
            ]}>
            <ThemedText style={[styles.finalizeLinkText, { color: accentColor }]}>
              Pick this time →
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}
