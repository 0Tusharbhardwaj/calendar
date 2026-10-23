-- ==============================================================================
-- TEAMFLOW — COMPLETE SUPABASE DATABASE SCHEMA & INITIAL SEED
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- It will create all necessary tables, set up security policies, enable realtime,
-- and seed the workspace for Tushar Bhardwaj & Bhoomika Chawla.
-- ==============================================================================

-- 1. CLEANUP (OPTIONAL / SAFE RE-RUN)
DROP TABLE IF EXISTS submission_reviews CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS app_notifications CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- 2. TEAMS TABLE
CREATE TABLE public.teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    color TEXT NOT NULL,
    badge_bg TEXT NOT NULL,
    badge_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS TABLE
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
    team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    designation TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TASKS TABLE
CREATE TABLE public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
    created_by TEXT NOT NULL,
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assignment_type TEXT NOT NULL CHECK (assignment_type IN ('individual', 'multiple', 'team')),
    reference_urls TEXT[] DEFAULT '{}',
    internal_instructions TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TASK ASSIGNMENTS TABLE
CREATE TABLE public.task_assignments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('assigned', 'in_progress', 'submitted', 'revision_required', 'resubmitted', 'approved')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 6. SUBMISSIONS TABLE
CREATE TABLE public.submissions (
    id TEXT PRIMARY KEY,
    task_assignment_id TEXT NOT NULL REFERENCES public.task_assignments(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    submitted_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    submission_url TEXT NOT NULL,
    comments TEXT DEFAULT '',
    supporting_links TEXT[] DEFAULT '{}',
    version_number INT DEFAULT 1,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUBMISSION REVIEWS TABLE
CREATE TABLE public.submission_reviews (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    task_assignment_id TEXT NOT NULL REFERENCES public.task_assignments(id) ON DELETE CASCADE,
    reviewed_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'changes_requested', 'rejected')),
    feedback TEXT DEFAULT '',
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CALENDAR EVENTS TABLE
CREATE TABLE public.calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    date DATE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    event_type TEXT NOT NULL,
    team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    associated_member_ids TEXT[] DEFAULT '{}',
    reference_url TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. APP NOTIFICATIONS TABLE
CREATE TABLE public.app_notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL, -- specific user_id or 'all'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    related_task_id TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ACTIVITY LOGS TABLE
CREATE TABLE public.activity_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_avatar TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ==============================================================================
-- Enables direct client read/write via the Supabase Anon Public API Key.

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for anon" ON public.teams FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON public.tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON public.task_assignments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON public.submissions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON public.submission_reviews FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON public.calendar_events FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON public.app_notifications FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anon" ON public.activity_logs FOR ALL TO anon USING (true) WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.teams,
    public.users,
    public.tasks,
    public.task_assignments,
    public.submissions,
    public.submission_reviews,
    public.calendar_events,
    public.app_notifications,
    public.activity_logs;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- 1. Insert Teams
INSERT INTO public.teams (id, name, description, color, badge_bg, badge_text, is_active) VALUES
('team-writing', 'Content Writing', 'Articles, blogs, social copy, newsletters, announcements', '#FC9631', 'rgba(252, 150, 49, 0.15)', '#A63500', true),
('team-graphics', 'Graphics & Design', 'Posters, social media creatives, thumbnails, brand illustrations', '#FE75B9', 'rgba(254, 117, 185, 0.15)', '#A91F62', true),
('team-video', 'Video & Editing', 'Reels, promo videos, long-form tutorials, animations, podcasts', '#FF5601', 'rgba(255, 86, 1, 0.15)', '#A63500', true),
('team-others', 'Operations & Research', 'Strategy, distribution, partner outreach, documentation', '#F9CC61', 'rgba(249, 204, 97, 0.25)', '#7A5200', true);

-- 2. Insert Initial Admins (Tushar Bhardwaj & Bhoomika Chawla)
-- Passwords: 'admin123' (SHA-256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9)
INSERT INTO public.users (id, full_name, username, password_hash, role, team_id, designation, avatar_url, is_active) VALUES
('usr-admin-tushar', 'Tushar Bhardwaj', 'tushar', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'team-others', 'Founder & Lead Administrator', 'https://api.dicebear.com/7.x/notionists/svg?seed=tushar&backgroundColor=ffdfbf', true),
('usr-admin-bhoomika', 'Bhoomika Chawla', 'bhoomika', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'team-others', 'Co-Founder & Lead Administrator', 'https://api.dicebear.com/7.x/notionists/svg?seed=bhoomika&backgroundColor=ffd5dc', true);

-- 3. Initial Welcome Notification
INSERT INTO public.app_notifications (id, user_id, title, message, type, is_read) VALUES
('notif-welcome', 'all', 'Welcome to TeamFlow!', 'Workspace is live and configured with cloud database. You can now invite members and assign tasks.', 'system', false);

-- 4. Initial Activity Log
INSERT INTO public.activity_logs (id, actor_id, actor_name, actor_avatar, action, entity_type, entity_id) VALUES
('act-init', 'usr-admin-tushar', 'Tushar Bhardwaj', 'https://api.dicebear.com/7.x/notionists/svg?seed=tushar&backgroundColor=ffdfbf', 'initialized TeamFlow cloud database', 'team', 'team-others');
