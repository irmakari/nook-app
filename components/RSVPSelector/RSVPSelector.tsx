import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { RSVPSelectorProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { PlanRSVPStatus } from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RSVPItemConfig {
  status: PlanRSVPStatus;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const RSVP_ITEMS: RSVPItemConfig[] = [
  { status: 'going', label: 'Going', iconName: 'checkmark-circle' },
  { status: 'maybe', label: 'Maybe', iconName: 'help-circle' },
  { status: 'declined', label: "Can't make it", iconName: 'close-circle' },
];

function RSVPButton({
  item,
  isSelected,
  accentColor,
  onPress,
}: {
  item: RSVPItemConfig;
  isSelected: boolean;
  accentColor: string;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const softTint = getAccentTint(accentColor, isDark ? 0.24 : 0.16);

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 300 }))}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected
            ? softTint
            : isDark
            ? '#222228'
            : '#FAF8F5',
          borderColor: isSelected
            ? accentColor
            : isDark
            ? '#2D2D35'
            : '#EFECE6',
        },
        animatedStyle,
      ]}>
      <Ionicons
        name={item.iconName}
        size={16}
        color={isSelected ? accentColor : isDark ? '#71717A' : '#A1A1AA'}
      />
      <ThemedText
        style={[
          styles.chipText,
          {
            color: isSelected
              ? isDark
                ? '#F4F4F5'
                : '#18181B'
              : isDark
              ? '#A1A1AA'
              : '#71717A',
          },
        ]}>
        {item.label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export function RSVPSelector({
  currentStatus,
  accentColor,
  onSelectStatus,
}: RSVPSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSelect = (status: PlanRSVPStatus) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onSelectStatus(status);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
          borderColor: isDark ? '#26262B' : '#EFECE6',
        },
      ]}>
      <View style={styles.headerRow}>
        <ThemedText type="body" weight="semiBold" style={styles.title}>
          Are you coming?
        </ThemedText>
      </View>

      <View style={styles.optionsRow}>
        {RSVP_ITEMS.map((item) => (
          <RSVPButton
            key={item.status}
            item={item}
            isSelected={currentStatus === item.status}
            accentColor={accentColor}
            onPress={() => handleSelect(item.status)}
          />
        ))}
      </View>
    </View>
  );
}
