import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ActivityItem } from '@/components/ActivityItem';
import { Activity, spaceService } from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const loadActivities = async () => {
      const list = await spaceService.getActivities();
      setActivities(list);
    };

    loadActivities();

    const unsubscribe = spaceService.subscribe(() => {
      loadActivities();
    });

    return () => unsubscribe();
  }, []);

  const handleActivityPress = (activity: Activity) => {
    if (!activity.entityType || !activity.entityId) {
      router.push({
        pathname: '/space/[id]',
        params: { id: activity.spaceId },
      });
      return;
    }

    switch (activity.entityType) {
      case 'plan':
        router.push({
          pathname: '/plan/[id]',
          params: { id: activity.entityId },
        });
        break;
      case 'poll':
        router.push({
          pathname: '/poll/[id]',
          params: { id: activity.entityId },
        });
        break;
      case 'list':
        router.push({
          pathname: '/list/[id]',
          params: { id: activity.entityId },
        });
        break;
      case 'todo':
        router.push({
          pathname: '/todo/[id]',
          params: { id: activity.entityId },
        });
        break;
      case 'note':
        router.push({
          pathname: '/note/[id]',
          params: { id: activity.entityId },
        });
        break;
      case 'member':
        router.push({
          pathname: '/space/[id]/members',
          params: { id: activity.spaceId },
        });
        break;
      default:
        router.push({
          pathname: '/space/[id]',
          params: { id: activity.spaceId },
        });
        break;
    }
  };

  // Group by Today, Yesterday, Earlier
  const todayActivities: Activity[] = [];
  const yesterdayActivities: Activity[] = [];
  const earlierActivities: Activity[] = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  activities.forEach((act) => {
    const actTime = new Date(act.createdAt).getTime();
    if (actTime >= startOfToday) {
      todayActivities.push(act);
    } else if (actTime >= startOfYesterday) {
      yesterdayActivities.push(act);
    } else {
      earlierActivities.push(act);
    }
  });

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
          { paddingBottom: Math.max(insets.bottom + 90, 110) },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="hero" style={styles.headerTitle}>
            Activity
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {"What's been happening in your Spaces"}
          </ThemedText>
        </View>

        {activities.length === 0 ? (
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
                borderColor: isDark ? '#26262B' : '#EFECE6',
              },
            ]}>
            <Ionicons
              name="sparkles-outline"
              size={36}
              color="#7FB9E6"
              style={{ marginBottom: 10 }}
            />
            <ThemedText type="body" weight="semiBold" style={styles.emptyTitle}>
              Quiet for now.
            </ThemedText>
            <ThemedText type="caption" style={styles.emptySubtitle}>
              Things your Spaces do together will show up here.
            </ThemedText>
          </View>
        ) : (
          <>
            {/* TODAY GROUP */}
            {todayActivities.length > 0 && (
              <View style={styles.groupSection}>
                <ThemedText type="caption" style={styles.groupLabel}>
                  TODAY
                </ThemedText>
                {todayActivities.map((act) => (
                  <ActivityItem
                    key={act.id}
                    activity={act}
                    onPress={handleActivityPress}
                  />
                ))}
              </View>
            )}

            {/* YESTERDAY GROUP */}
            {yesterdayActivities.length > 0 && (
              <View style={styles.groupSection}>
                <ThemedText type="caption" style={styles.groupLabel}>
                  YESTERDAY
                </ThemedText>
                {yesterdayActivities.map((act) => (
                  <ActivityItem
                    key={act.id}
                    activity={act}
                    onPress={handleActivityPress}
                  />
                ))}
              </View>
            )}

            {/* EARLIER GROUP */}
            {earlierActivities.length > 0 && (
              <View style={styles.groupSection}>
                <ThemedText type="caption" style={styles.groupLabel}>
                  EARLIER
                </ThemedText>
                {earlierActivities.map((act) => (
                  <ActivityItem
                    key={act.id}
                    activity={act}
                    onPress={handleActivityPress}
                  />
                ))}
              </View>
            )}
          </>
        )}
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 38,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#8E8D94',
    fontSize: 14,
  },
  emptyBox: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 17,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#8E8D94',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
  groupSection: {
    marginBottom: 16,
  },
  groupLabel: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
});
