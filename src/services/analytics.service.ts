import { supabase } from './supabase';
import dayjs from 'dayjs';

export interface PlatformStats {
  totalUsers: number;
  totalQuestions: number;
  totalQuizzes: number;
  totalExams: number;
  todayNewUsers: number;
  todayQuizAttempts: number;
  todayReports: number;
  weekGrowth: number;
}

export interface UserGrowthData {
  date: string;
  count: number;
}

export interface QuizCompletionData {
  type: string;
  completionRate: number;
  attempts: number;
}

export interface DifficultyDistribution {
  difficulty: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  entity_type: string;
  admin_name: string;
  created_at: string;
  details?: any;
}

export interface PendingItems {
  pendingReports: number;
  unpublishedQuizzes: number;
  pendingFeedback: number;
}

class AnalyticsService {
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const today = dayjs().startOf('day').toISOString();
      const weekAgo = dayjs().subtract(7, 'days').startOf('day').toISOString();
      const twoWeeksAgo = dayjs().subtract(14, 'days').startOf('day').toISOString();

      // Get total counts
      const [usersCount, questionsCount, quizzesCount, examsCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
        supabase.from('exams').select('*', { count: 'exact', head: true }),
      ]);

      // Get today's new users
      const { count: todayNewUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Get today's reports
      const { count: todayReports } = await supabase
        .from('question_reports')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Get this week's users
      const { count: thisWeekUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      // Get last week's users
      const { count: lastWeekUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twoWeeksAgo)
        .lt('created_at', weekAgo);

      // Calculate week-over-week growth
      const weekGrowth =
        lastWeekUsers && lastWeekUsers > 0
          ? ((thisWeekUsers || 0) - lastWeekUsers) / lastWeekUsers * 100
          : 0;

      return {
        totalUsers: usersCount.count || 0,
        totalQuestions: questionsCount.count || 0,
        totalQuizzes: quizzesCount.count || 0,
        totalExams: examsCount.count || 0,
        todayNewUsers: todayNewUsers || 0,
        todayQuizAttempts: 0, // Would need attempts table
        todayReports: todayReports || 0,
        weekGrowth: Math.round(weekGrowth * 10) / 10,
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      throw error;
    }
  }

  async getUserGrowth(days: number = 30): Promise<UserGrowthData[]> {
    try {
      const startDate = dayjs().subtract(days, 'days').startOf('day').toISOString();

      const { data, error } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const groupedData: { [key: string]: number } = {};
      
      // Initialize all dates with 0
      for (let i = 0; i < days; i++) {
        const date = dayjs().subtract(days - i - 1, 'days').format('YYYY-MM-DD');
        groupedData[date] = 0;
      }

      // Count users per date
      data?.forEach((user) => {
        const date = dayjs(user.created_at).format('YYYY-MM-DD');
        if (groupedData[date] !== undefined) {
          groupedData[date]++;
        }
      });

      return Object.entries(groupedData).map(([date, count]) => ({
        date,
        count,
      }));
    } catch (error) {
      console.error('Error fetching user growth:', error);
      throw error;
    }
  }

  async getQuizCompletionData(): Promise<QuizCompletionData[]> {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('type, is_published');

      if (error) throw error;

      // Group by type and calculate mock completion rates
      const typeGroups: { [key: string]: number } = {};
      data?.forEach((quiz) => {
        if (quiz.is_published) {
          typeGroups[quiz.type] = (typeGroups[quiz.type] || 0) + 1;
        }
      });

      return Object.entries(typeGroups).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        completionRate: Math.round(Math.random() * 30 + 60), // Mock data: 60-90%
        attempts: count * Math.floor(Math.random() * 50 + 10), // Mock data
      }));
    } catch (error) {
      console.error('Error fetching quiz completion data:', error);
      throw error;
    }
  }

  async getDifficultyDistribution(): Promise<DifficultyDistribution[]> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('difficulty');

      if (error) throw error;

      const distribution: { [key: string]: number } = {
        easy: 0,
        medium: 0,
        hard: 0,
      };

      data?.forEach((question) => {
        distribution[question.difficulty]++;
      });

      return Object.entries(distribution).map(([difficulty, count]) => ({
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        count,
      }));
    } catch (error) {
      console.error('Error fetching difficulty distribution:', error);
      throw error;
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          entity_type,
          created_at,
          details,
          admin_users!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((log: any) => ({
        id: log.id,
        action: log.action,
        entity_type: log.entity_type,
        admin_name: log.admin_users?.name || 'Unknown',
        created_at: log.created_at,
        details: log.details,
      }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Return empty array if audit_logs table doesn't exist yet
      return [];
    }
  }

  async getPendingItems(): Promise<PendingItems> {
    try {
      const [reportsCount, quizzesCount, feedbackCount] = await Promise.all([
        supabase
          .from('question_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', false),
        supabase
          .from('feedback')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

      return {
        pendingReports: reportsCount.count || 0,
        unpublishedQuizzes: quizzesCount.count || 0,
        pendingFeedback: feedbackCount.count || 0,
      };
    } catch (error) {
      console.error('Error fetching pending items:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
