import React, { createContext, useContext, useState } from 'react';
import {
  Space,
  INITIAL_SPACES,
  ActivityFeedItem,
  INITIAL_ACTIVITY,
  PlanItem,
  PollItem,
  TodoItem,
  ListItem,
  NoteItem,
} from '@/constants/spaces-data';
import { ActionType } from '@/components/action-sheet-modal';

interface SpacesContextType {
  spaces: Space[];
  activity: ActivityFeedItem[];
  addSpace: (newSpace: Space) => void;
  addItemToSpace: (spaceId: string, type: ActionType, itemData: any) => void;
  toggleTodo: (spaceId: string, todoId: string) => void;
  votePoll: (spaceId: string, pollId: string, optionId: string) => void;
  getSpace: (id: string) => Space | undefined;
}

const SpacesContext = createContext<SpacesContextType | undefined>(undefined);

export function SpacesProvider({ children }: { children: React.ReactNode }) {
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [activity, setActivity] = useState<ActivityFeedItem[]>(INITIAL_ACTIVITY);

  const addSpace = (newSpace: Space) => {
    setSpaces((prev) => [newSpace, ...prev]);

    const newActivity: ActivityFeedItem = {
      id: 'act-' + Date.now(),
      spaceId: newSpace.id,
      spaceName: newSpace.name,
      spaceThemeKey: newSpace.themeKey,
      user: 'Irmak',
      action: 'created new space',
      target: newSpace.name,
      timeAgo: 'Just now',
      type: 'plan',
    };
    setActivity((prev) => [newActivity, ...prev]);
  };

  const addItemToSpace = (spaceId: string, type: ActionType, itemData: any) => {
    setSpaces((prev) =>
      prev.map((space) => {
        if (space.id !== spaceId) return space;

        const updated = { ...space };
        const id = `${type}-${Date.now()}`;

        if (type === 'plan') {
          const newPlan: PlanItem = {
            id,
            title: itemData.title,
            date: itemData.date || 'Soon',
            location: itemData.location || space.name,
            attendeesCount: itemData.attendeesCount || 1,
          };
          updated.plans = [newPlan, ...updated.plans];
          updated.recentActivity = `Irmak added plan '${newPlan.title}'`;
        } else if (type === 'poll') {
          const newPoll: PollItem = {
            id,
            question: itemData.question,
            options: itemData.options || [
              { id: 'opt1', text: 'Option A', votes: 1 },
              { id: 'opt2', text: 'Option B', votes: 0 },
            ],
            totalVotes: itemData.totalVotes || 1,
            userVotedId: 'opt1',
          };
          updated.polls = [newPoll, ...updated.polls];
          updated.recentActivity = `Irmak started poll '${newPoll.question}'`;
        } else if (type === 'todo') {
          const newTodo: TodoItem = {
            id,
            text: itemData.text,
            completed: false,
            assignedTo: itemData.assignedTo || 'Irmak',
          };
          updated.todos = [newTodo, ...updated.todos];
          updated.recentActivity = `Irmak added task '${newTodo.text}'`;
        } else if (type === 'list') {
          const newList: ListItem = {
            id,
            title: itemData.title,
            itemCount: itemData.itemCount || 1,
            preview: itemData.preview || [],
          };
          updated.lists = [newList, ...updated.lists];
          updated.recentActivity = `Irmak created list '${newList.title}'`;
        } else if (type === 'note') {
          const newNote: NoteItem = {
            id,
            title: itemData.title,
            content: itemData.content,
            updatedAt: 'Just now',
          };
          updated.notes = [newNote, ...updated.notes];
          updated.recentActivity = `Irmak updated note '${newNote.title}'`;
        }

        updated.recentActivityTime = 'Just now';
        return updated;
      })
    );

    const targetSpace = spaces.find((s) => s.id === spaceId);
    if (targetSpace) {
      const actionText =
        type === 'plan'
          ? 'created plan'
          : type === 'poll'
          ? 'started poll'
          : type === 'todo'
          ? 'added to-do'
          : type === 'list'
          ? 'created list'
          : 'updated note';

      const targetTitle =
        itemData.title || itemData.question || itemData.text || 'new item';

      const newActivity: ActivityFeedItem = {
        id: 'act-' + Date.now(),
        spaceId: targetSpace.id,
        spaceName: targetSpace.name,
        spaceThemeKey: targetSpace.themeKey,
        user: 'Irmak',
        action: actionText,
        target: targetTitle,
        timeAgo: 'Just now',
        type: type,
      };
      setActivity((prev) => [newActivity, ...prev]);
    }
  };

  const toggleTodo = (spaceId: string, todoId: string) => {
    setSpaces((prev) =>
      prev.map((space) => {
        if (space.id !== spaceId) return space;
        return {
          ...space,
          todos: space.todos.map((todo) =>
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
          ),
        };
      })
    );
  };

  const votePoll = (spaceId: string, pollId: string, optionId: string) => {
    setSpaces((prev) =>
      prev.map((space) => {
        if (space.id !== spaceId) return space;
        return {
          ...space,
          polls: space.polls.map((poll) => {
            if (poll.id !== pollId) return poll;
            const hadVoted = poll.userVotedId;
            const isSame = hadVoted === optionId;
            if (isSame) return poll;

            const updatedOptions = poll.options.map((opt) => {
              if (opt.id === optionId) {
                return { ...opt, votes: opt.votes + 1 };
              }
              if (hadVoted && opt.id === hadVoted) {
                return { ...opt, votes: Math.max(0, opt.votes - 1) };
              }
              return opt;
            });

            return {
              ...poll,
              options: updatedOptions,
              totalVotes: hadVoted ? poll.totalVotes : poll.totalVotes + 1,
              userVotedId: optionId,
            };
          }),
        };
      })
    );
  };

  const getSpace = (id: string) => {
    return spaces.find((s) => s.id === id);
  };

  return (
    <SpacesContext.Provider
      value={{
        spaces,
        activity,
        addSpace,
        addItemToSpace,
        toggleTodo,
        votePoll,
        getSpace,
      }}>
      {children}
    </SpacesContext.Provider>
  );
}

export function useSpaces() {
  const context = useContext(SpacesContext);
  if (!context) {
    throw new Error('useSpaces must be used within a SpacesProvider');
  }
  return context;
}
