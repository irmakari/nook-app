import React, { useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ActivityCalendarProps } from './types';
import { styles } from './styles';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function ActivityCalendar({
  selectedDate,
  onSelectDate,
  activeDates = [3, 4, 5, 8, 11, 14, 18, 21, 24, 25, 27, 28, 30],
  specialDates = [{ day: 27, icon: 'airplane' }],
}: ActivityCalendarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(selectedDate));

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Generate days for the month
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday as 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleDayPress = (day: number) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const newDate = new Date(year, month, day);
    onSelectDate(newDate);
  };

  // Calendar cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    });
  }

  // Next month leading days to complete full rows (multiple of 7)
  const remaining = 7 - (calendarCells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      calendarCells.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }
  }

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
          borderColor: isDark ? '#26262B' : '#EFECE6',
        },
      ]}>
      {/* Month & Year Header Pill + Navigation */}
      <View style={styles.monthRow}>
        <View
          style={[
            styles.monthPill,
            {
              backgroundColor: isDark ? '#26262F' : '#F4F1EA',
            },
          ]}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color={isDark ? '#F4F4F5' : '#18181B'}
          />
          <ThemedText style={styles.monthText}>
            {MONTH_NAMES[month]} {year}
          </ThemedText>
        </View>

        <View style={styles.iconButtonsRow}>
          <Pressable
            onPress={handlePrevMonth}
            style={({ pressed }) => [
              styles.circleIconBtn,
              {
                backgroundColor: pressed
                  ? isDark
                    ? '#26262F'
                    : '#EAE6DF'
                  : 'transparent',
              },
            ]}>
            <Ionicons
              name="chevron-back"
              size={18}
              color={isDark ? '#A1A1AA' : '#71717A'}
            />
          </Pressable>
          <Pressable
            onPress={handleNextMonth}
            style={({ pressed }) => [
              styles.circleIconBtn,
              {
                backgroundColor: pressed
                  ? isDark
                    ? '#26262F'
                    : '#EAE6DF'
                  : 'transparent',
              },
            ]}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isDark ? '#A1A1AA' : '#71717A'}
            />
          </Pressable>
        </View>
      </View>

      {/* Weekday Names Header */}
      <View style={styles.daysHeaderRow}>
        {DAYS.map((d) => (
          <View key={d} style={styles.dayHeaderCell}>
            <ThemedText style={styles.dayHeaderText}>{d}</ThemedText>
          </View>
        ))}
      </View>

      {/* Dates Grid */}
      <View style={styles.datesGrid}>
        {calendarCells.map((item, index) => {
          if (!item.isCurrentMonth) {
            return (
              <View key={`prev-next-${index}`} style={styles.dateCell}>
                <ThemedText
                  style={[
                    styles.dateText,
                    { color: isDark ? '#3F3F46' : '#D4D4D8' },
                  ]}>
                  {item.day}
                </ThemedText>
              </View>
            );
          }

          const isSelected = isSameDay(item.date, selectedDate);
          const hasActivity = activeDates.includes(item.day);
          const special = specialDates.find((s) => s.day === item.day);

          let cellBg = 'transparent';
          let textColor = isDark ? '#F4F4F5' : '#18181B';

          if (isSelected) {
            cellBg = isDark ? '#F4F4F5' : '#18181B';
            textColor = isDark ? '#18181B' : '#FFFFFF';
          } else if (hasActivity) {
            cellBg = isDark ? '#26262E' : '#EAE6DF';
          }

          return (
            <Pressable
              key={`day-${item.day}`}
              onPress={() => handleDayPress(item.day)}
              style={[
                styles.dateCell,
                {
                  backgroundColor: cellBg,
                },
              ]}>
              <ThemedText
                style={[
                  styles.dateText,
                  {
                    color: textColor,
                    fontFamily: isSelected || hasActivity ? 'Poppins_600SemiBold' : 'Poppins_400Regular',
                  },
                ]}>
                {item.day}
              </ThemedText>

              {special && !isSelected && (
                <View style={styles.specialBadge}>
                  <Ionicons name="airplane" size={10} color="#7FB9E6" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
