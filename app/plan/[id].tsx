import React, { useEffect, useState, useMemo } from 'react';
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

// Helper to parse dateDisplay strings like "Saturday, Sep 5 · 10:00"
function parseConfirmedDate(dateDisplay?: string | null) {
  if (!dateDisplay) return null;
  const parts = dateDisplay.split('·').map((s) => s.trim());
  const datePart = parts[0] || '';
  const timePart = parts[1] || '';

  const match = datePart.match(/^(?:([A-Za-z]+),\s*)?([A-Za-z]+)\s+(\d+)/i);
  if (match) {
    return {
      weekday: (match[1] || '').toUpperCase(),
      month: (match[2] || '').toUpperCase().slice(0, 3),
      day: match[3] || '',
      time: timePart || '',
      fullDateText: datePart,
    };
  }

  return {
    weekday: '',
    month: 'PLAN',
    day: '★',
    time: timePart || '',
    fullDateText: dateDisplay,
  };
}

export default function PlanDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Fast synchronous initial cache retrieval
  const [currentUser, setCurrentUser] = useState<SpaceMember>(() => spaceService.getCurrentMember());
  const [plan, setPlan] = useState<Plan | null>(() => (id ? spaceService.getPlanSync(id) || null : null));
  const [space, setSpace] = useState<Space | null>(() => {
    const initialPlan = id ? spaceService.getPlanSync(id) : null;
    if (initialPlan) {
      return spaceService.getSpaceSync(initialPlan.spaceId) || null;
    }
    return null;
  });
  const [relatedPolls, setRelatedPolls] = useState<Poll[]>([]);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [finalizeModalVisible, setFinalizeModalVisible] = useState(false);
  const [selectedOptionToFinalize, setSelectedOptionToFinalize] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPlanAndSpace = async () => {
      setCurrentUser(spaceService.getCurrentMember());
      if (!id) return;

      const foundPlan = await spaceService.getPlanById(id);
      if (!foundPlan || !isMounted) return;

      let foundSpace = spaceService.getSpaceSync(foundPlan.spaceId);
      let polls: Poll[] = [];

      if (!foundSpace) {
        const [loadedSpace, loadedPolls] = await Promise.all([
          spaceService.getSpaceById(foundPlan.spaceId),
          spaceService.getPollsByPlanId(foundPlan.id),
        ]);
        foundSpace = loadedSpace;
        polls = loadedPolls;
      } else {
        polls = await spaceService.getPollsByPlanId(foundPlan.id);
      }

      if (isMounted) {
        // Batch set states together so there is NEVER an intermediate color flash
        setPlan(foundPlan);
        if (foundSpace) setSpace(foundSpace);
        setRelatedPolls(polls);
      }
    };

    loadPlanAndSpace();

    const unsubscribe = spaceService.subscribe(() => {
      loadPlanAndSpace();
    }, ['plans', 'polls', 'spaces', 'session']);

    return () => {
      isMounted = false;
      unsubscribe();
    };
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
  const isCreator = plan.createdBy === currentUser.name;

  const currentRSVP = plan.rsvps?.find(
    (r) => r.userId === currentUser.name || r.userName === currentUser.name
  )?.status;
  const goingRSVPs = plan.rsvps?.filter((r) => r.status === 'going') || [];
  const maybeRSVPs = plan.rsvps?.filter((r) => r.status === 'maybe') || [];
  const declinedRSVPs = plan.rsvps?.filter((r) => r.status === 'declined') || [];

  const parsedDate = parseConfirmedDate(plan.dateDisplay);

  const handleToggleVote = (optionId: string) => {
    // Optimistic local update
    if (plan.options) {
      const updatedOptions = plan.options.map((opt) => {
        if (opt.id === optionId) {
          const hasVoted = opt.voterIds.includes(currentUser.name);
          const nextVoters = hasVoted
            ? opt.voters.filter((v) => v.name !== currentUser.name)
            : [...opt.voters, currentUser];
          const nextVoterIds = hasVoted
            ? opt.voterIds.filter((name) => name !== currentUser.name)
            : [...opt.voterIds, currentUser.name];
          return { ...opt, voters: nextVoters, voterIds: nextVoterIds };
        }
        return opt;
      });
      setPlan({ ...plan, options: updatedOptions });
    }
    spaceService.votePlanOption(plan.id, optionId, currentUser);
  };

  const handleSelectRSVP = (status: PlanRSVPStatus) => {
    // Optimistic local update
    const nextRsvps = [...(plan.rsvps || []).filter((r) => r.userId !== currentUser.name && r.userName !== currentUser.name)];
    nextRsvps.push({
      id: `rsvp-${Date.now()}`,
      planId: plan.id,
      userId: currentUser.name,
      userName: currentUser.name,
      initials: currentUser.initials,
      status,
    });
    setPlan({ ...plan, rsvps: nextRsvps });
    spaceService.rsvpPlan(plan.id, currentUser, status);
  };

  const handleOpenFinalize = (optionId?: string) => {
    if (optionId) {
      setSelectedOptionToFinalize(optionId);
    } else if (plan.options && plan.options.length > 0) {
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
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      {/* Top Nav Bar */}
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

        <View
          style={[
            styles.navSpaceBadge,
            {
              backgroundColor: isDark ? '#1E1E24' : '#EFECE6',
              borderColor: isDark ? '#2D2D35' : '#E5E1D8',
            },
          ]}>
          {space?.icon && (
            <View style={{ marginRight: 6 }}>
              <SpaceIcon
                name={space.icon}
                size={14}
                color={accentColor}
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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText type="screenTitle" style={styles.planTitle}>
            {plan.title}
          </ThemedText>

          <View style={styles.creatorRow}>
            {/* Creator avatar & name */}
            <View style={styles.creatorMeta}>
              <View
                style={[
                  styles.creatorAvatar,
                  {
                    backgroundColor: softTint,
                    borderColor: subtleBorder,
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.creatorInitials,
                    { color: isDark ? '#F4F4F5' : '#18181B' },
                  ]}>
                  {plan.createdBy ? plan.createdBy.slice(0, 2).toUpperCase() : 'IR'}
                </ThemedText>
              </View>
              <ThemedText style={styles.creatorText}>
                by <ThemedText style={[styles.creatorName, { color: isDark ? '#F4F4F5' : '#18181B' }]}>{plan.createdBy || 'Irmak'}</ThemedText>
              </ThemedText>
            </View>

            <View style={[styles.metaDot, { backgroundColor: isDark ? '#3F3F46' : '#D4D4D8' }]} />

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isConfirmed ? softTint : 'rgba(255, 143, 69, 0.12)',
                  borderColor: isConfirmed ? subtleBorder : 'rgba(255, 143, 69, 0.28)',
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
                {isConfirmed ? 'Confirmed' : 'Choosing a time'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Location & Notes Section (Clean Card Layout) */}
        {(plan.location || plan.note) && (
          <View
            style={[
              styles.metaDetailsCard,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                borderColor: isDark ? '#26262B' : '#EFECE6',
              },
            ]}>
            {plan.location && (
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.metaIconBox,
                    { backgroundColor: isDark ? '#24242C' : '#F4F2EB' },
                  ]}>
                  <Ionicons name="location" size={16} color={accentColor} />
                </View>
                <View style={styles.metaTextGroup}>
                  <ThemedText type="caption" style={styles.metaLabel}>
                    LOCATION
                  </ThemedText>
                  <ThemedText type="body" weight="medium" style={styles.metaValue}>
                    {plan.location}
                  </ThemedText>
                </View>
              </View>
            )}

            {plan.location && plan.note && (
              <View
                style={[
                  styles.metaDivider,
                  { backgroundColor: isDark ? '#26262B' : '#EFECE6' },
                ]}
              />
            )}

            {plan.note && (
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.metaIconBox,
                    { backgroundColor: isDark ? '#24242C' : '#F4F2EB' },
                  ]}>
                  <Ionicons name="document-text-outline" size={16} color={accentColor} />
                </View>
                <View style={styles.metaTextGroup}>
                  <ThemedText type="caption" style={styles.metaLabel}>
                    NOTE / DESCRIPTION
                  </ThemedText>
                  <ThemedText type="body" style={styles.metaNoteText}>
                    {plan.note}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        )}

        {/* CONFIRMED STATE HERO TICKET */}
        {isConfirmed ? (
          <>
            <View
              style={[
                styles.ticketCard,
                {
                  backgroundColor: isDark ? '#18181D' : '#FFFFFF',
                  borderColor: isDark ? '#2D2D36' : '#EAE6DF',
                },
              ]}>
              {/* Left Calendar Block */}
              <View
                style={[
                  styles.calendarBlock,
                  {
                    backgroundColor: isDark ? '#22222A' : '#FAF8F5',
                    borderColor: subtleBorder,
                  },
                ]}>
                <View style={[styles.calendarMonthHeader, { backgroundColor: accentColor }]}>
                  <ThemedText style={styles.calendarMonthText}>
                    {parsedDate?.month || 'DATE'}
                  </ThemedText>
                </View>
                <View style={styles.calendarDayBody}>
                  <ThemedText style={styles.calendarDayNumber}>
                    {parsedDate?.day || '•'}
                  </ThemedText>
                  {parsedDate?.weekday ? (
                    <ThemedText style={styles.calendarWeekdayText}>
                      {parsedDate.weekday.slice(0, 3)}
                    </ThemedText>
                  ) : null}
                </View>
              </View>

              {/* Right Event Details */}
              <View style={styles.ticketDetails}>
                <View style={styles.ticketStatusRow}>
                  <View style={[styles.miniLockPill, { backgroundColor: softTint }]}>
                    <Ionicons name="lock-closed" size={11} color={accentColor} />
                    <ThemedText style={[styles.miniLockText, { color: accentColor }]}>
                      LOCKED IN
                    </ThemedText>
                  </View>
                </View>

                <ThemedText type="title" style={styles.ticketFullDate}>
                  {parsedDate?.fullDateText || plan.dateDisplay || 'Date Locked'}
                </ThemedText>

                {parsedDate?.time ? (
                  <View style={styles.ticketTimeRow}>
                    <Ionicons
                      name="time-outline"
                      size={15}
                      color={isDark ? '#A1A1AA' : '#71717A'}
                    />
                    <ThemedText style={styles.ticketTimeText}>
                      {parsedDate.time}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Attendance & RSVPs Card */}
            <View
              style={[
                styles.attendeesCard,
                {
                  backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                  borderColor: isDark ? '#26262B' : '#EFECE6',
                },
              ]}>
              <View style={styles.attendeesTop}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ThemedText type="body" weight="semiBold">
                    Who's coming
                  </ThemedText>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: isDark ? '#26262E' : '#EFECE6' },
                    ]}>
                    <ThemedText style={styles.countBadgeText}>
                      {goingRSVPs.length}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText type="caption" style={{ color: '#8E8D94' }}>
                  {goingRSVPs.length} going{maybeRSVPs.length > 0 ? ` · ${maybeRSVPs.length} maybe` : ''}
                </ThemedText>
              </View>

              {/* Going Members */}
              {goingRSVPs.length > 0 && (
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
                        size={15}
                        color="#10B981"
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* Maybe Members */}
              {maybeRSVPs.length > 0 && (
                <View style={[styles.membersGrid, { marginTop: 8 }]}>
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
                          { backgroundColor: 'rgba(244, 215, 122, 0.25)' },
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
                        size={15}
                        color="#F59E0B"
                      />
                    </View>
                  ))}
                </View>
              )}

              {goingRSVPs.length === 0 && maybeRSVPs.length === 0 && (
                <ThemedText style={styles.emptyRSVPText}>
                  No responses yet. Select below to RSVP!
                </ThemedText>
              )}
            </View>

            {/* RSVP Response Selector */}
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
                <View
                  style={[
                    styles.choiceBadge,
                    { backgroundColor: isDark ? '#26262E' : '#EFECE6' },
                  ]}>
                  <ThemedText style={styles.choiceBadgeText}>
                    {plan.allowMultiple === false ? 'Single Choice' : 'Multiple Choices'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="caption" style={styles.votingSub}>
                {plan.allowMultiple === false
                  ? 'Vote for the single best time that works for you:'
                  : 'Select all times that work for you:'}
              </ThemedText>
            </View>

            {/* Voting Options */}
            <View style={{ gap: 10 }}>
              {plan.options?.map((opt) => {
                const isSelected = opt.voterIds.includes(currentUser.name);
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
            </View>

            {/* Finalize Plan action for creator */}
            {isCreator && (
              <View style={styles.finalizeSection}>
                <PrimaryButton
                  title="Lock in Plan Time"
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
              Linked Decisions & Polls
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
                    <Ionicons name="bar-chart" size={18} color={accentColor} />
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerSection: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  creatorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorInitials: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
  },
  creatorText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#8E8D94',
  },
  creatorName: {
    fontFamily: 'Poppins_600SemiBold',
  },
  metaDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.3,
  },
  metaDetailsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  metaTextGroup: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.6,
    color: '#8E8D94',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
  },
  metaNoteText: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#8E8D94',
  },
  metaDivider: {
    height: 1,
    width: '100%',
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarBlock: {
    width: 68,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  calendarMonthHeader: {
    width: '100%',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.8,
  },
  calendarDayBody: {
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayNumber: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 26,
  },
  calendarWeekdayText: {
    fontSize: 9,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    marginTop: -2,
    letterSpacing: 0.4,
  },
  ticketDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  ticketStatusRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  miniLockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    gap: 4,
  },
  miniLockText: {
    fontSize: 9.5,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.6,
  },
  ticketFullDate: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 22,
  },
  ticketTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  ticketTimeText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#8E8D94',
  },
  attendeesCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  attendeesTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
  },
  countBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
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
    fontSize: 12.5,
    fontFamily: 'Poppins_500Medium',
  },
  emptyRSVPText: {
    color: '#8E8D94',
    fontSize: 13,
    fontStyle: 'italic',
  },
  votingContainer: {
    marginTop: 4,
  },
  votingHeader: {
    marginBottom: 14,
  },
  votingTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  votingSub: {
    color: '#8E8D94',
    marginTop: 3,
  },
  choiceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  choiceBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
  },
  finalizeSection: {
    marginTop: 16,
    marginBottom: 10,
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
    marginTop: 14,
    marginBottom: 10,
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
    padding: 14,
    borderRadius: 18,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollLinkTextGroup: {
    flex: 1,
  },
  pollQuestion: {
    fontSize: 14.5,
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  cancelMenuItem: {
    paddingVertical: 14,
    marginTop: 6,
  },
});
