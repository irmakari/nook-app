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
import { NoteCard } from '@/components/NoteCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Note, Space, spaceService } from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpaceIcon } from '@/components/SpaceIcon';

export default function NotesListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [space, setSpace] = useState<Space | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (spaceId) {
        const foundSpace = await spaceService.getSpaceById(spaceId);
        if (foundSpace) setSpace(foundSpace);
        const loadedNotes = await spaceService.getNotes(spaceId);
        setNotes(loadedNotes);
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
        <ThemedText type="subtitle">Loading notes...</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <ThemedText type="link">Go back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const accentColor = space.accentColor || '#7FB9E6';
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const regularNotes = notes.filter((n) => !n.isPinned);

  const handleOpenNote = (noteId: string) => {
    router.push({
      pathname: '/note/[id]',
      params: { id: noteId },
    });
  };

  const handleCreateNote = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/note/create',
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
          onPress={handleCreateNote}
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
        {/* Screen Title */}
        <View style={styles.titleRow}>
          <ThemedText type="screenTitle">
            Notes
          </ThemedText>
          <ThemedText type="caption" style={styles.countBadge}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </ThemedText>
        </View>

        {/* Empty State */}
        {notes.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                borderColor: isDark ? '#26262B' : '#EFECE6',
              },
            ]}>
            <Ionicons
              name="document-text-outline"
              size={36}
              color={accentColor}
              style={{ marginBottom: 10 }}
            />
            <ThemedText type="body" weight="semiBold" style={styles.emptyTitle}>
              Nothing written down yet.
            </ThemedText>
            <ThemedText type="caption" style={styles.emptySubtitle}>
              Keep Wi-Fi passwords, house details, or trip notes here.
            </ThemedText>
          </View>
        ) : (
          <>
            {/* PINNED SECTION */}
            {pinnedNotes.length > 0 && (
              <View style={styles.sectionBlock}>
                <ThemedText type="label" style={styles.sectionLabel}>
                  PINNED ({pinnedNotes.length})
                </ThemedText>
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    accentColor={accentColor}
                    onPress={handleOpenNote}
                  />
                ))}
              </View>
            )}

            {/* NOTES SECTION */}
            {regularNotes.length > 0 && (
              <View style={styles.sectionBlock}>
                {pinnedNotes.length > 0 && (
                  <ThemedText type="label" style={styles.sectionLabel}>
                    NOTES ({regularNotes.length})
                  </ThemedText>
                )}
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    accentColor={accentColor}
                    onPress={handleOpenNote}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating / Sticky Bottom Create Button */}
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
          title="+ Add a note"
          onPress={handleCreateNote}
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
  sectionBlock: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
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
