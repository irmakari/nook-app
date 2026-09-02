import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { SpaceHero } from '@/components/SpaceHero';
import { UpcomingPlanCard } from '@/components/UpcomingPlanCard';
import { SpaceSectionRow } from '@/components/SpaceSectionRow';
import { SpaceActivityItem } from '@/components/SpaceActivityItem';
import { SpaceCreateButton } from '@/components/SpaceCreateButton';
import { AddSomethingSheet, AddSomethingOptionType } from '@/components/AddSomethingSheet';
import { SpaceOptionsSheet } from '@/components/SpaceOptionsSheet';
import { EditSpaceModal } from '@/components/EditSpaceModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Space, spaceService } from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SpaceDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [space, setSpace] = useState<Space | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    const fetchSpace = async () => {
      if (id) {
        const found = await spaceService.getSpaceById(id);
        if (found) {
          setSpace(found);
        }
      }
    };

    fetchSpace();

    const unsubscribe = spaceService.subscribe(() => {
      fetchSpace();
    }, ['spaces', 'plans', 'polls', 'lists', 'tasks', 'notes', 'session']);

    return () => unsubscribe();
  }, [id]);

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
        <ThemedText type="subtitle">Loading space...</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <ThemedText type="link">Go back to Home</ThemedText>
        </Pressable>
      </View>
    );
  }

  const accentColor = space.accentColor || '#7FB9E6';
  const sections = space.sections || ['Plans', 'Polls', 'Shared Lists'];

  const handleSelectAddOption = (type: AddSomethingOptionType) => {
    if (type === 'plan') {
      router.push({
        pathname: '/plan/create',
        params: { spaceId: space.id },
      });
    } else if (type === 'poll') {
      router.push({
        pathname: '/poll/create',
        params: { spaceId: space.id },
      });
    } else if (type === 'list') {
      router.push({
        pathname: '/list/create',
        params: { spaceId: space.id },
      });
    } else if (type === 'todo') {
      router.push({
        pathname: '/todo/create',
        params: { spaceId: space.id },
      });
    } else if (type === 'note') {
      router.push({
        pathname: '/note/create',
        params: { spaceId: space.id },
      });
    }
  };

  const handleOpenPlanDetail = () => {
    if (space.upcomingPlan?.id) {
      router.push({
        pathname: '/plan/[id]',
        params: { id: space.upcomingPlan.id },
      });
    } else {
      router.push({
        pathname: '/plan/create',
        params: { spaceId: space.id },
      });
    }
  };

  const handleOpenSection = (sectionName: string) => {
    if (sectionName === 'Polls') {
      const meta = space.sectionMeta?.[sectionName] || '';
      const count = parseInt(meta, 10);
      if (Number.isFinite(count) && count <= 0) {
        router.push({
          pathname: '/poll/create',
          params: { spaceId: space.id },
        });
      } else {
        void spaceService.getPolls(space.id).then((spacePolls) => {
          if (spacePolls.length > 0) {
            router.push({
              pathname: '/poll/[id]',
              params: { id: spacePolls[0].id },
            });
          } else {
            router.push({
              pathname: '/poll/create',
              params: { spaceId: space.id },
            });
          }
        }).catch(() => {
          router.push({
            pathname: '/poll/create',
            params: { spaceId: space.id },
          });
        });
      }
    } else if (sectionName === 'Plans') {
      router.push({
        pathname: '/plan/list',
        params: { spaceId: space.id },
      });
    } else if (sectionName === 'Shared Lists' || sectionName === 'Shopping') {
      const meta = space.sectionMeta?.[sectionName] || '';
      const count = parseInt(meta, 10);
      if (Number.isFinite(count) && count <= 0) {
        router.push({
          pathname: '/list/create',
          params: { spaceId: space.id },
        });
      } else {
        void spaceService.getLists(space.id).then((spaceLists) => {
          if (spaceLists.length > 0) {
            router.push({
              pathname: '/list/[id]',
              params: { id: spaceLists[0].id },
            });
          } else {
            router.push({
              pathname: '/list/create',
              params: { spaceId: space.id },
            });
          }
        }).catch(() => {
          router.push({
            pathname: '/list/create',
            params: { spaceId: space.id },
          });
        });
      }
    } else if (sectionName === 'To-do') {
      router.push({
        pathname: '/todo/[id]',
        params: { id: space.id },
      });
    } else if (sectionName === 'Notes') {
      router.push({
        pathname: '/note/list',
        params: { spaceId: space.id },
      });
    }
  };

  const isOwner = space?.members?.[0]?.name === spaceService.getCurrentUser().name || true;

  const handleDeleteOrLeave = () => {
    setConfirmDeleteVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (space) {
      await spaceService.deleteSpace(space.id);
      router.replace('/');
    }
  };

  const handleSaveEdit = async (updates: {
    name: string;
    tagline?: string;
    accentColor: string;
  }) => {
    const updated = await spaceService.updateSpace(space.id, updates);
    if (updated) {
      setSpace(updated);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#121214' : '#FAF8F5',
        },
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 90, 110),
        }}>
        {/* Space Hero Block with full accent color */}
        <SpaceHero
          space={space}
          onBackPress={() => router.back()}
          onOptionsPress={() => setOptionsVisible(true)}
          onAddMemberPress={() => {
            router.push({
              pathname: '/space/[id]/members',
              params: { id: space.id },
            });
          }}
          onMembersPress={() => {
            router.push({
              pathname: '/space/[id]/members',
              params: { id: space.id },
            });
          }}
        />

        {/* Space Body Content on Warm Neutral Shell */}
        <View style={styles.bodyContent}>
          {/* NEXT UP SECTION */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText type="section" style={styles.sectionTitle}>
                Next up
              </ThemedText>
            </View>

            <UpcomingPlanCard
              plan={space.upcomingPlan}
              accentColor={accentColor}
              onPress={handleOpenPlanDetail}
              onAddPlanPress={() =>
                router.push({
                  pathname: '/plan/create',
                  params: { spaceId: space.id },
                })
              }
            />
          </View>

          {/* OUR SPACE SECTIONS */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText type="section" style={styles.sectionTitle}>
                Our space
              </ThemedText>
            </View>

            <View style={styles.sectionsList}>
              {sections.map((sectionName) => (
                <SpaceSectionRow
                  key={sectionName}
                  name={sectionName}
                  meta={space.sectionMeta?.[sectionName]}
                  accentColor={accentColor}
                  onPress={() => handleOpenSection(sectionName)}
                />
              ))}
            </View>
          </View>

          {/* RECENTLY SECTION */}
          {space.recentActivities && space.recentActivities.length > 0 ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="section" style={styles.sectionTitle}>
                  Recently
                </ThemedText>
              </View>

              <View
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                    borderColor: isDark ? '#26262B' : '#EFECE6',
                  },
                ]}>
                {space.recentActivities.map((act, index) => (
                  <SpaceActivityItem
                    key={act.id || index}
                    activity={act}
                    accentColor={accentColor}
                    isLast={index === (space.recentActivities?.length ?? 0) - 1}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Floating Contextual Create Button in Space Accent Color */}
      <SpaceCreateButton
        accentColor={accentColor}
        onPress={() => setSheetVisible(true)}
        bottomOffset={Math.max(insets.bottom + 20, 26)}
      />

      {/* Add Something Bottom Sheet */}
      <AddSomethingSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        accentColor={accentColor}
        spaceName={space.name}
        onSelectOption={handleSelectAddOption}
      />

      {/* Space Options (•••) Bottom Sheet */}
      <SpaceOptionsSheet
        visible={optionsVisible}
        space={space}
        isOwner={isOwner}
        onClose={() => setOptionsVisible(false)}
        onOpenMembers={() => {
          router.push({
            pathname: '/space/[id]/members',
            params: { id: space.id },
          });
        }}
        onEditSpace={() => setEditModalVisible(true)}
        onDeleteOrLeaveSpace={handleDeleteOrLeave}
      />

      {/* Edit Space Modal */}
      <EditSpaceModal
        visible={editModalVisible}
        space={space}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveEdit}
      />

      {/* Delete / Leave Space Custom Confirm Modal */}
      <ConfirmModal
        visible={confirmDeleteVisible}
        title={isOwner ? 'Delete Space' : 'Leave Space'}
        message={
          isOwner
            ? `Are you sure you want to delete "${space.name}"? This action cannot be undone.`
            : `Are you sure you want to leave "${space.name}"?`
        }
        confirmText={isOwner ? 'Delete' : 'Leave'}
        cancelText="Cancel"
        isDestructive={true}
        accentColor={accentColor}
        icon={isOwner ? 'trash-outline' : 'log-out-outline'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  sectionBlock: {
    marginBottom: 26,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#8E8D94',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  sectionsList: {
    gap: 2,
  },
  activityCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
});
