import { Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';

// Lazy load pages for better performance
import { lazy } from 'react';

// Auth pages
const Login = lazy(() => import('../pages/auth/Login'));

// Dashboard
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));

// Content pages
const ContentOverview = lazy(() => import('../pages/content/ContentOverview'));
const ExamsList = lazy(() => import('../pages/content/exams/ExamsList'));
const SubjectsList = lazy(() => import('../pages/content/subjects/SubjectsList'));
const TopicsList = lazy(() => import('../pages/content/topics/TopicsList'));
const SubtopicsList = lazy(() => import('../pages/content/subtopics/SubtopicsList'));
const QuestionsList = lazy(() => import('../pages/content/questions/QuestionsList'));
const CreateQuestion = lazy(() => import('../pages/content/questions/CreateQuestion'));
const EditQuestion = lazy(() => import('../pages/content/questions/EditQuestion'));
const QuestionDetail = lazy(() => import('../pages/content/questions/QuestionDetail'));
const BulkImport = lazy(() => import('../pages/content/questions/BulkImport'));
const QuizzesList = lazy(() => import('../pages/content/quizzes/QuizzesList'));
const DailyQuizzesList = lazy(() => import('../pages/content/quizzes/DailyQuizzesList'));
const TagsList = lazy(() => import('../pages/content/tags/TagsList'));

// User pages
const UsersList = lazy(() => import('../pages/users/UsersList'));
const UserDetail = lazy(() => import('../pages/users/UserDetail'));

// Analytics pages
const PlatformAnalytics = lazy(() => import('../pages/analytics/PlatformAnalytics'));
const QuestionAnalytics = lazy(() => import('../pages/analytics/QuestionAnalytics'));
const QuizAnalytics = lazy(() => import('../pages/analytics/QuizAnalytics'));
const TopicAnalytics = lazy(() => import('../pages/analytics/TopicAnalytics'));

// Reports pages
const QuestionReports = lazy(() => import('../pages/reports/QuestionReports'));
const Feedback = lazy(() => import('../pages/reports/Feedback'));

// Settings pages
const AdminManagement = lazy(() => import('../pages/settings/AdminManagement'));
const SystemConfig = lazy(() => import('../pages/settings/SystemConfig'));
const AuditLogs = lazy(() => import('../pages/settings/AuditLogs'));

// Error pages
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const Forbidden = lazy(() => import('../pages/errors/Forbidden'));

export type AdminRole = 'super_admin' | 'content_manager' | 'moderator';

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  roles?: AdminRole[];
  children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
        roles: ['super_admin', 'content_manager', 'moderator'],
      },
      // Content routes
      {
        path: 'content',
        element: <ContentOverview />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/exams',
        element: <ExamsList />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/subjects',
        element: <SubjectsList />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/topics',
        element: <TopicsList />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/subtopics',
        element: <SubtopicsList />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/questions',
        element: <QuestionsList />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/questions/new',
        element: <CreateQuestion />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/questions/bulk-import',
        element: <BulkImport />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/questions/:id',
        element: <QuestionDetail />,
        roles: ['super_admin', 'content_manager', 'moderator'],
      },
      {
        path: 'content/questions/:id/edit',
        element: <EditQuestion />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/quizzes',
        element: <QuizzesList />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/daily-quizzes',
        element: <DailyQuizzesList />,
        roles: ['super_admin', 'content_manager'],
      },
      {
        path: 'content/tags',
        element: <TagsList />,
        roles: ['super_admin', 'content_manager'],
      },
      // User routes
      {
        path: 'users',
        element: <UsersList />,
        roles: ['super_admin'],
      },
      {
        path: 'users/:id',
        element: <UserDetail />,
        roles: ['super_admin'],
      },
      // Analytics routes
      {
        path: 'analytics/platform',
        element: <PlatformAnalytics />,
        roles: ['super_admin', 'content_manager', 'moderator'],
      },
      {
        path: 'analytics/questions',
        element: <QuestionAnalytics />,
        roles: ['super_admin', 'content_manager', 'moderator'],
      },
      {
        path: 'analytics/quizzes',
        element: <QuizAnalytics />,
        roles: ['super_admin', 'content_manager', 'moderator'],
      },
      {
        path: 'analytics/topics',
        element: <TopicAnalytics />,
        roles: ['super_admin', 'content_manager', 'moderator'],
      },
      // Reports routes
      {
        path: 'reports/questions',
        element: <QuestionReports />,
        roles: ['super_admin', 'content_manager', 'moderator'],
      },
      {
        path: 'reports/feedback',
        element: <Feedback />,
        roles: ['super_admin', 'content_manager', 'moderator'],
      },
      // Settings routes
      {
        path: 'settings/admins',
        element: <AdminManagement />,
        roles: ['super_admin'],
      },
      {
        path: 'settings/system',
        element: <SystemConfig />,
        roles: ['super_admin'],
      },
      {
        path: 'settings/audit-logs',
        element: <AuditLogs />,
        roles: ['super_admin'],
      },
      // Error pages
      {
        path: '403',
        element: <Forbidden />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
