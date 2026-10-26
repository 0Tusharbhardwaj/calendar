export type UserRole = 'super_admin' | 'admin' | 'member';

export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  password_hash: string;
  role: UserRole;
  team_id: string;
  designation: string;
  description?: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  badge_bg: string;
  badge_text: string;
  is_active: boolean;
  created_at: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type AssignmentType = 'individual' | 'multiple' | 'team';

export type AssignmentStatus =
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'revision_required'
  | 'resubmitted'
  | 'approved';

export interface Task {
  id: string;
  title: string;
  description: string;
  team_id: string;
  created_by: string;
  start_date: string; // YYYY-MM-DD
  deadline: string;   // YYYY-MM-DD
  priority: TaskPriority;
  assignment_type: AssignmentType;
  reference_urls: string[];
  internal_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  status: AssignmentStatus;
  assigned_at: string;
  completed_at?: string;
}

export interface Submission {
  id: string;
  task_assignment_id: string;
  task_id: string;
  submitted_by: string;
  submission_url: string;
  comments: string;
  supporting_links?: string[];
  version_number: number;
  submitted_at: string;
}

export type ReviewDecision = 'approved' | 'changes_requested' | 'rejected';

export interface SubmissionReview {
  id: string;
  submission_id: string;
  task_assignment_id: string;
  reviewed_by: string;
  decision: ReviewDecision;
  feedback: string;
  reviewed_at: string;
}

export type CalendarEventType =
  | 'meeting'
  | 'campaign_launch'
  | 'announcement'
  | 'milestone'
  | 'publishing'
  | 'internal_deadline';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  start_time?: string;
  end_time?: string;
  event_type: CalendarEventType;
  team_id?: string;
  associated_member_ids?: string[];
  reference_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'task_assigned'
  | 'deadline_approaching'
  | 'task_overdue'
  | 'submission_received'
  | 'submission_approved'
  | 'revision_requested'
  | 'task_resubmitted'
  | 'system';

export interface AppNotification {
  id: string;
  user_id: string; // user id or 'all'
  title: string;
  message: string;
  type: NotificationType;
  related_task_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  action: string;
  entity_type: 'task' | 'submission' | 'review' | 'user' | 'team' | 'calendar_event';
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Joined views for rich UI rendering
export interface TaskWithDetails extends Task {
  team?: Team;
  creator?: UserProfile;
  assignments: (TaskAssignment & {
    user?: UserProfile;
    submissions?: (Submission & {
      reviews?: SubmissionReview[];
    })[];
  })[];
  overall_status: AssignmentStatus | 'overdue';
}
