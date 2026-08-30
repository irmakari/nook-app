import React from 'react';
import { Pressable, ActivityIndicator, Platform, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PrimaryButtonProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getReadableTextColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  backgroundColor,
  textColor,
  icon,
}: PrimaryButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const defaultBg = isDark ? '#F4F4F5' : '#18181B';
  const finalBg = backgroundColor || defaultBg;
  const finalTextColor = textColor || (backgroundColor ? getReadableTextColor(backgroundColor) : isDark ? '#18181B' : '#FFFFFF');

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.965, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const disabledBg = isDark ? '#26262E' : '#E5E1D8';
  const disabledText = isDark ? '#71717A' : '#A1A1AA';

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? disabledBg : finalBg,
        },
        animatedStyle,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={finalTextColor} />
      ) : (
        <>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <ThemedText
            type="button"
            style={[
              { color: disabled ? disabledText : finalTextColor },
            ]}>
            {title}
          </ThemedText>
        </>
      )}
    </AnimatedPressable>
  );
}
