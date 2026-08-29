import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PlanModeSelectorProps, PlanMode } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ModeCardItem({
  mode,
  title,
  subtitle,
  iconName,
  isSelected,
  accentColor,
  onSelect,
}: {
  mode: PlanMode;
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  accentColor: string;
  onSelect: (mode: PlanMode) => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onSelect(mode);
  };

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 300 }))}
      onPress={handlePress}
      style={[
        styles.modeCard,
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
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: isSelected
              ? accentColor
              : isDark
              ? '#222228'
              : '#FAF8F5',
          },
        ]}>
        <Ionicons
          name={iconName}
          size={18}
          color={isSelected ? '#FFFFFF' : isDark ? '#A1A1AA' : '#71717A'}
        />
      </View>
      <ThemedText
        type="body"
        weight="semiBold"
        style={[
          styles.title,
          isSelected && { color: isDark ? '#F4F4F5' : '#18181B' },
        ]}>
        {title}
      </ThemedText>
      <ThemedText type="caption" style={styles.subtitle}>
        {subtitle}
      </ThemedText>
    </AnimatedPressable>
  );
}

export function PlanModeSelector({
  selectedMode,
  onSelectMode,
  accentColor,
}: PlanModeSelectorProps) {
  return (
    <View style={styles.container}>
      <ModeCardItem
        mode="know"
        title="I know when"
        subtitle="Set a date & time"
        iconName="calendar"
        isSelected={selectedMode === 'know'}
        accentColor={accentColor}
        onSelect={onSelectMode}
      />
      <ModeCardItem
        mode="vote"
        title="Let everyone vote"
        subtitle="Propose multiple times"
        iconName="checkbox"
        isSelected={selectedMode === 'vote'}
        accentColor={accentColor}
        onSelect={onSelectMode}
      />
    </View>
  );
}
