import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { MemberRowProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function MemberRow({
  member,
  isCurrentUser,
  isOwner,
  canRemove,
  accentColor,
  onRemove,
}: MemberRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  const handleRemove = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onRemove?.(member.name);
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
      {/* Avatar Initials */}
      <View
        style={[
          styles.avatarCircle,
          {
            backgroundColor: isCurrentUser
              ? softTint
              : isDark
              ? '#2A2A33'
              : '#EFECE6',
          },
        ]}>
        <ThemedText
          style={[
            styles.avatarInitials,
            {
              color: isCurrentUser
                ? isDark
                  ? '#F4F4F5'
                  : '#18181B'
                : isDark
                ? '#D4D4D8'
                : '#52525B',
            },
          ]}>
          {member.initials}
        </ThemedText>
      </View>

      {/* Member Details */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <ThemedText style={styles.name}>{member.name}</ThemedText>
          {isCurrentUser && (
            <View
              style={[
                styles.youBadge,
                { backgroundColor: softTint },
              ]}>
              <ThemedText
                style={[
                  styles.youText,
                  { color: isDark ? '#F4F4F5' : '#18181B' },
                ]}>
                You
              </ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={styles.roleText}>
          {isOwner ? 'Owner' : 'Member'}
        </ThemedText>
      </View>

      {/* Owner Remove Trigger */}
      {canRemove && !isCurrentUser && (
        <Pressable onPress={handleRemove} style={styles.removeBtn}>
          <Ionicons
            name="trash-outline"
            size={18}
            color={isDark ? '#71717A' : '#A1A1AA'}
          />
        </Pressable>
      )}
    </View>
  );
}
