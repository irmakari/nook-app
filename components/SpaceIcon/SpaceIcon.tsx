import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SpaceIconProps, IconName } from './types';

const ICON_MAP: Record<string, IconName> = {
  // Legacy emoji mappings
  '👯': 'people',
  '🏠': 'home',
  '💘': 'heart',
  '🌊': 'airplane',
  '✨': 'sparkles',
  '☕': 'cafe',
  '🍸': 'wine',
  '🎶': 'musical-notes',
  '🥐': 'restaurant',
  '🍕': 'pizza',
  '🏄': 'fitness',
  '🪴': 'leaf',
  '🗓️': 'calendar-outline',
  '📊': 'bar-chart-outline',
  '📝': 'list-outline',
  '✅': 'checkbox-outline',
  '🛒': 'cart-outline',
  '📌': 'document-text-outline',

  // String names
  friends: 'people',
  people: 'people',
  home: 'home',
  partner: 'heart',
  heart: 'heart',
  trip: 'airplane',
  airplane: 'airplane',
  sparkles: 'sparkles',
  cafe: 'cafe',
  coffee: 'cafe',
  wine: 'wine',
  drinks: 'wine',
  music: 'musical-notes',
  'musical-notes': 'musical-notes',
  restaurant: 'restaurant',
  food: 'restaurant',
  pizza: 'pizza',
  fitness: 'fitness',
  surf: 'fitness',
  leaf: 'leaf',
  plant: 'leaf',
  calendar: 'calendar-outline',
  'calendar-outline': 'calendar-outline',
  'bar-chart': 'bar-chart-outline',
  'bar-chart-outline': 'bar-chart-outline',
  list: 'list-outline',
  'list-outline': 'list-outline',
  todo: 'checkbox-outline',
  checkbox: 'checkbox-outline',
  'checkbox-outline': 'checkbox-outline',
  cart: 'cart-outline',
  shopping: 'cart-outline',
  'cart-outline': 'cart-outline',
  notes: 'document-text-outline',
  'document-text': 'document-text-outline',
  'document-text-outline': 'document-text-outline',
};

export function SpaceIcon({ name, size = 20, color = '#18181B' }: SpaceIconProps) {
  const resolvedIcon: IconName = ICON_MAP[name] || (name in Ionicons.glyphMap ? (name as IconName) : 'sparkles');

  return <Ionicons name={resolvedIcon} size={size} color={color} />;
}
