import {
  UserProfile,
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
  INITIALIZED: 'teamflow_db_initialized_v2',
};

// Default seed data with realistic avatars, teams, tasks, submissions, calendar events
export const SEED_TEAMS: Team[] = [
  {
    id: 'team-writing',
    name: 'Content Writing',
    description: 'Articles, blogs, social copy, newsletters, announcements',
    color: '#FC9631', // Sunset
    badge_bg: 'rgba(252, 150, 49, 0.15)',
    badge_text: '#B85B00',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'team-graphics',
    name: 'Graphics & Design',
    description: 'Posters, social media creatives, thumbnails, brand illustrations',
    color: '#FE75B9', // Hot Pink
    badge_bg: 'rgba(254, 117, 185, 0.15)',
    badge_text: '#A91F62',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'team-video',
    name: 'Video & Editing',
    description: 'Reels, promo videos, long-form tutorials, animations, podcasts',
    color: '#FF5601', // Flame
    badge_bg: 'rgba(255, 86, 1, 0.15)',
    badge_text: '#A63500',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'team-others',
    name: 'Operations & Research',
    description: 'Strategy, distribution, partner outreach, documentation',
    color: '#F9CC61', // Marigold
    badge_bg: 'rgba(249, 204, 97, 0.25)',
    badge_text: '#7A5200',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export async function createSeedUsers(): Promise<UserProfile[]> {
  // Passwords:
  // admin: "admin123"
  // members: "member123"
  const adminHash = await hashPassword('admin123');
  const memberHash = await hashPassword('member123');

  return [
    {
      id: 'usr-admin-1',
      full_name: 'Maya Chen',
      username: 'admin',
      password_hash: adminHash,
      role: 'admin',
      team_id: 'team-others',
      designation: 'Head of Operations & Production',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    {
      id: 'usr-writer-1',
      full_name: 'Marcus Thorne',
      username: 'marcus',
      password_hash: memberHash,
      role: 'member',
      team_id: 'team-writing',
      designation: 'Senior Editorial Writer',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      id: 'usr-writer-2',
      full_name: 'Sophia Patel',
      username: 'sophia',
      password_hash: memberHash,
      role: 'member',
      team_id: 'team-writing',
      designation: 'Content & Copy Specialist',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    },
    {
      id: 'usr-designer-1',
      full_name: 'Liam Keller',
      username: 'liam',
      password_hash: memberHash,
      role: 'member',
      team_id: 'team-graphics',
      designation: 'Lead Visual Designer',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    },
    {
      id: 'usr-designer-2',
      full_name: 'Aria Rossi',
      username: 'aria',
      password_hash: memberHash,
      role: 'member',
      team_id: 'team-graphics',
      designation: 'UI & Motion Illustrator',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    },
    {
      id: 'usr-video-1',
      full_name: 'Chloe Simmons',
      username: 'chloe',
      password_hash: memberHash,
      role: 'member',
      team_id: 'team-video',
      designation: 'Video Producer & Director',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'usr-video-2',
      full_name: 'Alex Vance',
      username: 'alex',
      password_hash: memberHash,
      role: 'member',
      team_id: 'team-video',
      designation: 'Senior Video Editor & Colorist',
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
  ];
}

export function createSeedTasks(): {
  tasks: Task[];
  assignments: TaskAssignment[];
  submissions: Submission[];
  reviews: SubmissionReview[];
} {
  const now = new Date();
  const formatOffset = (days: number) => {
    const d = new Date(now.getTime() + days * 86400000);
    return d.toISOString().split('T')[0];
  };

  const tasks: Task[] = [
    {
      id: 'tsk-101',
      title: 'Q4 Product Showcase Article & Case Study',
      description: 'Deep dive editorial covering the new workflow automation engine. Highlight customer quotes and performance benchmarks.',
      team_id: 'team-writing',
      created_by: 'usr-admin-1',
      start_date: formatOffset(-5),
      deadline: formatOffset(1),
      priority: 'high',
      assignment_type: 'individual',
      reference_urls: ['https://notion.so/editorial/guidelines', 'https://figma.com/file/assets-q4'],
      internal_instructions: 'Keep voice warm yet authoritative. Target 1,400 words.',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'tsk-102',
      title: 'Brand Refresh: 3D Icons & Asset Library',
      description: 'Render warm tactile 3D icons for core product categories using brand clay/terracotta palette.',
      team_id: 'team-graphics',
      created_by: 'usr-admin-1',
      start_date: formatOffset(-4),
      deadline: formatOffset(2),
      priority: 'urgent',
      assignment_type: 'multiple',
      reference_urls: ['https://figma.com/file/brand-rebrand-flow'],
      internal_instructions: 'Export in @2x PNG and SVG with transparent backgrounds.',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'tsk-103',
      title: 'Feature Walkthrough Reel & Cutdowns',
      description: '60-second high-energy product reel with dynamic typography, audio beats, and quick UI zooms.',
      team_id: 'team-video',
      created_by: 'usr-admin-1',
      start_date: formatOffset(-6),
      deadline: formatOffset(-1), // overdue deadline
      priority: 'high',
      assignment_type: 'individual',
      reference_urls: ['https://frame.io/v/cut2-final'],
      internal_instructions: 'Ensure vertical 9:16 aspect ratio with safe zone for Instagram / TikTok UI.',
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'tsk-104',
      title: 'Instagram Carousel: Team Operations Playbook',
      description: '8-slide educational carousel highlighting 5 mistakes teams make in content scheduling.',
      team_id: 'team-graphics',
      created_by: 'usr-admin-1',
      start_date: formatOffset(-2),
      deadline: formatOffset(4),
      priority: 'medium',
      assignment_type: 'individual',
      reference_urls: ['https://notion.so/social/carousel-script'],
      internal_instructions: 'Use warm cream backdrop with Flame and Hot Pink emphasis pills.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'tsk-105',
      title: 'Bi-Weekly Team Operations Sync & Retrospective',
      description: 'Quarterly review of team velocity, completed content distribution, and upcoming milestones.',
      team_id: 'team-others',
      created_by: 'usr-admin-1',
      start_date: formatOffset(0),
      deadline: formatOffset(5),
      priority: 'low',
      assignment_type: 'team',
      reference_urls: ['https://teamflow.internal/retro-agenda'],
      internal_instructions: 'All members compile their top 3 wins and 1 blocker before Thursday.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  const assignments: TaskAssignment[] = [
    // tsk-101 assigned to Marcus (Submitted for review!)
    {
      id: 'asg-101-marcus',
      task_id: 'tsk-101',
      user_id: 'usr-writer-1',
      status: 'submitted',
      assigned_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    // tsk-102 assigned to Liam (Submitted for review) and Aria (In Progress)
    {
      id: 'asg-102-liam',
      task_id: 'tsk-102',
      user_id: 'usr-designer-1',
      status: 'submitted',
      assigned_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'asg-102-aria',
      task_id: 'tsk-102',
      user_id: 'usr-designer-2',
      status: 'in_progress',
      assigned_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    // tsk-103 assigned to Chloe (Revision Required, awaiting resubmission)
    {
      id: 'asg-103-chloe',
      task_id: 'tsk-103',
      user_id: 'usr-video-1',
      status: 'revision_required',
      assigned_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    // tsk-104 assigned to Aria (In progress)
    {
      id: 'asg-104-aria',
      task_id: 'tsk-104',
      user_id: 'usr-designer-2',
      status: 'in_progress',
      assigned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    // tsk-105 assigned to team-others (Maya)
    {
      id: 'asg-105-maya',
      task_id: 'tsk-105',
      user_id: 'usr-admin-1',
      status: 'assigned',
      assigned_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  const submissions: Submission[] = [
    // Marcus submission for tsk-101
    {
      id: 'sub-101-1',
      task_assignment_id: 'asg-101-marcus',
      task_id: 'tsk-101',
      submitted_by: 'usr-writer-1',
      submission_url: 'https://notion.so/teamflow/q4-showcase-draft-v1',
      comments: 'Full article written with executive summary, customer highlights, and metrics. Ready for editorial review.',
      supporting_links: ['https://drive.google.com/folder/assets'],
      version_number: 1,
      submitted_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    // Liam submission for tsk-102
    {
      id: 'sub-102-1',
      task_assignment_id: 'asg-102-liam',
      task_id: 'tsk-102',
      submitted_by: 'usr-designer-1',
      submission_url: 'https://figma.com/file/rebrand-3d-icons-final',
      comments: 'All 8 core icon assets rendered in Blender with warm clay shader and exported to Figma.',
      supporting_links: ['https://dropbox.com/sh/3d-renders'],
      version_number: 1,
      submitted_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    // Chloe submission for tsk-103 (has a review requesting changes)
    {
      id: 'sub-103-1',
      task_assignment_id: 'asg-103-chloe',
      task_id: 'tsk-103',
      submitted_by: 'usr-video-1',
      submission_url: 'https://frame.io/v/reel-rough-cut-v1',
      comments: 'Initial 60s edit with audio sync. Please check intro hook pacing.',
      supporting_links: [],
      version_number: 1,
      submitted_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
  ];

  const reviews: SubmissionReview[] = [
    {
      id: 'rev-103-1',
      submission_id: 'sub-103-1',
      task_assignment_id: 'asg-103-chloe',
      reviewed_by: 'usr-admin-1',
      decision: 'changes_requested',
      feedback: 'The intro hook at 0:04 is slightly too slow. Please trim the title slide to 1.5 seconds and boost the voiceover gain by +2dB.',
      reviewed_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  return { tasks, assignments, submissions, reviews };
}

export function createSeedCalendarEvents(): CalendarEvent[] {
  const now = new Date();
  const formatOffset = (days: number) => {
    const d = new Date(now.getTime() + days * 86400000);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'evt-201',
      title: 'Press Release Embargo Lift & Launch Blast',
      description: 'Official launch of TeamFlow 2.0 announcement across all digital channels.',
      date: formatOffset(0), // Today
      start_time: '12:00',
      end_time: '13:00',
      event_type: 'milestone',
      team_id: 'team-writing',
      reference_url: 'https://news.teamflow.internal/press-kit',
      created_by: 'usr-admin-1',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'evt-202',
      title: 'Content Planning & Editorial Board Sync',
      description: 'Review monthly story queue, guest author pitches, and upcoming campaign assets.',
      date: formatOffset(2),
      start_time: '10:00',
      end_time: '11:00',
      event_type: 'meeting',
      team_id: 'team-writing',
      reference_url: 'https://meet.google.com/tf-edit-sync',
      created_by: 'usr-admin-1',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'evt-203',
      title: 'Festival Social Campaign Blast',
      description: 'Coordinated rollout of holiday promos across YouTube, Instagram, and X.',
      date: formatOffset(4),
      start_time: '14:00',
      end_time: '15:30',
      event_type: 'campaign_launch',
      team_id: 'team-graphics',
      created_by: 'usr-admin-1',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'evt-204',
      title: 'Monthly Video Production Wrap',
      description: 'Final cut export deadline for all customer testimonial segments.',
      date: formatOffset(7),
      start_time: '16:00',
      end_time: '17:00',
      event_type: 'publishing',
      team_id: 'team-video',
      created_by: 'usr-admin-1',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
}

export function createSeedNotifications(): AppNotification[] {
  return [
    {
      id: 'notif-1',
      user_id: 'usr-admin-1',
      title: 'New Submission Awaiting Review',
      message: 'Marcus Thorne submitted "Q4 Product Showcase Article & Case Study" for your approval.',
      type: 'submission_received',
      related_task_id: 'tsk-101',
      is_read: false,
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'notif-2',
      user_id: 'usr-admin-1',
      title: 'New Submission Awaiting Review',
      message: 'Liam Keller submitted "Brand Refresh: 3D Icons & Asset Library".',
      type: 'submission_received',
      related_task_id: 'tsk-102',
      is_read: false,
      created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'notif-3',
      user_id: 'usr-video-1',
      title: 'Revision Requested on Reel',
      message: 'Maya Chen requested revisions on "Feature Walkthrough Reel & Cutdowns": Trim intro hook to 1.5s.',
      type: 'revision_requested',
      related_task_id: 'tsk-103',
      is_read: false,
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];
}

export function createSeedActivity(): ActivityLog[] {
  return [
    {
      id: 'act-1',
      actor_id: 'usr-writer-1',
      actor_name: 'Marcus Thorne',
      actor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      action: 'submitted work URL for review on "Q4 Product Showcase Article"',
      entity_type: 'submission',
      entity_id: 'sub-101-1',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'act-2',
      actor_id: 'usr-designer-1',
      actor_name: 'Liam Keller',
      actor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      action: 'submitted Figma deliverables for "Brand Refresh: 3D Icons"',
      entity_type: 'submission',
      entity_id: 'sub-102-1',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      id: 'act-3',
      actor_id: 'usr-admin-1',
      actor_name: 'Maya Chen',
      actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      action: 'requested revisions on "Feature Walkthrough Reel"',
      entity_type: 'review',
      entity_id: 'rev-103-1',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];
}

// Database Engine Service Class
class TeamFlowDatabase {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public async ensureInitialized(forceReset = false) {
    if (!forceReset && localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
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

    // Default active session to Maya Chen (Admin)
    if (!localStorage.getItem(STORAGE_KEYS.SESSION)) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(seedUsers[0]));
    }

    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    this.notify();
  }

  // --- Auth & Session ---
  public getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    try {
      const user = JSON.parse(raw) as UserProfile;
      // Refresh with latest from USERS table
      const users = this.getUsers();
      const fresh = users.find((u) => u.id === user.id);
      return fresh || user;
    } catch {
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
    this.notify();
    return teams[idx];
  }

  public deleteTeam(id: string): boolean {
    const teams = this.getTeams();
    const filtered = teams.filter((t) => t.id !== id);
    if (filtered.length === teams.length) return false;
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(filtered));
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
    role: 'admin' | 'member';
    team_id: string;
    designation: string;
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
      avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${data.username}`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

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

    asg.status = status;
    if (status === 'approved') {
      asg.completed_at = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
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

    // Notify admins
    const submitter = this.getUser(data.user_id);
    const task = this.getTasks().find((t) => t.id === asg.task_id);
    const admins = this.getUsers().filter((u) => u.role === 'admin' && u.is_active);

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

    // Notify assigned member
    const reviewer = this.getUser(data.reviewed_by);
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
    this.notify();
    return events[idx];
  }

  public deleteCalendarEvent(id: string): boolean {
    const events = this.getCalendarEvents();
    const filtered = events.filter((e) => e.id !== id);
    if (filtered.length === events.length) return false;
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(filtered));
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
    this.notify();
    return newNotif;
  }

  public markNotificationAsRead(id: string): boolean {
    const notifs = this.getNotifications();
    const n = notifs.find((x) => x.id === id);
    if (!n) return false;
    n.is_read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
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
    this.notify();
    return newLog;
  }

  // Reset database back to clean seed
  public async resetToSeed(): Promise<void> {
    await this.ensureInitialized(true);
  }
}

export const db = new TeamFlowDatabase();
