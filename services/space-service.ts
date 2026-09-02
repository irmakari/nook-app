import { Platform } from 'react-native';

import { ListTemplate } from '@/constants/list-templates';
import { deleteSessionValue, getSessionValue, setSessionValue } from '@/services/session-storage';

export type SpaceMemberRole = 'owner' | 'member';

export interface SpaceMember {
  id?: string;
  name: string;
  initials: string;
  role?: SpaceMemberRole;
  joinedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  fullName?: string;
  phone?: string;
}

export interface AuthSession {
  accessToken: string;
  expiresAtUtc: string;
  user: User;
}

export const ALL_MOCK_USERS: SpaceMember[] = [
  { id: 'u1', name: 'Irmak', initials: 'IR', role: 'member' },
  { id: 'u2', name: 'Eren', initials: 'ER', role: 'member' },
  { id: 'u3', name: 'Bengisu', initials: 'BE', role: 'member' },
  { id: 'u4', name: 'İrem', initials: 'İR', role: 'member' },
  { id: 'u5', name: 'Mert', initials: 'ME', role: 'member' },
  { id: 'u6', name: 'Efe', initials: 'EF', role: 'member' },
  { id: 'u7', name: 'Lara', initials: 'LR', role: 'member' },
  { id: 'u8', name: 'Cem', initials: 'CM', role: 'member' },
  { id: 'u9', name: 'Ece', initials: 'EC', role: 'member' },
  { id: 'u10', name: 'Berk', initials: 'BK', role: 'member' },
  { id: 'u11', name: 'Selin', initials: 'SL', role: 'member' },
  { id: 'u12', name: 'Can', initials: 'CN', role: 'member' },
  { id: 'u13', name: 'Derya', initials: 'DY', role: 'member' },
  { id: 'u14', name: 'Deniz', initials: 'DN', role: 'member' },
  { id: 'u15', name: 'Ayşe', initials: 'AY', role: 'member' },
];

export type ActivityType =
  | 'plan_created'
  | 'plan_voted'
  | 'poll_created'
  | 'poll_voted'
  | 'list_created'
  | 'list_item_added'
  | 'task_created'
  | 'task_claimed'
  | 'task_completed'
  | 'note_created'
  | 'note_updated'
  | 'member_joined';

export interface Activity {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceAccentColor: string;
  actorName: string;
  actorInitials: string;
  type: ActivityType;
  entityType?: 'plan' | 'poll' | 'list' | 'todo' | 'note' | 'member';
  entityId?: string;
  targetTitle?: string;
  actionText: string;
  createdAt: string;
}

export interface UpcomingPlan {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  goingCount: number;
  maybeCount?: number;
  attendees?: SpaceMember[];
  status?: PlanStatus;
}

export interface SpaceActivity {
  id: string;
  user: string;
  action: string;
  target?: string;
  timeAgo: string;
}

export interface Space {
  id: string;
  name: string;
  tagline?: string;
  icon: string;
  accentColor: string;
  type?: 'home' | 'friends' | 'partner' | 'trip' | 'blank';
  sections?: string[];
  sectionMeta?: Record<string, string>;
  memberCount: number;
  members: SpaceMember[];
  upcomingPlan?: UpcomingPlan;
  recentActivities?: SpaceActivity[];
  recentActivity?: string;
  recentActivityTime?: string;
  isPinned?: boolean;
}

export interface CreateSpacePayload {
  name: string;
  icon: string;
  accentColor: string;
  type: 'home' | 'friends' | 'partner' | 'trip' | 'blank';
  sections: string[];
  tagline?: string;
}

export type PlanStatus = 'confirmed' | 'voting';
export type PlanRSVPStatus = 'going' | 'maybe' | 'declined';

export interface PlanRSVP {
  id: string;
  planId: string;
  userId: string;
  userName: string;
  initials: string;
  status: PlanRSVPStatus;
}

export interface PlanOption {
  id: string;
  planId: string;
  date: string;
  time?: string;
  title: string;
  voterIds: string[];
  voters: SpaceMember[];
}

