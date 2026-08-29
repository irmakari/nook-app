import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AssigneeSelector } from '@/components/AssigneeSelector';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Space, spaceService } from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DUE_OPTIONS = [
  { label: 'No date', value: undefined },
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
];

export default function CreateTodoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [space, setSpace] = useState<Space | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [dueAt, setDueAt] = useState<string | undefined>('today');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [notice, setNotice] = useState<string | null>(null);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      setNotice('Please enter a task title.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await spaceService.createTask({
        spaceId: spaceId || 'ev',
        title: title.trim(),
        note: note.trim() || undefined,
        assignedTo,
        dueAt,
      });

      router.replace({
        pathname: '/todo/[id]',
        params: { id: spaceId || 'ev' },
      });
    } catch (err) {
      console.error('Error creating to-do:', err);
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
      <View style={styles.headerWrapper}>
        <ScreenHeader
          showBackButton
          onBackPress={() => router.back()}
          title="Add a to-do"
          subtitle="What needs doing?"
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}>
        {/* Task Title Input */}
        <View style={styles.inputGroup}>
          <ThemedText type="caption" style={styles.label}>
            TASK
          </ThemedText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Empty the dishwasher, Take out the trash"
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

        {/* Who's doing it? */}
        {space && (
          <View style={styles.inputGroup}>
            <ThemedText type="caption" style={styles.label}>
              {"WHO'S DOING IT?"}
            </ThemedText>
            <AssigneeSelector
              members={space.members}
              selectedAssignee={assignedTo}
              onSelectAssignee={setAssignedTo}
              accentColor={accentColor}
            />
          </View>
        )}

        {/* When? Due Date */}
        <View style={styles.inputGroup}>
          <ThemedText type="caption" style={styles.label}>
            WHEN?
          </ThemedText>
          <View style={styles.datePillsRow}>
            {DUE_OPTIONS.map((opt) => {
              const isSelected = dueAt === opt.value;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setDueAt(opt.value);
                  }}
                  style={[
                    styles.datePill,
                    {
                      backgroundColor: isSelected
                        ? softTint
                        : isDark
                        ? '#1A1A1E'
                        : '#FFFFFF',
                      borderColor: isSelected
                        ? accentColor
                        : isDark
                        ? '#26262B'
                        : '#EFECE6',
                    },
                  ]}>
                  <ThemedText
                    style={[
                      styles.datePillText,
                      {
                        color: isSelected
                          ? isDark
                            ? '#F4F4F5'
                            : '#18181B'
                          : isDark
                          ? '#A1A1AA'
                          : '#71717A',
                      },
                    ]}>
                    {opt.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Optional Note */}
        <View style={styles.inputGroup}>
          <ThemedText type="caption" style={styles.label}>
            ADD A NOTE (OPTIONAL)
          </ThemedText>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Before guests arrive"
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
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
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
          title="Add To-do"
          onPress={handleCreateTask}
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
    paddingTop: 4,
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
  datePillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  datePill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
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
