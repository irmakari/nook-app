import db from '@/data/db.json';
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

// POLL TYPES
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

// SHARED LIST TYPES
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

// TO-DO / TASK TYPES
export type TaskStatus = 'open' | 'completed';

export interface Task {
  id: string;
  spaceId: string;
  title: string;
  note?: string;
  createdBy: string;
  assignedTo?: string; // undefined means "Anyone"
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

// NOTE TYPES
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

class SpaceService {
  private currentUser: User = {
    id: 'user-irmak',
    name: 'Irmak',
    email: 'irmak@nook.app',
    initials: 'IR',
    avatarColor: '#7FB9E6',
  };

  private spaces: Space[] = [...(db.spaces as unknown as Space[])];
  private plans: Plan[] = [...((db.plans || []) as unknown as Plan[])];
  private polls: Poll[] = [...((db.polls || []) as unknown as Poll[])];
  private lists: SharedList[] = [...((db.lists || []) as unknown as SharedList[])];
  private tasks: Task[] = [...((db.tasks || []) as unknown as Task[])];
  private notes: Note[] = [...(((db as any).notes || []) as unknown as Note[])];
  
  private activities: Activity[] = [
    {
      id: 'act-1',
      spaceId: 'kankiler',
      spaceName: 'Kankiler',
      spaceAccentColor: '#7FB9E6',
      actorName: 'Ece',
      actorInitials: 'EC',
      type: 'poll_voted',
      entityType: 'poll',
      entityId: 'poll-1',
      targetTitle: 'Where should we eat?',
      actionText: 'voted on',
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-2',
      spaceId: 'kankiler',
      spaceName: 'Kankiler',
      spaceAccentColor: '#7FB9E6',
      actorName: 'Eren',
      actorInitials: 'ER',
      type: 'poll_voted',
      entityType: 'poll',
      entityId: 'poll-1',
      targetTitle: 'Where should we eat?',
      actionText: 'added "Basta" to',
      createdAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-3',
      spaceId: 'ev',
      spaceName: 'Ev',
      spaceAccentColor: '#B7C96A',
      actorName: 'Efe',
      actorInitials: 'EF',
      type: 'list_item_added',
      entityType: 'list',
      entityId: 'list-3',
      targetTitle: 'Weekend groceries',
      actionText: 'added "Oat milk" to',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-4',
      spaceId: 'kankiler',
      spaceName: 'Kankiler',
      spaceAccentColor: '#7FB9E6',
      actorName: 'Irmak',
      actorInitials: 'IR',
      type: 'plan_created',
      entityType: 'plan',
      entityId: 'plan-1',
      targetTitle: 'Saturday in Kadıköy',
      actionText: 'created a plan',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-5',
      spaceId: 'ev',
      spaceName: 'Ev',
      spaceAccentColor: '#B7C96A',
      actorName: 'Lara',
      actorInitials: 'LR',
      type: 'task_completed',
      entityType: 'todo',
      entityId: 'ev',
      targetTitle: 'Water the plants',
      actionText: 'completed',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-6',
      spaceId: 'manita',
      spaceName: 'Manita',
      spaceAccentColor: '#E7BEF8',
      actorName: 'Cem',
      actorInitials: 'CM',
      type: 'plan_created',
      entityType: 'plan',
      entityId: 'plan-3',
      targetTitle: 'Saturday Jazz Night',
      actionText: 'created plan',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ];

  private listeners: (() => void)[] = [];

  // CURRENT USER
  public getCurrentUser(): User {
    return { ...this.currentUser };
  }

  public updateCurrentUser(updates: Partial<User>): User {
    this.currentUser = {
      ...this.currentUser,
      ...updates,
      initials: updates.name ? updates.name.slice(0, 2).toUpperCase() : this.currentUser.initials,
    };
    this.notify();
    return { ...this.currentUser };
  }

  private populateSpace(space: Space): Space {
    const id = space.id;

    // Attach latest primary plan if exists
    const spacePlans = this.plans.filter((p) => p.spaceId === id);
    const activePlan = spacePlans[spacePlans.length - 1] || spacePlans[0];
    if (activePlan) {
      if (activePlan.status === 'confirmed') {
        const goingList = activePlan.rsvps?.filter((r) => r.status === 'going') || [];
        const maybeList = activePlan.rsvps?.filter((r) => r.status === 'maybe') || [];
        space.upcomingPlan = {
          id: activePlan.id,
          title: activePlan.title,
          date: activePlan.dateDisplay || activePlan.startAt || 'Upcoming',
          location: activePlan.location,
          goingCount: goingList.length,
          maybeCount: maybeList.length,
          attendees: goingList.map((g) => ({ name: g.userName, initials: g.initials })),
          status: 'confirmed',
        };
      } else {
        const totalVotes = activePlan.options?.reduce((acc, opt) => acc + opt.voters.length, 0) || 0;
        space.upcomingPlan = {
          id: activePlan.id,
          title: activePlan.title,
          date: 'Choosing a time',
          location: activePlan.location,
          goingCount: totalVotes,
          status: 'voting',
        };
      }
    } else {
      delete space.upcomingPlan;
    }

    // Dynamic membership count
    space.memberCount = space.members.length;

    // Update sectionMeta Plans count dynamically
    if (space.sectionMeta && space.sections?.includes('Plans')) {
      space.sectionMeta['Plans'] = `${spacePlans.length} upcoming`;
    }

    // Update sectionMeta Polls count
    const spacePolls = this.polls.filter((p) => p.spaceId === id && !p.isClosed);
    if (space.sectionMeta && space.sections?.includes('Polls')) {
      space.sectionMeta['Polls'] = `${spacePolls.length} active`;
    }

    // Update sectionMeta Lists count
    const spaceLists = this.lists.filter((l) => l.spaceId === id);
    const totalItems = spaceLists.reduce((acc, l) => acc + l.items.length, 0);
    if (space.sectionMeta) {
      if (space.sections?.includes('Shared Lists')) {
        space.sectionMeta['Shared Lists'] = `${spaceLists.length} ${spaceLists.length === 1 ? 'list' : 'lists'} · ${totalItems} items`;
      }
      if (space.sections?.includes('Shopping')) {
        const shoppingLists = spaceLists.filter((l) => l.template === 'shopping');
        const shoppingItems = shoppingLists.reduce((acc, l) => acc + l.items.length, 0);
        space.sectionMeta['Shopping'] = `${shoppingLists.length} list · ${shoppingItems} items`;
      }
    }

    // Update sectionMeta To-do count
    const openTasks = this.tasks.filter((t) => t.spaceId === id && t.status === 'open');
    if (space.sectionMeta && space.sections?.includes('To-do')) {
      space.sectionMeta['To-do'] = `${openTasks.length} remaining`;
    }

    // Update sectionMeta Notes count
    const spaceNotes = this.notes.filter((n) => n.spaceId === id);
    if (space.sectionMeta && space.sections?.includes('Notes')) {
      space.sectionMeta['Notes'] = `${spaceNotes.length} ${spaceNotes.length === 1 ? 'note' : 'notes'}`;
    }

    return space;
  }

  // SPACES
  public async getSpaces(): Promise<Space[]> {
    const populated = this.spaces.map((s) => this.populateSpace(s));
    return Promise.resolve(populated);
  }

  public async getSpaceById(id: string): Promise<Space | undefined> {
    const space = this.spaces.find((s) => s.id === id);
    if (!space) return undefined;
    return Promise.resolve({ ...this.populateSpace(space) });
  }

  public async createSpace(payload: CreateSpacePayload): Promise<Space> {
    const id = payload.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    const initialSectionMeta: Record<string, string> = {};
    payload.sections.forEach((sec) => {
      initialSectionMeta[sec] = '0 items';
    });
    
    const newSpace: Space = {
      id,
      name: payload.name.trim(),
      tagline: payload.tagline || this.getDefaultTagline(payload.type),
      icon: payload.icon,
      accentColor: payload.accentColor,
      type: payload.type,
      sections: payload.sections,
      sectionMeta: initialSectionMeta,
      memberCount: 1,
      members: [{ id: this.currentUser.id, name: this.currentUser.name, initials: this.currentUser.initials, role: 'owner' }],
      recentActivities: [],
      recentActivity: 'Space created',
      recentActivityTime: 'Just now',
    };

    this.spaces = [newSpace, ...this.spaces];
    this.logActivity({
      spaceId: newSpace.id,
      spaceName: newSpace.name,
      spaceAccentColor: newSpace.accentColor,
      actorName: this.currentUser.name,
      actorInitials: this.currentUser.initials,
      type: 'member_joined',
      entityType: 'member',
      entityId: newSpace.id,
      actionText: 'created space',
      targetTitle: newSpace.name,
    });

    this.notify();
    return Promise.resolve(newSpace);
  }

  public async updateSpace(id: string, updates: Partial<Space>): Promise<Space | undefined> {
    const space = this.spaces.find((s) => s.id === id);
    if (!space) return undefined;

    Object.assign(space, updates);
    this.notify();
    return Promise.resolve({ ...space });
  }

  public async deleteSpace(id: string): Promise<boolean> {
    const initialLen = this.spaces.length;
    this.spaces = this.spaces.filter((s) => s.id !== id);
    this.notify();
    return Promise.resolve(this.spaces.length < initialLen);
  }

  // SPACE MEMBERS
  public async getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
    const space = this.spaces.find((s) => s.id === spaceId);
    if (!space) return [];
    return Promise.resolve(
      space.members.map((m, idx) => ({
        ...m,
        role: idx === 0 ? 'owner' : m.role || 'member',
      }))
    );
  }

