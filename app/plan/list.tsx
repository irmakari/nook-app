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
import { AvatarStack } from '@/components/AvatarStack';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Plan, Space, SpaceMember, spaceService } from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpaceIcon } from '@/components/SpaceIcon';

export default function PlansListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [space, setSpace] = useState<Space | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (spaceId) {
        const foundSpace = await spaceService.getSpaceById(spaceId);
        if (foundSpace) setSpace(foundSpace);
        const loadedPlans = await spaceService.getPlans(spaceId);
        setPlans(loadedPlans);
      }
    };

    loadData();

    const unsubscribe = spaceService.subscribe(() => {
      loadData();
    });

    return () => unsubscribe();
  }, [spaceId]);

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
        <ThemedText type="subtitle">Loading plans...</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <ThemedText type="link">Go back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const accentColor = space.accentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);
  const subtleBorder = getAccentTint(accentColor, isDark ? 0.35 : 0.25);

  const handleOpenPlan = (planId: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/plan/[id]',
      params: { id: planId },
    });
  };

  const handleCreatePlan = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/plan/create',
      params: { spaceId: space.id },
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
      {/* Top Navigation Bar */}
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
          onPress={handleCreatePlan}
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
            name="add"
            size={20}
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
        {/* Page Title */}
        <View style={styles.titleRow}>
          <ThemedText type="hero" style={styles.screenTitle}>
            Plans
          </ThemedText>
          <ThemedText type="caption" style={styles.countBadge}>
            {plans.length} {plans.length === 1 ? 'upcoming plan' : 'upcoming plans'}
          </ThemedText>
        </View>

        {/* Empty State */}
        {plans.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                borderColor: isDark ? '#26262B' : '#EFECE6',
              },
            ]}>
            <Ionicons
              name="calendar-outline"
              size={36}
              color={accentColor}
              style={{ marginBottom: 10 }}
            />
            <ThemedText type="body" weight="semiBold" style={styles.emptyTitle}>
              No plans yet.
            </ThemedText>
            <ThemedText type="caption" style={styles.emptySubtitle}>
              Organize trips, dinner gatherings, or movie nights together.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.plansList}>
            {plans.map((plan) => {
              const currentUser = spaceService.getCurrentUser();
              const isConfirmed = plan.status === 'confirmed';
              const userRsvp = plan.rsvps?.find((r) => r.userId === currentUser.name)?.status;
              const hasVoted = plan.options?.some((opt) => opt.voterIds.includes(currentUser.name)) || false;
              
              // Attendees / Voters mapping
              let attendees: SpaceMember[] = [];
              let summaryText = '';
              
              if (isConfirmed) {
                const goingRSVPs = plan.rsvps?.filter((r) => r.status === 'going') || [];
                const maybeRSVPs = plan.rsvps?.filter((r) => r.status === 'maybe') || [];
                attendees = goingRSVPs.map((r) => ({ name: r.userName, initials: r.initials }));
                summaryText = `${goingRSVPs.length} going`;
                if (maybeRSVPs.length > 0) {
                  summaryText += ` · ${maybeRSVPs.length} maybe`;
                }
              } else {
                const allVoters: SpaceMember[] = [];
                const voterNames = new Set<string>();
                plan.options?.forEach((opt) => {
                  opt.voters?.forEach((v) => {
                    if (!voterNames.has(v.name)) {
                      voterNames.add(v.name);
                      allVoters.push(v);
                    }
                  });
                });
                attendees = allVoters;
                const totalVotes = plan.options?.reduce((acc, opt) => acc + opt.voters.length, 0) || 0;
                summaryText = `${totalVotes} total votes`;
              }

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => handleOpenPlan(plan.id)}
                  style={({ pressed }) => [
                    styles.planCard,
                    {
                      backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                      borderColor: isDark ? '#26262B' : '#EFECE6',
                      opacity: pressed ? 0.96 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
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

                    <ThemedText type="caption" style={styles.creatorLabel}>
                      By {plan.createdBy}
                    </ThemedText>
                  </View>

                  {/* Plan Title */}
                  <ThemedText type="subtitle" style={styles.planTitle} numberOfLines={2}>
                    {plan.title}
                  </ThemedText>

                  {/* Date & Location */}
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={isDark ? '#A1A1AA' : '#71717A'}
                      />
                      <ThemedText style={styles.detailText}>
                        {isConfirmed ? plan.dateDisplay || 'Date locked' : 'Choosing a time'}
                      </ThemedText>
                    </View>

                    {plan.location ? (
                      <View style={styles.detailItem}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={isDark ? '#A1A1AA' : '#71717A'}
                        />
                        <ThemedText style={styles.detailText} numberOfLines={1}>
                          {plan.location}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>

                  {/* Divider */}
                  <View style={[styles.cardDivider, { backgroundColor: isDark ? '#26262B' : '#F0ECE4' }]} />

                  {/* Footer (Attendee stack + count text) */}
                  <View style={styles.footerRow}>
                    {attendees.length > 0 ? (
                      <AvatarStack
                        members={attendees}
                        max={3}
                        size={24}
                        ringColor={isDark ? '#1A1A1E' : '#FFFFFF'}
                      />
                    ) : (
                      <View />
                    )}

                    <View style={styles.footerRight}>
                      {isConfirmed ? (
                        userRsvp === 'going' ? (
                          <View style={[styles.userBadge, styles.goingBadge]}>
                            <ThemedText style={[styles.userBadgeText, { color: '#10B981' }]}>✓ Going</ThemedText>
                          </View>
                        ) : userRsvp === 'maybe' ? (
                          <View style={[styles.userBadge, styles.maybeBadge]}>
                            <ThemedText style={[styles.userBadgeText, { color: '#F59E0B' }]}>? Maybe</ThemedText>
                          </View>
                        ) : userRsvp === 'declined' ? (
                          <View style={[styles.userBadge, styles.declinedBadge]}>
                            <ThemedText style={[styles.userBadgeText, { color: '#EF4444' }]}>✕ No</ThemedText>
                          </View>
                        ) : (
                          <View style={[styles.userBadge, styles.pendingBadge]}>
                            <ThemedText style={[styles.userBadgeText, { color: '#8E8D94' }]}>RSVP Needed</ThemedText>
                          </View>
                        )
                      ) : (
                        hasVoted ? (
                          <View style={[styles.userBadge, { backgroundColor: isDark ? 'rgba(127, 185, 230, 0.15)' : 'rgba(127, 185, 230, 0.12)', borderColor: isDark ? 'rgba(127, 185, 230, 0.25)' : 'rgba(127, 185, 230, 0.2)' }]}>
                            <ThemedText style={[styles.userBadgeText, { color: accentColor }]}>✓ Voted</ThemedText>
                          </View>
                        ) : (
                          <View style={[styles.userBadge, { backgroundColor: 'rgba(255, 143, 69, 0.1)', borderColor: 'rgba(255, 143, 69, 0.2)' }]}>
                            <ThemedText style={[styles.userBadgeText, { color: '#FF8F45' }]}>Vote Needed</ThemedText>
                          </View>
                        )
                      )}

                      <ThemedText style={styles.attendanceText}>
                        {summaryText}
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom "+ Add a plan" Button */}
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
          title="+ Add a plan"
          onPress={handleCreatePlan}
          backgroundColor={accentColor}
        />
      </View>
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
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  countBadge: {
    color: '#8E8D94',
    fontSize: 13,
  },
  emptyBox: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 17,
    marginBottom: 2,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#8E8D94',
    textAlign: 'center',
  },
  plansList: {
    gap: 16,
  },
  planCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  creatorLabel: {
    marginLeft: 'auto',
    color: '#8E8D94',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    alignSelf: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  userBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  goingBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  maybeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  declinedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(142, 141, 148, 0.1)',
    borderColor: 'rgba(142, 141, 148, 0.2)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontSize: 9,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#8E8D94',
  },
  cardDivider: {
    height: 1,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendanceText: {
    fontSize: 13,
    color: '#8E8D94',
    fontFamily: 'Poppins_500Medium',
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
