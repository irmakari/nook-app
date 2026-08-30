export interface ActivityCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  activeDates?: number[]; // day numbers that have activity
  specialDates?: { day: number; icon: string }[];
}