  public async addSpaceMember(spaceId: string, member: SpaceMember): Promise<Space | undefined> {
    const space = this.spaces.find((s) => s.id === spaceId);
    if (!space) return undefined;

    if (!space.members.some((m) => m.name === member.name)) {
      const newMember: SpaceMember = {
        ...member,
        role: 'member',
        joinedAt: new Date().toISOString(),
      };
      space.members = [...space.members, newMember];
      space.memberCount = space.members.length;

      this.logActivity({
        spaceId: space.id,
        spaceName: space.name,
        spaceAccentColor: space.accentColor,
        actorName: member.name,
        actorInitials: member.initials,
        type: 'member_joined',
        entityType: 'member',
        entityId: space.id,
        actionText: 'joined',
        targetTitle: space.name,
      });

      this.notify();
    }
    return Promise.resolve({ ...space });
  }

  public async removeSpaceMember(spaceId: string, memberName: string): Promise<Space | undefined> {
    const space = this.spaces.find((s) => s.id === spaceId);
    if (!space) return undefined;

    space.members = space.members.filter((m) => m.name !== memberName);
    space.memberCount = space.members.length;
    this.notify();
    return Promise.resolve({ ...space });
  }

  public getAvailableUsersForSpace(spaceId: string): SpaceMember[] {
    const space = this.spaces.find((s) => s.id === spaceId);
    if (!space) return ALL_MOCK_USERS;
    const existingNames = space.members.map((m) => m.name);
    return ALL_MOCK_USERS.filter((u) => !existingNames.includes(u.name));
  }

