import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { CreateSpaceOptionProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CreateSpaceOption({
  type,
  icon,
  title,
  description,
  selected,
  onSelect,
}: CreateSpaceOptionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onSelect(type);
  };

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.98, { damping: 15, stiffness: 300 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 300 }))}
      onPress={handlePress}
      style={[
        styles.optionCard,
        {
          backgroundColor: selected
            ? isDark
              ? '#222228'
              : '#FFFFFF'
            : isDark
            ? '#1A1A1E'
            : '#FFFFFF',
          borderColor: selected
            ? isDark
              ? '#F4F4F5'
              : '#18181B'
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
            backgroundColor: selected
              ? isDark
                ? '#2D2D38'
                : '#F3F0EB'
              : isDark
              ? '#222228'
              : '#FAF8F5',
          },
        ]}>
        <ThemedText style={styles.iconEmoji}>{icon}</ThemedText>
      </View>

      <View style={styles.textContainer}>
        <ThemedText type="body" weight="semiBold" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText type="caption" style={styles.description}>
          {description}
        </ThemedText>
      </View>

      <View
        style={[
          styles.radioCircle,
          {
            borderColor: selected
              ? isDark
                ? '#F4F4F5'
                : '#18181B'
              : isDark
              ? '#3F3F46'
              : '#D4D4D8',
          },
        ]}>
        {selected ? (
          <View
            style={[
              styles.radioDot,
              { backgroundColor: isDark ? '#F4F4F5' : '#18181B' },
            ]}
          />
        ) : null}
      </View>
    </AnimatedPressable>
  );
}
