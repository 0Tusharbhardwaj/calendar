import {
  UserProfile,
  UserRole,
  Team,
  Task,
  TaskAssignment,
  Submission,
  SubmissionReview,
  CalendarEvent,
  AppNotification,
  ActivityLog,
  TaskWithDetails,
  AssignmentStatus,
  ReviewDecision,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Simple SHA-256 hasher using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_KEYS = {
  USERS: 'teamflow_users',
  TEAMS: 'teamflow_teams',
  TASKS: 'teamflow_tasks',
  ASSIGNMENTS: 'teamflow_assignments',
  SUBMISSIONS: 'teamflow_submissions',
  REVIEWS: 'teamflow_reviews',
  CALENDAR_EVENTS: 'teamflow_calendar_events',
  NOTIFICATIONS: 'teamflow_notifications',
  ACTIVITY_LOGS: 'teamflow_activity_logs',
  SESSION: 'teamflow_session',
  INITIALIZED: 'teamflow_db_initialized_v5_auth_flow',
};

// Default departments (The 4 core functional teams)
export const SEED_TEAMS: Team[] = [
  {
    id: 'team-writing',
    name: 'Content Writing',
    description: 'Articles, blogs, social copy, newsletters, announcements',
    color: '#FC9631', // Sunset
    badge_bg: 'rgba(252, 150, 49, 0.15)',
    badge_text: '#B85B00',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'team-graphics',
    name: 'Graphics & Design',
    description: 'Posters, social media creatives, thumbnails, brand illustrations',
    color: '#FE75B9', // Hot Pink
    badge_bg: 'rgba(254, 117, 185, 0.15)',
    badge_text: '#A91F62',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'team-video',
    name: 'Video & Editing',
    description: 'Reels, promo videos, long-form tutorials, animations, podcasts',
    color: '#FF5601', // Flame
    badge_bg: 'rgba(255, 86, 1, 0.15)',
    badge_text: '#A63500',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'team-others',
    name: 'Operations & Research',
    description: 'Strategy, distribution, partner outreach, documentation',
    color: '#F9CC61', // Marigold
    badge_bg: 'rgba(249, 204, 97, 0.25)',
    badge_text: '#7A5200',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function createSeedUsers(): Promise<UserProfile[]> {
  // Passwords default to "admin123" for both Tushar and Bhoomika
  const adminHash = await hashPassword('admin123');

  return [
    {
      id: 'usr-admin-tushar',
      full_name: 'Tushar Bhardwaj',
      username: 'tushar',
      password_hash: adminHash,
      role: 'super_admin',
      team_id: 'team-others',
      designation: 'Founder',
      description: 'Super Administrator',
      avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=tushar&backgroundColor=ffdfbf',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'usr-admin-ayush',
      full_name: 'Ayush',
      username: 'ayush',
      password_hash: adminHash,
      role: 'admin',
      team_id: 'team-others',
      designation: 'HR',
      description: 'Core Team Member',
      avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=ayush&backgroundColor=c0aede',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'usr-admin-bhoomika',
      full_name: 'Bhoomika Chawla',
      username: 'bhoomika',
      password_hash: adminHash,
      role: 'admin',
      team_id: 'team-others',
      designation: 'Social Media Manager',
      description: 'Core Operations',
      avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=bhoomika&backgroundColor=ffd5dc',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export function createSeedTasks(): {
  tasks: Task[];
  assignments: TaskAssignment[];
  submissions: Submission[];
  reviews: SubmissionReview[];
} {
  // Fresh clean slate - zero dummy tasks
  return {
    tasks: [],
    assignments: [],
    submissions: [],
    reviews: [],
  };
}

export function createSeedCalendarEvents(): CalendarEvent[] {
  const todayStr = new Date().toISOString().split('T')[0];

  return [
    {
      id: 'evt-welcome',
      title: 'TeamFlow Platform Launch',
      description: 'Official launch of the TeamFlow internal team operations & content schedule.',
      date: todayStr,
      start_time: '10:00',
      end_time: '11:00',
      event_type: 'milestone',
      team_id: 'team-others',
      created_by: 'usr-admin-tushar',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export function createSeedNotifications(): AppNotification[] {
  return [
    {
      id: 'notif-welcome',
      user_id: 'all',
      title: 'Welcome to TeamFlow!',
      message: 'Workspace is live and configured for Tushar Bhardwaj and Bhoomika Chawla. You can now invite members and assign tasks.',
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ];
}

export function createSeedActivity(): ActivityLog[] {
  return [
    {
      id: 'act-init',
      actor_id: 'usr-admin-tushar',
      actor_name: 'Tushar Bhardwaj',
      actor_avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=tushar&backgroundColor=ffdfbf',
      action: 'initialized TeamFlow production workspace',
      entity_type: 'team',
      entity_id: 'team-others',
      created_at: new Date().toISOString(),
    },
  ];
}

// Database Engine Service Class
class TeamFlowDatabase {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
    if (isSupabaseConfigured && supabase) {
      this.initSupabaseSync();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Supabase Realtime & Cloud Sync ---
  private async initSupabaseSync() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await this.pullFromSupabase();

      // Listen to all PostgreSQL changes in real time
      supabase
        .channel('public-db-realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          this.pullFromSupabase();
        })
        .subscribe();
    } catch (err) {
      console.warn('Supabase sync init warning:', err);
    }
  }

  public async pullFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const [
        teamsRes,
        usersRes,
        tasksRes,
        assignmentsRes,
        submissionsRes,
        reviewsRes,
        eventsRes,
        notificationsRes,
        activityRes,
      ] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('users').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('task_assignments').select('*'),
        supabase.from('submissions').select('*'),
        supabase.from('submission_reviews').select('*'),
        supabase.from('calendar_events').select('*'),
        supabase.from('app_notifications').select('*'),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (teamsRes.data && teamsRes.data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teamsRes.data));
      }
      if (usersRes.data && usersRes.data.length > 0) {
        // Guarantee Tushar is super_admin and Ayush is admin/HR
        const mappedUsers = usersRes.data.map((u: UserProfile) => {
          if (u.username === 'tushar' || u.id === 'usr-admin-tushar') {
            return {
              ...u,
              role: 'super_admin' as const,
              designation: u.designation || 'Founder',
              description: u.description || 'Super Administrator',
            };
          }
          if (u.username === 'ayush' || u.id === 'usr-admin-ayush') {
            return {
              ...u,
              role: 'admin' as const,
              designation: u.designation || 'HR',
              description: u.description || 'Core Team Member',
            };
          }
          return u;
        });

        // Ensure Ayush is present if not in Supabase yet
        if (!mappedUsers.some((u: UserProfile) => u.username === 'ayush' || u.id === 'usr-admin-ayush')) {
          const adminHash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
          mappedUsers.push({
            id: 'usr-admin-ayush',
            full_name: 'Ayush',
            username: 'ayush',
            password_hash: adminHash,
            role: 'admin',
            team_id: 'team-others',
            designation: 'HR',
            description: 'Core Team Member',
            avatar_url: 'https://api.dicebear.com/7.x/notionists/svg?seed=ayush&backgroundColor=c0aede',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mappedUsers));
      }
      if (tasksRes.data) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasksRes.data));
      }
      if (assignmentsRes.data) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignmentsRes.data));
      }
      if (submissionsRes.data) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissionsRes.data));
      }
      if (reviewsRes.data) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviewsRes.data));
      }
      if (eventsRes.data) {
        localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(eventsRes.data));
      }
      if (notificationsRes.data) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationsRes.data));
      }
      if (activityRes.data) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(activityRes.data));
      }

      this.notify();
    } catch (err) {
      console.warn('Failed to pull from Supabase:', err);
    }
  }

  private async pushToSupabase(
    table: string,
    payload: any,
    action: 'insert' | 'update' | 'delete',
    matchColumn = 'id',
    matchValue?: any
  ) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      if (action === 'insert') {
        const { error } = await (supabase as any).from(table).insert(payload);
        if (error) {
          // Fallback if Postgres table users check constraint hasn't been altered yet
          if (table === 'users' && payload.role === 'super_admin' && (error.code === '23514' || error.message?.includes('users_role_check'))) {
            console.warn('Supabase check constraint fallback for super_admin -> admin in cloud DB');
            await (supabase as any).from(table).insert({ ...payload, role: 'admin' });
          } else {
            console.warn(`Supabase insert error on ${table}:`, error.message);
          }
        }
      } else if (action === 'update') {
        const { error } = await (supabase as any)
          .from(table)
          .update(payload)
          .eq(matchColumn, matchValue ?? payload[matchColumn]);
        if (error) {
          if (table === 'users' && payload.role === 'super_admin' && (error.code === '23514' || error.message?.includes('users_role_check'))) {
            console.warn('Supabase check constraint fallback for super_admin -> admin in cloud DB');
            await (supabase as any)
              .from(table)
              .update({ ...payload, role: 'admin' })
              .eq(matchColumn, matchValue ?? payload[matchColumn]);
          } else {
            console.warn(`Supabase update error on ${table}:`, error.message);
          }
        }
      } else if (action === 'delete') {
        const { error } = await (supabase as any).from(table).delete().eq(matchColumn, matchValue);
        if (error) console.warn(`Supabase delete error on ${table}:`, error.message);
      }
    } catch (err) {
      console.warn(`Supabase ${action} failed on ${table}:`, err);
    }
  }

  public async ensureInitialized(forceReset = false) {
    if (!forceReset && localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      let usersChanged = false;
      const existingUsers = this.getUsers();

      // Ensure Tushar is super_admin with designation 'Founder' and description 'Super Administrator'
      const tushar = existingUsers.find((u) => u.id === 'usr-admin-tushar' || u.username === 'tushar');
      if (tushar) {
        if (tushar.role !== 'super_admin' || tushar.designation !== 'Founder' || tushar.description !== 'Super Administrator') {
          tushar.role = 'super_admin';
          tushar.designation = 'Founder';
          tushar.description = 'Super Administrator';
          usersChanged = true;
          this.pushToSupabase('users', tushar, 'update', 'id', tushar.id);
        }
      }

      // Ensure Ayush exists as HR, Core Team Member, Admin
      let ayush = existingUsers.find((u) => u.id === 'usr-admin-ayush' || u.username === 'ayush');
      if (!ayush) {
        const seedUsers = await createSeedUsers();
        const seedAyush = seedUsers.find((u) => u.username === 'ayush');
        if (seedAyush) {
          existingUsers.push(seedAyush);
          usersChanged = true;
          this.pushToSupabase('users', seedAyush, 'insert');
        }
      } else {
        if (ayush.role !== 'admin' || ayush.designation !== 'HR' || ayush.description !== 'Core Team Member') {
          ayush.role = 'admin';
          ayush.designation = 'HR';
          ayush.description = 'Core Team Member';
          usersChanged = true;
          this.pushToSupabase('users', ayush, 'update', 'id', ayush.id);
        }
      }

      // Ensure Bhoomika has designation 'Social Media Manager'
      const bhoomika = existingUsers.find((u) => u.id === 'usr-admin-bhoomika' || u.username === 'bhoomika');
      if (bhoomika && (bhoomika.designation !== 'Social Media Manager' || !bhoomika.description)) {
        bhoomika.designation = 'Social Media Manager';
        bhoomika.description = 'Core Operations';
        usersChanged = true;
        this.pushToSupabase('users', bhoomika, 'update', 'id', bhoomika.id);
      }

      if (usersChanged) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(existingUsers));
        const sessionRaw = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (sessionRaw) {
          try {
            const s = JSON.parse(sessionRaw);
            const fresh = existingUsers.find((u) => u.id === s.id);
            if (fresh) {
              localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(fresh));
            }
          } catch (e) {
            // ignore
          }
        }
        this.notify();
      }
      return;
    }

    const seedUsers = await createSeedUsers();
    const { tasks, assignments, submissions, reviews } = createSeedTasks();
    const calendarEvents = createSeedCalendarEvents();
    const notifications = createSeedNotifications();
    const activity = createSeedActivity();

    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(SEED_TEAMS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(calendarEvents));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(activity));

    // Do not set default active session - users must explicitly log in!
    localStorage.removeItem(STORAGE_KEYS.SESSION);

    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    this.notify();
  }

  // --- Auth & Session ---
  public getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;

    const users = this.getUsers();
    if (!users || users.length === 0) return null;

    try {
      const user = JSON.parse(raw) as UserProfile;
      // Refresh with latest from USERS table
      const fresh = users.find((u) => u.id === user.id);
      if (fresh && fresh.is_active) {
        return fresh;
      }
      // If cached session user no longer exists or is deactivated, invalidate session
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    }
  }

  public async login(username: string, passwordPlain: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const users = this.getUsers();
    const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'User does not exist.' };
    }
    if (!user.is_active) {
      return { success: false, error: 'This account has been deactivated. Contact an administrator.' };
    }

    const hash = await hashPassword(passwordPlain);
    if (user.password_hash !== hash) {
      return { success: false, error: 'Invalid username or password.' };
    }

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    this.addActivityLog(user, 'logged into TeamFlow', 'user', user.id);
    this.notify();
    return { success: true, user };
  }

  public switchActiveUser(userId: string): UserProfile | null {
    const user = this.getUser(userId);
    if (!user) return null;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    this.notify();
    return user;
  }

  public logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.notify();
  }

  // --- Teams ---
  public getTeams(): Team[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return raw ? JSON.parse(raw) : [];
  }

  public getTeam(id: string): Team | undefined {
    return this.getTeams().find((t) => t.id === id);
  }

  public createTeam(name: string, description: string, color: string): Team {
    const teams = this.getTeams();
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      color,
      badge_bg: `${color}25`,
      badge_text: color,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    teams.push(newTeam);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    this.pushToSupabase('teams', newTeam, 'insert');

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addActivityLog(currentUser, `created new team "${name}"`, 'team', newTeam.id);
    }
    this.notify();
    return newTeam;
  }

  public updateTeam(id: string, updates: Partial<Team>): Team | null {
    const teams = this.getTeams();
    const idx = teams.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    teams[idx] = { ...teams[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    this.pushToSupabase('teams', teams[idx], 'update', 'id', id);
    this.notify();
    return teams[idx];
  }

  public deleteTeam(id: string): boolean {
    const teams = this.getTeams();
    const filtered = teams.filter((t) => t.id !== id);
    if (filtered.length === teams.length) return false;
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(filtered));
    this.pushToSupabase('teams', null, 'delete', 'id', id);
    this.notify();
    return true;
  }

  // --- Users ---
  public getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  }

  public getUser(id: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public async createUser(data: {
    full_name: string;
    username: string;
    passwordPlain: string;
    role: UserRole;
    team_id: string;
    designation: string;
    description?: string;
    avatar_url?: string;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const users = this.getUsers();
    if (users.some((u) => u.username.toLowerCase() === data.username.trim().toLowerCase())) {
      return { success: false, error: 'A user with this username already exists.' };
    }

    const password_hash = await hashPassword(data.passwordPlain || 'welcome123');
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      full_name: data.full_name.trim(),
      username: data.username.trim().toLowerCase(),
      password_hash,
      role: data.role,
      team_id: data.team_id,
      designation: data.designation.trim(),
      description: data.description?.trim(),
      avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${data.username}`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.pushToSupabase('users', newUser, 'insert');

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addActivityLog(currentUser, `added new member ${newUser.full_name} (@${newUser.username})`, 'user', newUser.id);
    }
    this.notify();
    return { success: true, user: newUser };
  }

  public async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    users[idx] = {
      ...users[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.pushToSupabase('users', users[idx], 'update', 'id', id);

    // Keep active session in sync if this user is currently logged in
    const currentSessionRaw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (currentSessionRaw) {
      try {
        const sessionUser = JSON.parse(currentSessionRaw) as UserProfile;
        if (sessionUser.id === id) {
          localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(users[idx]));
        }
      } catch (e) {
        // ignore
      }
    }

    this.notify();
    return users[idx];
  }

  public async resetPassword(userId: string, newPasswordPlain: string): Promise<boolean> {
    const password_hash = await hashPassword(newPasswordPlain);
    const updated = await this.updateUser(userId, { password_hash });
    if (updated) {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.addActivityLog(currentUser, `reset password for @${updated.username}`, 'user', userId);
      }
      return true;
    }
    return false;
  }

  // --- Tasks & Assignments ---
  public getTasks(): Task[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    return raw ? JSON.parse(raw) : [];
  }

  public getAssignments(): TaskAssignment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public getSubmissions(): Submission[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public getReviews(): SubmissionReview[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return raw ? JSON.parse(raw) : [];
  }

  public getTasksWithDetails(): TaskWithDetails[] {
    const tasks = this.getTasks();
    const teams = this.getTeams();
    const users = this.getUsers();
    const assignments = this.getAssignments();
    const submissions = this.getSubmissions();
    const reviews = this.getReviews();
    const nowStr = new Date().toISOString().split('T')[0];

    return tasks.map((task) => {
      const team = teams.find((t) => t.id === task.team_id);
      const creator = users.find((u) => u.id === task.created_by);

      const taskAssignments = assignments
        .filter((a) => a.task_id === task.id)
        .map((a) => {
          const user = users.find((u) => u.id === a.user_id);
          const assignmentSubs = submissions
            .filter((s) => s.task_assignment_id === a.id)
            .sort((x, y) => y.version_number - x.version_number)
            .map((s) => {
              const subReviews = reviews.filter((r) => r.submission_id === s.id);
              return { ...s, reviews: subReviews };
            });

          return {
            ...a,
            user,
            submissions: assignmentSubs,
          };
        });

      // Calculate composite overall status
      let overall_status: AssignmentStatus | 'overdue' = 'assigned';
      if (taskAssignments.length > 0) {
        const statuses = taskAssignments.map((a) => a.status);
        if (statuses.every((s) => s === 'approved')) {
          overall_status = 'approved';
        } else if (statuses.some((s) => s === 'submitted' || s === 'resubmitted')) {
          overall_status = 'submitted';
        } else if (statuses.some((s) => s === 'revision_required')) {
          overall_status = 'revision_required';
        } else if (statuses.some((s) => s === 'in_progress')) {
          overall_status = 'in_progress';
        } else {
          overall_status = 'assigned';
        }
      }

      // Check if overdue: deadline passed and not approved
      if (overall_status !== 'approved' && task.deadline < nowStr) {
        // preserve actual workflow status, but flag is overdue
        // in composite view we can display overdue badge while tracking actual assignment status
      }

      return {
        ...task,
        team,
        creator,
        assignments: taskAssignments,
        overall_status,
      };
    });
  }

  public createTask(data: {
    title: string;
    description: string;
    team_id: string;
    start_date: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignment_type: 'individual' | 'multiple' | 'team';
    assignee_ids: string[];
    reference_urls: string[];
    internal_instructions?: string;
  }): TaskWithDetails {
    const currentUser = this.getCurrentUser();
    const created_by = currentUser?.id || 'usr-admin-1';

    const tasks = this.getTasks();
    const assignments = this.getAssignments();

    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      title: data.title.trim(),
      description: data.description.trim(),
      team_id: data.team_id,
      created_by,
      start_date: data.start_date,
      deadline: data.deadline,
      priority: data.priority,
      assignment_type: data.assignment_type,
      reference_urls: data.reference_urls || [],
      internal_instructions: data.internal_instructions?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    tasks.unshift(newTask);

    // Determine assignees
    let finalAssigneeIds: string[] = [];
    if (data.assignment_type === 'team') {
      const allUsers = this.getUsers().filter((u) => u.team_id === data.team_id && u.is_active);
      finalAssigneeIds = allUsers.map((u) => u.id);
    } else {
      finalAssigneeIds = data.assignee_ids;
    }

    // Create assignments per assignee
    finalAssigneeIds.forEach((uid) => {
      assignments.push({
        id: `asg-${newTask.id}-${uid}-${Date.now().toString().slice(-4)}`,
        task_id: newTask.id,
        user_id: uid,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      });

      // Send in-app notification to member
      this.addNotification({
        user_id: uid,
        title: 'New Task Assigned',
        message: `You were assigned "${newTask.title}" (Due: ${newTask.deadline})`,
        type: 'task_assigned',
        related_task_id: newTask.id,
      });
    });

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));

    this.pushToSupabase('tasks', newTask, 'insert');
    assignments
      .filter((a) => a.task_id === newTask.id)
      .forEach((asg) => {
        this.pushToSupabase('task_assignments', asg, 'insert');
      });

    if (currentUser) {
      this.addActivityLog(currentUser, `created task "${newTask.title}"`, 'task', newTask.id);
    }

    this.notify();
    return this.getTasksWithDetails().find((t) => t.id === newTask.id)!;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    tasks[idx] = {
      ...tasks[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.pushToSupabase('tasks', tasks[idx], 'update', 'id', id);
    this.notify();
    return tasks[idx];
  }

  public deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter((t) => t.id !== id);
    if (filteredTasks.length === tasks.length) return false;

    const assignments = this.getAssignments().filter((a) => a.task_id !== id);
    const submissions = this.getSubmissions().filter((s) => s.task_id !== id);

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));

    this.pushToSupabase('tasks', null, 'delete', 'id', id);

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addActivityLog(currentUser, `deleted task ${id}`, 'task', id);
    }

    this.notify();
    return true;
  }

  // --- Assignment Status & Work Submission ---
  public updateAssignmentStatus(assignmentId: string, status: AssignmentStatus): boolean {
    const assignments = this.getAssignments();
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return false;

    // Strict security check: Only administrators can approve assignments!
    if (status === 'approved') {
      const currentUser = this.getCurrentUser();
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
        console.warn('Unauthorized: Only administrators can mark an assignment as approved.');
        return false;
      }
    }

    asg.status = status;
    if (status === 'approved') {
      asg.completed_at = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    this.pushToSupabase('task_assignments', asg, 'update', 'id', assignmentId);
    this.notify();
    return true;
  }

  public submitWork(data: {
    task_assignment_id: string;
    user_id: string;
    submission_url: string;
    comments: string;
    supporting_links?: string[];
  }): Submission | null {
    const assignments = this.getAssignments();
    const asg = assignments.find((a) => a.id === data.task_assignment_id);
    if (!asg) return null;

    const submissions = this.getSubmissions();
    const existingSubs = submissions.filter((s) => s.task_assignment_id === data.task_assignment_id);
    const nextVersion = existingSubs.length + 1;

    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      task_assignment_id: data.task_assignment_id,
      task_id: asg.task_id,
      submitted_by: data.user_id,
      submission_url: data.submission_url.trim(),
      comments: data.comments.trim(),
      supporting_links: data.supporting_links || [],
      version_number: nextVersion,
      submitted_at: new Date().toISOString(),
    };
    submissions.push(newSubmission);

    // Update assignment status
    asg.status = nextVersion > 1 ? 'resubmitted' : 'submitted';
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));

    this.pushToSupabase('submissions', newSubmission, 'insert');
    this.pushToSupabase('task_assignments', asg, 'update', 'id', asg.id);

    // Notify admins and super_admins
    const submitter = this.getUser(data.user_id);
    const task = this.getTasks().find((t) => t.id === asg.task_id);
    const admins = this.getUsers().filter((u) => (u.role === 'admin' || u.role === 'super_admin') && u.is_active);

    admins.forEach((admin) => {
      this.addNotification({
        user_id: admin.id,
        title: nextVersion > 1 ? 'Work Resubmitted' : 'New Submission Received',
        message: `${submitter?.full_name || 'Member'} submitted work for "${task?.title || 'Task'}" (v${nextVersion})`,
        type: nextVersion > 1 ? 'task_resubmitted' : 'submission_received',
        related_task_id: asg.task_id,
      });
    });

    if (submitter) {
      this.addActivityLog(
        submitter,
        `submitted work (v${nextVersion}) for "${task?.title || 'Task'}"`,
        'submission',
        newSubmission.id
      );
    }

    this.notify();
    return newSubmission;
  }

  public reviewSubmission(data: {
    submission_id: string;
    reviewed_by: string;
    decision: ReviewDecision;
    feedback: string;
  }): SubmissionReview | null {
    // Strict permission check: Only administrators can approve or review submissions!
    const reviewer = this.getUser(data.reviewed_by);
    if (!reviewer || (reviewer.role !== 'admin' && reviewer.role !== 'super_admin')) {
      console.warn('Unauthorized: Only workspace administrators have permission to review or approve submissions.');
      return null;
    }

    const submissions = this.getSubmissions();
    const sub = submissions.find((s) => s.id === data.submission_id);
    if (!sub) return null;

    const assignments = this.getAssignments();
    const asg = assignments.find((a) => a.id === sub.task_assignment_id);
    if (!asg) return null;

    const reviews = this.getReviews();
    const newReview: SubmissionReview = {
      id: `rev-${Date.now()}`,
      submission_id: data.submission_id,
      task_assignment_id: asg.id,
      reviewed_by: data.reviewed_by,
      decision: data.decision,
      feedback: data.feedback.trim(),
      reviewed_at: new Date().toISOString(),
    };
    reviews.push(newReview);

    // Update assignment workflow status
    if (data.decision === 'approved') {
      asg.status = 'approved';
      asg.completed_at = new Date().toISOString();
    } else if (data.decision === 'changes_requested') {
      asg.status = 'revision_required';
    } else if (data.decision === 'rejected') {
      asg.status = 'assigned';
    }

    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    this.pushToSupabase('submission_reviews', newReview, 'insert');
    this.pushToSupabase('task_assignments', asg, 'update', 'id', asg.id);

    // Notify assigned member
    const task = this.getTasks().find((t) => t.id === asg.task_id);

    const titleMap: Record<ReviewDecision, string> = {
      approved: 'Submission Approved! 🎉',
      changes_requested: 'Revisions Requested',
      rejected: 'Submission Rejected',
    };

    const typeMap: Record<ReviewDecision, any> = {
      approved: 'submission_approved',
      changes_requested: 'revision_requested',
      rejected: 'system',
    };

    this.addNotification({
      user_id: asg.user_id,
      title: titleMap[data.decision],
      message: `${reviewer?.full_name || 'Admin'} ${data.decision === 'approved' ? 'approved your submission' : 'left review feedback'}: "${data.feedback}"`,
      type: typeMap[data.decision],
      related_task_id: asg.task_id,
    });

    if (reviewer) {
      this.addActivityLog(
        reviewer,
        `${data.decision === 'approved' ? 'approved' : 'reviewed'} submission for "${task?.title || 'Task'}"`,
        'review',
        newReview.id
      );
    }

    this.notify();
    return newReview;
  }

  // --- Calendar Events ---
  public getCalendarEvents(): CalendarEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public createCalendarEvent(data: {
    title: string;
    description: string;
    date: string;
    start_time?: string;
    end_time?: string;
    event_type: any;
    team_id?: string;
    associated_member_ids?: string[];
    reference_url?: string;
  }): CalendarEvent {
    const currentUser = this.getCurrentUser();
    const created_by = currentUser?.id || 'usr-admin-1';
    const events = this.getCalendarEvents();

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: data.title.trim(),
      description: data.description.trim(),
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      event_type: data.event_type,
      team_id: data.team_id,
      associated_member_ids: data.associated_member_ids,
      reference_url: data.reference_url?.trim(),
      created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    events.push(newEvent);
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(events));
    this.pushToSupabase('calendar_events', newEvent, 'insert');

    if (currentUser) {
      this.addActivityLog(currentUser, `scheduled calendar event "${newEvent.title}"`, 'calendar_event', newEvent.id);
    }

    this.notify();
    return newEvent;
  }

  public updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    const events = this.getCalendarEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    events[idx] = {
      ...events[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(events));
    this.pushToSupabase('calendar_events', events[idx], 'update', 'id', id);
    this.notify();
    return events[idx];
  }

  public deleteCalendarEvent(id: string): boolean {
    const events = this.getCalendarEvents();
    const filtered = events.filter((e) => e.id !== id);
    if (filtered.length === events.length) return false;
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(filtered));
    this.pushToSupabase('calendar_events', null, 'delete', 'id', id);
    this.notify();
    return true;
  }

  // --- Notifications ---
  public getNotifications(userId?: string): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: AppNotification[] = raw ? JSON.parse(raw) : [];
    if (!userId) return all;
    return all
      .filter((n) => n.user_id === userId || n.user_id === 'all')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addNotification(data: Omit<AppNotification, 'id' | 'is_read' | 'created_at'>): AppNotification {
    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...data,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.pushToSupabase('app_notifications', newNotif, 'insert');
    this.notify();
    return newNotif;
  }

  public markNotificationAsRead(id: string): boolean {
    const notifs = this.getNotifications();
    const n = notifs.find((x) => x.id === id);
    if (!n) return false;
    n.is_read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.pushToSupabase('app_notifications', { is_read: true }, 'update', 'id', id);
    this.notify();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    const notifs = this.getNotifications();
    notifs.forEach((n) => {
      if (n.user_id === userId || n.user_id === 'all') {
        n.is_read = true;
      }
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.pushToSupabase('app_notifications', { is_read: true }, 'update', 'user_id', userId);
    this.notify();
  }

  // --- Activity Logs ---
  public getActivityLogs(): ActivityLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    const logs: ActivityLog[] = raw ? JSON.parse(raw) : [];
    return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addActivityLog(
    actor: UserProfile,
    action: string,
    entityType: ActivityLog['entity_type'],
    entityId: string,
    metadata?: Record<string, any>
  ): ActivityLog {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actor_id: actor.id,
      actor_name: actor.full_name,
      actor_avatar: actor.avatar_url,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // keep latest 100 entries
    if (logs.length > 100) logs.pop();
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
    this.pushToSupabase('activity_logs', newLog, 'insert');
    this.notify();
    return newLog;
  }

  // Reset database back to clean seed
  public async resetToSeed(): Promise<void> {
    await this.ensureInitialized(true);
  }
}

export const db = new TeamFlowDatabase();
