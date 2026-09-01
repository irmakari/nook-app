import React, { useRef } from 'react';
import { View, Pressable, Platform, Animated, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { SpaceCardProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { SpaceIcon } from '@/components/SpaceIcon';
import { useColorScheme } from '@/hooks/use-color-scheme';

function getSolidPastelColor(hex: string, opacity: number, isDark: boolean): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;

  const bgR = isDark ? 18 : 250;
  const bgG = isDark ? 18 : 248;
  const bgB = isDark ? 20 : 245;

  const outR = Math.round(r * opacity + bgR * (1 - opacity));
  const outG = Math.round(g * opacity + bgG * (1 - opacity));
  const outB = Math.round(b * opacity + bgB * (1 - opacity));

  return `rgb(${outR}, ${outG}, ${outB})`;
}

export function SpaceCard({ space, onPress, onDelete, onLongPress }: SpaceCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const translateX = useRef(new Animated.Value(0)).current;
  const isSwiping = useRef(false);
  const isOpened = useRef(false);

  const deleteOpacity = translateX.interpolate({
    inputRange: [-65, -15, 0],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        isSwiping.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        const startX = isOpened.current ? -75 : 0;
        const newX = Math.min(10, Math.max(-95, startX + gestureState.dx));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40 || (isOpened.current && gestureState.dx < 30)) {
          // Snap open delete button
          isOpened.current = true;
          Animated.spring(translateX, {
            toValue: -75,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
          }
        } else {
          // Snap back closed
          isOpened.current = false;
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
        setTimeout(() => {
          isSwiping.current = false;
        }, 100);
      },
    })
  ).current;

  const accentColor = space.accentColor || '#7FB9E6';
  
  // Solid opaque pastel surface for the card so background elements never bleed through
  const cardBg = getSolidPastelColor(accentColor, isDark ? 0.22 : 0.44, isDark);
  const iconBoxBg = getSolidPastelColor(accentColor, isDark ? 0.45 : 0.74, isDark);

  const handlePress = () => {
    if (isSwiping.current) return;
    if (isOpened.current) {
      isOpened.current = false;
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onPress?.(space);
  };

  const handleLongPress = () => {
    if (isSwiping.current || isOpened.current) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress?.(space);
  };

  const handleDeletePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    isOpened.current = false;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    onDelete?.(space);
  };

  const planTitle = space.upcomingPlan?.title;
  const recentAction = space.recentActivity;
  const timeText = space.recentActivityTime || 'Recently';

  return (
    <View style={styles.containerWrapper}>
      {/* Background Delete Action Button */}
      {onDelete ? (
        <Animated.View
          style={[
            styles.deleteActionBox,
            {
              opacity: deleteOpacity,
              backgroundColor: '#FF3B30',
            },
          ]}>
          <Pressable
            onPress={handleDeletePress}
            style={styles.deleteButtonInner}>
            <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      ) : null}

      {/* Foreground Swipeable Card Layer */}
      <Animated.View
        {...(onDelete ? panResponder.panHandlers : {})}
        style={{
          transform: [{ translateX }],
          width: '100%',
        }}>
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={350}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: cardBg,
              transform: [{ scale: pressed ? 0.985 : 1 }],
            },
          ]}>
          {/* Floating Pin Badge at Top-Right Border */}
          {space.isPinned ? (
            <View style={styles.pinBadge}>
              <Ionicons name="pin" size={11} color="#FFFFFF" />
            </View>
          ) : null}

          {/* Main Header Row: Icon + Space Title + Tagline + Members */}
          <View style={styles.mainRow}>
            <View style={[styles.iconBox, { backgroundColor: iconBoxBg }]}>
              <SpaceIcon name={space.icon} size={20} color="#111111" />
            </View>

            <View style={styles.infoCol}>
              <View style={styles.titleRow}>
                <ThemedText style={styles.spaceName} numberOfLines={1}>{space.name}</ThemedText>
                <ThemedText style={styles.memberText}>
                  {space.memberCount} {space.memberCount === 1 ? 'person' : 'people'}
                </ThemedText>
              </View>

              {space.tagline ? (
                <ThemedText numberOfLines={1} style={styles.tagline}>
                  {space.tagline}
                </ThemedText>
              ) : null}
            </View>
          </View>

          {/* Context Footer (Upcoming Plan or Recent Activity) */}
          {(planTitle || recentAction) ? (
            <View style={styles.contextFooter}>
              <View style={styles.contextLeft}>
                <View style={styles.contextDot} />
                <ThemedText numberOfLines={1} style={styles.contextText}>
                  {planTitle || recentAction}
                </ThemedText>
              </View>
              <ThemedText style={styles.timeText}>{timeText}</ThemedText>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}
