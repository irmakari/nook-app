import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PlanModeSelector, PlanMode } from '@/components/PlanModeSelector';
import { MemberSelector } from '@/components/MemberSelector';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Space, SpaceMember, spaceService } from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface VotingOptionDraft {
  id: string;
  date: string;
  time: string;
}

export default function CreatePlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [space, setSpace] = useState<Space | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [mode, setMode] = useState<PlanMode>('know');
  const [singleDate, setSingleDate] = useState('Saturday, Sep 5');
  const [singleTime, setSingleTime] = useState('10:00');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('Kadıköy');
  const [selectedMembers, setSelectedMembers] = useState<SpaceMember[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(true);

  // Voting options
  const [votingOptions, setVotingOptions] = useState<VotingOptionDraft[]>([
    { id: '1', date: 'Saturday, Sep 5', time: '10:00' },
    { id: '2', date: 'Saturday, Sep 5', time: '12:00' },
    { id: '3', date: 'Sunday, Sep 6', time: '11:00' },
  ]);

  useEffect(() => {
    const loadSpace = async () => {
      if (spaceId) {
        const found = await spaceService.getSpaceById(spaceId);
        if (found) {
          setSpace(found);
          setSelectedMembers([...found.members]);
        }
      }
    };
    loadSpace();
  }, [spaceId]);

  const accentColor = space?.accentColor || '#7FB9E6';

  const handleAddVotingOption = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const newId = (votingOptions.length + 1).toString();
    setVotingOptions([
      ...votingOptions,
      { id: newId, date: 'Next weekend', time: '14:00' },
    ]);
  };

  const [notice, setNotice] = useState<string | null>(null);

  const handleRemoveVotingOption = (idToRemove: string) => {
    if (votingOptions.length <= 2) {
      setNotice('A voting plan requires at least 2 options.');
      return;
    }
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setVotingOptions(votingOptions.filter((o) => o.id !== idToRemove));
  };

  const handleUpdateVotingOption = (
    id: string,
    field: 'date' | 'time',
    val: string
  ) => {
    setVotingOptions(
      votingOptions.map((o) => (o.id === id ? { ...o, [field]: val } : o))
    );
  };

  const handleCreatePlan = async () => {
    if (!title.trim()) {
      setNotice('Please enter a plan name.');
      return;
    }

    if (mode === 'vote' && votingOptions.length < 2) {
      setNotice('Please provide at least 2 options for voting.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const created = await spaceService.createPlan({
        spaceId: spaceId || 'kankiler',
        title: title.trim(),
        note: note.trim() || undefined,
        location: location.trim() || undefined,
        mode,
        singleDate: singleDate.trim() || 'This weekend',
        singleTime: singleTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        votingOptions:
          mode === 'vote'
            ? votingOptions.map((v) => ({ date: v.date, time: v.time }))
            : undefined,
        invitedMembers: selectedMembers,
        allowMultiple,
      });

      router.replace({
        pathname: '/plan/[id]',
        params: { id: created.id },
      });
    } catch (err) {
      console.error('Error creating plan:', err);
      setNotice(err instanceof Error ? err.message : 'Error creating plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.headerWrapper}>
        <ScreenHeader
          showBackButton
          onBackPress={() => router.back()}
          title="Make a plan"
          subtitle="What's happening?"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}>
        {/* 1. Plan Name */}
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            PLAN NAME
          </ThemedText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Saturday in Kadıköy, Sunset Drinks"
            placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                color: isDark ? '#F4F4F5' : '#18181B',
                borderColor: isDark ? '#26262B' : '#EBE7E0',
              },
            ]}
            autoFocus
          />
        </View>

        {/* 2. Optional Note */}
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            ADD A NOTE (OPTIONAL)
          </ThemedText>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Kahvaltı + biraz gezme, bring sunglasses"
            placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                color: isDark ? '#F4F4F5' : '#18181B',
                borderColor: isDark ? '#26262B' : '#EBE7E0',
              },
            ]}
          />
        </View>

        {/* 3. When? Mode Decision */}
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            WHEN?
          </ThemedText>
          <PlanModeSelector
            selectedMode={mode}
            onSelectMode={setMode}
            accentColor={accentColor}
          />
        </View>

        {/* Mode A: Single Date / Time */}
        {mode === 'know' && (
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText type="label" style={styles.label}>
                  DATE
                </ThemedText>
                <TextInput
                  value={singleDate}
                  onChangeText={setSingleDate}
                  placeholder="e.g. Saturday, Sep 5"
                  placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                      color: isDark ? '#F4F4F5' : '#18181B',
                      borderColor: isDark ? '#26262B' : '#EBE7E0',
                    },
                  ]}
                />
              </View>

              <View style={[styles.inputGroup, { width: 110 }]}>
                <ThemedText type="label" style={styles.label}>
                  START TIME
                </ThemedText>
                <TextInput
                  value={singleTime}
                  onChangeText={setSingleTime}
                  placeholder="10:00"
                  placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                      color: isDark ? '#F4F4F5' : '#18181B',
                      borderColor: isDark ? '#26262B' : '#EBE7E0',
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="label" style={styles.label}>
                END TIME (OPTIONAL)
              </ThemedText>
              <TextInput
                value={endTime}
                onChangeText={setEndTime}
                placeholder="e.g. 14:00"
                placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                    color: isDark ? '#F4F4F5' : '#18181B',
                    borderColor: isDark ? '#26262B' : '#EBE7E0',
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Mode B: Multi-option Voting List */}
        {mode === 'vote' && (
          <View style={styles.votingOptionsContainer}>
            <ThemedText type="label" style={styles.label}>
              PROPOSED TIMES ({votingOptions.length})
            </ThemedText>

            {votingOptions.map((opt, index) => (
              <View
                key={opt.id}
                style={[
                  styles.optionDraftCard,
                  {
                    backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                    borderColor: isDark ? '#26262B' : '#EFECE6',
                  },
                ]}>
                <View style={styles.optionIndexBadge}>
                  <ThemedText style={styles.optionIndexText}>
                    {index + 1}
                  </ThemedText>
                </View>

                <TextInput
                  value={opt.date}
                  onChangeText={(val) =>
                    handleUpdateVotingOption(opt.id, 'date', val)
                  }
                  placeholder="Date (e.g. Saturday)"
                  placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                  style={[
                    styles.draftInput,
                    {
                      color: isDark ? '#F4F4F5' : '#18181B',
                      flex: 1,
                    },
                  ]}
                />

                <TextInput
                  value={opt.time}
                  onChangeText={(val) =>
                    handleUpdateVotingOption(opt.id, 'time', val)
                  }
                  placeholder="10:00"
                  placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                  style={[
                    styles.draftInput,
                    {
                      color: isDark ? '#F4F4F5' : '#18181B',
                      width: 70,
                    },
                  ]}
                />

                <Pressable
                  onPress={() => handleRemoveVotingOption(opt.id)}
                  style={styles.deleteOptionBtn}>
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={isDark ? '#71717A' : '#A1A1AA'}
                  />
                </Pressable>
              </View>
            ))}

            <Pressable
              onPress={handleAddVotingOption}
              style={({ pressed }) => [
                styles.addOptionButton,
                {
                  backgroundColor: pressed
                    ? isDark
                      ? '#24242A'
                      : '#F5F2EB'
                    : 'transparent',
                  borderColor: isDark ? '#2B2B33' : '#E5E1D8',
                },
              ]}>
              <Ionicons name="add" size={18} color={accentColor} />
              <ThemedText
                style={[styles.addOptionText, { color: accentColor }]}>
                Add another option
              </ThemedText>
            </Pressable>

            {/* Allow Multiple choices Switch */}
            <View
              style={[
                styles.switchGroup,
                { borderTopColor: isDark ? '#26262B' : '#EFECE6' },
              ]}>
              <View style={styles.switchTextGroup}>
                <ThemedText type="body" weight="medium">
                  Allow multiple choices
                </ThemedText>
                <ThemedText type="caption" style={styles.switchHelp}>
                  People can vote for more than one date/time
                </ThemedText>
              </View>
              <Switch
                value={allowMultiple}
                onValueChange={setAllowMultiple}
                trackColor={{ false: '#767577', true: accentColor }}
                thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : allowMultiple ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
          </View>
        )}

        {/* 4. Where? Location */}
        <View style={styles.inputGroup}>
          <ThemedText type="label" style={styles.label}>
            WHERE? (OPTIONAL)
          </ThemedText>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Kadıköy, Soho House, Bebek"
            placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                color: isDark ? '#F4F4F5' : '#18181B',
                borderColor: isDark ? '#26262B' : '#EBE7E0',
              },
            ]}
          />
        </View>

        {/* 5. Who's invited? */}
        {space && (
          <View style={styles.inputGroup}>
            <ThemedText type="label" style={styles.label}>
              {"WHO'S INVITED?"}
            </ThemedText>
            <MemberSelector
              spaceName={space.name}
              allMembers={space.members}
              selectedMembers={selectedMembers}
              onUpdateSelectedMembers={setSelectedMembers}
              accentColor={accentColor}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? '#121214' : '#FAF8F5',
            borderTopColor: isDark ? '#222227' : '#EFECE6',
            bottom: 0,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 16,
          },
        ]}>
        <PrimaryButton
          title="Create Plan"
          onPress={handleCreatePlan}
          loading={isSubmitting}
          backgroundColor={accentColor}
        />
      </View>

      {/* Notice Dialog */}
      <ConfirmModal
        visible={!!notice}
        title="Notice"
        message={notice || ''}
        confirmText="Got it"
        cancelText=""
        accentColor={accentColor}
        icon="information-circle-outline"
        onConfirm={() => setNotice(null)}
        onCancel={() => setNotice(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
  },
  dateTimeContainer: {
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  votingOptionsContainer: {
    marginBottom: 20,
  },
  optionDraftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  optionIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(142, 141, 148, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#71717A',
  },
  draftInput: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    paddingVertical: 6,
  },
  deleteOptionBtn: {
    padding: 6,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 6,
    marginTop: 4,
  },
  addOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  switchTextGroup: {
    flex: 1,
    paddingRight: 16,
  },
  switchHelp: {
    color: '#8E8D94',
    marginTop: 2,
  },
});
