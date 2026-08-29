import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { EditProfileModal } from '@/components/EditProfileModal';
import { Space, User, spaceService } from '@/services/space-service';
import { SpaceIcon } from '@/components/SpaceIcon';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [user, setUser] = useState<User>(spaceService.getCurrentUser());
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setUser(spaceService.getCurrentUser());
      const allSpaces = await spaceService.getSpaces();
      setSpaces(allSpaces);
    };

    loadData();

    const unsubscribe = spaceService.subscribe(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = (updates: Partial<User>) => {
    const updated = spaceService.updateCurrentUser(updates);
    setUser(updated);
  };

  const toggleHaptics = (val: boolean) => {
    setHapticsEnabled(val);
    if (Platform.OS !== 'web' && val) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleOpenSpace = (spaceId: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/space/[id]',
      params: { id: spaceId },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#121214' : '#FAF8F5',
          paddingTop: Math.max(insets.top, 20),
        },
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}>
        {/* Header Title */}
        <View style={styles.header}>
          <ThemedText type="hero" style={styles.headerTitle}>
            Profile
          </ThemedText>
        </View>

        {/* User Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
              borderColor: isDark ? '#26262B' : '#EFECE6',
            },
          ]}>
          <View style={styles.userCardTop}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: user.avatarColor || '#7FB9E6' },
              ]}>
              <ThemedText style={styles.avatarInitials}>
                {user.initials}
              </ThemedText>
            </View>

            <View style={styles.userInfo}>
              <ThemedText style={styles.userName}>{user.name}</ThemedText>
              <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
              <ThemedText style={styles.userSpacesCount}>
                {spaces.length} {spaces.length === 1 ? 'Space' : 'Spaces'}
              </ThemedText>
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setIsEditModalVisible(true);
            }}
            style={({ pressed }) => [
              styles.editProfileBtn,
              {
                backgroundColor: pressed
                  ? isDark
                    ? '#26262F'
                    : '#F5F2EB'
                  : isDark
                  ? '#222228'
                  : '#FAF8F5',
                borderColor: isDark ? '#2D2D35' : '#EFECE6',
              },
            ]}>
            <Ionicons
              name="create-outline"
              size={16}
              color={isDark ? '#F4F4F5' : '#18181B'}
            />
            <ThemedText style={styles.editProfileBtnText}>
              Edit profile
            </ThemedText>
          </Pressable>
        </View>

        {/* YOUR SPACES SECTION */}
        <View style={styles.sectionBlock}>
          <ThemedText type="caption" style={styles.sectionLabel}>
            YOUR SPACES ({spaces.length})
          </ThemedText>

          <View style={styles.spacesList}>
            {spaces.map((space) => (
              <Pressable
                key={space.id}
                onPress={() => handleOpenSpace(space.id)}
                style={({ pressed }) => [
                  styles.spaceRow,
                  {
                    backgroundColor: pressed
                      ? isDark
                        ? '#222228'
                        : '#F5F2EB'
                      : isDark
                      ? '#1A1A1E'
                      : '#FFFFFF',
                    borderColor: isDark ? '#26262B' : '#EFECE6',
                  },
                ]}>
                <View style={{ marginRight: 10 }}>
                  <SpaceIcon
                    name={space.icon}
                    size={18}
                    color={space.accentColor || '#7FB9E6'}
                  />
                </View>
                <ThemedText style={styles.spaceName}>{space.name}</ThemedText>

                <ThemedText style={styles.spaceMembers}>
                  {space.memberCount} {space.memberCount === 1 ? 'person' : 'people'}
                </ThemedText>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isDark ? '#52525B' : '#C4C0B8'}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.sectionBlock}>
          <ThemedText type="caption" style={styles.sectionLabel}>
            PREFERENCES
          </ThemedText>

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                borderColor: isDark ? '#26262B' : '#EFECE6',
              },
            ]}>
            {/* Haptic Feedback */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color={isDark ? '#A1A1AA' : '#71717A'}
                />
                <ThemedText style={styles.settingText}>Haptic Feedback</ThemedText>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={toggleHaptics}
                trackColor={{ false: '#767577', true: '#7FB9E6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Appearance */}
            <View
              style={[
                styles.settingRow,
                { borderTopWidth: 1, borderTopColor: isDark ? '#26262B' : '#EFECE6' },
              ]}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="moon-outline"
                  size={18}
                  color={isDark ? '#A1A1AA' : '#71717A'}
                />
                <ThemedText style={styles.settingText}>Appearance</ThemedText>
              </View>
              <ThemedText style={{ color: '#8E8D94', fontSize: 13 }}>
                System ({colorScheme})
              </ThemedText>
            </View>
          </View>
        </View>

        {/* ABOUT NOOK */}
        <View style={styles.sectionBlock}>
          <ThemedText type="caption" style={styles.sectionLabel}>
            ABOUT
          </ThemedText>
          <View
            style={[
              styles.aboutCard,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                borderColor: isDark ? '#26262B' : '#EFECE6',
              },
            ]}>
            <ThemedText style={styles.aboutAppName}>Nook</ThemedText>
            <ThemedText style={styles.aboutVersion}>Version 1.0.0</ThemedText>
            <ThemedText style={styles.aboutTagline}>
              Private, cozy shared spaces for your favorite people.
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        user={user}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleUpdateProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 38,
  },
  userCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
  },
  userCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  userEmail: {
    color: '#8E8D94',
    fontSize: 13,
    marginBottom: 4,
  },
  userSpacesCount: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#7FB9E6',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  sectionBlock: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  spacesList: {
    gap: 8,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  spaceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  spaceEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  spaceName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  spaceMembers: {
    color: '#8E8D94',
    fontSize: 12,
    marginRight: 8,
  },
  settingsCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  aboutCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  aboutAppName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 2,
  },
  aboutVersion: {
    color: '#8E8D94',
    fontSize: 12,
    marginBottom: 6,
  },
  aboutTagline: {
    color: '#8E8D94',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
