import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  Team,
  TaskWithDetails,
  CalendarEvent,
  AppNotification,
  ActivityLog,
  ReviewDecision,
} from '../types';
import { db } from '../services/db';

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  teams: Team[];
  tasks: TaskWithDetails[];
  calendarEvents: CalendarEvent[];
  notifications: AppNotification[];
  activityLogs: ActivityLog[];
  unreadCount: number;
  isLoading: boolean;

  // Auth
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;

  // Task Operations
  createTask: (data: any) => Promise<TaskWithDetails>;
  updateTask: (id: string, updates: any) => void;
  deleteTask: (id: string) => void;
  updateAssignmentStatus: (assignmentId: string, status: any) => boolean;

  // Submission & Review
  submitWork: (data: {
    task_assignment_id: string;
    submission_url: string;
    comments: string;
    supporting_links?: string[];
  }) => Promise<boolean>;
  reviewSubmission: (data: {
    submission_id: string;
    decision: ReviewDecision;
    feedback: string;
  }) => Promise<boolean>;

  // Teams
  createTeam: (name: string, desc: string, color: string) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;

  // Users
  createUser: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  deleteUser: (id: string) => Promise<boolean>;
  resetPassword: (userId: string, newPass: string) => Promise<boolean>;

  // Calendar Events
  createCalendarEvent: (data: any) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Utilities
  resetDatabase: () => Promise<void>;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshState = useCallback(() => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    setUsers(db.getUsers());
    setTeams(db.getTeams());
    setTasks(db.getTasksWithDetails());
    setCalendarEvents(db.getCalendarEvents());
    setNotifications(db.getNotifications(user?.id));
    setActivityLogs(db.getActivityLogs());
  }, []);

  useEffect(() => {
    refreshState();
    setIsLoading(false);
    const unsubscribe = db.subscribe(() => {
      refreshState();
    });
    return unsubscribe;
  }, [refreshState]);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF5601', '#FE75B9', '#FC9631', '#F9CC61', '#E6455E'],
    });
  }, []);

  const login = async (username: string, pass: string) => {
    const res = await db.login(username, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      triggerConfetti();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const logout = () => {
    db.logout();
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const user = db.switchActiveUser(userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const createTask = async (data: any) => {
    const task = db.createTask(data);
    triggerConfetti();
    return task;
  };

  const updateTask = (id: string, updates: any) => {
    db.updateTask(id, updates);
  };

  const deleteTask = (id: string) => {
    db.deleteTask(id);
  };

  const updateAssignmentStatus = (assignmentId: string, status: any) => {
    if (status === 'approved' && currentUser?.role !== 'admin') {
      console.warn('Unauthorized: Only administrators can approve tasks.');
      return false;
    }
    return db.updateAssignmentStatus(assignmentId, status);
  };

  const submitWork = async (data: {
    task_assignment_id: string;
    submission_url: string;
    comments: string;
    supporting_links?: string[];
  }) => {
    if (!currentUser) return false;
    const sub = db.submitWork({
      ...data,
      user_id: currentUser.id,
    });
    if (sub) {
      triggerConfetti();
      return true;
    }
    return false;
  };

  const reviewSubmission = async (data: {
    submission_id: string;
    decision: ReviewDecision;
    feedback: string;
  }) => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      console.warn('Unauthorized: Only administrators can review and approve submissions.');
      return false;
    }
    const rev = db.reviewSubmission({
      ...data,
      reviewed_by: currentUser.id,
    });
    if (rev) {
      if (data.decision === 'approved') {
        triggerConfetti();
      }
      return true;
    }
    return false;
  };

  const createTeam = (name: string, desc: string, color: string) => {
    db.createTeam(name, desc, color);
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    db.updateTeam(id, updates);
  };

  const deleteTeam = (id: string) => {
    db.deleteTeam(id);
  };

  const createUser = async (data: any) => {
    return db.createUser(data);
  };

  const updateUser = async (id: string, updates: Partial<UserProfile>) => {
    return db.updateUser(id, updates);
  };

  const deleteUser = async (id: string) => {
    return db.deleteUser(id);
  };

  const resetPassword = async (userId: string, newPass: string) => {
    return db.resetPassword(userId, newPass);
  };

  const createCalendarEvent = (data: any) => {
    db.createCalendarEvent(data);
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    db.updateCalendarEvent(id, updates);
  };

  const deleteCalendarEvent = (id: string) => {
    db.deleteCalendarEvent(id);
  };

  const markNotificationRead = (id: string) => {
    db.markNotificationAsRead(id);
  };

  const markAllNotificationsRead = () => {
    if (currentUser) {
      db.markAllNotificationsAsRead(currentUser.id);
    }
  };

  const resetDatabase = async () => {
    await db.resetToSeed();
    refreshState();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        teams,
        tasks,
        calendarEvents,
        notifications,
        activityLogs,
        unreadCount,
        isLoading,
        login,
        logout,
        switchUser,
        createTask,
        updateTask,
        deleteTask,
        updateAssignmentStatus,
        submitWork,
        reviewSubmission,
        createTeam,
        updateTeam,
        deleteTeam,
        createUser,
        updateUser,
        deleteUser,
        resetPassword,
        createCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        markNotificationRead,
        markAllNotificationsRead,
        resetDatabase,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
