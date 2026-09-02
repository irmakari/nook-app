import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { SpaceCard } from '@/components/SpaceCard';
import { ConfirmModal } from '@/components/ConfirmModal';
import { SpaceActionSheet } from '@/components/SpaceActionSheet';
import { EditSpaceModal } from '@/components/EditSpaceModal';
import { ReorderSpacesModal } from '@/components/ReorderSpacesModal';
import { nookSpaceColors } from '@/constants/theme';
import { Space, spaceService } from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);
  const [actionSheetSpace, setActionSheetSpace] = useState<Space | null>(null);
  const [editModalSpace, setEditModalSpace] = useState<Space | null>(null);
  const [reorderModalVisible, setReorderModalVisible] = useState(false);

  useEffect(() => {
    // Load spaces from service layer
    const loadSpaces = async () => {
      const loaded = await spaceService.getSpaces();
      setSpaces(loaded);
    };

    loadSpaces();

    // Subscribe to updates from create space flow
    const unsubscribe = spaceService.subscribe(() => {
      loadSpaces();
    }, ['spaces', 'session']);

    return () => unsubscribe();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleNavigateCreate = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/create-space');
  };

  const handleOpenSpace = (spaceId: string) => {
    router.push({
      pathname: '/space/[id]',
      params: { id: spaceId },
    });
  };

  const handleConfirmDelete = async () => {
    if (spaceToDelete) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await spaceService.deleteSpace(spaceToDelete.id);
      setSpaceToDelete(null);
      const updated = await spaceService.getSpaces();
      setSpaces(updated);
    }
  };

  const handleTogglePin = async (targetSpace: Space) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const updated = await spaceService.togglePinSpace(targetSpace.id);
    setSpaces(updated);
  };

  const handleMoveToTop = async (targetSpace: Space) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const updated = await spaceService.moveSpaceToTop(targetSpace.id);
    setSpaces(updated);
  };

  const handleSaveReorder = async (reordered: Space[]) => {
    const ids = reordered.map((s) => s.id);
    const updated = await spaceService.reorderSpaces(ids);
    setSpaces(updated);
  };

  const handleSaveEdit = async (updates: {
    name: string;
    tagline?: string;
    accentColor: string;
  }) => {
    if (editModalSpace) {
      await spaceService.updateSpace(editModalSpace.id, updates);
      setEditModalSpace(null);
      const updated = await spaceService.getSpaces();
      setSpaces(updated);
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 32, 48) },
        ]}>
        {/* Top Greeting & Create Header */}
        <View style={styles.header}>
          <View style={styles.greetingWrapper}>
            <ThemedText type="display">
              {getGreeting()}, {spaceService.getCurrentUser().name}.
            </ThemedText>
            <ThemedText type="description" style={styles.subGreeting}>
              A private place for every part of your life.
            </ThemedText>
          </View>

          <Pressable
            onPress={handleNavigateCreate}
            style={({ pressed }) => [
              styles.headerPlusButton,
              {
                backgroundColor: pressed
                  ? isDark
                    ? '#F98BA9'
                    : '#D94E84'
                  : nookSpaceColors.raspberryRose,
                borderColor: isDark ? '#F98BA9' : '#D94E84',
              },
            ]}>
            <Ionicons
              name="add"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {/* Section Heading & Space Count */}
        <View style={styles.sectionHeader}>
          <ThemedText type="label">
            Your spaces
          </ThemedText>
          <View
            style={[
              styles.countPill,
              {
                backgroundColor: isDark
                  ? 'rgba(127, 185, 230, 0.24)'
                  : 'rgba(127, 185, 230, 0.22)',
              },
            ]}>
            <ThemedText
              type="caption"
              style={{
                color: isDark ? '#A9D5F5' : '#3979A8',
              }}>
              {spaces.length}
            </ThemedText>
          </View>
        </View>

        {/* Pastel Space Cards List */}
        <View style={styles.spacesContainer}>
          {spaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onPress={() => handleOpenSpace(space.id)}
              onDelete={(targetSpace) => setSpaceToDelete(targetSpace)}
              onLongPress={(targetSpace) => setActionSheetSpace(targetSpace)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Quick Action Sheet on Long Press */}
      <SpaceActionSheet
        visible={!!actionSheetSpace}
        space={actionSheetSpace}
        onClose={() => setActionSheetSpace(null)}
        onTogglePin={handleTogglePin}
        onMoveToTop={handleMoveToTop}
        onOpenReorder={() => setReorderModalVisible(true)}
        onEditSpace={(targetSpace) => setEditModalSpace(targetSpace)}
        onDeleteSpace={(targetSpace) => setSpaceToDelete(targetSpace)}
      />

      {/* Reorder Spaces Modal */}
      <ReorderSpacesModal
        visible={reorderModalVisible}
        spaces={spaces}
        onClose={() => setReorderModalVisible(false)}
        onSave={handleSaveReorder}
      />

      {/* Edit Space Modal */}
      {editModalSpace ? (
        <EditSpaceModal
          visible={!!editModalSpace}
          space={editModalSpace}
          onClose={() => setEditModalSpace(null)}
          onSave={handleSaveEdit}
        />
      ) : null}

      {/* Delete Space Confirm Modal */}
      <ConfirmModal
        visible={!!spaceToDelete}
        title="Delete Space"
        message={`Are you sure you want to delete "${spaceToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        accentColor={spaceToDelete?.accentColor || '#FF3B30'}
        icon="trash-outline"
        onConfirm={handleConfirmDelete}
        onCancel={() => setSpaceToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  greetingWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  subGreeting: {
    marginTop: 4,
  },
  headerPlusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#F2619C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  countPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  spacesContainer: {
    marginBottom: 20,
  },
  newSpaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 6,
    marginBottom: 16,
  },
  newSpaceIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  newSpaceTextWrapper: {
    flex: 1,
  },
  newSpaceTitle: {
    fontSize: 15,
    marginBottom: 1,
  },
  newSpaceSubtitle: {
    color: '#8E8D94',
  },
});
