import React, { useEffect, useState } from 'react';
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
import { AvatarStack } from '@/components/AvatarStack';
import { PlanOptionCard } from '@/components/PlanOptionCard';
import { RSVPSelector } from '@/components/RSVPSelector';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  Plan,
  Space,
  SpaceMember,
  PlanRSVPStatus,
  spaceService,
  Poll,
} from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpaceIcon } from '@/components/SpaceIcon';

const CURRENT_USER: SpaceMember = { name: 'Irmak', initials: 'IR' };

export default function PlanDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [plan, setPlan] = useState<Plan | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [relatedPolls, setRelatedPolls] = useState<Poll[]>([]);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [finalizeModalVisible, setFinalizeModalVisible] = useState(false);
  const [selectedOptionToFinalize, setSelectedOptionToFinalize] = useState<string | null>(null);

  useEffect(() => {
    const loadPlanAndSpace = async () => {
      if (id) {
        const foundPlan = await spaceService.getPlanById(id);
        if (foundPlan) {
          setPlan(foundPlan);
          const foundSpace = await spaceService.getSpaceById(foundPlan.spaceId);
          if (foundSpace) setSpace(foundSpace);
          const polls = await spaceService.getPollsByPlanId(foundPlan.id);
          setRelatedPolls(polls);
        }
      }
    };

    loadPlanAndSpace();

    const unsubscribe = spaceService.subscribe(() => {
      loadPlanAndSpace();
    });

    return () => unsubscribe();
  }, [id]);

  if (!plan) {
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
        <ThemedText type="subtitle">Loading plan...</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <ThemedText type="link">Go back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const accentColor = space?.accentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);
  const subtleBorder = getAccentTint(accentColor, isDark ? 0.35 : 0.25);

  const isConfirmed = plan.status === 'confirmed';
  const isCreator = plan.createdBy === CURRENT_USER.name;

  const currentRSVP = plan.rsvps?.find((r) => r.userId === CURRENT_USER.name)?.status;
  const goingRSVPs = plan.rsvps?.filter((r) => r.status === 'going') || [];
  const maybeRSVPs = plan.rsvps?.filter((r) => r.status === 'maybe') || [];

  const handleToggleVote = (optionId: string) => {
    spaceService.votePlanOption(plan.id, optionId, CURRENT_USER);
  };

  const handleSelectRSVP = (status: PlanRSVPStatus) => {
    spaceService.rsvpPlan(plan.id, CURRENT_USER, status);
  };

  const handleOpenFinalize = (optionId?: string) => {
    if (optionId) {
      setSelectedOptionToFinalize(optionId);
    } else if (plan.options && plan.options.length > 0) {
      // Pick option with most votes as default
      const sorted = [...plan.options].sort((a, b) => b.voters.length - a.voters.length);
      setSelectedOptionToFinalize(sorted[0].id);
    }
    setFinalizeModalVisible(true);
  };

  const handleConfirmFinalize = async () => {
    if (!selectedOptionToFinalize) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await spaceService.finalizePlan(plan.id, selectedOptionToFinalize);
    setFinalizeModalVisible(false);
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
      {/* Top Nav */}
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
                backgroundColor: isConfirmed ? softTint : 'rgba(255, 143, 69, 0.14)',
                borderColor: isConfirmed ? subtleBorder : 'rgba(255, 143, 69, 0.3)',
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConfirmed ? accentColor : '#FF8F45' },
              ]}
            />
            <ThemedText
              style={[
                styles.statusBadgeText,
                { color: isConfirmed ? (isDark ? '#F4F4F5' : '#18181B') : '#FF8F45' },
              ]}>
              {isConfirmed ? 'PLAN CONFIRMED' : 'CHOOSING A TIME'}
            </ThemedText>
          </View>
        </View>

        {/* Plan Title */}
        <ThemedText type="hero" style={styles.planTitle}>
          {plan.title}
        </ThemedText>

        {/* Creator Identity & Meta */}
        <View style={styles.creatorRow}>
          <View style={[styles.creatorAvatar, { backgroundColor: softTint }]}>
            <ThemedText
              style={[
                styles.creatorInitials,
                { color: isDark ? '#F4F4F5' : '#18181B' },
              ]}>
              {plan.createdBy ? plan.createdBy.slice(0, 2).toUpperCase() : 'IR'}
            </ThemedText>
          </View>
          <ThemedText style={styles.creatorText}>
            Created by{' '}
            <ThemedText style={styles.creatorName}>
              {plan.createdBy || 'Irmak'}
            </ThemedText>
          </ThemedText>
        </View>

        {/* Note if exists */}
        {plan.note ? (
          <ThemedText type="body" style={styles.planNote}>
            {plan.note}
          </ThemedText>
        ) : null}

        {/* Location if exists */}
        {plan.location ? (
          <View style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={16}
              color={isDark ? '#A1A1AA' : '#71717A'}
            />
            <ThemedText style={styles.locationText}>{plan.location}</ThemedText>
          </View>
        ) : null}

        {/* CONFIRMED STATE */}
        {isConfirmed ? (
          <>
            {/* Confirmed Date Banner */}
            <View
              style={[
                styles.confirmedDateBanner,
                {
                  backgroundColor: softTint,
                  borderColor: subtleBorder,
                },
              ]}>
              <View style={styles.bannerIconBox}>
                <Ionicons name="calendar" size={22} color={accentColor} />
              </View>
              <View style={styles.bannerTextGroup}>
                <ThemedText type="caption" style={styles.bannerLabel}>
                  CONFIRMED DATE & TIME
                </ThemedText>
                <ThemedText type="title" style={styles.bannerDateText}>
                  {plan.dateDisplay || 'Date locked'}
                </ThemedText>
              </View>
            </View>

            {/* Attendance & RSVPs */}
            <View
              style={[
                styles.attendeesCard,
                {
                  backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                  borderColor: isDark ? '#26262B' : '#EFECE6',
                },
              ]}>
              <View style={styles.attendeesTop}>
                <ThemedText type="body" weight="semiBold">
                  {"Who's coming"}
                </ThemedText>
                <ThemedText type="caption" style={{ color: '#8E8D94' }}>
                  {goingRSVPs.length} going
                  {maybeRSVPs.length > 0 ? ` · ${maybeRSVPs.length} maybe` : ''}
                </ThemedText>
              </View>

              {/* Going Members List */}
              {goingRSVPs.length > 0 ? (
                <View style={styles.rsvpGroupSection}>
                  <ThemedText style={styles.rsvpGroupLabel}>
                    GOING ({goingRSVPs.length})
                  </ThemedText>
                  <View style={styles.membersGrid}>
                    {goingRSVPs.map((r) => (
                      <View
                        key={r.id || r.userName}
                        style={[
                          styles.memberChip,
                          {
                            backgroundColor: isDark ? '#222228' : '#FAF8F5',
                            borderColor: isDark ? '#2D2D35' : '#EFECE6',
                          },
                        ]}>
                        <View
                          style={[
                            styles.chipAvatar,
                            { backgroundColor: softTint },
                          ]}>
                          <ThemedText style={styles.chipInitials}>
                            {r.initials}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.chipName}>
                          {r.userName}
                        </ThemedText>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#10B981"
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Maybe Members List */}
              {maybeRSVPs.length > 0 ? (
                <View style={[styles.rsvpGroupSection, { marginTop: 12 }]}>
                  <ThemedText style={styles.rsvpGroupLabel}>
                    MAYBE ({maybeRSVPs.length})
                  </ThemedText>
                  <View style={styles.membersGrid}>
                    {maybeRSVPs.map((r) => (
                      <View
                        key={r.id || r.userName}
                        style={[
                          styles.memberChip,
                          {
                            backgroundColor: isDark ? '#222228' : '#FAF8F5',
                            borderColor: isDark ? '#2D2D35' : '#EFECE6',
                          },
                        ]}>
                        <View
                          style={[
                            styles.chipAvatar,
                            { backgroundColor: 'rgba(244, 215, 122, 0.3)' },
                          ]}>
                          <ThemedText style={styles.chipInitials}>
                            {r.initials}
                          </ThemedText>
                        </View>
                        <ThemedText style={styles.chipName}>
                          {r.userName}
                        </ThemedText>
                        <Ionicons
                          name="help-circle"
                          size={14}
                          color="#F59E0B"
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            {/* RSVP Selector */}
            <RSVPSelector
              currentStatus={currentRSVP}
              accentColor={accentColor}
              onSelectStatus={handleSelectRSVP}
            />
          </>
        ) : (
          /* VOTING STATE */
          <View style={styles.votingContainer}>
            <View style={styles.votingHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                <ThemedText type="subtitle" style={styles.votingTitle}>
                  When should we do this?
                </ThemedText>
                <ThemedText type="caption" style={styles.choiceNote}>
                  {plan.allowMultiple === false ? 'Single choice' : 'Multiple choices'}
                </ThemedText>
              </View>
              <ThemedText type="caption" style={styles.votingSub}>
                {plan.allowMultiple === false
                  ? 'Select the single best time that works for you:'
                  : 'Select all times that work for you:'}
              </ThemedText>
            </View>

            {/* Voting Options */}
            {plan.options?.map((opt) => {
              const isSelected = opt.voterIds.includes(CURRENT_USER.name);
              return (
                <PlanOptionCard
                  key={opt.id}
                  option={opt}
                  isSelected={isSelected}
                  accentColor={accentColor}
                  onToggleVote={handleToggleVote}
                  canFinalize={isCreator}
                  onFinalize={() => handleOpenFinalize(opt.id)}
                />
              );
            })}

            {/* Finalize Plan action for creator */}
            {isCreator && (
              <View style={styles.finalizeSection}>
                <PrimaryButton
                  title="Finalize Plan"
                  onPress={() => handleOpenFinalize()}
                  backgroundColor={accentColor}
                />
              </View>
            )}
          </View>
        )}

        {/* Decisions & Polls section */}
        {relatedPolls.length > 0 && (
          <View style={styles.decisionsSection}>
            <ThemedText type="body" weight="semiBold" style={styles.sectionHeading}>
              Decisions & Polls
            </ThemedText>
            {relatedPolls.map((poll) => (
              <Pressable
                key={poll.id}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  router.push({
                    pathname: '/poll/[id]',
                    params: { id: poll.id },
                  });
                }}
                style={({ pressed }) => [
                  styles.pollLinkCard,
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
                <View style={styles.pollLinkLeft}>
                  <View style={[styles.pollIconBox, { backgroundColor: softTint }]}>
                    <Ionicons name="bar-chart-outline" size={20} color={accentColor} />
                  </View>
                  <View style={styles.pollLinkTextGroup}>
                    <ThemedText type="body" weight="semiBold" style={styles.pollQuestion}>
                      {poll.question}
                    </ThemedText>
                    <ThemedText type="caption" style={styles.pollMeta}>
                      {poll.options.reduce((acc, opt) => acc + opt.voters.length, 0)} votes · {poll.isClosed ? 'Closed' : 'Active'}
                    </ThemedText>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDark ? '#71717A' : '#A1A1AA'}
                />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Finalize Modal */}
      <Modal
        visible={finalizeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFinalizeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setFinalizeModalVisible(false)}
          />

          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#1C1C20' : '#FFFFFF',
                borderColor: isDark ? '#2B2B33' : '#EAE6DF',
              },
            ]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Lock this in?
            </ThemedText>
            <ThemedText type="caption" style={styles.modalSubtitle}>
              Select the final date and time for {plan.title}:
            </ThemedText>

            <View style={styles.modalOptionsList}>
              {plan.options?.map((opt) => {
                const isPicked = selectedOptionToFinalize === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.selectionAsync();
                      setSelectedOptionToFinalize(opt.id);
                    }}
                    style={[
                      styles.modalOptionItem,
                      {
                        backgroundColor: isPicked
                          ? softTint
                          : isDark
                          ? '#222228'
                          : '#FAF8F5',
                        borderColor: isPicked
                          ? accentColor
                          : isDark
                          ? '#2D2D35'
                          : '#EFECE6',
                      },
                    ]}>
                    <View>
                      <ThemedText type="body" weight="semiBold">
                        {opt.title}
                      </ThemedText>
                      <ThemedText type="caption" style={{ color: '#8E8D94' }}>
                        {opt.voters.length} {opt.voters.length === 1 ? 'person voted' : 'people voted'}
                      </ThemedText>
                    </View>
                    {isPicked && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={accentColor}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <PrimaryButton
              title="Confirm & Finalize"
              onPress={handleConfirmFinalize}
              backgroundColor={accentColor}
              disabled={!selectedOptionToFinalize}
            />
          </View>
        </View>
      </Modal>

      {/* Overflow Action Menu Modal */}
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
              Plan Options
            </ThemedText>

            <Pressable
              onPress={() => {
                setMenuModalVisible(false);
                setTimeout(() => {
                  setConfirmDeleteVisible(true);
                }, 150);
              }}
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
                Delete plan
              </ThemedText>
            </Pressable>

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

      {/* Custom Confirm Delete Plan Modal */}
      <ConfirmModal
        visible={confirmDeleteVisible}
        title="Delete Plan"
        message="Are you sure you want to delete this plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        accentColor={accentColor}
        icon="trash-outline"
        onConfirm={async () => {
          setConfirmDeleteVisible(false);
          await spaceService.deletePlan(plan.id);
          router.back();
        }}
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
    marginBottom: 8,
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
  planTitle: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 4,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
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
  planNote: {
    color: '#8E8D94',
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  locationText: {
    color: '#8E8D94',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  confirmedDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    gap: 14,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextGroup: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.6,
    color: '#71717A',
  },
  bannerDateText: {
    fontSize: 18,
    lineHeight: 24,
    marginTop: 2,
  },
  attendeesCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  attendeesTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rsvpGroupSection: {
    marginTop: 6,
  },
  rsvpGroupLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  chipAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipInitials: {
    fontSize: 9,
    fontFamily: 'Poppins_600SemiBold',
  },
  chipName: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  votingContainer: {
    marginTop: 8,
  },
  votingHeader: {
    marginBottom: 16,
  },
  votingTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  votingSub: {
    color: '#8E8D94',
    marginTop: 2,
  },
  finalizeSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#8E8D94',
    marginBottom: 16,
  },
  modalOptionsList: {
    gap: 10,
    marginBottom: 20,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  decisionsSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  choiceNote: {
    color: '#8E8D94',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  pollLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  pollLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pollIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollLinkTextGroup: {
    flex: 1,
  },
  pollQuestion: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 20,
  },
  pollMeta: {
    color: '#8E8D94',
    fontSize: 12,
    marginTop: 1,
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
