import { Ionicons } from '@expo/vector-icons';

export type ListTemplate =
  | 'shopping'
  | 'watchlist'
  | 'places'
  | 'wishlist'
  | 'trip'
  | 'blank';

export interface ListTemplateConfig {
  id: ListTemplate;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeLabel: string;
  completedLabel: string;
  placeholder: string;
  emptyPrompt: string;
  defaultName: string;
}

export const LIST_TEMPLATES: Record<ListTemplate, ListTemplateConfig> = {
  shopping: {
    id: 'shopping',
    title: 'Shopping',
    subtitle: 'Things we need',
    icon: 'cart-outline',
    activeLabel: 'To get',
    completedLabel: 'Got it',
    placeholder: 'e.g. Oat milk, Coffee, Eggs',
    emptyPrompt: 'What do we need?',
    defaultName: 'Weekend groceries',
  },
  watchlist: {
    id: 'watchlist',
    title: 'Watchlist',
    subtitle: 'Movies, shows & more',
    icon: 'film-outline',
    activeLabel: 'To watch',
    completedLabel: 'Watched',
    placeholder: 'e.g. Past Lives, Challengers',
    emptyPrompt: 'What should we watch next?',
    defaultName: 'Movies we need to watch',
  },
  places: {
    id: 'places',
    title: 'Places',
    subtitle: 'Somewhere we should go',
    icon: 'location-outline',
    activeLabel: 'Want to go',
    completedLabel: 'Been there',
    placeholder: 'e.g. Basta, Soho House, Moda Sahnesi',
    emptyPrompt: 'Where should we go?',
    defaultName: 'Kadıköy spots',
  },
  wishlist: {
    id: 'wishlist',
    title: 'Wishlist',
    subtitle: 'Things we want',
    icon: 'heart-outline',
    activeLabel: 'Wishlist',
    completedLabel: 'Got it',
    placeholder: 'e.g. Espresso machine, Big mirror',
    emptyPrompt: 'What are we wishing for?',
    defaultName: 'Apartment wishlist',
  },
  trip: {
    id: 'trip',
    title: 'Trip',
    subtitle: "Don't forget anything",
    icon: 'briefcase-outline',
    activeLabel: 'Need to pack',
    completedLabel: 'Packed',
    placeholder: 'e.g. Passport, Chargers, Swimsuit',
    emptyPrompt: 'What should we pack?',
    defaultName: 'Kaş trip packing',
  },
  blank: {
    id: 'blank',
    title: 'Blank',
    subtitle: 'Start from scratch',
    icon: 'list-outline',
    activeLabel: 'Items',
    completedLabel: 'Done',
    placeholder: 'Add an item...',
    emptyPrompt: 'Nothing here yet.',
    defaultName: 'Shared list',
  },
};

export const LIST_TEMPLATES_ARRAY: ListTemplateConfig[] = [
  LIST_TEMPLATES.shopping,
  LIST_TEMPLATES.watchlist,
  LIST_TEMPLATES.places,
  LIST_TEMPLATES.wishlist,
  LIST_TEMPLATES.trip,
  LIST_TEMPLATES.blank,
];