export interface Plan {
  id: string;
  spaceId: string;
  title: string;
  note?: string;
  location?: string;
  createdBy: string;
  invitedMemberIds: string[];
  status: PlanStatus;
  startAt?: string;
  dateDisplay?: string;
  endAt?: string;
  createdAt: string;
  options?: PlanOption[];
  rsvps?: PlanRSVP[];
  allowMultiple?: boolean;
}

export interface CreatePlanPayload {
  spaceId: string;
  title: string;
  note?: string;
  location?: string;
  mode: 'know' | 'vote';
  singleDate?: string;
  singleTime?: string;
  endTime?: string;
  votingOptions?: { date: string; time?: string }[];
  invitedMembers: SpaceMember[];
  allowMultiple?: boolean;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  createdBy: string;
  createdAt: string;
  voterIds: string[];
  voters: SpaceMember[];
}

export interface Poll {
  id: string;
  spaceId: string;
  planId?: string;
  question: string;
  note?: string;
  createdBy: string;
  allowMultiple: boolean;
  membersCanAddOptions: boolean;
  isClosed?: boolean;
  createdAt: string;
  options: PollOption[];
}

export interface CreatePollPayload {
  spaceId: string;
  question: string;
  note?: string;
  options: string[];
  allowMultiple: boolean;
  membersCanAddOptions: boolean;
}

export interface ListItem {
  id: string;
  listId: string;
  text: string;
  note?: string;
  createdBy: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
}

export interface SharedList {
  id: string;
  spaceId: string;
  name: string;
  description?: string;
  template: ListTemplate;
  createdBy: string;
  createdAt: string;
  items: ListItem[];
}

export interface CreateListPayload {
  spaceId: string;
  name: string;
  description?: string;
  template: ListTemplate;
}

export type TaskStatus = 'open' | 'completed';

export interface Task {
  id: string;
  spaceId: string;
  title: string;
  note?: string;
  createdBy: string;
  assignedTo?: string;
  dueAt?: string;
  status: TaskStatus;
  completedBy?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreateTaskPayload {
  spaceId: string;
  title: string;
  note?: string;
  assignedTo?: string;
  dueAt?: string;
}

export interface Note {
  id: string;
  spaceId: string;
  title?: string;
  content: string;
  isPinned?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotePayload {
  spaceId: string;
  title?: string;
  content: string;
  isPinned?: boolean;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  isPinned?: boolean;
}

import Constants from 'expo-constants';

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const isPhysicalDevice = Constants.isDevice;

  if (isPhysicalDevice) {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host) {
        return `http://${host}:5180/api`;
      }
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5180/api';
  }

  return 'http://127.0.0.1:5180/api';
};

const API_URL = getApiUrl();

const ACCESS_TOKEN_KEY = 'accessToken';
const SESSION_USER_KEY = 'sessionUser';
const PINNED_SPACES_KEY = 'pinnedSpaces';
const SPACE_ORDER_KEY = 'spaceOrder';

const DEFAULT_USER: User = {
  id: 'user-irmak',
  name: 'Irmak',
  email: 'irmak@nook.app',
  initials: 'IR',
  avatarColor: '#7FB9E6',
};

export type SpaceServiceEvent =
  | 'spaces'
  | 'activities'
  | 'session'
  | 'plans'
  | 'polls'
  | 'lists'
  | 'tasks'
  | 'notes';

class SpaceService {
  private accessToken: string | null = null;
  private currentUser: User = DEFAULT_USER;
  private hasLoadedSession = false;

  private spaces: Space[] = [];
  private pinnedSpaceIds: Set<string> = new Set();
  private hasLoadedPinned = false;
  private customSpaceOrder: string[] = [];
  private hasLoadedCustomOrder = false;
  private plansCache: Map<string, Plan> = new Map();
  private listeners: { listener: (event: SpaceServiceEvent) => void; events?: Set<SpaceServiceEvent> }[] = [];
  private notifyTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingEvents = new Set<SpaceServiceEvent>();

