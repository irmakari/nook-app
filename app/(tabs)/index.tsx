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
import { Space, spaceService } from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [spaces, setSpaces] = useState<Space[]>([]);

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
    });

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
            <ThemedText type="hero" style={styles.greetingText}>
              {getGreeting()}, {spaceService.getCurrentUser().name}.
            </ThemedText>
            <ThemedText type="muted" style={styles.subGreeting}>
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
                    ? '#2C2C34'
                    : '#EAE6DF'
                  : isDark
                  ? '#1C1C20'
                  : '#FFFFFF',
                borderColor: isDark ? '#2B2B33' : '#EBE7E0',
              },
            ]}>
            <Ionicons
              name="add"
              size={22}
              color={isDark ? '#F4F4F5' : '#18181B'}
            />
          </Pressable>
        </View>

        {/* Section Heading & Space Count */}
        <View style={styles.sectionHeader}>
          <ThemedText type="section" style={styles.sectionTitle}>
            Your spaces
          </ThemedText>
          <View
            style={[
              styles.countPill,
              {
                backgroundColor: isDark ? '#1E1E24' : '#EFECE6',
              },
            ]}>
            <ThemedText
              type="caption"
              style={{
                color: isDark ? '#A1A1AA' : '#71717A',
                fontFamily: 'Poppins_600SemiBold',
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
            />
          ))}
        </View>
      </ScrollView>
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
  greetingText: {
    fontSize: 28,
    lineHeight: 34,
  },
  subGreeting: {
    marginTop: 4,
    color: '#8E8D94',
    fontSize: 14,
  },
  headerPlusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    color: '#8E8D94',
    fontSize: 12,
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
