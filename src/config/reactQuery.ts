import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Questions
  questions: {
    all: ['questions'] as const,
    lists: () => [...queryKeys.questions.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.questions.lists(), filters] as const,
    details: () => [...queryKeys.questions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.questions.details(), id] as const,
    analytics: () => [...queryKeys.questions.all, 'analytics'] as const,
  },

  // Quizzes
  quizzes: {
    all: ['quizzes'] as const,
    lists: () => [...queryKeys.quizzes.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.quizzes.lists(), filters] as const,
    details: () => [...queryKeys.quizzes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.quizzes.details(), id] as const,
    analytics: () => [...queryKeys.quizzes.all, 'analytics'] as const,
  },

  // Exams
  exams: {
    all: ['exams'] as const,
    lists: () => [...queryKeys.exams.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.exams.lists(), filters] as const,
    details: () => [...queryKeys.exams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.exams.details(), id] as const,
  },

  // Subjects
  subjects: {
    all: ['subjects'] as const,
    lists: () => [...queryKeys.subjects.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.subjects.lists(), filters] as const,
    details: () => [...queryKeys.subjects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.subjects.details(), id] as const,
    byExam: (examId: string) => [...queryKeys.subjects.all, 'byExam', examId] as const,
  },

  // Topics
  topics: {
    all: ['topics'] as const,
    lists: () => [...queryKeys.topics.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.topics.lists(), filters] as const,
    details: () => [...queryKeys.topics.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.topics.details(), id] as const,
    bySubject: (subjectId: string) => [...queryKeys.topics.all, 'bySubject', subjectId] as const,
  },

  // Subtopics
  subtopics: {
    all: ['subtopics'] as const,
    lists: () => [...queryKeys.subtopics.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.subtopics.lists(), filters] as const,
    details: () => [...queryKeys.subtopics.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.subtopics.details(), id] as const,
    byTopic: (topicId: string) => [...queryKeys.subtopics.all, 'byTopic', topicId] as const,
  },

  // Tags
  tags: {
    all: ['tags'] as const,
    lists: () => [...queryKeys.tags.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.tags.lists(), filters] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    analytics: () => [...queryKeys.users.all, 'analytics'] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.reports.lists(), filters] as const,
    details: () => [...queryKeys.reports.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reports.details(), id] as const,
  },

  // Feedback
  feedback: {
    all: ['feedback'] as const,
    lists: () => [...queryKeys.feedback.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.feedback.lists(), filters] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    platform: () => [...queryKeys.analytics.all, 'platform'] as const,
    questions: (filters: Record<string, any>) =>
      [...queryKeys.analytics.all, 'questions', filters] as const,
    quizzes: (filters: Record<string, any>) =>
      [...queryKeys.analytics.all, 'quizzes', filters] as const,
    topics: (filters: Record<string, any>) =>
      [...queryKeys.analytics.all, 'topics', filters] as const,
  },

  // Admins
  admins: {
    all: ['admins'] as const,
    lists: () => [...queryKeys.admins.all, 'list'] as const,
    list: () => [...queryKeys.admins.lists()] as const,
  },

  // System Config
  config: {
    all: ['config'] as const,
    lists: () => [...queryKeys.config.all, 'list'] as const,
    detail: (key: string) => [...queryKeys.config.all, key] as const,
  },

  // Audit Logs
  auditLogs: {
    all: ['auditLogs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.auditLogs.lists(), filters] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    activity: () => [...queryKeys.dashboard.all, 'activity'] as const,
  },
};