  // ACTIVITIES
  public async getActivities(): Promise<Activity[]> {
    const sorted = [...this.activities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return Promise.resolve(sorted);
  }

  private logActivity(activityData: Omit<Activity, 'id' | 'createdAt'>) {
    const newAct: Activity = {
      ...activityData,
      id: 'act-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    this.activities = [newAct, ...this.activities];
  }

  // PLANS
  public async getPlans(spaceId?: string): Promise<Plan[]> {
    if (spaceId) {
      return Promise.resolve(this.plans.filter((p) => p.spaceId === spaceId));
    }
    return Promise.resolve([...this.plans]);
  }

  public async getPlanById(id: string): Promise<Plan | undefined> {
    return Promise.resolve(this.plans.find((p) => p.id === id));
  }

  public async createPlan(payload: CreatePlanPayload): Promise<Plan> {
    const planId = 'plan-' + Date.now().toString(36);
    const isVoting = payload.mode === 'vote';

    let dateDisplay = 'Upcoming';
    let options: PlanOption[] | undefined;
    let rsvps: PlanRSVP[] | undefined;

    if (isVoting && payload.votingOptions && payload.votingOptions.length > 0) {
      options = payload.votingOptions.map((opt, index) => {
        const optionId = `opt-${planId}-${index + 1}`;
        const title = opt.time ? `${opt.date} · ${opt.time}` : opt.date;
        return {
          id: optionId,
          planId,
          date: opt.date,
          time: opt.time,
          title,
          voterIds: [this.currentUser.name],
          voters: [{ name: this.currentUser.name, initials: this.currentUser.initials }],
        };
      });
      dateDisplay = 'Choosing a time';
    } else {
      const datePart = payload.singleDate || 'This weekend';
      const timePart = payload.singleTime ? ` · ${payload.singleTime}` : '';
      dateDisplay = `${datePart}${timePart}`;
      rsvps = [
        {
          id: 'rsvp-' + Date.now(),
          planId,
          userId: this.currentUser.name,
          userName: this.currentUser.name,
          initials: this.currentUser.initials,
          status: 'going',
        },
      ];
    }

    const newPlan: Plan = {
      id: planId,
      spaceId: payload.spaceId,
      title: payload.title.trim(),
      note: payload.note?.trim(),
      location: payload.location?.trim(),
      createdBy: this.currentUser.name,
      invitedMemberIds: payload.invitedMembers.map((m) => m.name),
      status: isVoting ? 'voting' : 'confirmed',
      startAt: payload.singleDate ? `${payload.singleDate}T${payload.singleTime || '12:00'}:00Z` : undefined,
      dateDisplay,
      createdAt: new Date().toISOString(),
      options,
      rsvps,
      allowMultiple: payload.allowMultiple,
    };

    this.plans = [newPlan, ...this.plans];

    const targetSpace = this.spaces.find((s) => s.id === payload.spaceId);
    if (targetSpace) {
      this.logActivity({
        spaceId: targetSpace.id,
        spaceName: targetSpace.name,
        spaceAccentColor: targetSpace.accentColor,
        actorName: this.currentUser.name,
        actorInitials: this.currentUser.initials,
        type: 'plan_created',
        entityType: 'plan',
        entityId: newPlan.id,
        actionText: 'created a plan',
        targetTitle: newPlan.title,
      });
    }

    this.notify();
    return Promise.resolve(newPlan);
  }

  public async votePlanOption(planId: string, optionId: string, user: SpaceMember): Promise<Plan | undefined> {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan || !plan.options) return undefined;

    const hasVotedThisOption = plan.options.find((o) => o.id === optionId)?.voterIds.includes(user.name);

    plan.options = plan.options.map((opt) => {
      if (opt.id === optionId) {
        const hasVoted = opt.voterIds.includes(user.name);
        const newVoterIds = hasVoted
          ? opt.voterIds.filter((id) => id !== user.name)
          : [...opt.voterIds, user.name];
        const newVoters = hasVoted
          ? opt.voters.filter((v) => v.name !== user.name)
          : [...opt.voters, user];
        return {
          ...opt,
          voterIds: newVoterIds,
          voters: newVoters,
        };
      } else if (plan.allowMultiple === false && !hasVotedThisOption) {
        // Clear votes from other options if single choice is enforced
        return {
          ...opt,
          voterIds: opt.voterIds.filter((id) => id !== user.name),
          voters: opt.voters.filter((v) => v.name !== user.name),
        };
      }
      return opt;
    });

    this.notify();
    return Promise.resolve({ ...plan });
  }

  public async finalizePlan(planId: string, optionId: string): Promise<Plan | undefined> {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan || !plan.options) return undefined;

    const chosenOption = plan.options.find((o) => o.id === optionId);
    if (!chosenOption) return undefined;

    plan.status = 'confirmed';
    plan.dateDisplay = chosenOption.title;
    plan.startAt = `${chosenOption.date}T${chosenOption.time || '12:00'}:00Z`;

    plan.rsvps = chosenOption.voters.map((voter) => ({
      id: `rsvp-${Date.now()}-${voter.name}`,
      planId: plan.id,
      userId: voter.name,
      userName: voter.name,
      initials: voter.initials,
      status: 'going',
    }));

    this.notify();
    return Promise.resolve({ ...plan });
  }

