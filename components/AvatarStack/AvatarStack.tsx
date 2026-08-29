import React from 'react';
import { View } from 'react-native';

import { AvatarStackProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AVATAR_PALETTES = [
  { bg: '#EAE6F8', text: '#5D4F88' },
  { bg: '#E4F2E9', text: '#3E6B4F' },
  { bg: '#FAE8EE', text: '#8E3F53' },
  { bg: '#F8ECE5', text: '#8E4E30' },
  { bg: '#E2EEF4', text: '#345E70' },
];

export function AvatarStack({
  members = [],
  max = 3,
  size = 28,
  ringColor,
}: AvatarStackProps) {
  const colorScheme = useColorScheme();
  const defaultRing = colorScheme === 'dark' ? '#1A1A1E' : '#FFFFFF';
  const finalRing = ringColor || defaultRing;

  const displayMembers = members.slice(0, max);
  const remainingCount = members.length - max;

  return (
    <View style={styles.container}>
      {displayMembers.map((member, index) => {
        const colorPair = AVATAR_PALETTES[index % AVATAR_PALETTES.length];
        return (
          <View
            key={member.name + index}
            style={[
              styles.avatar,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: colorPair.bg,
                borderColor: finalRing,
                borderWidth: 2,
                marginLeft: index === 0 ? 0 : -8,
                zIndex: displayMembers.length - index,
              },
            ]}>
            <ThemedText
              style={[
                styles.initials,
                {
                  fontSize: Math.max(9, size * 0.38),
                  color: colorPair.text,
                },
              ]}>
              {member.initials}
            </ThemedText>
          </View>
        );
      })}
      {remainingCount > 0 && (
        <View
          style={[
            styles.avatar,
            styles.remaining,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: finalRing,
              borderWidth: 2,
              marginLeft: -8,
              zIndex: 0,
              backgroundColor: colorScheme === 'dark' ? '#2A2A31' : '#F0ECE6',
            },
          ]}>
          <ThemedText
            style={[
              styles.remainingText,
              {
                fontSize: Math.max(8, size * 0.35),
                color: colorScheme === 'dark' ? '#A1A1AA' : '#71717A',
              },
            ]}>
            +{remainingCount}
          </ThemedText>
        </View>
      )}
    </View>
  );
}
