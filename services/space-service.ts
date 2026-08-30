import { Platform } from 'react-native';

import { ListTemplate } from '@/constants/list-templates';

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

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:5180/api' : 'http://localhost:5180/api');

class SpaceService {
  private currentUser: User = {
    id: 'user-irmak',
    name: 'Irmak',
    email: 'irmak@nook.app',
    initials: 'IR',
    avatarColor: '#7FB9E6',
  };

  private spaces: Space[] = [];
  private listeners: (() => void)[] = [];

  private async request<T>(path: string, options?: RequestInit, allowNotFound = false): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });
    if (allowNotFound && response.status === 404) return undefined as T;
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Nook API ${response.status}: ${details || response.statusText}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  private async mutate<T>(path: string, options: RequestInit): Promise<T> {
    const result = await this.request<T>(path, options);
    this.notify();
    return result;
  }

  public getCurrentUser(): User { return { ...this.currentUser }; }

  public updateCurrentUser(updates: Partial<User>): User {
    this.currentUser = { ...this.currentUser, ...updates, initials: updates.name ? updates.name.slice(0, 2).toUpperCase() : this.currentUser.initials };
    this.notify();
    return { ...this.currentUser };
  }

  public async getSpaces(): Promise<Space[]> {
    this.spaces = await this.request<Space[]>('/spaces');
    return this.spaces;
  }

  public async getSpaceById(id: string): Promise<Space | undefined> {
    const space = await this.request<Space | undefined>(`/spaces/${encodeURIComponent(id)}`, undefined, true);
    if (space) this.spaces = [space, ...this.spaces.filter((item) => item.id !== space.id)];
    return space;
  }

  public createSpace(payload: CreateSpacePayload): Promise<Space> { return this.mutate('/spaces', { method: 'POST', body: JSON.stringify(payload) }); }
  public updateSpace(id: string, updates: Partial<Space>): Promise<Space | undefined> { return this.mutate(`/spaces/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(updates) }); }
  public async deleteSpace(id: string): Promise<boolean> { await this.mutate<void>(`/spaces/${encodeURIComponent(id)}`, { method: 'DELETE' }); return true; }
  public getSpaceMembers(spaceId: string): Promise<SpaceMember[]> { return this.request(`/spaces/${encodeURIComponent(spaceId)}/members`); }
  public addSpaceMember(spaceId: string, member: SpaceMember): Promise<Space | undefined> { return this.mutate(`/spaces/${encodeURIComponent(spaceId)}/members`, { method: 'POST', body: JSON.stringify(member) }); }
  public removeSpaceMember(spaceId: string, memberName: string): Promise<Space | undefined> { return this.mutate(`/spaces/${encodeURIComponent(spaceId)}/members/${encodeURIComponent(memberName)}`, { method: 'DELETE' }); }

  public getAvailableUsersForSpace(spaceId: string): SpaceMember[] {
    const existingNames = this.spaces.find((space) => space.id === spaceId)?.members.map((member) => member.name) ?? [];
    return ALL_MOCK_USERS.filter((user) => !existingNames.includes(user.name));
  }

  public getActivities(): Promise<Activity[]> { return this.request('/activities'); }
  public getPlans(spaceId?: string): Promise<Plan[]> { return this.request(`/plans${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`); }
  public getPlanById(id: string): Promise<Plan | undefined> { return this.request(`/plans/${encodeURIComponent(id)}`, undefined, true); }
  public createPlan(payload: CreatePlanPayload): Promise<Plan> { return this.mutate('/plans', { method: 'POST', body: JSON.stringify(payload) }); }
  public votePlanOption(planId: string, optionId: string, user: SpaceMember): Promise<Plan | undefined> { return this.mutate(`/plans/${encodeURIComponent(planId)}/options/${encodeURIComponent(optionId)}/vote`, { method: 'POST', body: JSON.stringify({ user }) }); }
  public finalizePlan(planId: string, optionId: string): Promise<Plan | undefined> { return this.mutate(`/plans/${encodeURIComponent(planId)}/finalize`, { method: 'POST', body: JSON.stringify({ optionId }) }); }
  public rsvpPlan(planId: string, user: SpaceMember, status: PlanRSVPStatus): Promise<Plan | undefined> { return this.mutate(`/plans/${encodeURIComponent(planId)}/rsvp`, { method: 'POST', body: JSON.stringify({ user, status }) }); }
  public async deletePlan(id: string): Promise<boolean> { await this.mutate<void>(`/plans/${encodeURIComponent(id)}`, { method: 'DELETE' }); return true; }

  public getPolls(spaceId?: string): Promise<Poll[]> { return this.request(`/polls${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`); }
  public getPollsByPlanId(planId: string): Promise<Poll[]> { return this.request(`/polls?planId=${encodeURIComponent(planId)}`); }
  public getPollById(id: string): Promise<Poll | undefined> { return this.request(`/polls/${encodeURIComponent(id)}`, undefined, true); }
  public createPoll(payload: CreatePollPayload): Promise<Poll> { return this.mutate('/polls', { method: 'POST', body: JSON.stringify(payload) }); }
  public votePoll(pollId: string, optionId: string, user: SpaceMember): Promise<Poll | undefined> { return this.mutate(`/polls/${encodeURIComponent(pollId)}/options/${encodeURIComponent(optionId)}/vote`, { method: 'POST', body: JSON.stringify({ user }) }); }
  public addPollOption(pollId: string, text: string, user: SpaceMember): Promise<Poll | undefined> { return this.mutate(`/polls/${encodeURIComponent(pollId)}/options`, { method: 'POST', body: JSON.stringify({ text, user }) }); }
  public closePoll(pollId: string): Promise<Poll | undefined> { return this.mutate(`/polls/${encodeURIComponent(pollId)}/close`, { method: 'POST' }); }
  public async deletePoll(pollId: string): Promise<boolean> { await this.mutate<void>(`/polls/${encodeURIComponent(pollId)}`, { method: 'DELETE' }); return true; }

  public getLists(spaceId?: string): Promise<SharedList[]> { return this.request(`/lists${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`); }
  public getListById(id: string): Promise<SharedList | undefined> { return this.request(`/lists/${encodeURIComponent(id)}`, undefined, true); }
  public createList(payload: CreateListPayload): Promise<SharedList> { return this.mutate('/lists', { method: 'POST', body: JSON.stringify(payload) }); }
  public addListItem(listId: string, text: string, user: SpaceMember, note?: string): Promise<SharedList | undefined> { return this.mutate(`/lists/${encodeURIComponent(listId)}/items`, { method: 'POST', body: JSON.stringify({ text, note, user }) }); }
  public toggleListItem(listId: string, itemId: string, user: SpaceMember): Promise<SharedList | undefined> { return this.mutate(`/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}/toggle`, { method: 'POST', body: JSON.stringify({ user }) }); }
  public deleteListItem(listId: string, itemId: string): Promise<SharedList | undefined> { return this.mutate(`/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' }); }
  public clearCompletedItems(listId: string): Promise<SharedList | undefined> { return this.mutate(`/lists/${encodeURIComponent(listId)}/clear-completed`, { method: 'POST' }); }
  public async deleteList(listId: string): Promise<boolean> { await this.mutate<void>(`/lists/${encodeURIComponent(listId)}`, { method: 'DELETE' }); return true; }

  public getTasks(spaceId?: string): Promise<Task[]> { return this.request(`/tasks${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`); }
  public getTaskById(id: string): Promise<Task | undefined> { return this.request(`/tasks/${encodeURIComponent(id)}`, undefined, true); }
  public createTask(payload: CreateTaskPayload): Promise<Task> { return this.mutate('/tasks', { method: 'POST', body: JSON.stringify(payload) }); }
  public toggleTask(taskId: string, user: SpaceMember): Promise<Task | undefined> { return this.mutate(`/tasks/${encodeURIComponent(taskId)}/toggle`, { method: 'POST', body: JSON.stringify({ user }) }); }
  public claimTask(taskId: string, user: SpaceMember): Promise<Task | undefined> { return this.mutate(`/tasks/${encodeURIComponent(taskId)}/claim`, { method: 'POST', body: JSON.stringify({ user }) }); }
  public updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined> { return this.mutate(`/tasks/${encodeURIComponent(taskId)}`, { method: 'PATCH', body: JSON.stringify(updates) }); }
  public async deleteTask(taskId: string): Promise<boolean> { await this.mutate<void>(`/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' }); return true; }

  public getNotes(spaceId?: string): Promise<Note[]> { return this.request(`/notes${spaceId ? `?spaceId=${encodeURIComponent(spaceId)}` : ''}`); }
  public getNoteById(id: string): Promise<Note | undefined> { return this.request(`/notes/${encodeURIComponent(id)}`, undefined, true); }
  public createNote(payload: CreateNotePayload): Promise<Note> { return this.mutate('/notes', { method: 'POST', body: JSON.stringify(payload) }); }
  public updateNote(noteId: string, updates: UpdateNotePayload): Promise<Note | undefined> { return this.mutate(`/notes/${encodeURIComponent(noteId)}`, { method: 'PATCH', body: JSON.stringify(updates) }); }
  public togglePinNote(noteId: string): Promise<Note | undefined> { return this.mutate(`/notes/${encodeURIComponent(noteId)}/toggle-pin`, { method: 'POST' }); }
  public async deleteNote(noteId: string): Promise<boolean> { await this.mutate<void>(`/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' }); return true; }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((item) => item !== listener); };
  }

  private notify() { this.listeners.forEach((listener) => listener()); }
}

export const spaceService = new SpaceService();
