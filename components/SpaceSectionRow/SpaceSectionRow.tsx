import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SpaceSectionRowProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getSectionIcon = (name: string): keyof typeof Ionicons.glyphMap => {
  const lower = name.toLowerCase();
  if (lower.includes('plan')) return 'calendar-outline';
  if (lower.includes('poll')) return 'bar-chart-outline';
  if (lower.includes('list')) return 'list-outline';
  if (lower.includes('to-do') || lower.includes('todo')) return 'checkbox-outline';
  if (lower.includes('shop')) return 'cart-outline';
  if (lower.includes('note')) return 'document-text-outline';
  return 'grid-outline';
};

export function SpaceSectionRow({
  name,
  meta,
  accentColor,
  onPress,
}: SpaceSectionRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);
  const iconName = getSectionIcon(name);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.row,
        {
          backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
          borderColor: isDark ? '#26262B' : '#EFECE6',
        },
        animatedStyle,
      ]}>
      <View style={[styles.iconBox, { backgroundColor: softTint }]}>
        <Ionicons name={iconName} size={20} color={isDark ? '#F4F4F5' : '#18181B'} />
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="body" weight="semiBold" style={styles.name}>
          {name}
        </ThemedText>
      </View>

      <View style={styles.rightGroup}>
        {meta ? (
          <ThemedText type="caption" style={styles.metaText}>
            {meta}
          </ThemedText>
        ) : null}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDark ? '#71717A' : '#A1A1AA'}
          style={styles.chevron}
        />
      </View>
    </AnimatedPressable>
  );
}
