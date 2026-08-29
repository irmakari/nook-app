import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Space, spaceService } from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface OptionDraft {
  id: string;
  text: string;
}

export default function CreatePollScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [space, setSpace] = useState<Space | null>(null);

  // Form states
  const [question, setQuestion] = useState('');
  const [note, setNote] = useState('');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [membersCanAddOptions, setMembersCanAddOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [options, setOptions] = useState<OptionDraft[]>([
    { id: '1', text: "Cecconi's" },
    { id: '2', text: 'Basta' },
    { id: '3', text: 'Il Sud' },
  ]);

  useEffect(() => {
    const loadSpace = async () => {
      if (spaceId) {
        const found = await spaceService.getSpaceById(spaceId);
        if (found) setSpace(found);
      }
    };
    loadSpace();
  }, [spaceId]);

  const accentColor = space?.accentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  const handleAddOption = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const newId = (options.length + 1).toString();
    setOptions([...options, { id: newId, text: '' }]);
  };

  const handleRemoveOption = (idToRemove: string) => {
    if (options.length <= 2) {
      if (Platform.OS === 'web') {
        alert('A poll requires at least 2 options.');
      } else {
        Alert.alert('Notice', 'A poll requires at least 2 options.');
      }
      return;
    }
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setOptions(options.filter((o) => o.id !== idToRemove));
  };

  const handleUpdateOption = (id: string, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleCreatePoll = async () => {
    if (!question.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a poll question.');
      } else {
        Alert.alert('Notice', 'Please enter a poll question.');
      }
      return;
    }

    const validOptions = options.map((o) => o.text.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      if (Platform.OS === 'web') {
        alert('Please provide at least 2 non-empty options.');
      } else {
        Alert.alert('Notice', 'Please provide at least 2 non-empty options.');
      }
      return;
    }

    try {
      setIsSubmitting(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const created = await spaceService.createPoll({
        spaceId: spaceId || 'kankiler',
        question: question.trim(),
        note: note.trim() || undefined,
        options: validOptions,
        allowMultiple,
        membersCanAddOptions,
      });

      router.replace({
        pathname: '/poll/[id]',
        params: { id: created.id },
      });
    } catch (err) {
      console.error('Error creating poll:', err);
    } finally {
      setIsSubmitting(false);
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
      {/* Header */}
      <View style={styles.headerWrapper}>
        <ScreenHeader
          showBackButton
          onBackPress={() => router.back()}
          title="Start a poll"
          subtitle="Let the group decide."
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}>
        {/* 1. Poll Question */}
        <View style={styles.inputGroup}>
          <ThemedText type="caption" style={styles.label}>
            POLL QUESTION
          </ThemedText>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="e.g. Where should we eat? Which movie?"
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
          <ThemedText type="caption" style={styles.label}>
            ADD A NOTE (OPTIONAL)
          </ThemedText>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Saturday lunch after Kadıköy"
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

        {/* 3. Options List */}
        <View style={styles.inputGroup}>
          <ThemedText type="caption" style={styles.label}>
            OPTIONS ({options.length})
          </ThemedText>

          {options.map((opt, index) => (
            <View
              key={opt.id}
              style={[
                styles.optionRow,
                {
                  backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                  borderColor: isDark ? '#26262B' : '#EFECE6',
                },
              ]}>
              <View style={styles.optionIndexCircle}>
                <ThemedText style={styles.optionIndexText}>
                  {index + 1}
                </ThemedText>
              </View>

              <TextInput
                value={opt.text}
                onChangeText={(val) => handleUpdateOption(opt.id, val)}
                placeholder={`Option ${index + 1}`}
                placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                style={[
                  styles.optionInput,
                  { color: isDark ? '#F4F4F5' : '#18181B' },
                ]}
              />

              <Pressable
                onPress={() => handleRemoveOption(opt.id)}
                style={styles.deleteBtn}>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={isDark ? '#71717A' : '#A1A1AA'}
                />
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={handleAddOption}
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
              Add option
            </ThemedText>
          </Pressable>
        </View>

        {/* 4. Voting Mode: One option vs Multiple options */}
        <View style={styles.inputGroup}>
          <ThemedText type="caption" style={styles.label}>
            PEOPLE CAN CHOOSE
          </ThemedText>
          <View style={styles.choicesRow}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setAllowMultiple(false);
              }}
              style={[
                styles.choiceCard,
                {
                  backgroundColor:
                    !allowMultiple
                      ? softTint
                      : isDark
                      ? '#1A1A1E'
                      : '#FFFFFF',
                  borderColor:
                    !allowMultiple
                      ? accentColor
                      : isDark
                      ? '#26262B'
                      : '#EFECE6',
                },
              ]}>
              <ThemedText
                style={[
                  styles.choiceTitle,
                  !allowMultiple && {
                    color: isDark ? '#F4F4F5' : '#18181B',
                  },
                ]}>
                One option
              </ThemedText>
              <ThemedText type="caption" style={styles.choiceSub}>
                Single choice
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setAllowMultiple(true);
              }}
              style={[
                styles.choiceCard,
                {
                  backgroundColor:
                    allowMultiple
                      ? softTint
                      : isDark
                      ? '#1A1A1E'
                      : '#FFFFFF',
                  borderColor:
                    allowMultiple
                      ? accentColor
                      : isDark
                      ? '#26262B'
                      : '#EFECE6',
                },
              ]}>
              <ThemedText
                style={[
                  styles.choiceTitle,
                  allowMultiple && {
                    color: isDark ? '#F4F4F5' : '#18181B',
                  },
                ]}>
                Multiple options
              </ThemedText>
              <ThemedText type="caption" style={styles.choiceSub}>
                Select all that fit
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* 5. Members Can Add Options Toggle */}
        <View
          style={[
            styles.toggleCard,
            {
              backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
              borderColor: isDark ? '#26262B' : '#EFECE6',
            },
          ]}>
          <View style={styles.toggleTextGroup}>
            <ThemedText type="body" weight="semiBold">
              Let others add options
            </ThemedText>
            <ThemedText type="caption" style={{ color: '#8E8D94' }}>
              Friends can suggest new choices to this poll
            </ThemedText>
          </View>
          <Switch
            value={membersCanAddOptions}
            onValueChange={(val) => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setMembersCanAddOptions(val);
            }}
            trackColor={{ false: isDark ? '#3F3F46' : '#E4E4E7', true: accentColor }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
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
          title="Create Poll"
          onPress={handleCreatePoll}
          loading={isSubmitting}
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
  headerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    fontSize: 11,
    letterSpacing: 0.6,
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  optionIndexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(142, 141, 148, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndexText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#71717A',
  },
  optionInput: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    paddingVertical: 4,
  },
  deleteBtn: {
    padding: 4,
  },
  addOptionBtn: {
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
  choicesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  choiceTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  choiceSub: {
    color: '#8E8D94',
    marginTop: 1,
    fontSize: 11,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  toggleTextGroup: {
    flex: 1,
    paddingRight: 12,
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