  public async rsvpPlan(planId: string, user: SpaceMember, status: PlanRSVPStatus): Promise<Plan | undefined> {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) return undefined;

    const rsvps = plan.rsvps || [];
    const existingIndex = rsvps.findIndex((r) => r.userId === user.name);

    if (existingIndex >= 0) {
      rsvps[existingIndex] = {
        ...rsvps[existingIndex],
        status,
      };
    } else {
      rsvps.push({
        id: `rsvp-${Date.now()}-${user.name}`,
        planId: plan.id,
        userId: user.name,
        userName: user.name,
        initials: user.initials,
        status,
      });
    }

    plan.rsvps = [...rsvps];
    this.notify();
    return Promise.resolve({ ...plan });
  }

  public async deletePlan(id: string): Promise<boolean> {
    const initialLen = this.plans.length;
    this.plans = this.plans.filter((p) => p.id !== id);
    this.notify();
    return Promise.resolve(this.plans.length < initialLen);
  }

  // POLLS
  public async getPolls(spaceId?: string): Promise<Poll[]> {
    if (spaceId) {
      return Promise.resolve(this.polls.filter((p) => p.spaceId === spaceId));
    }
    return Promise.resolve([...this.polls]);
  }

  public async getPollsByPlanId(planId: string): Promise<Poll[]> {
    return Promise.resolve(this.polls.filter((p) => p.planId === planId));
  }

