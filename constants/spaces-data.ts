import { SpaceThemeKey } from './theme';

export interface SpaceMember {
  name: string;
  avatarColor?: string;
  initials: string;
}

export interface PlanItem {
  id: string;
  title: string;
  date: string;
  location?: string;
  attendeesCount: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollItem {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedId?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  assignedTo?: string;
}

export interface ListItem {
  id: string;
  title: string;
  itemCount: number;
  preview: string[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Space {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  themeKey: SpaceThemeKey;
  memberCount: number;
  members: SpaceMember[];
  recentActivity: string;
  recentActivityTime: string;
  plans: PlanItem[];
  polls: PollItem[];
  todos: TodoItem[];
  lists: ListItem[];
  notes: NoteItem[];
}

export interface ActivityFeedItem {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceThemeKey: SpaceThemeKey;
  user: string;
  action: string;
  target: string;
  timeAgo: string;
  type: 'plan' | 'poll' | 'todo' | 'note' | 'list';
}

export const INITIAL_SPACES: Space[] = [
  {
    id: 'kankiler',
    name: 'Kankiler',
    tagline: 'Weekend plans & night out',
    icon: '✨',
    themeKey: 'lavender',
    memberCount: 5,
    members: [
      { name: 'Irmak', initials: 'IR' },
      { name: 'Maya', initials: 'MA' },
      { name: 'Can', initials: 'CN' },
      { name: 'Selin', initials: 'SL' },
      { name: 'Derin', initials: 'DR' },
    ],
    recentActivity: "Maya voted on Cecconi's dinner poll",
    recentActivityTime: '12m ago',
    plans: [
      {
        id: 'p1',
        title: 'Sunset Cocktails & Dinner',
        date: 'Sat, 20:00',
        location: "Cecconi's Bosphorus",
        attendeesCount: 5,
      },
      {
        id: 'p2',
        title: 'Berlin Trip Coffee Sync',
        date: 'Tue, 19:30',
        location: 'Soho House Lounge',
        attendeesCount: 4,
      },
    ],
    polls: [
      {
        id: 'pol1',
        question: 'Where are we going after dinner?',
        totalVotes: 5,
        userVotedId: 'opt1',
        options: [
          { id: 'opt1', text: 'Lucca Bebek', votes: 3 },
          { id: 'opt2', text: 'Klein Phönix', votes: 2 },
        ],
      },
    ],
    todos: [
      { id: 't1', text: 'Book table reservation for 5', completed: true, assignedTo: 'Irmak' },
      { id: 't2', text: 'Check DJ set schedule at Klein', completed: false, assignedTo: 'Can' },
    ],
    lists: [
      {
        id: 'l1',
        title: 'Berlin Airbnb Wishlist',
        itemCount: 4,
        preview: ['Mitte Loft with Balcony', 'Kreuzberg Studio', 'Prenzlauer Berg Flat'],
      },
      {
        id: 'l2',
        title: 'Pre-party Spotify Tracks',
        itemCount: 18,
        preview: ['Kaytranada - Doberman', 'Disclosure - She’s Gone', 'Peggy Gou - Find The Way'],
      },
    ],
    notes: [
      {
        id: 'n1',
        title: 'Dinner Booking Details',
        content: 'Table confirmed under Irmak Ari. Inside booth near garden terrace.',
        updatedAt: 'Yesterday',
      },
    ],
  },
  {
    id: 'ev',
    name: 'Ev',
    tagline: 'Apartment 4B & groceries',
    icon: '🌿',
    themeKey: 'sage',
    memberCount: 3,
    members: [
      { name: 'Irmak', initials: 'IR' },
      { name: 'Efe', initials: 'EF' },
      { name: 'Lara', initials: 'LR' },
    ],
    recentActivity: 'Efe added Oat Milk to market list',
    recentActivityTime: '45m ago',
    plans: [
      {
        id: 'p3',
        title: 'Sunday Deep Cleaning',
        date: 'Sun, 11:00',
        location: 'Living room & kitchen',
        attendeesCount: 3,
      },
    ],
    polls: [
      {
        id: 'pol2',
        question: 'Which coffee beans this month?',
        totalVotes: 3,
        userVotedId: 'opt_c1',
        options: [
          { id: 'opt_c1', text: 'Petra Colombia El Paraiso', votes: 2 },
          { id: 'opt_c2', text: 'Kronotrop Ethiopia Guji', votes: 1 },
        ],
      },
    ],
    todos: [
      { id: 't3', text: 'Oat Milk (Barista edition)', completed: false, assignedTo: 'Efe' },
      { id: 't4', text: 'Sourdough bread', completed: true, assignedTo: 'Irmak' },
      { id: 't5', text: 'Olive oil & sea salt flakes', completed: false },
      { id: 't6', text: 'Replace bathroom light bulb', completed: false, assignedTo: 'Lara' },
    ],
    lists: [
      {
        id: 'l3',
        title: 'Living Room Upgrades',
        itemCount: 3,
        preview: ['Linen throw pillows', 'Artemide Tolomeo lamp', 'Ceramic incense holder'],
      },
    ],
    notes: [
      {
        id: 'n2',
        title: 'Building WiFi & Info',
        content: 'Apartment WiFi: Nook_Fiber_5G | Pass: sunset2026! Building door: #4012',
        updatedAt: 'Aug 15',
      },
    ],
  },
  {
    id: 'manita',
    name: 'Manita',
    tagline: 'Our cozy corner & date nights',
    icon: '🕯️',
    themeKey: 'rose',
    memberCount: 2,
    members: [
      { name: 'Irmak', initials: 'IR' },
      { name: 'Cem', initials: 'CM' },
    ],
    recentActivity: "Cem added 'Saturday Jazz Night' plan",
    recentActivityTime: '2h ago',
    plans: [
      {
        id: 'p4',
        title: 'Saturday Jazz Night',
        date: 'Sat, 21:00',
        location: 'Nardis Jazz Club',
        attendeesCount: 2,
      },
      {
        id: 'p5',
        title: 'Ceramics & Coffee Workshop',
        date: 'Next Sun, 14:00',
        location: 'Moda Atelier',
        attendeesCount: 2,
      },
    ],
    polls: [
      {
        id: 'pol3',
        question: 'Film night pick?',
        totalVotes: 2,
        options: [
          { id: 'm1', text: 'Past Lives', votes: 1 },
          { id: 'm2', text: 'Anatomy of a Fall', votes: 1 },
        ],
      },
    ],
    todos: [
      { id: 't7', text: 'Book jazz club front row', completed: true, assignedTo: 'Cem' },
      { id: 't8', text: 'Pick up anniversary film prints', completed: false, assignedTo: 'Irmak' },
    ],
    lists: [
      {
        id: 'l4',
        title: 'Must-Try Bakeries & Cafes',
        itemCount: 6,
        preview: ['Sour & Sweet Moda', 'Apartiman Yeniköy', 'Bready Nişantaşı'],
      },
      {
        id: 'l5',
        title: 'Cozy Movie Watchlist',
        itemCount: 8,
        preview: ['Aftersun', 'Perfect Days', 'La Chimera'],
      },
    ],
    notes: [
      {
        id: 'n3',
        title: 'Bodrum Getaway Flight',
        content: 'TK2510 at 09:15 AM from IST. Gate closes 20 mins prior.',
        updatedAt: 'Aug 22',
      },
    ],
  },
  {
    id: 'yaz-tatili',
    name: 'Yaz Tatili',
    tagline: 'Kaş & Bodrum summer crew',
    icon: '🌊',
    themeKey: 'terracotta',
    memberCount: 6,
    members: [
      { name: 'Irmak', initials: 'IR' },
      { name: 'Cem', initials: 'CM' },
      { name: 'Maya', initials: 'MA' },
      { name: 'Can', initials: 'CN' },
      { name: 'Bora', initials: 'BR' },
      { name: 'Aslı', initials: 'AS' },
    ],
    recentActivity: 'Bora reserved Kekova boat tour',
    recentActivityTime: '5h ago',
    plans: [
      {
        id: 'p6',
        title: 'Kekova Sunken City Boat Day',
        date: 'July 18, 10:00',
        location: 'Kaş Harbour Pier 3',
        attendeesCount: 6,
      },
    ],
    polls: [
      {
        id: 'pol4',
        question: 'Rental car pickup point?',
        totalVotes: 5,
        userVotedId: 'air1',
        options: [
          { id: 'air1', text: 'Dalaman Airport (DLM)', votes: 4 },
          { id: 'air2', text: 'Antalya Airport (AYT)', votes: 1 },
        ],
      },
    ],
    todos: [
      { id: 't9', text: 'Confirm villa deposit transfer', completed: true, assignedTo: 'Irmak' },
      { id: 't10', text: 'Snorkel gear for all 6', completed: false, assignedTo: 'Bora' },
    ],
    lists: [
      {
        id: 'l6',
        title: 'Summer Essentials Checklist',
        itemCount: 7,
        preview: ['Sunscreen SPF 50', 'Underwater camera', 'Polaroid film packs'],
      },
    ],
    notes: [
      {
        id: 'n4',
        title: 'Villa Check-in Details',
        content: 'Villa Oliveto, Kaş Bay. Key lockbox code: 8842.',
        updatedAt: 'Aug 10',
      },
    ],
  },
];

export const INITIAL_ACTIVITY: ActivityFeedItem[] = [
  {
    id: 'act1',
    spaceId: 'kankiler',
    spaceName: 'Kankiler',
    spaceThemeKey: 'lavender',
    user: 'Maya',
    action: 'voted in poll',
    target: "Where are we going after dinner? (Lucca Bebek)",
    timeAgo: '12m ago',
    type: 'poll',
  },
  {
    id: 'act2',
    spaceId: 'ev',
    spaceName: 'Ev',
    spaceThemeKey: 'sage',
    user: 'Efe',
    action: 'added item to to-do',
    target: 'Oat Milk (Barista edition)',
    timeAgo: '45m ago',
    type: 'todo',
  },
  {
    id: 'act3',
    spaceId: 'manita',
    spaceName: 'Manita',
    spaceThemeKey: 'rose',
    user: 'Cem',
    action: 'created a new plan',
    target: 'Saturday Jazz Night @ Nardis',
    timeAgo: '2h ago',
    type: 'plan',
  },
  {
    id: 'act4',
    spaceId: 'yaz-tatili',
    spaceName: 'Yaz Tatili',
    spaceThemeKey: 'terracotta',
    user: 'Bora',
    action: 'confirmed reservation',
    target: 'Kekova Sunken City Boat Day',
    timeAgo: '5h ago',
    type: 'plan',
  },
  {
    id: 'act5',
    spaceId: 'kankiler',
    spaceName: 'Kankiler',
    spaceThemeKey: 'lavender',
    user: 'Can',
    action: 'added tracks to list',
    target: 'Pre-party Spotify Tracks',
    timeAgo: 'Yesterday',
    type: 'list',
  },
  {
    id: 'act6',
    spaceId: 'ev',
    spaceName: 'Ev',
    spaceThemeKey: 'sage',
    user: 'Irmak',
    action: 'completed task',
    target: 'Sourdough bread',
    timeAgo: 'Yesterday',
    type: 'todo',
  },
];
