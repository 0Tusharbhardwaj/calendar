import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation, ActiveTab } from './components/Navigation';
import { CommandPalette } from './components/CommandPalette';
import { NotificationDrawer } from './components/NotificationDrawer';
import { DashboardView } from './components/views/DashboardView';
import { CalendarView } from './components/views/CalendarView';
import { TasksView } from './components/views/TasksView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { TeamsMembersView } from './components/views/TeamsMembersView';
import { ActivityView } from './components/views/ActivityView';
import { LoginPage } from './components/views/LoginPage';
import { LoginModal } from './components/views/LoginModal';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { CreateEventModal } from './components/modals/CreateEventModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { SubmitWorkModal } from './components/modals/SubmitWorkModal';
import { ReviewModal } from './components/modals/ReviewModal';
import { TeamModal } from './components/modals/TeamModal';
import { UserModal } from './components/modals/UserModal';
import { Team, UserProfile } from './types';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState<string | undefined>(undefined);

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [createEventDate, setCreateEventDate] = useState<string | undefined>(undefined);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [submitAssignmentId, setSubmitAssignmentId] = useState<string | null>(null);
  const [reviewSubmissionId, setReviewSubmissionId] = useState<string | null>(null);

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);

  // Global key listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#FDF7F0] text-[#2A1812] flex flex-col selection:bg-[#FC9631]/30 pb-24 lg:pb-12">
      {/* 1. Floating Top Navigation Capsule */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateTask={() => {
          setCreateTaskDate(undefined);
          setIsCreateTaskOpen(true);
        }}
        onOpenCreateEvent={() => {
          setCreateEventDate(undefined);
          setIsCreateEventOpen(true);
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 w-full flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenCreateTask={() => {
              setCreateTaskDate(undefined);
              setIsCreateTaskOpen(true);
            }}
            onOpenCreateEvent={() => {
              setCreateEventDate(undefined);
              setIsCreateEventOpen(true);
            }}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onOpenReview={(id) => setReviewSubmissionId(id)}
            onOpenSubmit={(id) => setSubmitAssignmentId(id)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            onSelectTask={(id) => setSelectedTaskId(id)}
            onOpenCreateTask={(date) => {
              setCreateTaskDate(date);
              setIsCreateTaskOpen(true);
            }}
            onOpenCreateEvent={(date) => {
              setCreateEventDate(date);
              setIsCreateEventOpen(true);
            }}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            onSelectTask={(id) => setSelectedTaskId(id)}
            onOpenCreateTask={() => {
              setCreateTaskDate(undefined);
              setIsCreateTaskOpen(true);
            }}
          />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsView
            onSelectTask={(id) => setSelectedTaskId(id)}
            onOpenReview={(id) => setReviewSubmissionId(id)}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsMembersView
            onOpenCreateTeam={() => {
              setTeamToEdit(null);
              setIsTeamModalOpen(true);
            }}
            onOpenEditTeam={(t) => {
              setTeamToEdit(t);
              setIsTeamModalOpen(true);
            }}
            onOpenCreateUser={() => {
              setUserToEdit(null);
              setIsUserModalOpen(true);
            }}
            onOpenEditUser={(u) => {
              setUserToEdit(u);
              setIsUserModalOpen(true);
            }}
          />
        )}

        {activeTab === 'activity' && <ActivityView />}
      </main>

      {/* 3. Global Modals & Dialogs */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setActiveTab={setActiveTab}
        onSelectTask={(id) => setSelectedTaskId(id)}
        onOpenCreateTask={() => {
          setCreateTaskDate(undefined);
          setIsCreateTaskOpen(true);
        }}
        onOpenCreateEvent={() => {
          setCreateEventDate(undefined);
          setIsCreateEventOpen(true);
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectTask={(id) => setSelectedTaskId(id)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        initialDate={createTaskDate}
        onClose={() => setIsCreateTaskOpen(false)}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        initialDate={createEventDate}
        onClose={() => setIsCreateEventOpen(false)}
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onOpenSubmit={(asgId) => setSubmitAssignmentId(asgId)}
        onOpenReview={(subId) => setReviewSubmissionId(subId)}
      />

      <SubmitWorkModal
        assignmentId={submitAssignmentId}
        isOpen={!!submitAssignmentId}
        onClose={() => setSubmitAssignmentId(null)}
      />

      <ReviewModal
        submissionId={reviewSubmissionId}
        isOpen={!!reviewSubmissionId}
        onClose={() => setReviewSubmissionId(null)}
      />

      <TeamModal
        teamToEdit={teamToEdit}
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setTeamToEdit(null);
        }}
      />

      <UserModal
        userToEdit={userToEdit}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setUserToEdit(null);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
