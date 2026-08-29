import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { MemberRow } from '@/components/MemberRow';
import { InviteMemberSheet } from '@/components/InviteMemberSheet';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  Space,
  SpaceMember,
  User,
  spaceService,
} from '@/services/space-service';
import { SpaceIcon } from '@/components/SpaceIcon';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SpaceMembersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [space, setSpace] = useState<Space | null>(null);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(spaceService.getCurrentUser());
  const [inviteVisible, setInviteVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const foundSpace = await spaceService.getSpaceById(id);
        if (foundSpace) {
          setSpace(foundSpace);
          const loadedMembers = await spaceService.getSpaceMembers(id);
          setMembers(loadedMembers);
        }
      }
      setCurrentUser(spaceService.getCurrentUser());
    };

    loadData();

    const unsubscribe = spaceService.subscribe(() => {
      loadData();
    });

    return () => unsubscribe();
  }, [id]);

  if (!space) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#121214' : '#FAF8F5',
            paddingTop: insets.top,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        <ThemedText type="subtitle">Loading members...</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <ThemedText type="link">Go back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const accentColor = space.accentColor || '#7FB9E6';
  const availableUsers = spaceService.getAvailableUsersForSpace(space.id);
  const isCurrentUserOwner = members.length > 0 && members[0].name === currentUser.name;

  const handleAddMember = async (user: SpaceMember) => {
    setInviteVisible(false);
    await spaceService.addSpaceMember(space.id, user);
  };

  const handleRemoveMember = async (memberName: string) => {
    await spaceService.removeSpaceMember(space.id, memberName);
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
      {/* Top Navigation */}
      <View style={styles.navBar}>
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            router.back();
          }}
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

        <View style={styles.navSpaceBadge}>
          {space.icon && (
            <View style={{ marginRight: 6 }}>
              <SpaceIcon
                name={space.icon}
                size={14}
                color={isDark ? '#F4F4F5' : '#18181B'}
              />
            </View>
          )}
          <ThemedText
            type="caption"
            style={{
              fontFamily: 'Poppins_600SemiBold',
              color: isDark ? '#F4F4F5' : '#18181B',
            }}>
            {space.name}
          </ThemedText>
        </View>

        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            setInviteVisible(true);
          }}
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
            name="person-add-outline"
            size={18}
            color={isDark ? '#F4F4F5' : '#18181B'}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}>
        {/* Title Header */}
        <View style={styles.titleRow}>
          <ThemedText type="hero" style={styles.screenTitle}>
            Members
          </ThemedText>
          <ThemedText type="caption" style={styles.countBadge}>
            {members.length} {members.length === 1 ? 'person' : 'people'}
          </ThemedText>
        </View>

        <ThemedText type="caption" style={styles.sectionLabel}>
          IN THIS SPACE
        </ThemedText>

        {/* Member Rows */}
        {members.map((member, idx) => (
          <MemberRow
            key={member.name}
            member={member}
            isCurrentUser={member.name === currentUser.name}
            isOwner={idx === 0}
            canRemove={isCurrentUserOwner}
            accentColor={accentColor}
            onRemove={handleRemoveMember}
          />
        ))}
      </ScrollView>

      {/* Sticky Bottom Invite Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? '#121214' : '#FAF8F5',
            borderTopColor: isDark ? '#222227' : '#EFECE6',
            bottom: insets.bottom,
          },
        ]}>
        <PrimaryButton
          title="+ Invite people"
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            setInviteVisible(true);
          }}
          backgroundColor={accentColor}
        />
      </View>

      {/* Invite Member Bottom Sheet */}
      <InviteMemberSheet
        visible={inviteVisible}
        spaceName={space.name}
        accentColor={accentColor}
        availableUsers={availableUsers}
        onClose={() => setInviteVisible(false)}
        onAddMember={handleAddMember}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  navSpaceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: 'rgba(142, 141, 148, 0.12)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  countBadge: {
    color: '#8E8D94',
    fontSize: 13,
  },
  sectionLabel: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