  public async getPollById(id: string): Promise<Poll | undefined> {
    return Promise.resolve(this.polls.find((p) => p.id === id));
  }

  public async createPoll(payload: CreatePollPayload): Promise<Poll> {
    const pollId = 'poll-' + Date.now().toString(36);
    const createdAt = new Date().toISOString();

    const options: PollOption[] = payload.options.map((optText, index) => ({
      id: `popt-${pollId}-${index + 1}`,
      pollId,
      text: optText.trim(),
      createdBy: this.currentUser.name,
      createdAt,
      voterIds: index === 0 ? [this.currentUser.name] : [],
      voters: index === 0 ? [{ name: this.currentUser.name, initials: this.currentUser.initials }] : [],
    }));

    const newPoll: Poll = {
      id: pollId,
      spaceId: payload.spaceId,
      question: payload.question.trim(),
      note: payload.note?.trim(),
      createdBy: this.currentUser.name,
      allowMultiple: payload.allowMultiple,
      membersCanAddOptions: payload.membersCanAddOptions,
      isClosed: false,
      createdAt,
      options,
    };

    this.polls = [newPoll, ...this.polls];

    const targetSpace = this.spaces.find((s) => s.id === payload.spaceId);
    if (targetSpace) {
      this.logActivity({
        spaceId: targetSpace.id,
        spaceName: targetSpace.name,
        spaceAccentColor: targetSpace.accentColor,
        actorName: this.currentUser.name,
        actorInitials: this.currentUser.initials,
        type: 'poll_created',
        entityType: 'poll',
        entityId: newPoll.id,
        actionText: 'started a poll',
        targetTitle: newPoll.question,
      });
    }

    this.notify();
    return Promise.resolve(newPoll);
  }

