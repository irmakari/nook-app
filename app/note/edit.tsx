import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Note, Space, spaceService } from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditNoteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [note, setNote] = useState<Note | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      if (id) {
        const found = await spaceService.getNoteById(id);
        if (found) {
          setNote(found);
          setTitle(found.title || '');
          setContent(found.content);
          setIsPinned(!!found.isPinned);
          const foundSpace = await spaceService.getSpaceById(found.spaceId);
          if (foundSpace) setSpace(foundSpace);
        }
      }
    };
    loadNote();
  }, [id]);

  if (!note) {
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
        <ThemedText type="subtitle">Loading note...</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <ThemedText type="link">Go back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const accentColor = space?.accentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);

  const handleSaveChanges = async () => {
    if (!content.trim()) {
      if (Platform.OS === 'web') {
        alert('Please write some note content.');
      } else {
        Alert.alert('Notice', 'Please write some note content.');
      }
      return;
    }

    try {
      setIsSubmitting(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await spaceService.updateNote(note.id, {
        title: title.trim() || undefined,
        content: content.trim(),
        isPinned,
      });

      router.back();
    } catch (err) {
      console.error('Error updating note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenContainer variant="modal">
        <View style={styles.headerWrapper}>
          <ScreenHeader
            showBackButton
            onBackPress={() => router.back()}
            title="Edit note"
            subtitle={space ? `In ${space.name}` : undefined}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 90, 110) },
          ]}>
          {/* Optional Title Input */}
          <View style={styles.inputGroup}>
            <ThemedText type="label" style={styles.label}>
              TITLE (OPTIONAL)
            </ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Wi-Fi password, Trip details"
              placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
              style={[
                styles.titleInput,
                {
                  backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                  color: isDark ? '#F4F4F5' : '#18181B',
                  borderColor: isDark ? '#26262B' : '#EBE7E0',
                },
              ]}
            />
          </View>

          {/* Note Content */}
          <View style={styles.inputGroup}>
            <ThemedText type="label" style={styles.label}>
              NOTE
            </ThemedText>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write something..."
              placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
              multiline
              textAlignVertical="top"
              style={[
                styles.contentInput,
                {
                  backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                  color: isDark ? '#F4F4F5' : '#18181B',
                  borderColor: isDark ? '#26262B' : '#EBE7E0',
                },
              ]}
            />
          </View>

          {/* Pin Note Option */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setIsPinned(!isPinned);
            }}
            style={[
              styles.pinToggleRow,
              {
                backgroundColor: isPinned
                  ? softTint
                  : isDark
                  ? '#1A1A1E'
                  : '#FFFFFF',
                borderColor: isPinned
                  ? accentColor
                  : isDark
                  ? '#26262B'
                  : '#EFECE6',
              },
            ]}>
            <View style={styles.pinTextWrapper}>
              <Ionicons
                name={isPinned ? 'pin' : 'pin-outline'}
                size={18}
                color={isPinned ? accentColor : isDark ? '#A1A1AA' : '#71717A'}
              />
              <ThemedText
                style={[
                  styles.pinLabel,
                  {
                    color: isPinned
                      ? isDark
                        ? '#F4F4F5'
                        : '#18181B'
                      : isDark
                      ? '#A1A1AA'
                      : '#71717A',
                  },
                ]}>
                Pin note to top of Space
              </ThemedText>
            </View>

            <View
              style={[
                styles.checkboxBox,
                {
                  backgroundColor: isPinned ? accentColor : 'transparent',
                  borderColor: isPinned
                    ? accentColor
                    : isDark
                    ? '#3F3F46'
                    : '#D4D4D8',
                },
              ]}>
              {isPinned && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
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
            title="Save changes"
            onPress={handleSaveChanges}
            loading={isSubmitting}
            backgroundColor={accentColor}
            disabled={!content.trim()}
          />
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 8,
  },
  titleInput: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
  },
  contentInput: {
    minHeight: 160,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  pinToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 4,
  },
  pinTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pinLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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