  private async loadPinnedSpaces(): Promise<void> {
    if (this.hasLoadedPinned) return;
    try {
      const stored = await getSessionValue(PINNED_SPACES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        this.pinnedSpaceIds = new Set(parsed);
      }
    } catch {
      // fallback
    } finally {
      this.hasLoadedPinned = true;
    }
  }

  private async loadCustomSpaceOrder(): Promise<void> {
    if (this.hasLoadedCustomOrder) return;
    try {
      const stored = await getSessionValue(SPACE_ORDER_KEY);
      if (stored) {
        this.customSpaceOrder = JSON.parse(stored) as string[];
      }
    } catch {
      // fallback
    } finally {
      this.hasLoadedCustomOrder = true;
    }
  }

  private processSpaces(rawSpaces: Space[]): Space[] {
    const list = rawSpaces.map((s) => ({
      ...s,
      isPinned: this.pinnedSpaceIds.has(s.id),
    }));

    if (this.customSpaceOrder.length > 0) {
      const orderMap = new Map(this.customSpaceOrder.map((id, index) => [id, index]));
      return list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const indexA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
        const indexB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
        return indexA - indexB;
      });
    }

    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }

  private spacesSignature(spaces: Space[]): string {
    return JSON.stringify(spaces);
  }

  public async togglePinSpace(spaceId: string): Promise<Space[]> {
    await this.loadPinnedSpaces();
    await this.loadCustomSpaceOrder();
    if (this.pinnedSpaceIds.has(spaceId)) {
      this.pinnedSpaceIds.delete(spaceId);
    } else {
      this.pinnedSpaceIds.add(spaceId);
    }
    await setSessionValue(PINNED_SPACES_KEY, JSON.stringify([...this.pinnedSpaceIds]));
    this.spaces = this.processSpaces(this.spaces);
    this.notify('spaces');
    return this.spaces;
  }

  public async moveSpaceToTop(spaceId: string): Promise<Space[]> {
    await this.loadPinnedSpaces();
    await this.loadCustomSpaceOrder();
    const currentIds = this.spaces.map((s) => s.id);
    const filtered = currentIds.filter((id) => id !== spaceId);
    this.customSpaceOrder = [spaceId, ...filtered];
    await setSessionValue(SPACE_ORDER_KEY, JSON.stringify(this.customSpaceOrder));
    this.spaces = this.processSpaces(this.spaces);
    this.notify('spaces');
    return this.spaces;
  }

  public async reorderSpaces(newOrderIds: string[]): Promise<Space[]> {
    await this.loadPinnedSpaces();
    this.customSpaceOrder = newOrderIds;
    await setSessionValue(SPACE_ORDER_KEY, JSON.stringify(this.customSpaceOrder));
    this.spaces = this.processSpaces(this.spaces);
    this.notify('spaces');
    return this.spaces;
  }

  public async restoreSession(): Promise<User | null> {
    const [accessToken, storedUser] = await Promise.all([
      getSessionValue(ACCESS_TOKEN_KEY),
      getSessionValue(SESSION_USER_KEY),
    ]);

    this.accessToken = accessToken;
    this.hasLoadedSession = true;

    if (!accessToken) {
      this.currentUser = DEFAULT_USER;
      return null;
    }

    try {
      if (storedUser) {
        this.currentUser = this.normalizeUser(JSON.parse(storedUser) as User);
      }

      const user = await this.send<User>('/auth/me', undefined, false, false);
      this.currentUser = this.normalizeUser(user);
      await setSessionValue(SESSION_USER_KEY, JSON.stringify(this.currentUser));
      this.notify(['session', 'spaces', 'activities']);
      return this.getCurrentUser();
    } catch {
      await this.logout(false);
      return null;
    }
  }

  public isSignedIn(): boolean {
    return this.accessToken !== null;
  }

  public async login(credentials: AuthCredentials): Promise<AuthSession> {
    try {
      const session = await this.send<AuthSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }, false, false);
      await this.applySession(session);
      return session;
    } catch (err: any) {
      if (err?.message?.includes('Network request failed') || err?.message?.includes('Failed to fetch')) {
        const namePart = credentials.email.split('@')[0] || 'User';
        const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const session: AuthSession = {
          accessToken: 'local-demo-token-' + Date.now(),
          expiresAtUtc: new Date(Date.now() + 86400000 * 30).toISOString(),
          user: {
            id: 'user-' + Date.now(),
            name,
            email: credentials.email,
            initials: name.slice(0, 2).toUpperCase(),
            avatarColor: '#7FB9E6',
          },
        };
        await this.applySession(session);
        return session;
      }
      throw err;
    }
  }

  public async register(credentials: RegisterCredentials): Promise<AuthSession> {
    try {
      const session = await this.send<AuthSession>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          fullName: credentials.fullName,
          phoneNumber: credentials.phone,
        }),
      }, false, false);
      await this.applySession(session);
      return session;
    } catch (err: any) {
      if (err?.message?.includes('Network request failed') || err?.message?.includes('Failed to fetch')) {
        const name = credentials.fullName || credentials.email.split('@')[0] || 'User';
        const parts = name.trim().split(' ');
        const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
        const session: AuthSession = {
          accessToken: 'local-demo-token-' + Date.now(),
          expiresAtUtc: new Date(Date.now() + 86400000 * 30).toISOString(),
          user: {
            id: 'user-' + Date.now(),
            name,
            email: credentials.email,
            initials,
            avatarColor: '#7FB9E6',
          },
        };
        await this.applySession(session);
        return session;
      }
      throw err;
    }
  }

  public async sendVerificationCode(email: string): Promise<{ message: string }> {
    try {
      return await this.send<{ message: string }>('/auth/send-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }, false, false);
    } catch (err: any) {
      if (err?.message?.includes('Network request failed') || err?.message?.includes('Failed to fetch')) {
        return { message: 'Doğrulama kodu e-posta adresinize gönderildi.' };
      }
      throw err;
    }
  }

  public async verifyCode(email: string, code: string): Promise<{ message: string }> {
    try {
      return await this.send<{ message: string }>('/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      }, false, false);
    } catch (err: any) {
      if (err?.message?.includes('Network request failed') || err?.message?.includes('Failed to fetch')) {
        return { message: 'Doğrulama kodu onaylandı.' };
      }
      throw err;
    }
  }

  public async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await this.send<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }, false, false);
    } catch (err: any) {
      if (err?.message?.includes('Network request failed') || err?.message?.includes('Failed to fetch')) {
        return { message: 'Şifre sıfırlama talimatları gönderildi.' };
      }
      throw err;
    }
  }

  public async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    try {
      await this.send<void>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, newPassword }),
      }, false, false);
    } catch (err: any) {
      if (err?.message?.includes('Network request failed') || err?.message?.includes('Failed to fetch')) {
        return;
      }
      throw err;
    }
  }

  public async logout(shouldNotify = true): Promise<void> {
    this.accessToken = null;
    this.currentUser = DEFAULT_USER;
    await Promise.all([
      deleteSessionValue(ACCESS_TOKEN_KEY),
      deleteSessionValue(SESSION_USER_KEY),
    ]);
    if (shouldNotify) this.notify(['session', 'spaces', 'activities']);
  }

  private async applySession(session: AuthSession): Promise<void> {
    this.accessToken = session.accessToken;
    this.currentUser = this.normalizeUser(session.user);
    await Promise.all([
      setSessionValue(ACCESS_TOKEN_KEY, session.accessToken),
      setSessionValue(SESSION_USER_KEY, JSON.stringify(this.currentUser)),
    ]);
    this.notify(['session', 'spaces', 'activities']);
  }

  private async ensureSessionLoaded(): Promise<void> {
    if (this.hasLoadedSession) return;
    await this.restoreSession();
  }

  private normalizeUser(user: User): User {
    return {
      ...DEFAULT_USER,
      ...user,
      id: String(user.id),
      name: user.name || user.email.split('@')[0] || DEFAULT_USER.name,
      initials: user.initials || user.name?.slice(0, 2).toUpperCase() || DEFAULT_USER.initials,
      avatarColor: user.avatarColor || DEFAULT_USER.avatarColor,
    };
  }

  private async request<T>(path: string, options?: RequestInit, allowNotFound = false): Promise<T> {
    return this.send<T>(path, options, allowNotFound, true);
  }

  private async send<T>(
    path: string,
    options?: RequestInit,
    allowNotFound = false,
    loadStoredSession = true
  ): Promise<T> {
    if (loadStoredSession) await this.ensureSessionLoaded();

    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
          ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
          ...options?.headers,
        },
      });
      if (allowNotFound && response.status === 404) return undefined as T;
      if (!response.ok) {
        const details = await response.text().catch(() => '');
        throw new Error(`Nook API ${response.status}: ${details || response.statusText}`);
      }
      if (response.status === 204) return undefined as T;
      return (await response.json()) as T;
    } catch (err: any) {
      if (allowNotFound && (err?.message?.includes('404') || err?.message?.includes('Network request failed'))) {
        return undefined as T;
      }
      throw err;
    }
  }

  private async mutate<T>(path: string, options: RequestInit): Promise<T> {
    const result = await this.request<T>(path, options);
    this.notify(this.eventsForPath(path));
    return result;
  }

  private eventsForPath(path: string): SpaceServiceEvent[] {
    if (path.startsWith('/spaces')) return ['spaces', 'activities'];
    if (path.startsWith('/plans')) return ['plans', 'spaces', 'activities'];
    if (path.startsWith('/polls')) return ['polls', 'spaces', 'activities'];
    if (path.startsWith('/lists')) return ['lists', 'spaces', 'activities'];
    if (path.startsWith('/tasks')) return ['tasks', 'spaces', 'activities'];
    if (path.startsWith('/notes')) return ['notes', 'spaces', 'activities'];
    return ['spaces', 'activities'];
  }

  public getCurrentUser(): User { return { ...this.currentUser }; }

  public getCurrentMember(): SpaceMember {
    const u = this.currentUser;
    return {
      id: u.id,
      name: u.name,
      initials: u.initials || (u.name ? u.name.slice(0, 2).toUpperCase() : 'US'),
      role: 'member',
    };
  }

  public updateCurrentUser(updates: Partial<User>): User {
    this.currentUser = { ...this.currentUser, ...updates, initials: updates.name ? updates.name.slice(0, 2).toUpperCase() : this.currentUser.initials };
    this.notify('session');
    return { ...this.currentUser };
  }

  public async getSpaces(): Promise<Space[]> {
    await this.loadPinnedSpaces();
    await this.loadCustomSpaceOrder();
    if (this.spaces.length > 0) {
      const previousSignature = this.spacesSignature(this.spaces);
      this.request<Space[]>('/spaces').then((spaces) => {
        if (spaces) {
          const processed = this.processSpaces(spaces);
          const nextSignature = this.spacesSignature(processed);
          this.spaces = processed;
          if (nextSignature !== previousSignature) {
            this.notify('spaces');
          }
        }
      }).catch(() => {});
      return this.processSpaces(this.spaces);
    }
    const raw = await this.request<Space[]>('/spaces');
    this.spaces = this.processSpaces(raw);
    return this.spaces;
  }

  public async getSpaceById(id: string): Promise<Space | undefined> {
    await this.loadPinnedSpaces();
    await this.loadCustomSpaceOrder();
    const cached = this.spaces.find((item) => item.id === id);
    if (cached) {
      this.request<Space | undefined>(`/spaces/${encodeURIComponent(id)}`, undefined, true).then((space) => {
        if (space) {
          const previousSignature = this.spacesSignature(this.spaces);
          const updated = [space, ...this.spaces.filter((item) => item.id !== space.id)];
          this.spaces = this.processSpaces(updated);
          if (this.spacesSignature(this.spaces) !== previousSignature) {
            this.notify('spaces');
          }
        }
      }).catch(() => {});
      return cached;
    }
    const space = await this.request<Space | undefined>(`/spaces/${encodeURIComponent(id)}`, undefined, true);
    if (space) {
      const updated = [space, ...this.spaces.filter((item) => item.id !== space.id)];
      this.spaces = this.processSpaces(updated);
    }
    return space ? { ...space, isPinned: this.pinnedSpaceIds.has(space.id) } : undefined;
  }

  public getSpaceSync(id: string): Space | undefined {
    return this.spaces.find((item) => item.id === id);
  }

  public getPlanSync(id: string): Plan | undefined {
    return this.plansCache.get(id);
  }

  public async createSpace(payload: CreateSpacePayload): Promise<Space> {
    try {
      return await this.mutate('/spaces', { method: 'POST', body: JSON.stringify(payload) });
    } catch (err) {
      // Local fallback if API is unreachable or returns error
      const newSpace: Space = {
        id: `space-${Date.now()}`,
        name: payload.name,
        tagline: payload.type === 'friends'
          ? 'Plans, lists & chaos'
          : payload.type === 'home'
          ? 'Family or roommates'
          : payload.type === 'partner'
          ? 'For you two'
          : payload.type === 'trip'
          ? 'Plan something together'
          : 'Custom space',
        icon: payload.icon || 'people',
        accentColor: payload.accentColor || '#7FB9E6',
        type: payload.type || 'friends',
        memberCount: 1,
        members: [{ id: this.currentUser.id || 'u1', name: this.currentUser.name || 'Irmak', initials: this.currentUser.initials || 'IR', role: 'owner' }],
        recentActivity: `${this.currentUser.name || 'User'} created ${payload.name}`,
        recentActivityTime: 'Just now',
      };
      this.spaces = this.processSpaces([newSpace, ...this.spaces]);
      this.notify(['spaces', 'activities']);
      return newSpace;
    }
  }

  public updateSpace(id: string, updates: Partial<Space>): Promise<Space | undefined> { return this.mutate(`/spaces/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(updates) }); }
  public async deleteSpace(id: string): Promise<boolean> {
    try {
      await this.mutate<void>(`/spaces/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {
      this.spaces = this.spaces.filter((s) => s.id !== id);
      this.notify(['spaces', 'activities']);
    }
    return true;
  }
  public getSpaceMembers(spaceId: string): Promise<SpaceMember[]> { return this.request(`/spaces/${encodeURIComponent(spaceId)}/members`); }
  public addSpaceMember(spaceId: string, member: SpaceMember): Promise<Space | undefined> { return this.mutate(`/spaces/${encodeURIComponent(spaceId)}/members`, { method: 'POST', body: JSON.stringify(member) }); }
  public removeSpaceMember(spaceId: string, memberName: string): Promise<Space | undefined> { return this.mutate(`/spaces/${encodeURIComponent(spaceId)}/members/${encodeURIComponent(memberName)}`, { method: 'DELETE' }); }

  public getAvailableUsersForSpace(spaceId: string): SpaceMember[] {
    const existingNames = this.spaces.find((space) => space.id === spaceId)?.members.map((member) => member.name) ?? [];
    return ALL_MOCK_USERS.filter((user) => !existingNames.includes(user.name));
  }

  public getActivities(): Promise<Activity[]> { return this.request<Activity[]>('/activities').catch(() => []); }
  public async getPlans(spaceId?: string): Promise<Plan[]> {
    const plans = await this.request<Plan[]>(`/plans${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`).catch(() => []);
    if (Array.isArray(plans)) {
      plans.forEach((p) => this.plansCache.set(p.id, p));
    }
    return plans;
  }
  public async getPlanById(id: string): Promise<Plan | undefined> {
    const cached = this.plansCache.get(id);
    if (cached) {
      this.request<Plan | undefined>(`/plans/${encodeURIComponent(id)}`, undefined, true)
        .then((fresh) => {
          if (fresh) {
            this.plansCache.set(id, fresh);
            this.notify('plans');
          }
        })
        .catch(() => {});
      return cached;
    }
    const plan = await this.request<Plan | undefined>(`/plans/${encodeURIComponent(id)}`, undefined, true).catch(() => undefined);
    if (plan) {
      this.plansCache.set(id, plan);
    }
    return plan;
  }
  public async createPlan(payload: CreatePlanPayload): Promise<Plan> {
    const res = await this.mutate<Plan>('/plans', { method: 'POST', body: JSON.stringify(payload) });
    if (res?.id) this.plansCache.set(res.id, res);
    return res;
  }
  public async votePlanOption(planId: string, optionId: string, user: SpaceMember): Promise<Plan | undefined> {
    const res = await this.mutate<Plan | undefined>(`/plans/${encodeURIComponent(planId)}/options/${encodeURIComponent(optionId)}/vote`, { method: 'POST', body: JSON.stringify({ user }) });
    if (res?.id) this.plansCache.set(res.id, res);
    return res;
  }
  public async finalizePlan(planId: string, optionId: string): Promise<Plan | undefined> {
    const res = await this.mutate<Plan | undefined>(`/plans/${encodeURIComponent(planId)}/finalize`, { method: 'POST', body: JSON.stringify({ optionId }) });
    if (res?.id) this.plansCache.set(res.id, res);
    return res;
  }
  public async rsvpPlan(planId: string, user: SpaceMember, status: PlanRSVPStatus): Promise<Plan | undefined> {
    const res = await this.mutate<Plan | undefined>(`/plans/${encodeURIComponent(planId)}/rsvp`, { method: 'POST', body: JSON.stringify({ user, status }) });
    if (res?.id) this.plansCache.set(res.id, res);
    return res;
  }
  public async deletePlan(id: string): Promise<boolean> {
    this.plansCache.delete(id);
    try { await this.mutate<void>(`/plans/${encodeURIComponent(id)}`, { method: 'DELETE' }); } catch {}
    return true;
  }

  public getPolls(spaceId?: string): Promise<Poll[]> { return this.request<Poll[]>(`/polls${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`).catch(() => []); }
  public getPollsByPlanId(planId: string): Promise<Poll[]> { return this.request<Poll[]>(`/polls?planId=${encodeURIComponent(planId)}`).catch(() => []); }
  public getPollById(id: string): Promise<Poll | undefined> { return this.request<Poll | undefined>(`/polls/${encodeURIComponent(id)}`, undefined, true).catch(() => undefined); }
  public createPoll(payload: CreatePollPayload): Promise<Poll> { return this.mutate('/polls', { method: 'POST', body: JSON.stringify(payload) }); }
  public votePoll(pollId: string, optionId: string, user: SpaceMember): Promise<Poll | undefined> { return this.mutate(`/polls/${encodeURIComponent(pollId)}/options/${encodeURIComponent(optionId)}/vote`, { method: 'POST', body: JSON.stringify({ user }) }); }
  public addPollOption(pollId: string, text: string, user: SpaceMember): Promise<Poll | undefined> { return this.mutate(`/polls/${encodeURIComponent(pollId)}/options`, { method: 'POST', body: JSON.stringify({ text, user }) }); }
  public closePoll(pollId: string): Promise<Poll | undefined> { return this.mutate(`/polls/${encodeURIComponent(pollId)}/close`, { method: 'POST' }); }
  public async deletePoll(pollId: string): Promise<boolean> { try { await this.mutate<void>(`/polls/${encodeURIComponent(pollId)}`, { method: 'DELETE' }); } catch {} return true; }

  public getLists(spaceId?: string): Promise<SharedList[]> { return this.request<SharedList[]>(`/lists${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`).catch(() => []); }
  public getListById(id: string): Promise<SharedList | undefined> { return this.request<SharedList | undefined>(`/lists/${encodeURIComponent(id)}`, undefined, true).catch(() => undefined); }
  public createList(payload: CreateListPayload): Promise<SharedList> { return this.mutate('/lists', { method: 'POST', body: JSON.stringify(payload) }); }
  public addListItem(listId: string, text: string, user: SpaceMember, note?: string): Promise<SharedList | undefined> { return this.mutate(`/lists/${encodeURIComponent(listId)}/items`, { method: 'POST', body: JSON.stringify({ text, note, user }) }); }
  public toggleListItem(listId: string, itemId: string, user: SpaceMember): Promise<SharedList | undefined> { return this.mutate(`/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}/toggle`, { method: 'POST', body: JSON.stringify({ user }) }); }
  public deleteListItem(listId: string, itemId: string): Promise<SharedList | undefined> { return this.mutate(`/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' }); }
  public clearCompletedItems(listId: string): Promise<SharedList | undefined> { return this.mutate(`/lists/${encodeURIComponent(listId)}/clear-completed`, { method: 'POST' }); }
  public async deleteList(listId: string): Promise<boolean> { try { await this.mutate<void>(`/lists/${encodeURIComponent(listId)}`, { method: 'DELETE' }); } catch {} return true; }

  public getTasks(spaceId?: string): Promise<Task[]> { return this.request<Task[]>(`/tasks${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`).catch(() => []); }
  public getTaskById(id: string): Promise<Task | undefined> { return this.request<Task | undefined>(`/tasks/${encodeURIComponent(id)}`, undefined, true).catch(() => undefined); }
  public createTask(payload: CreateTaskPayload): Promise<Task> { return this.mutate('/tasks', { method: 'POST', body: JSON.stringify(payload) }); }
  public toggleTask(taskId: string, user: SpaceMember): Promise<Task | undefined> { return this.mutate(`/tasks/${encodeURIComponent(taskId)}/toggle`, { method: 'POST', body: JSON.stringify({ user }) }); }
  public claimTask(taskId: string, user: SpaceMember): Promise<Task | undefined> { return this.mutate(`/tasks/${encodeURIComponent(taskId)}/claim`, { method: 'POST', body: JSON.stringify({ user }) }); }
  public updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined> { return this.mutate(`/tasks/${encodeURIComponent(taskId)}`, { method: 'PATCH', body: JSON.stringify(updates) }); }
  public async deleteTask(taskId: string): Promise<boolean> { try { await this.mutate<void>(`/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' }); } catch {} return true; }

  public getNotes(spaceId?: string): Promise<Note[]> { return this.request<Note[]>(`/notes${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`).catch(() => []); }
  public getNoteById(id: string): Promise<Note | undefined> { return this.request<Note | undefined>(`/notes/${encodeURIComponent(id)}`, undefined, true).catch(() => undefined); }
  public createNote(payload: CreateNotePayload): Promise<Note> { return this.mutate('/notes', { method: 'POST', body: JSON.stringify(payload) }); }
  public updateNote(noteId: string, updates: UpdateNotePayload): Promise<Note | undefined> { return this.mutate(`/notes/${encodeURIComponent(noteId)}`, { method: 'PATCH', body: JSON.stringify(updates) }); }
  public togglePinNote(noteId: string): Promise<Note | undefined> { return this.mutate(`/notes/${encodeURIComponent(noteId)}/toggle-pin`, { method: 'POST' }); }
  public async deleteNote(noteId: string): Promise<boolean> { await this.mutate<void>(`/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }); return true; }

  public subscribe(
    listener: (event: SpaceServiceEvent) => void,
    events?: SpaceServiceEvent[]
  ): () => void {
    const subscription = {
      listener,
      events: events ? new Set(events) : undefined,
    };
    this.listeners.push(subscription);
    return () => { this.listeners = this.listeners.filter((item) => item !== subscription); };
  }

  private notify(events: SpaceServiceEvent | SpaceServiceEvent[]) {
    const list = Array.isArray(events) ? events : [events];
    list.forEach((event) => this.pendingEvents.add(event));

    if (this.notifyTimer !== null) {
      clearTimeout(this.notifyTimer);
    }
    this.notifyTimer = setTimeout(() => {
      this.notifyTimer = null;
      const pendingEvents = [...this.pendingEvents];
      this.pendingEvents.clear();

      this.listeners.forEach(({ listener, events }) => {
        const shouldNotify = !events || pendingEvents.some((event) => events.has(event));
        if (shouldNotify) listener(pendingEvents[0]);
      });
    }, 100);
  }
}

export const spaceService = new SpaceService();
