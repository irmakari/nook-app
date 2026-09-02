import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { TaskRow } from '@/components/TaskRow';
import { TaskDetailSheet } from '@/components/TaskDetailSheet';
import { QuickAddTask } from '@/components/QuickAddTask';
import {
  Task,
  Space,
  SpaceMember,
  spaceService,
} from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpaceIcon } from '@/components/SpaceIcon';

export default function TodoListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [currentUser, setCurrentUser] = useState<SpaceMember>(spaceService.getCurrentMember());
  const [space, setSpace] = useState<Space | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [showDone, setShowDone] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setCurrentUser(spaceService.getCurrentMember());
      if (id) {
        const foundSpace = await spaceService.getSpaceById(id);
        if (foundSpace) setSpace(foundSpace);
        const loadedTasks = await spaceService.getTasks(id);
        setTasks(loadedTasks);
      }
    };

    loadData();

    const unsubscribe = spaceService.subscribe(() => {
      loadData();
    }, ['tasks', 'spaces', 'session']);

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
        <ThemedText type="subtitle">Loading to-dos...</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <ThemedText type="link">Go back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const accentColor = space.accentColor || '#7FB9E6';

  // Apply Filter
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'mine') {
      return t.assignedTo === currentUser.name;
    }
    return true;
  });

  const openTasks = filteredTasks.filter((t) => t.status === 'open');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  // Natural Date Groupings
  const todayTasks = openTasks.filter((t) => t.dueAt?.toLowerCase() === 'today');
  const tomorrowTasks = openTasks.filter((t) => t.dueAt?.toLowerCase() === 'tomorrow');
  const noDateTasks = openTasks.filter((t) => !t.dueAt);
  const otherTasks = openTasks.filter(
    (t) =>
      t.dueAt &&
      t.dueAt.toLowerCase() !== 'today' &&
      t.dueAt.toLowerCase() !== 'tomorrow'
  );

  const handleToggleTask = (taskId: string) => {
    spaceService.toggleTask(taskId, currentUser);
  };

  const handleClaimTask = (taskId: string) => {
    spaceService.claimTask(taskId, currentUser);
  };

  const handleQuickAdd = (title: string) => {
    spaceService.createTask({
      spaceId: space.id,
      title,
      assignedTo: undefined,
      dueAt: 'today',
    });
  };

  const handleOpenDetail = (task: Task) => {
    setEditingTask(task);
    setIsDetailVisible(true);
  };

  const handleSaveDetail = (taskId: string, updates: Partial<Task>) => {
    spaceService.updateTask(taskId, updates);
  };

  const handleDeleteTask = (taskId: string) => {
    spaceService.deleteTask(taskId);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            onPress={() => {
              router.push({
                pathname: '/todo/create',
                params: { spaceId: space.id },
              });
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
            { paddingBottom: 24 },
          ]}>
          {/* Header Title & Open Count */}
          <View style={styles.titleRow}>
            <ThemedText type="screenTitle">
              To-do
            </ThemedText>

            {/* Filter Toggle: All vs Mine */}
            <View
              style={[
                styles.filterToggle,
                {
                  backgroundColor: isDark ? '#1A1A1E' : '#EFECE6',
                },
              ]}>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setFilter('all');
                }}
                style={[
                  styles.filterTab,
                  filter === 'all' && [
                    styles.activeFilterTab,
                    { backgroundColor: isDark ? '#26262F' : '#FFFFFF' },
                  ],
                ]}>
                <ThemedText
                  style={[
                    styles.filterTabText,
                    filter === 'all' && {
                      color: isDark ? '#F4F4F5' : '#18181B',
                      fontFamily: 'Poppins_600SemiBold',
                    },
                  ]}>
                  All ({openTasks.length})
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setFilter('mine');
                }}
                style={[
                  styles.filterTab,
                  filter === 'mine' && [
                    styles.activeFilterTab,
                    { backgroundColor: isDark ? '#26262F' : '#FFFFFF' },
                  ],
                ]}>
                <ThemedText
                  style={[
                    styles.filterTabText,
                    filter === 'mine' && {
                      color: isDark ? '#F4F4F5' : '#18181B',
                      fontFamily: 'Poppins_600SemiBold',
                    },
                  ]}>
                  Mine
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Empty State */}
          {openTasks.length === 0 && completedTasks.length === 0 ? (
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                  borderColor: isDark ? '#26262B' : '#EFECE6',
                },
              ]}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={36}
                color={accentColor}
                style={{ marginBottom: 10 }}
              />
              <ThemedText type="body" weight="semiBold" style={styles.emptyTitle}>
                All clear.
              </ThemedText>
              <ThemedText type="caption" style={styles.emptySubtitle}>
                Nothing needs doing right now.
              </ThemedText>
            </View>
          ) : (
            <>
              {/* TODAY SECTION */}
              {todayTasks.length > 0 && (
                <View style={styles.dateGroup}>
                  <ThemedText type="caption" style={styles.groupLabel}>
                    TODAY ({todayTasks.length})
                  </ThemedText>
                  {todayTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      accentColor={accentColor}
                      onToggle={handleToggleTask}
                      onClaim={handleClaimTask}
                      onPress={handleOpenDetail}
                    />
                  ))}
                </View>
              )}

              {/* TOMORROW SECTION */}
              {tomorrowTasks.length > 0 && (
                <View style={styles.dateGroup}>
                  <ThemedText type="caption" style={styles.groupLabel}>
                    TOMORROW ({tomorrowTasks.length})
                  </ThemedText>
                  {tomorrowTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      accentColor={accentColor}
                      onToggle={handleToggleTask}
                      onClaim={handleClaimTask}
                      onPress={handleOpenDetail}
                    />
                  ))}
                </View>
              )}

              {/* LATER / OTHER DATES */}
              {otherTasks.length > 0 && (
                <View style={styles.dateGroup}>
                  <ThemedText type="caption" style={styles.groupLabel}>
                    LATER ({otherTasks.length})
                  </ThemedText>
                  {otherTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      accentColor={accentColor}
                      onToggle={handleToggleTask}
                      onClaim={handleClaimTask}
                      onPress={handleOpenDetail}
                    />
                  ))}
                </View>
              )}

              {/* NO DATE SECTION */}
              {noDateTasks.length > 0 && (
                <View style={styles.dateGroup}>
                  <ThemedText type="caption" style={styles.groupLabel}>
                    NO DATE ({noDateTasks.length})
                  </ThemedText>
                  {noDateTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      accentColor={accentColor}
                      onToggle={handleToggleTask}
                      onClaim={handleClaimTask}
                      onPress={handleOpenDetail}
                    />
                  ))}
                </View>
              )}

              {/* DONE / COMPLETED COLLAPSIBLE SECTION */}
              {completedTasks.length > 0 && (
                <View style={styles.doneSection}>
                  <Pressable
                    onPress={() => setShowDone(!showDone)}
                    style={styles.doneHeader}>
                    <ThemedText type="caption" style={styles.groupLabel}>
                      DONE ({completedTasks.length})
                    </ThemedText>
                    <Ionicons
                      name={showDone ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#8E8D94"
                    />
                  </Pressable>

                  {showDone &&
                    completedTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        accentColor={accentColor}
                        onToggle={handleToggleTask}
                        onPress={handleOpenDetail}
                      />
                    ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Sticky Inline Quick Add Input Bar */}
        <QuickAddTask
          placeholder="Add a to-do..."
          accentColor={accentColor}
          onAddTask={handleQuickAdd}
          bottomOffset={insets.bottom}
        />

        {/* Task Detail Edit Sheet */}
        <TaskDetailSheet
          task={editingTask}
          visible={isDetailVisible}
          members={space.members}
          accentColor={accentColor}
          onClose={() => setIsDetailVisible(false)}
          onSave={handleSaveDetail}
          onDelete={handleDeleteTask}
        />
      </View>
    </KeyboardAvoidingView>
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
  filterToggle: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
  },
  filterTab: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  activeFilterTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 12,
    color: '#8E8D94',
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
  dateGroup: {
    marginBottom: 16,
  },
  groupLabel: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  doneSection: {
    marginTop: 10,
    marginBottom: 16,
  },
  doneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 8,
  },
});
