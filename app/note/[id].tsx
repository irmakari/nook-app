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
import { Note, Space, spaceService } from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpaceIcon } from '@/components/SpaceIcon';
import { ConfirmModal } from '@/components/ConfirmModal';

const formatDetailedTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 5) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NoteDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [note, setNote] = useState<Note | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    const loadNoteAndSpace = async () => {
      if (id) {
        const found = await spaceService.getNoteById(id);
        if (found) {
          setNote(found);
          const foundSpace = await spaceService.getSpaceById(found.spaceId);
          if (foundSpace) setSpace(foundSpace);
        }
      }
    };

    loadNoteAndSpace();

    const unsubscribe = spaceService.subscribe(() => {
      loadNoteAndSpace();
    });

    return () => unsubscribe();
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

  const handleTogglePin = async () => {
    setMenuVisible(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await spaceService.togglePinNote(note.id);
  };

  const handleEditNote = () => {
    setMenuVisible(false);
    router.push({
      pathname: '/note/edit',
      params: { id: note.id },
    });
  };

  const handleDeleteNote = () => {
    setMenuVisible(false);
    setTimeout(() => {
      setConfirmDeleteVisible(true);
    }, 150);
  };

  const handleConfirmDeleteNote = async () => {
    if (note) {
      await spaceService.deleteNote(note.id);
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
            setMenuVisible(true);
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
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}>
        {/* Pinned Pill if pinned */}
        {note.isPinned && (
          <View style={[styles.pinBadge, { backgroundColor: softTint }]}>
            <Ionicons name="pin" size={13} color={accentColor} />
            <ThemedText style={[styles.pinBadgeText, { color: accentColor }]}>
              PINNED NOTE
            </ThemedText>
          </View>
        )}

        {/* Note Title if present */}
        {note.title ? (
          <ThemedText type="hero" style={styles.noteTitle}>
            {note.title}
          </ThemedText>
        ) : null}

        {/* Note Content */}
        <ThemedText style={styles.noteContent}>{note.content}</ThemedText>

        {/* Author and Updated Time Footer */}
        <View
          style={[
            styles.footerCard,
            {
              borderTopColor: isDark ? '#26262B' : '#EFECE6',
            },
          ]}>
          <Ionicons
            name="time-outline"
            size={14}
            color="#8E8D94"
            style={{ marginRight: 6 }}
          />
          <ThemedText style={styles.footerText}>
            {note.createdBy} · Updated {formatDetailedTime(note.updatedAt)}
          </ThemedText>
        </View>
      </ScrollView>

      {/* Overflow Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.menuOverlay}>
          <Pressable
            style={styles.menuBackdrop}
            onPress={() => setMenuVisible(false)}
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
              Note Options
            </ThemedText>

            {/* Pin / Unpin */}
            <Pressable
              onPress={handleTogglePin}
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
                name={note.isPinned ? 'pin' : 'pin-outline'}
                size={20}
                color={isDark ? '#F4F4F5' : '#18181B'}
              />
              <ThemedText style={styles.menuItemText}>
                {note.isPinned ? 'Unpin from top' : 'Pin to top'}
              </ThemedText>
            </Pressable>

            {/* Edit note */}
            <Pressable
              onPress={handleEditNote}
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
                name="create-outline"
                size={20}
                color={isDark ? '#F4F4F5' : '#18181B'}
              />
              <ThemedText style={styles.menuItemText}>Edit note</ThemedText>
            </Pressable>

            {/* Delete note */}
            <Pressable
              onPress={handleDeleteNote}
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
                Delete note
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setMenuVisible(false)}
              style={styles.cancelMenuItem}>
              <ThemedText style={{ color: '#8E8D94', textAlign: 'center' }}>
                Cancel
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Custom Delete Note Confirm Modal */}
      <ConfirmModal
        visible={confirmDeleteVisible}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        accentColor={space?.accentColor || '#7FB9E6'}
        icon="trash-outline"
        onConfirm={handleConfirmDeleteNote}
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
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 6,
    marginBottom: 12,
  },
  pinBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.6,
  },
  noteTitle: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 16,
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 25,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 28,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    color: '#8E8D94',
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
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
