import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

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
  const [showAllFilter, setShowAllFilter] = useState(false);

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

  // Filter activities for selected date, or show all if showAllFilter is on
  const filteredActivities = showAllFilter
    ? activities
    : activities.filter((act) => {
        const actDate = new Date(act.createdAt);
        return (
          actDate.getFullYear() === selectedDate.getFullYear() &&
          actDate.getMonth() === selectedDate.getMonth() &&
          actDate.getDate() === selectedDate.getDate()
        );
      });

  const displayList =
    filteredActivities.length > 0 ? filteredActivities : activities;
  const isFilteredEmpty = filteredActivities.length === 0 && !showAllFilter;

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
          onSelectDate={(date) => {
            setSelectedDate(date);
            setShowAllFilter(false);
          }}
          activeDates={activeDayNumbers}
          specialDates={[{ day: 27, icon: 'airplane' }]}
        />

        {/* Selected Date Summary Header */}
        <View style={styles.dateSummaryRow}>
          <View style={styles.dateNumberCol}>
            <ThemedText style={styles.dateSubLabel}>
              {isSelectedToday ? 'TODAY' : 'DATE'}
            </ThemedText>
            <View style={styles.dateTitleRow}>
              <ThemedText type="hero" style={styles.dateNumberText}>
                {dayNumber}
              </ThemedText>
              <View style={styles.dayMetaCol}>
                <ThemedText type="title" style={styles.dayNameText}>
                  {dayName}
                </ThemedText>
                <ThemedText type="caption" style={{ color: '#8E8D94' }}>
                  {filteredActivities.length}{' '}
                  {filteredActivities.length === 1 ? 'activity' : 'activities'}
                </ThemedText>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setShowAllFilter(!showAllFilter);
            }}
            style={[
              styles.viewAllPill,
              {
                backgroundColor: showAllFilter
                  ? isDark
                    ? '#F4F4F5'
                    : '#18181B'
                  : isDark
                  ? '#26262F'
                  : '#EAE6DF',
              },
            ]}>
            <ThemedText
              style={[
                styles.viewAllText,
                {
                  color: showAllFilter
                    ? isDark
                      ? '#18181B'
                      : '#FFFFFF'
                    : isDark
                    ? '#F4F4F5'
                    : '#18181B',
                },
              ]}>
              {showAllFilter ? 'Selected' : 'View all'}
            </ThemedText>
          </Pressable>
        </View>

        {/* Notice when filtered day has no direct items */}
        {isFilteredEmpty ? (
          <View style={styles.emptyNoticeRow}>
            <Ionicons name="calendar-outline" size={14} color="#8E8D94" />
            <ThemedText style={styles.emptyNoticeText}>
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
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8E8D94',
    letterSpacing: 0.6,
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
    fontFamily: 'Poppins_700Bold',
  },
  dayMetaCol: {
    justifyContent: 'center',
  },
  dayNameText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  viewAllPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  viewAllText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  emptyNoticeText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#8E8D94',
  },
  timelineList: {
    marginTop: 4,
  },
});
