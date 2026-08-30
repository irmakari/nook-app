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
import { ActivityCalendar } from '@/components/ActivityCalendar';
import { ActivityTimelineCard } from '@/components/ActivityTimelineCard';
import { Activity, spaceService } from '@/services/space-service';
import { useColorScheme } from '@/hooks/use-color-scheme';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // Find which day numbers have activities
  const activeDayNumbers = activities.map((act) => {
    const d = new Date(act.createdAt);
    return d.getDate();
  });

  const filteredActivities = activities.filter((act) => {
    const actDate = new Date(act.createdAt);
    return (
      actDate.getFullYear() === selectedDate.getFullYear() &&
      actDate.getMonth() === selectedDate.getMonth() &&
      actDate.getDate() === selectedDate.getDate()
    );
  });

  const displayList =
    filteredActivities.length > 0 ? filteredActivities : activities;
  const isFilteredEmpty = filteredActivities.length === 0;

  const dayNumber = selectedDate.getDate();
  const dayName = WEEKDAYS[selectedDate.getDay()];
  const isSelectedToday = isToday(selectedDate);

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
        {/* Interactive Calendar Card */}
        <ActivityCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          activeDates={activeDayNumbers}
          specialDates={[{ day: 27, icon: 'airplane' }]}
        />

        {/* Selected Date Summary Header */}
        <View style={styles.dateSummaryRow}>
          <View style={styles.dateNumberCol}>
            <ThemedText type="label" style={styles.dateSubLabel}>
              {isSelectedToday ? 'TODAY' : 'DATE'}
            </ThemedText>
            <View style={styles.dateTitleRow}>
              <ThemedText type="display" weight="bold" style={styles.dateNumberText}>
                {dayNumber}
              </ThemedText>
              <View style={styles.dayMetaCol}>
                <ThemedText type="subtitle">
                  {dayName}
                </ThemedText>
                <ThemedText type="caption">
                  {filteredActivities.length}{' '}
                  {filteredActivities.length === 1 ? 'activity' : 'activities'}
                </ThemedText>
              </View>
            </View>
          </View>

        </View>

        {/* Notice when filtered day has no direct items */}
        {isFilteredEmpty ? (
          <View style={styles.emptyNoticeRow}>
            <Ionicons name="calendar-outline" size={14} color="#8E8D94" />
            <ThemedText type="caption">
              No events on this day · Showing recent space activity
            </ThemedText>
          </View>
        ) : null}

        {/* Timeline Activities List */}
        <View style={styles.timelineList}>
          {displayList.map((act) => (
            <ActivityTimelineCard
              key={act.id}
              activity={act}
              onPress={handleActivityPress}
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
    paddingTop: 8,
  },
  dateSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 4,
  },
  dateNumberCol: {
    flex: 1,
  },
  dateSubLabel: {
    marginBottom: 2,
  },
  dateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateNumberText: {
    fontSize: 34,
    lineHeight: 38,
  },
  dayMetaCol: {
    justifyContent: 'center',
  },
  emptyNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  timelineList: {
    marginTop: 4,
  },
});
