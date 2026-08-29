import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { SpaceHeaderProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { AvatarStack } from '@/components/AvatarStack';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function SpaceHeader({
  space,
  onBackPress,
  onOptionsPress,
  onMembersPress,
}: SpaceHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const accentColor = space.accentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.15);

  const handleBack = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onBackPress();
  };

  const handleOptions = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onOptionsPress?.();
  };

  const handleMembers = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onMembersPress?.();
  };

  return (
    <View style={styles.container}>
      {/* Top Nav Row: Back + Options */}
      <View style={styles.topNavRow}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.circleBtn,
            {
              backgroundColor: pressed
                ? isDark
                  ? '#26262D'
                  : '#EAE6DF'
                : isDark
                ? '#1A1A1E'
                : '#FFFFFF',
              borderColor: isDark ? '#26262B' : '#EFECE6',
            },
          ]}>
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDark ? '#F4F4F5' : '#18181B'}
          />
        </Pressable>

        <Pressable
          onPress={handleOptions}
          style={({ pressed }) => [
            styles.circleBtn,
            {
              backgroundColor: pressed
                ? isDark
                  ? '#26262D'
                  : '#EAE6DF'
                : isDark
                ? '#1A1A1E'
                : '#FFFFFF',
              borderColor: isDark ? '#26262B' : '#EFECE6',
            },
          ]}>
          <Ionicons
            name="ellipsis-horizontal"
            size={18}
            color={isDark ? '#A1A1AA' : '#71717A'}
          />
        </Pressable>
      </View>

      {/* Main Identity Row: Icon + Name + Member Stack */}
      <View style={styles.identityRow}>
        <View style={styles.leftIdentity}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: softTint,
                borderColor: accentColor,
              },
            ]}>
            <ThemedText style={styles.iconEmoji}>{space.icon}</ThemedText>
          </View>
          <View style={styles.nameWrapper}>
            <ThemedText type="title" style={styles.spaceName} numberOfLines={1}>
              {space.name}
            </ThemedText>
            <View style={styles.membersInfo}>
              <ThemedText type="caption" style={styles.memberCountText}>
                {space.memberCount} {space.memberCount === 1 ? 'person' : 'people'}
              </ThemedText>
            </View>
          </View>
        </View>

        <Pressable onPress={handleMembers} style={styles.membersButton}>
          <AvatarStack
            members={space.members}
            max={3}
            size={28}
            ringColor={isDark ? '#121214' : '#FAF8F5'}
          />
        </Pressable>
      </View>
    </View>
  );
}
