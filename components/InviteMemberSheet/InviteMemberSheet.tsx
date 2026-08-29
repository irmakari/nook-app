import React from 'react';
import {
  Modal,
  View,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { InviteMemberSheetProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { getAccentTint, getReadableTextColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function InviteMemberSheet({
  visible,
  spaceName,
  accentColor,
  availableUsers,
  onClose,
  onAddMember,
}: InviteMemberSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);
  const btnTextColor = getReadableTextColor(accentColor);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
              borderColor: isDark ? '#2B2B33' : '#EAE6DF',
            },
          ]}>
          <View
            style={[
              styles.handleBar,
              { backgroundColor: isDark ? '#33333D' : '#D8D4CC' },
            ]}
          />

          <View style={styles.headerRow}>
            <ThemedText type="title" style={styles.title}>
              Add to {spaceName}
            </ThemedText>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={22}
                color={isDark ? '#A1A1AA' : '#71717A'}
              />
            </Pressable>
          </View>

          <ThemedText style={styles.subtitle}>
            Choose someone to add to this Space.
          </ThemedText>

          <ScrollView showsVerticalScrollIndicator={false}>
            {availableUsers.length === 0 ? (
              <ThemedText style={styles.emptyNotice}>
                Everyone in your contacts is already in this Space!
              </ThemedText>
            ) : (
              availableUsers.map((user) => (
                <View
                  key={user.name}
                  style={[
                    styles.userRow,
                    {
                      backgroundColor: isDark ? '#222228' : '#FAF8F5',
                      borderColor: isDark ? '#2D2D35' : '#EFECE6',
                    },
                  ]}>
                  <View
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: softTint },
                    ]}>
                    <ThemedText
                      style={[
                        styles.avatarInitials,
                        { color: isDark ? '#F4F4F5' : '#18181B' },
                      ]}>
                      {user.initials}
                    </ThemedText>
                  </View>

                  <ThemedText style={styles.userName}>{user.name}</ThemedText>

                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.notificationAsync(
                          Haptics.NotificationFeedbackType.Success
                        );
                      }
                      onAddMember(user);
                    }}
                    style={[
                      styles.addBtn,
                      { backgroundColor: accentColor },
                    ]}>
                    <ThemedText
                      style={[
                        styles.addBtnText,
                        { color: btnTextColor },
                      ]}>
                      Add
                    </ThemedText>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
