// Database types for PyQuiz Admin Web Application
// Generated from Supabase schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      // Admin Tables
      admin_users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'super_admin' | 'content_manager' | 'moderator';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: 'super_admin' | 'content_manager' | 'moderator';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'super_admin' | 'content_manager' | 'moderator';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
      };
      system_config: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      // Master Content Tables
      exams: {
        Row: {
          id: string;
          name: string;
          name_hi: string;
          description: string | null;
          description_hi: string | null;
          icon_url: string | null;
          category: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_hi: string;
          description?: string | null;
          description_hi?: string | null;
          icon_url?: string | null;
          category: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_hi?: string;
          description?: string | null;
          description_hi?: string | null;
          icon_url?: string | null;
          category?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          exam_id: string;
          name: string;
          name_hi: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          name: string;
          name_hi: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          name?: string;
          name_hi?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      topics: {
        Row: {
          id: string;
          subject_id: string;
          name: string;
          name_hi: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          name: string;
          name_hi: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          name?: string;
          name_hi?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subtopics: {
        Row: {
          id: string;
          topic_id: string;
          name: string;
          name_hi: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          topic_id: string;
          name: string;
          name_hi: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          topic_id?: string;
          name?: string;
          name_hi?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          exam_id: string;
          topic_id: string;
          subtopic_id: string | null;
          question_content: Json; // Array of ContentBlock
          options: Json; // Array of QuestionOption
          correct_option: number;
          explanation_content: Json; // Array of ContentBlock
          difficulty: 'easy' | 'medium' | 'hard';
          is_pyq: boolean;
          year: number | null;
          tier: string | null;
          shift: string | null;
          comprehension_group_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          topic_id: string;
          subtopic_id?: string | null;
          question_content: Json;
          options: Json;
          correct_option: number;
          explanation_content?: Json; // Optional - can be empty array
          difficulty: 'easy' | 'medium' | 'hard';
          is_pyq?: boolean;
          year?: number | null;
          tier?: string | null;
          shift?: string | null;
          comprehension_group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          topic_id?: string;
          subtopic_id?: string | null;
          question_content?: Json;
          options?: Json;
          correct_option?: number;
          explanation_content?: Json;
          difficulty?: 'easy' | 'medium' | 'hard';
          is_pyq?: boolean;
          year?: number | null;
          tier?: string | null;
          shift?: string | null;
          comprehension_group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comprehension_groups: {
        Row: {
          id: string;
          title: string;
          title_hi: string;
          passage_content: Json; // Array of ContentBlock
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          title_hi: string;
          passage_content: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          title_hi?: string;
          passage_content?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          name_hi: string;
          type: 'concept' | 'pattern' | 'skill' | 'exam_behavior';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_hi: string;
          type: 'concept' | 'pattern' | 'skill' | 'exam_behavior';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_hi?: string;
          type?: 'concept' | 'pattern' | 'skill' | 'exam_behavior';
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          exam_id: string;
          title: string;
          title_hi: string;
          type: 'pyq' | 'practice' | 'daily';
          scope: 'exam' | 'subject' | 'topic' | 'subtopic';
          scope_id: string;
          is_pyq: boolean;
          year: number | null;
          tier: string | null;
          shift: string | null;
          duration_minutes: number;
          total_marks: number;
          marking_scheme: Json;
          negative_marking: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          title: string;
          title_hi: string;
          type: 'pyq' | 'practice' | 'daily';
          scope: 'exam' | 'subject' | 'topic' | 'subtopic';
          scope_id: string;
          is_pyq?: boolean;
          year?: number | null;
          tier?: string | null;
          shift?: string | null;
          duration_minutes: number;
          total_marks: number;
          marking_scheme: Json;
          negative_marking?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          title?: string;
          title_hi?: string;
          type?: 'pyq' | 'practice' | 'daily';
          scope?: 'exam' | 'subject' | 'topic' | 'subtopic';
          scope_id?: string;
          is_pyq?: boolean;
          year?: number | null;
          tier?: string | null;
          shift?: string | null;
          duration_minutes?: number;
          total_marks?: number;
          marking_scheme?: Json;
          negative_marking?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_sections: {
        Row: {
          id: string;
          quiz_id: string;
          name: string;
          name_hi: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          name: string;
          name_hi: string;
          display_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          name?: string;
          name_hi?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          section_id: string | null;
          question_id: string;
          display_order: number;
          marks: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          section_id?: string | null;
          question_id: string;
          display_order: number;
          marks: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          section_id?: string | null;
          question_id?: string;
          display_order?: number;
          marks?: number;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          gender: string | null;
          age: number | null;
          category: string | null;
          state: string | null;
          selected_exam_id: string | null;
          theme: 'light' | 'dark' | 'system';
          language: 'en' | 'hi';
          streak: number;
          last_activity: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          gender?: string | null;
          age?: number | null;
          category?: string | null;
          state?: string | null;
          selected_exam_id?: string | null;
          theme?: 'light' | 'dark' | 'system';
          language?: 'en' | 'hi';
          streak?: number;
          last_activity?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          gender?: string | null;
          age?: number | null;
          category?: string | null;
          state?: string | null;
          selected_exam_id?: string | null;
          theme?: 'light' | 'dark' | 'system';
          language?: 'en' | 'hi';
          streak?: number;
          last_activity?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      question_reports: {
        Row: {
          id: string;
          question_id: string;
          user_id: string;
          report_type: 'wrong_question' | 'wrong_answer' | 'typo' | 'image_issue' | 'other';
          description: string;
          status: 'pending' | 'reviewed' | 'resolved';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          user_id: string;
          report_type: 'wrong_question' | 'wrong_answer' | 'typo' | 'image_issue' | 'other';
          description: string;
          status?: 'pending' | 'reviewed' | 'resolved';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          user_id?: string;
          report_type?: 'wrong_question' | 'wrong_answer' | 'typo' | 'image_issue' | 'other';
          description?: string;
          status?: 'pending' | 'reviewed' | 'resolved';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          rating: number;
          message: string;
          status: 'pending' | 'reviewed';
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rating: number;
          message: string;
          status?: 'pending' | 'reviewed';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rating?: number;
          message?: string;
          status?: 'pending' | 'reviewed';
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
