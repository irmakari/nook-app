import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { PollOptionCard } from '@/components/PollOptionCard';
import { PollAddOptionModal } from '@/components/PollAddOptionModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  Poll,
  Space,
  SpaceMember,
  spaceService,
} from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpaceIcon } from '@/components/SpaceIcon';

export default function PollDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [currentUser, setCurrentUser] = useState<SpaceMember>(spaceService.getCurrentMember());
  const [poll, setPoll] = useState<Poll | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    const loadPollAndSpace = async () => {
      setCurrentUser(spaceService.getCurrentMember());
      if (id) {
        const foundPoll = await spaceService.getPollById(id);
        if (foundPoll) {
          setPoll(foundPoll);
          const foundSpace = await spaceService.getSpaceById(foundPoll.spaceId);
          if (foundSpace) setSpace(foundSpace);
        }
      }
    };

    loadPollAndSpace();

    const unsubscribe = spaceService.subscribe(() => {
      loadPollAndSpace();
    }, ['polls', 'spaces', 'session']);

    return () => unsubscribe();
  }, [id]);

  if (!poll) {
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
        <ThemedText type="subtitle">Loading poll...</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <ThemedText type="link">Go back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const accentColor = space?.accentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);
  const subtleBorder = getAccentTint(accentColor, isDark ? 0.35 : 0.25);

  const isClosed = !!poll.isClosed;

  // Calculate total votes and leading vote count
  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.voters.length, 0);
  const maxVotes = Math.max(...poll.options.map((o) => o.voters.length), 0);
  
  const isCreator = poll.createdBy === currentUser.name;
  const userHasVoted = poll.options.some((opt) =>
    opt.voterIds.includes(currentUser.name)
  );

  const handleToggleVote = (optionId: string) => {
    if (poll.isClosed) return;
    spaceService.votePoll(poll.id, optionId, currentUser);
  };

  const handleAddOption = (text: string) => {
    spaceService.addPollOption(poll.id, text, currentUser);
  };

  const handleClosePoll = async () => {
    setMenuModalVisible(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await spaceService.closePoll(poll.id);
  };

  const handleDeletePoll = () => {
    setMenuModalVisible(false);
    setTimeout(() => {
      setConfirmDeleteVisible(true);
    }, 150);
  };

  const handleConfirmDeletePoll = async () => {
    if (poll) {
      await spaceService.deletePoll(poll.id);
      router.back();
    }
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
          {space?.icon && (
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
            {space?.name || 'Space'}
          </ThemedText>
        </View>

        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            setMenuModalVisible(true);
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
            name="ellipsis-horizontal"
            size={18}
            color={isDark ? '#A1A1AA' : '#71717A'}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
        ]}>
        {/* Status Badge */}
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isClosed
                  ? 'rgba(142, 141, 148, 0.14)'
                  : softTint,
                borderColor: isClosed
                  ? 'rgba(142, 141, 148, 0.3)'
                  : subtleBorder,
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isClosed ? '#8E8D94' : accentColor },
              ]}
            />
            <ThemedText
              style={[
                styles.statusBadgeText,
                {
                  color: isClosed
                    ? '#8E8D94'
                    : isDark
                    ? '#F4F4F5'
                    : '#18181B',
                },
              ]}>
              {isClosed ? 'POLL CLOSED' : 'ACTIVE POLL'}
            </ThemedText>
          </View>

          <ThemedText type="caption" style={styles.choiceNote}>
            {poll.allowMultiple ? 'Multiple choices' : 'Single choice'}
          </ThemedText>
        </View>

        {/* Question Title */}
        <ThemedText type="screenTitle" style={styles.questionTitle}>
          {poll.question}
        </ThemedText>

        {/* Creator Info */}
        <View style={styles.creatorRow}>
          <View style={[styles.creatorAvatar, { backgroundColor: softTint }]}>
            <ThemedText
              style={[
                styles.creatorInitials,
                { color: isDark ? '#F4F4F5' : '#18181B' },
              ]}>
              {poll.createdBy ? poll.createdBy.slice(0, 2).toUpperCase() : 'IR'}
            </ThemedText>
          </View>
          <ThemedText style={styles.creatorText}>
            Created by{' '}
            <ThemedText style={styles.creatorName}>
              {poll.createdBy || 'Irmak'}
            </ThemedText>
          </ThemedText>
        </View>

        {/* Note if exists */}
        {poll.note ? (
          <ThemedText type="body" style={styles.noteText}>
            {poll.note}
          </ThemedText>
        ) : null}

        {/* Options List */}
        <View style={styles.optionsList}>
          {poll.options.map((opt) => {
            const isSelected = opt.voterIds.includes(currentUser.name);
            const isLeading = maxVotes > 0 && opt.voters.length === maxVotes;

            return (
              <PollOptionCard
                key={opt.id}
                option={opt}
                totalVotes={totalVotes}
                isLeading={isLeading}
                isSelected={isSelected}
                isClosed={isClosed}
                accentColor={accentColor}
                onVote={handleToggleVote}
              />
            );
          })}
        </View>

        {/* Add Option Trigger (if allowed and active) */}
        {poll.membersCanAddOptions && !isClosed && (
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setAddModalVisible(true);
            }}
            style={({ pressed }) => [
              styles.addOptionBtn,
              {
                backgroundColor: pressed
                  ? isDark
                    ? '#222228'
                    : '#F5F2EB'
                  : 'transparent',
                borderColor: isDark ? '#2B2B33' : '#E5E1D8',
              },
            ]}>
            <Ionicons name="add" size={18} color={accentColor} />
            <ThemedText style={[styles.addOptionText, { color: accentColor }]}>
              Add an option
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>

      {/* Add Option Bottom Sheet Modal */}
      <PollAddOptionModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddOption={handleAddOption}
        accentColor={accentColor}
      />

      {/* Creator Overflow Action Menu Modal */}
      <Modal
        visible={menuModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuModalVisible(false)}>
        <View style={styles.menuOverlay}>
          <Pressable
            style={styles.menuBackdrop}
            onPress={() => setMenuModalVisible(false)}
          />
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? '#1C1C20' : '#FFFFFF',
                borderColor: isDark ? '#2B2B33' : '#EAE6DF',
              },
            ]}>
            <ThemedText type="body" weight="semiBold" style={styles.menuHeader}>
              Poll Options
            </ThemedText>

            {!isClosed && isCreator && (
              <Pressable
                onPress={handleClosePoll}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: pressed
                      ? isDark
                        ? '#26262F'
                        : '#FAF8F5'
                      : 'transparent',
                  },
                ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={isDark ? '#F4F4F5' : '#18181B'}
                />
                <ThemedText style={styles.menuItemText}>
                  Close poll
                </ThemedText>
              </Pressable>
            )}

            {isCreator && (
              <Pressable
                onPress={handleDeletePoll}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: pressed
                      ? isDark
                        ? '#26262F'
                        : '#FAF8F5'
                      : 'transparent',
                  },
                ]}>
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
                <ThemedText style={[styles.menuItemText, { color: '#FF5252' }]}>
                  Delete poll
                </ThemedText>
              </Pressable>
            )}

            <Pressable
              onPress={() => setMenuModalVisible(false)}
              style={styles.cancelMenuItem}>
              <ThemedText style={{ color: '#8E8D94', textAlign: 'center' }}>
                Cancel
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Custom Delete Poll Confirm Modal */}
      <ConfirmModal
        visible={confirmDeleteVisible}
        title="Delete Poll"
        message="Are you sure you want to delete this poll? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        accentColor={accentColor}
        icon="trash-outline"
        onConfirm={handleConfirmDeletePoll}
        onCancel={() => setConfirmDeleteVisible(false)}
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.6,
  },
  choiceNote: {
    color: '#8E8D94',
    fontSize: 12,
  },
  questionTitle: {
    marginBottom: 4,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorInitials: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  creatorText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#8E8D94',
  },
  creatorName: {
    fontFamily: 'Poppins_600SemiBold',
  },
  noteText: {
    color: '#8E8D94',
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  optionsList: {
    marginTop: 10,
    marginBottom: 10,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 6,
    marginTop: 6,
    marginBottom: 24,
  },
  addOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  menuHeader: {
    fontSize: 16,
    marginBottom: 14,
    color: '#8E8D94',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  menuItemText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  cancelMenuItem: {
    paddingVertical: 14,
    marginTop: 8,
  },
});
