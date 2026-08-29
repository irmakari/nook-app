import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SpaceHeroProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { AvatarStack } from '@/components/AvatarStack';
import { getReadableTextColor } from '@/constants/theme';

export function SpaceHero({
  space,
  onBackPress,
  onOptionsPress,
  onAddMemberPress,
  onMembersPress,
}: SpaceHeroProps) {
  const insets = useSafeAreaInsets();
  const accentColor = space.accentColor || '#7FB9E6';
  const textColor = getReadableTextColor(accentColor);
  const isDarkText = textColor === '#18181B';

  const secondaryTextColor = isDarkText
    ? 'rgba(24, 24, 27, 0.70)'
    : 'rgba(255, 255, 255, 0.80)';

  const translucentBg = isDarkText
    ? 'rgba(255, 255, 255, 0.45)'
    : 'rgba(0, 0, 0, 0.16)';

  const translucentBorder = isDarkText
    ? 'rgba(255, 255, 255, 0.65)'
    : 'rgba(255, 255, 255, 0.25)';

  const handleBack = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onBackPress();
  };

  const handleOptions = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onOptionsPress?.();
  };

  const handleAddMember = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onAddMemberPress?.();
  };

  const handleMembers = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    (onMembersPress || onAddMemberPress)?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: accentColor,
          paddingTop: Math.max(insets.top, 16) + 6,
        },
      ]}>
      {/* Top Nav Row: Back + Options */}
      <View style={styles.topNavRow}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.circleBtn,
            {
              backgroundColor: translucentBg,
              borderColor: translucentBorder,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}>
          <Ionicons name="chevron-back" size={20} color={textColor} />
        </Pressable>

        <Pressable
          onPress={handleOptions}
          style={({ pressed }) => [
            styles.circleBtn,
            {
              backgroundColor: translucentBg,
              borderColor: translucentBorder,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}>
          <Ionicons name="ellipsis-horizontal" size={18} color={textColor} />
        </Pressable>
      </View>

      {/* Main Identity: Icon + Name + Tagline */}
      <View style={styles.identityBlock}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: translucentBg,
                borderColor: translucentBorder,
              },
            ]}>
            <ThemedText style={styles.iconEmoji}>{space.icon}</ThemedText>
          </View>
          <ThemedText
            type="hero"
            style={[styles.spaceName, { color: textColor }]}
            numberOfLines={1}>
            {space.name}
          </ThemedText>
        </View>

        {space.tagline ? (
          <ThemedText
            style={[styles.tagline, { color: secondaryTextColor }]}>
            {space.tagline}
          </ThemedText>
        ) : null}
      </View>

      {/* Members Area */}
      <View
        style={[
          styles.membersRow,
          {
            borderTopColor: isDarkText
              ? 'rgba(24, 24, 27, 0.12)'
              : 'rgba(255, 255, 255, 0.25)',
          },
        ]}>
        <Pressable onPress={handleMembers} style={styles.membersLeft}>
          <AvatarStack
            members={space.members}
            max={4}
            size={28}
            ringColor={accentColor}
          />
          <ThemedText
            style={[styles.memberCountText, { color: textColor }]}>
            {space.memberCount} {space.memberCount === 1 ? 'person' : 'people'}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleAddMember}
          style={({ pressed }) => [
            styles.addMemberBtn,
            {
              backgroundColor: translucentBg,
              borderColor: translucentBorder,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            },
          ]}>
          <Ionicons name="add" size={16} color={textColor} />
        </Pressable>
      </View>
    </View>
  );
}
