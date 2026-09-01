import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Pressable, ScrollView, Platform, PanResponder, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ReorderSpacesModalProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { SpaceIcon } from '@/components/SpaceIcon';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Space } from '@/services/space-service';
import { getAccentTint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ROW_HEIGHT = 62;

export function ReorderSpacesModal({
  visible,
  spaces,
  onClose,
  onSave,
}: ReorderSpacesModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [orderedSpaces, setOrderedSpaces] = useState<Space[]>(spaces);
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);

  const spacesRef = useRef<Space[]>(spaces);
  spacesRef.current = orderedSpaces;

  const dragIndexRef = useRef<number | null>(null);
  dragIndexRef.current = activeDragIndex;

  const accumulatedDy = useRef(0);

  useEffect(() => {
    setOrderedSpaces(spaces);
  }, [spaces, visible]);

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const updated = [...orderedSpaces];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setOrderedSpaces(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= orderedSpaces.length - 1) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const updated = [...orderedSpaces];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setOrderedSpaces(updated);
  };

  const handleMoveToTop = (index: number) => {
    if (index <= 0) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = [...orderedSpaces];
    const [target] = updated.splice(index, 1);
    updated.unshift(target);
    setOrderedSpaces(updated);
  };

  const handleSave = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(orderedSpaces);
    onClose();
  };

  const createPanResponder = (index: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setActiveDragIndex(index);
        accumulatedDy.current = 0;
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const currIndex = dragIndexRef.current;
        if (currIndex === null) return;

        const totalDy = gestureState.dy - accumulatedDy.current;

        if (totalDy < -ROW_HEIGHT / 2 && currIndex > 0) {
          // Dragged up past threshold
          const updated = [...spacesRef.current];
          const temp = updated[currIndex - 1];
          updated[currIndex - 1] = updated[currIndex];
          updated[currIndex] = temp;
          setOrderedSpaces(updated);
          setActiveDragIndex(currIndex - 1);
          accumulatedDy.current -= ROW_HEIGHT;
          if (Platform.OS !== 'web') Haptics.selectionAsync();
        } else if (totalDy > ROW_HEIGHT / 2 && currIndex < spacesRef.current.length - 1) {
          // Dragged down past threshold
          const updated = [...spacesRef.current];
          const temp = updated[currIndex + 1];
          updated[currIndex + 1] = updated[currIndex];
          updated[currIndex] = temp;
          setOrderedSpaces(updated);
          setActiveDragIndex(currIndex + 1);
          accumulatedDy.current += ROW_HEIGHT;
          if (Platform.OS !== 'web') Haptics.selectionAsync();
        }
      },
      onPanResponderRelease: () => {
        setActiveDragIndex(null);
        accumulatedDy.current = 0;
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      onPanResponderTerminate: () => {
        setActiveDragIndex(null);
        accumulatedDy.current = 0;
      },
    });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
              borderColor: isDark ? '#2B2B33' : '#EAE6DF',
            },
          ]}>
          <View
            style={[
              styles.handleBar,
              { backgroundColor: isDark ? '#33333D' : '#D8D4CC' },
            ]}
          />

          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <ThemedText type="title">Reorder Spaces</ThemedText>
              <ThemedText type="caption">
                Drag handle (☰) to reorder, or use arrows & Top
              </ThemedText>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={isDark ? '#A1A1AA' : '#71717A'}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={activeDragIndex === null}
            contentContainerStyle={styles.scrollList}>
            {orderedSpaces.map((item, index) => {
              const accentColor = item.accentColor || '#7FB9E6';
              const softTint = getAccentTint(accentColor, isDark ? 0.25 : 0.16);
              const isFirst = index === 0;
              const isLast = index === orderedSpaces.length - 1;
              const isDragging = activeDragIndex === index;

              const panResponder = createPanResponder(index);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    {
                      backgroundColor: isDragging
                        ? isDark ? '#2B2B36' : '#F0EBE3'
                        : isDark ? '#222228' : '#FAF8F5',
                      borderColor: isDragging
                        ? accentColor
                        : isDark ? '#2B2B33' : '#EFECE6',
                      transform: [{ scale: isDragging ? 1.02 : 1 }],
                      shadowColor: isDragging ? '#000' : 'transparent',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: isDragging ? 8 : 0,
                    },
                  ]}>
                  {/* Drag Handle Icon */}
                  <View
                    {...panResponder.panHandlers}
                    style={styles.dragHandle}>
                    <Ionicons
                      name="reorder-three-outline"
                      size={22}
                      color={isDragging ? accentColor : isDark ? '#8E8D94' : '#999999'}
                    />
                  </View>

                  <View style={[styles.iconBox, { backgroundColor: softTint }]}>
                    <SpaceIcon
                      name={item.icon}
                      size={18}
                      color={isDark ? '#F4F4F5' : '#18181B'}
                    />
                  </View>

                  <View style={styles.itemInfo}>
                    <ThemedText style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                    <ThemedText type="caption">
                      {item.memberCount} {item.memberCount === 1 ? 'person' : 'people'}
                      {item.isPinned ? ' · 📌 Pinned' : ''}
                    </ThemedText>
                  </View>

                  <View style={styles.controlsRow}>
                    {/* Send to Top Button */}
                    {!isFirst ? (
                      <Pressable
                        onPress={() => handleMoveToTop(index)}
                        style={({ pressed }) => [
                          styles.topBtn,
                          {
                            backgroundColor: pressed
                              ? isDark ? '#33333E' : '#EAE6DF'
                              : isDark ? '#2B2B35' : '#F0ECE4',
                            borderColor: isDark ? '#383845' : '#E2DDD3',
                          },
                        ]}>
                        <Ionicons
                          name="arrow-up"
                          size={13}
                          color={isDark ? '#A9D5F5' : '#2B6CB0'}
                        />
                        <ThemedText
                          style={[
                            styles.topBtnText,
                            { color: isDark ? '#A9D5F5' : '#2B6CB0' },
                          ]}>
                          Top
                        </ThemedText>
                      </Pressable>
                    ) : null}

                    {/* Move Up */}
                    <Pressable
                      onPress={() => handleMoveUp(index)}
                      disabled={isFirst}
                      style={({ pressed }) => [
                        styles.controlBtn,
                        {
                          opacity: isFirst ? 0.3 : 1,
                          backgroundColor: pressed
                            ? isDark ? '#33333E' : '#EAE6DF'
                            : isDark ? '#2B2B35' : '#F0ECE4',
                          borderColor: isDark ? '#383845' : '#E2DDD3',
                        },
                      ]}>
                      <Ionicons
                        name="chevron-up"
                        size={16}
                        color={isDark ? '#F4F4F5' : '#18181B'}
                      />
                    </Pressable>

                    {/* Move Down */}
                    <Pressable
                      onPress={() => handleMoveDown(index)}
                      disabled={isLast}
                      style={({ pressed }) => [
                        styles.controlBtn,
                        {
                          opacity: isLast ? 0.3 : 1,
                          backgroundColor: pressed
                            ? isDark ? '#33333E' : '#EAE6DF'
                            : isDark ? '#2B2B35' : '#F0ECE4',
                          borderColor: isDark ? '#383845' : '#E2DDD3',
                        },
                      ]}>
                      <Ionicons
                        name="chevron-down"
                        size={16}
                        color={isDark ? '#F4F4F5' : '#18181B'}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.bottomBar}>
            <PrimaryButton title="Done" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
