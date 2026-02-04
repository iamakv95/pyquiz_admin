import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface UserFilters {
  search?: string;
  exam_id?: string;
  date_from?: string;
  date_to?: string;
  state?: string;
  category?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'last_activity' | 'streak';
  sort_order?: 'asc' | 'desc';
}

export interface UserWithExam extends User {
  exam?: {
    id: string;
    name: string;
    name_hi: string;
  };
}

export interface UserStatistics {
  total_quizzes_attempted: number;
  total_questions_attempted: number;
  average_accuracy: number;
  total_time_spent_minutes: number;
  weak_areas_count: number;
}

export interface UserActivity {
  id: string;
  type: 'quiz_attempt' | 'flashcard_review' | 'report_submitted';
  title: string;
  timestamp: string;
  details?: any;
}

export interface UserAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  quiz_title_hi: string;
  score: number;
  total_marks: number;
  time_taken_seconds: number;
  completed_at: string;
}

export interface UsersListResponse {
  users: UserWithExam[];
  total: number;
  page: number;
  limit: number;
}

class UserService {
  async getUsers(filters: UserFilters): Promise<UsersListResponse> {
    const {
      search,
      exam_id,
      date_from,
      date_to,
      state,
      category,
      is_active,
      page = 1,
      limit = 50,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = filters;

    let query = supabase
      .from('users')
      .select(
        `
        *,
        exam:exams!users_selected_exam_id_fkey(id, name, name_hi)
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (exam_id) {
      query = query.eq('selected_exam_id', exam_id);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    if (state) {
      query = query.eq('state', state);
    }

    if (category) {
      query = query.eq('category', category);
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      users: (data || []) as UserWithExam[],
      total: count || 0,
      page,
      limit,
    };
  }

  async getUser(id: string): Promise<UserWithExam> {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        exam:exams!users_selected_exam_id_fkey(id, name, name_hi)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as UserWithExam;
  }

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    // Get quiz attempts count and stats
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select('id, score, total_marks, time_taken_seconds')
      .eq('user_id', userId);

    if (attemptsError) throw attemptsError;

    // Get question responses count
    const { count: questionsCount, error: questionsError } = await supabase
      .from('attempt_responses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (questionsError) throw questionsError;

    // Get weak areas count
    const { count: weakAreasCount, error: weakAreasError } = await supabase
      .from('weak_areas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (weakAreasError) throw weakAreasError;

    // Calculate statistics
    const totalQuizzes = attempts?.length || 0;
    const totalQuestions = questionsCount || 0;
    
    let totalScore = 0;
    let totalMarks = 0;
    let totalTime = 0;

    attempts?.forEach((attempt) => {
      totalScore += attempt.score || 0;
      totalMarks += attempt.total_marks || 0;
      totalTime += attempt.time_taken_seconds || 0;
    });

    const averageAccuracy = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

    return {
      total_quizzes_attempted: totalQuizzes,
      total_questions_attempted: totalQuestions,
      average_accuracy: Math.round(averageAccuracy * 100) / 100,
      total_time_spent_minutes: Math.round(totalTime / 60),
      weak_areas_count: weakAreasCount || 0,
    };
  }

  async getUserActivity(userId: string, limit = 10): Promise<UserActivity[]> {
    const activities: UserActivity[] = [];

    // Get recent quiz attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select(
        `
        id,
        completed_at,
        score,
        total_marks,
        quiz:quizzes(id, title, title_hi)
      `
      )
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (!attemptsError && attempts) {
      attempts.forEach((attempt: any) => {
        activities.push({
          id: attempt.id,
          type: 'quiz_attempt',
          title: `Attempted: ${attempt.quiz?.title || 'Quiz'}`,
          timestamp: attempt.completed_at,
          details: {
            score: attempt.score,
            total_marks: attempt.total_marks,
          },
        });
      });
    }

    // Get recent reports
    const { data: reports, error: reportsError } = await supabase
      .from('question_reports')
      .select('id, created_at, report_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!reportsError && reports) {
      reports.forEach((report) => {
        activities.push({
          id: report.id,
          type: 'report_submitted',
          title: `Reported: ${report.report_type.replace('_', ' ')}`,
          timestamp: report.created_at,
        });
      });
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, limit);
  }

  async getUserAttempts(userId: string): Promise<UserAttempt[]> {
    const { data, error } = await supabase
      .from('attempts')
      .select(
        `
        id,
        quiz_id,
        score,
        total_marks,
        time_taken_seconds,
        completed_at,
        quiz:quizzes(title, title_hi)
      `
      )
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((attempt: any) => ({
      id: attempt.id,
      quiz_id: attempt.quiz_id,
      quiz_title: attempt.quiz?.title || 'Unknown Quiz',
      quiz_title_hi: attempt.quiz?.title_hi || 'अज्ञात क्विज़',
      score: attempt.score,
      total_marks: attempt.total_marks,
      time_taken_seconds: attempt.time_taken_seconds,
      completed_at: attempt.completed_at,
    }));
  }

  async updateUser(id: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserReports(userId: string) {
    const { data, error } = await supabase
      .from('question_reports')
      .select(
        `
        *,
        question:questions(id, question_content)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getUserFeedback(userId: string) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async exportUsers(filters: UserFilters): Promise<Blob> {
    // Get all users matching filters (without pagination)
    const { users } = await this.getUsers({ ...filters, limit: 10000 });

    // Convert to CSV
    const headers = [
      'ID',
      'Name',
      'Email',
      'Exam',
      'State',
      'Category',
      'Gender',
      'Age',
      'Streak',
      'Last Activity',
      'Created At',
    ];

    const rows = users.map((user) => [
      user.id,
      user.full_name,
      user.email,
      user.exam?.name || '',
      user.state || '',
      user.category || '',
      user.gender || '',
      user.age || '',
      user.streak,
      user.last_activity || '',
      user.created_at,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }
}

export const userService = new UserService();