  public async votePoll(pollId: string, optionId: string, user: SpaceMember): Promise<Poll | undefined> {
    const poll = this.polls.find((p) => p.id === pollId);
    if (!poll || poll.isClosed) return undefined;

    if (poll.allowMultiple) {
      poll.options = poll.options.map((opt) => {
        if (opt.id === optionId) {
          const hasVoted = opt.voterIds.includes(user.name);
          const newVoterIds = hasVoted
            ? opt.voterIds.filter((id) => id !== user.name)
            : [...opt.voterIds, user.name];
          const newVoters = hasVoted
            ? opt.voters.filter((v) => v.name !== user.name)
            : [...opt.voters, user];
          return {
            ...opt,
            voterIds: newVoterIds,
            voters: newVoters,
          };
        }
        return opt;
      });
    } else {
      const currentVotedOption = poll.options.find((o) => o.voterIds.includes(user.name));
      const isCurrentTarget = currentVotedOption?.id === optionId;

      poll.options = poll.options.map((opt) => {
        if (opt.id === optionId) {
          if (isCurrentTarget) {
            return {
              ...opt,
              voterIds: opt.voterIds.filter((id) => id !== user.name),
              voters: opt.voters.filter((v) => v.name !== user.name),
            };
          } else {
            return {
              ...opt,
              voterIds: [...opt.voterIds, user.name],
              voters: [...opt.voters, user],
            };
          }
        } else {
          return {
            ...opt,
            voterIds: opt.voterIds.filter((id) => id !== user.name),
            voters: opt.voters.filter((v) => v.name !== user.name),
          };
        }
      });
    }

    this.notify();
    return Promise.resolve({ ...poll });
  }

  public async addPollOption(pollId: string, text: string, user: SpaceMember): Promise<Poll | undefined> {
    const poll = this.polls.find((p) => p.id === pollId);
    if (!poll || poll.isClosed) return undefined;

    const newOption: PollOption = {
      id: `popt-${poll.id}-${Date.now().toString(36)}`,
      pollId: poll.id,
      text: text.trim(),
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      voterIds: [user.name],
      voters: [user],
    };

    poll.options = [...poll.options, newOption];
    this.notify();
    return Promise.resolve({ ...poll });
  }

  public async closePoll(pollId: string): Promise<Poll | undefined> {
    const poll = this.polls.find((p) => p.id === pollId);
    if (!poll) return undefined;

    poll.isClosed = true;
    this.notify();
    return Promise.resolve({ ...poll });
  }

  public async deletePoll(pollId: string): Promise<boolean> {
    const initialLen = this.polls.length;
    this.polls = this.polls.filter((p) => p.id !== pollId);
    this.notify();
    return Promise.resolve(this.polls.length < initialLen);
  }

  // SHARED LISTS
  public async getLists(spaceId?: string): Promise<SharedList[]> {
    if (spaceId) {
      return Promise.resolve(this.lists.filter((l) => l.spaceId === spaceId));
    }
    return Promise.resolve([...this.lists]);
  }

  public async getListById(id: string): Promise<SharedList | undefined> {
    return Promise.resolve(this.lists.find((l) => l.id === id));
  }

  public async createList(payload: CreateListPayload): Promise<SharedList> {
    const listId = 'list-' + Date.now().toString(36);
    const createdAt = new Date().toISOString();

    const newList: SharedList = {
      id: listId,
      spaceId: payload.spaceId,
      name: payload.name.trim(),
      description: payload.description?.trim(),
      template: payload.template,
      createdBy: this.currentUser.name,
      createdAt,
      items: [],
    };

    this.lists = [newList, ...this.lists];

    const targetSpace = this.spaces.find((s) => s.id === payload.spaceId);
    if (targetSpace) {
      this.logActivity({
        spaceId: targetSpace.id,
        spaceName: targetSpace.name,
        spaceAccentColor: targetSpace.accentColor,
        actorName: this.currentUser.name,
        actorInitials: this.currentUser.initials,
        type: 'list_created',
        entityType: 'list',
        entityId: newList.id,
        actionText: 'created list',
        targetTitle: newList.name,
      });
    }

    this.notify();
    return Promise.resolve(newList);
  }

  public async addListItem(
    listId: string,
    text: string,
    user: SpaceMember,
    note?: string
  ): Promise<SharedList | undefined> {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) return undefined;

