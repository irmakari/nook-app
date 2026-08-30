import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ListItemRow } from '@/components/ListItemRow';
import { QuickAddItem } from '@/components/QuickAddItem';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  ListItem,
  SharedList,
  Space,
  SpaceMember,
  spaceService,
} from '@/services/space-service';
import { ListTemplate, LIST_TEMPLATES } from '@/constants/list-templates';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpaceIcon } from '@/components/SpaceIcon';

const CURRENT_USER: SpaceMember = { name: 'Irmak', initials: 'IR' };

export default function ListDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [list, setList] = useState<SharedList | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    const loadListAndSpace = async () => {
      if (id) {
        const foundList = await spaceService.getListById(id);
        if (foundList) {
          setList(foundList);
          const foundSpace = await spaceService.getSpaceById(foundList.spaceId);
          if (foundSpace) setSpace(foundSpace);
        }
      }
    };

    loadListAndSpace();

    const unsubscribe = spaceService.subscribe(() => {
      loadListAndSpace();
    });

    return () => unsubscribe();
  }, [id]);

  if (!list) {
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
        <ThemedText type="subtitle">Loading list...</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <ThemedText type="link">Go back</ThemedText>
        </Pressable>
      </View>
    );
  }

  const accentColor = space?.accentColor || '#7FB9E6';
  const softTint = getAccentTint(accentColor, isDark ? 0.22 : 0.14);
  const subtleBorder = getAccentTint(accentColor, isDark ? 0.35 : 0.25);

  const tpl = LIST_TEMPLATES[list.template as ListTemplate] || LIST_TEMPLATES.blank;

  const activeItems = list.items.filter((item: ListItem) => !item.completed);
  const completedItems = list.items.filter((item: ListItem) => item.completed);

  const handleAddItem = (text: string) => {
    spaceService.addListItem(list.id, text, CURRENT_USER);
  };

  const handleToggleItem = (itemId: string) => {
    spaceService.toggleListItem(list.id, itemId, CURRENT_USER);
  };

  const handleDeleteItem = (itemId: string) => {
    spaceService.deleteListItem(list.id, itemId);
  };

  const handleClearCompleted = async () => {
    setMenuVisible(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await spaceService.clearCompletedItems(list.id);
  };

  const handleDeleteList = () => {
    setMenuVisible(false);
    setTimeout(() => {
      setConfirmDeleteVisible(true);
    }, 150);
  };

  const handleConfirmDeleteList = async () => {
    if (list) {
      await spaceService.deleteList(list.id);
      router.back();
    }
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
            { paddingBottom: 24 },
          ]}>
          {/* Template Badge & Items Summary */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.templateBadge,
                {
                  backgroundColor: softTint,
                  borderColor: subtleBorder,
                },
              ]}>
              <Ionicons
                name={tpl.icon}
                size={14}
                color={isDark ? '#F4F4F5' : '#18181B'}
              />
              <ThemedText
                style={[
                  styles.templateBadgeText,
                  { color: isDark ? '#F4F4F5' : '#18181B' },
                ]}>
                {tpl.title.toUpperCase()}
              </ThemedText>
            </View>

            <ThemedText type="caption" style={styles.summaryText}>
              {activeItems.length} {tpl.activeLabel.toLowerCase()}
            </ThemedText>
          </View>

          {/* List Title */}
          <ThemedText type="screenTitle" style={styles.listTitle}>
            {list.name}
          </ThemedText>

          {/* List Description if exists */}
          {list.description ? (
            <ThemedText type="body" style={styles.descriptionText}>
              {list.description}
            </ThemedText>
          ) : null}

          {/* Empty State */}
          {list.items.length === 0 ? (
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                  borderColor: isDark ? '#26262B' : '#EFECE6',
                },
              ]}>
              <Ionicons
                name={tpl.icon}
                size={28}
                color={accentColor}
                style={{ marginBottom: 8 }}
              />
              <ThemedText type="body" weight="semiBold" style={styles.emptyTitle}>
                {tpl.emptyPrompt}
              </ThemedText>
              <ThemedText type="caption" style={styles.emptySubtitle}>
                Type below to add the first item.
              </ThemedText>
            </View>
          ) : (
            <>
              {/* ACTIVE ITEMS SECTION */}
              <View style={styles.itemsSection}>
                {activeItems.length > 0 && (
                  <ThemedText type="caption" style={styles.sectionHeaderLabel}>
                    {tpl.activeLabel.toUpperCase()} ({activeItems.length})
                  </ThemedText>
                )}

                {activeItems.map((item: ListItem) => (
                  <ListItemRow
                    key={item.id}
                    item={item}
                    accentColor={accentColor}
                    onToggle={handleToggleItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </View>

              {/* COMPLETED ITEMS SECTION */}
              {completedItems.length > 0 && (
                <View style={styles.completedSection}>
                  <ThemedText
                    type="caption"
                    style={styles.sectionHeaderLabel}>
                    {tpl.completedLabel.toUpperCase()} ({completedItems.length})
                  </ThemedText>

                  {completedItems.map((item: ListItem) => (
                    <ListItemRow
                      key={item.id}
                      item={item}
                      accentColor={accentColor}
                      onToggle={handleToggleItem}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Sticky Bottom Inline Add Input Bar */}
        <QuickAddItem
          placeholder={tpl.placeholder}
          accentColor={accentColor}
          onAddItem={handleAddItem}
          bottomOffset={insets.bottom}
        />

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
                List Actions
              </ThemedText>

              {completedItems.length > 0 && (
                <Pressable
                  onPress={handleClearCompleted}
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
                    name="checkmark-done-outline"
                    size={20}
                    color={isDark ? '#F4F4F5' : '#18181B'}
                  />
                  <ThemedText style={styles.menuItemText}>
                    Clear completed ({completedItems.length})
                  </ThemedText>
                </Pressable>
              )}

              <Pressable
                onPress={handleDeleteList}
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
                  Delete list
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

        {/* Custom Delete List Confirm Modal */}
        <ConfirmModal
          visible={confirmDeleteVisible}
          title="Delete List"
          message="Are you sure you want to delete this list? All items will be removed."
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
          accentColor={space?.accentColor || '#7FB9E6'}
          icon="trash-outline"
          onConfirm={handleConfirmDeleteList}
          onCancel={() => setConfirmDeleteVisible(false)}
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    gap: 6,
  },
  templateBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.6,
  },
  summaryText: {
    color: '#8E8D94',
    fontSize: 12,
  },
  listTitle: {
    marginBottom: 4,
  },
  descriptionText: {
    color: '#8E8D94',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyBox: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#8E8D94',
    textAlign: 'center',
  },
  itemsSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  sectionHeaderLabel: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  completedSection: {
    marginTop: 14,
    marginBottom: 12,
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
