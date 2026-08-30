import React from 'react';
import { Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SpaceCreateButtonProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getReadableTextColor } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SpaceCreateButton({
  accentColor,
  onPress,
  bottomOffset = 24,
}: SpaceCreateButtonProps) {
  const textColor = getReadableTextColor(accentColor);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.floatingBtn,
        {
          backgroundColor: accentColor,
          bottom: bottomOffset,
        },
        animatedStyle,
      ]}>
      <Ionicons name="add" size={20} color={textColor} />
      <ThemedText type="button" style={{ color: textColor }}>
        Add something
      </ThemedText>
    </AnimatedPressable>
  );
}