    const newItem: ListItem = {
      id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      listId,
      text: text.trim(),
      note: note?.trim(),
      createdBy: user.name,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    list.items = [...list.items, newItem];

    const targetSpace = this.spaces.find((s) => s.id === list.spaceId);
    if (targetSpace) {
      this.logActivity({
        spaceId: targetSpace.id,
        spaceName: targetSpace.name,
        spaceAccentColor: targetSpace.accentColor,
        actorName: user.name,
        actorInitials: user.initials,
        type: 'list_item_added',
        entityType: 'list',
        entityId: list.id,
        actionText: `added "${newItem.text}" to`,
        targetTitle: list.name,
      });
    }

    this.notify();
    return Promise.resolve({ ...list });
  }

  public async toggleListItem(
    listId: string,
    itemId: string,
    user: SpaceMember
  ): Promise<SharedList | undefined> {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) return undefined;

    list.items = list.items.map((item) => {
      if (item.id === itemId) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          completedBy: nextCompleted ? user.name : undefined,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return item;
    });

    this.notify();
    return Promise.resolve({ ...list });
  }

  public async deleteListItem(listId: string, itemId: string): Promise<SharedList | undefined> {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) return undefined;

    list.items = list.items.filter((item) => item.id !== itemId);
    this.notify();
    return Promise.resolve({ ...list });
  }

  public async clearCompletedItems(listId: string): Promise<SharedList | undefined> {
    const list = this.lists.find((l) => l.id === listId);
    if (!list) return undefined;

    list.items = list.items.filter((item) => !item.completed);
    this.notify();
    return Promise.resolve({ ...list });
  }

  public async deleteList(listId: string): Promise<boolean> {
    const initialLen = this.lists.length;
    this.lists = this.lists.filter((l) => l.id !== listId);
    this.notify();
    return Promise.resolve(this.lists.length < initialLen);
  }

  // TO-DO / TASKS
  public async getTasks(spaceId?: string): Promise<Task[]> {
    if (spaceId) {
      return Promise.resolve(this.tasks.filter((t) => t.spaceId === spaceId));
    }
    return Promise.resolve([...this.tasks]);
  }

  public async getTaskById(id: string): Promise<Task | undefined> {
    return Promise.resolve(this.tasks.find((t) => t.id === id));
  }

  public async createTask(payload: CreateTaskPayload): Promise<Task> {
    const taskId = 'task-' + Date.now().toString(36);
    const createdAt = new Date().toISOString();

    const newTask: Task = {
      id: taskId,
      spaceId: payload.spaceId,
      title: payload.title.trim(),
      note: payload.note?.trim(),
      assignedTo: payload.assignedTo?.trim() || undefined,
      dueAt: payload.dueAt || undefined,
      status: 'open',
      createdBy: this.currentUser.name,
      createdAt,
    };

    this.tasks = [newTask, ...this.tasks];

    const targetSpace = this.spaces.find((s) => s.id === payload.spaceId);
    if (targetSpace) {
      this.logActivity({
        spaceId: targetSpace.id,
        spaceName: targetSpace.name,
        spaceAccentColor: targetSpace.accentColor,
        actorName: this.currentUser.name,
        actorInitials: this.currentUser.initials,
        type: 'task_created',
        entityType: 'todo',
        entityId: targetSpace.id,
        actionText: 'added task',
        targetTitle: newTask.title,
      });
    }

    this.notify();
    return Promise.resolve(newTask);
  }

  public async toggleTask(taskId: string, user: SpaceMember): Promise<Task | undefined> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    const nextStatus = task.status === 'open' ? 'completed' : 'open';
    task.status = nextStatus;
    task.completedBy = nextStatus === 'completed' ? user.name : undefined;
    task.completedAt = nextStatus === 'completed' ? new Date().toISOString() : undefined;

    if (nextStatus === 'completed') {
      const targetSpace = this.spaces.find((s) => s.id === task.spaceId);
      if (targetSpace) {
        this.logActivity({
          spaceId: targetSpace.id,
          spaceName: targetSpace.name,
          spaceAccentColor: targetSpace.accentColor,
          actorName: user.name,
          actorInitials: user.initials,
          type: 'task_completed',
          entityType: 'todo',
          entityId: targetSpace.id,
          actionText: 'completed',
          targetTitle: task.title,
        });
      }
    }

    this.notify();
    return Promise.resolve({ ...task });
  }

  public async claimTask(taskId: string, user: SpaceMember): Promise<Task | undefined> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    task.assignedTo = user.name;

    const targetSpace = this.spaces.find((s) => s.id === task.spaceId);
    if (targetSpace) {
      this.logActivity({
        spaceId: targetSpace.id,
        spaceName: targetSpace.name,
        spaceAccentColor: targetSpace.accentColor,
        actorName: user.name,
        actorInitials: user.initials,
        type: 'task_claimed',
        entityType: 'todo',
        entityId: targetSpace.id,
        actionText: 'took',
        targetTitle: task.title,
      });
    }

    this.notify();
    return Promise.resolve({ ...task });
  }

  public async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return undefined;

    Object.assign(task, updates);
    this.notify();
    return Promise.resolve({ ...task });
  }

  public async deleteTask(taskId: string): Promise<boolean> {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.notify();
    return Promise.resolve(this.tasks.length < initialLen);
  }

  // NOTES
  public async getNotes(spaceId?: string): Promise<Note[]> {
    let list = this.notes;
    if (spaceId) {
      list = list.filter((n) => n.spaceId === spaceId);
    }
    const sorted = [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return Promise.resolve(sorted);
  }

  public async getNoteById(id: string): Promise<Note | undefined> {
    return Promise.resolve(this.notes.find((n) => n.id === id));
  }

  public async createNote(payload: CreateNotePayload): Promise<Note> {
    const noteId = 'note-' + Date.now().toString(36);
    const now = new Date().toISOString();

    const newNote: Note = {
      id: noteId,
      spaceId: payload.spaceId,
      title: payload.title?.trim() || undefined,
      content: payload.content.trim(),
      isPinned: !!payload.isPinned,
      createdBy: this.currentUser.name,
      createdAt: now,
      updatedAt: now,
    };

    this.notes = [newNote, ...this.notes];

    const targetSpace = this.spaces.find((s) => s.id === payload.spaceId);
    if (targetSpace) {
      const displayTitle = newNote.title || newNote.content.slice(0, 24);
      this.logActivity({
        spaceId: targetSpace.id,
        spaceName: targetSpace.name,
        spaceAccentColor: targetSpace.accentColor,
        actorName: this.currentUser.name,
        actorInitials: this.currentUser.initials,
        type: 'note_created',
        entityType: 'note',
        entityId: newNote.id,
        actionText: 'added note',
        targetTitle: displayTitle,
      });
    }

    this.notify();
    return Promise.resolve(newNote);
  }

  public async updateNote(noteId: string, updates: UpdateNotePayload): Promise<Note | undefined> {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return undefined;

    if (updates.title !== undefined) note.title = updates.title.trim() || undefined;
    if (updates.content !== undefined) note.content = updates.content.trim();
    if (updates.isPinned !== undefined) note.isPinned = updates.isPinned;
    note.updatedAt = new Date().toISOString();

    this.notify();
    return Promise.resolve({ ...note });
  }

  public async togglePinNote(noteId: string): Promise<Note | undefined> {
    const note = this.notes.find((n) => n.id === noteId);
    if (!note) return undefined;

    note.isPinned = !note.isPinned;
    this.notify();
    return Promise.resolve({ ...note });
  }

  public async deleteNote(noteId: string): Promise<boolean> {
    const initialLen = this.notes.length;
    this.notes = this.notes.filter((n) => n.id !== noteId);
    this.notify();
    return Promise.resolve(this.notes.length < initialLen);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private getDefaultTagline(type: string): string {
    switch (type) {
      case 'friends':
        return 'Plans, lists & chaos';
      case 'home':
        return 'Family or roommates';
      case 'partner':
        return 'For you two';
      case 'trip':
        return 'Plan something together';
      default:
        return 'A private space for our group';
    }
  }
}

export const spaceService = new SpaceService();
