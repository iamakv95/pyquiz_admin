import { supabase } from './supabase';
import type { Database } from '../types/database.types';

type Exam = Database['public']['Tables']['exams']['Row'];
type ExamInsert = Database['public']['Tables']['exams']['Insert'];
type ExamUpdate = Database['public']['Tables']['exams']['Update'];

type Subject = Database['public']['Tables']['subjects']['Row'];
type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];
type SubjectUpdate = Database['public']['Tables']['subjects']['Update'];

type Topic = Database['public']['Tables']['topics']['Row'];
type TopicInsert = Database['public']['Tables']['topics']['Insert'];
type TopicUpdate = Database['public']['Tables']['topics']['Update'];

type Subtopic = Database['public']['Tables']['subtopics']['Row'];
type SubtopicInsert = Database['public']['Tables']['subtopics']['Insert'];
type SubtopicUpdate = Database['public']['Tables']['subtopics']['Update'];

// Exam Service
export const examService = {
  async getAll(): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Exam> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(exam: ExamInsert): Promise<Exam> {
    const { data, error } = await supabase
      .from('exams')
      .insert(exam)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, exam: ExamUpdate): Promise<Exam> {
    const { data, error } = await supabase
      .from('exams')
      .update(exam)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async togglePublish(id: string, isPublished: boolean): Promise<Exam> {
    return this.update(id, { is_published: isPublished });
  },
};

// Subject Service
export const subjectService = {
  async getAll(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(subject: SubjectInsert): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, subject: SubjectUpdate): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .update(subject)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Topic Service
export const topicService = {
  async getAll(): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getBySubject(subjectId: string): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(topic: TopicInsert): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .insert(topic)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, topic: TopicUpdate): Promise<Topic> {
    const { data, error } = await supabase
      .from('topics')
      .update(topic)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Subtopic Service
export const subtopicService = {
  async getAll(): Promise<Subtopic[]> {
    const { data, error } = await supabase
      .from('subtopics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByTopic(topicId: string): Promise<Subtopic[]> {
    const { data, error } = await supabase
      .from('subtopics')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Subtopic> {
    const { data, error } = await supabase
      .from('subtopics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(subtopic: SubtopicInsert): Promise<Subtopic> {
    const { data, error } = await supabase
      .from('subtopics')
      .insert(subtopic)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, subtopic: SubtopicUpdate): Promise<Subtopic> {
    const { data, error } = await supabase
      .from('subtopics')
      .update(subtopic)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error} = await supabase
      .from('subtopics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Question Types
type Question = Database['public']['Tables']['questions']['Row'];
type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
type QuestionUpdate = Database['public']['Tables']['questions']['Update'];

// Comprehension Group Types
type ComprehensionGroup = Database['public']['Tables']['comprehension_groups']['Row'];
type ComprehensionGroupInsert = Database['public']['Tables']['comprehension_groups']['Insert'];
type ComprehensionGroupUpdate = Database['public']['Tables']['comprehension_groups']['Update'];

export interface QuestionFilters {
  search?: string;
  exam_id?: string;
  topic_id?: string;
  subtopic_id?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_pyq?: boolean;
  year_from?: number;
  year_to?: number;
  comprehension_group_id?: string;
  page?: number;
  limit?: number;
}

export interface QuestionWithRelations extends Question {
  topic?: Topic & {
    subject?: Subject;
  };
  subtopic?: Subtopic;
  comprehension_group?: ComprehensionGroup;
}

// Helper function to extract text from content blocks for search
function extractTextFromContent(content: any): string {
  if (!content || !Array.isArray(content)) return '';
  
  return content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => `${block.content || ''} ${block.content_hi || ''}`)
    .join(' ');
}

// Comprehension Group Service
export const comprehensionGroupService = {
  async getAll(): Promise<ComprehensionGroup[]> {
    const { data, error } = await supabase
      .from('comprehension_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<ComprehensionGroup> {
    const { data, error } = await supabase
      .from('comprehension_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(group: ComprehensionGroupInsert): Promise<ComprehensionGroup> {
    const { data, error } = await supabase
      .from('comprehension_groups')
      .insert(group)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, group: ComprehensionGroupUpdate): Promise<ComprehensionGroup> {
    const { data, error } = await supabase
      .from('comprehension_groups')
      .update(group)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('comprehension_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getQuestions(id: string): Promise<QuestionWithRelations[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*, topic:topics(*), subtopic:subtopics(*)')
      .eq('comprehension_group_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};

// Question Service
export const questionService = {
  async getAll(filters: QuestionFilters = {}): Promise<{ data: QuestionWithRelations[]; count: number }> {
    const { 
      search, 
      exam_id,
      topic_id, 
      subtopic_id, 
      difficulty, 
      is_pyq, 
      year_from, 
      year_to,
      comprehension_group_id,
      page = 1,
      limit = 50
    } = filters;

    let query = supabase
      .from('questions')
      .select('*, topic:topics(*), subtopic:subtopics(*), comprehension_group:comprehension_groups(*)', { count: 'exact' });

    // Filter by exam
    if (exam_id) {
      query = query.eq('exam_id', exam_id);
    }

    // Search in question_content blocks
    if (search) {
      // Note: This is a simplified search. For production, consider using PostgreSQL full-text search
      // or a dedicated search service like Algolia
      const { data: allQuestions } = await supabase
        .from('questions')
        .select('id, question_content');
      
      const matchingIds = allQuestions
        ?.filter(q => {
          const text = extractTextFromContent(q.question_content);
          return text.toLowerCase().includes(search.toLowerCase());
        })
        .map(q => q.id) || [];

      if (matchingIds.length > 0) {
        query = query.in('id', matchingIds);
      } else {
        // No matches, return empty result
        return { data: [], count: 0 };
      }
    }

    if (topic_id) {
      query = query.eq('topic_id', topic_id);
    }

    if (subtopic_id) {
      query = query.eq('subtopic_id', subtopic_id);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (is_pyq !== undefined) {
      query = query.eq('is_pyq', is_pyq);
    }

    if (year_from) {
      query = query.gte('year', year_from);
    }

    if (year_to) {
      query = query.lte('year', year_to);
    }

    if (comprehension_group_id) {
      query = query.eq('comprehension_group_id', comprehension_group_id);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  async getById(id: string): Promise<QuestionWithRelations> {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *, 
        topic:topics(*, subject:subjects(*)), 
        subtopic:subtopics(*), 
        comprehension_group:comprehension_groups(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getQuestionTags(questionId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('question_tags')
      .select('tag_id')
      .eq('question_id', questionId);

    if (error) throw error;
    return data?.map(t => t.tag_id) || [];
  },

  async create(question: QuestionInsert): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createWithTags(question: QuestionInsert, tagIds: string[]): Promise<Question> {
    // Create the question first
    const createdQuestion = await this.create(question);

    // If there are tags, create the relationships
    if (tagIds.length > 0) {
      const tagRelations = tagIds.map(tagId => ({
        question_id: createdQuestion.id,
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from('question_tags')
        .insert(tagRelations);

      if (tagError) throw tagError;
    }

    return createdQuestion;
  },

  async update(id: string, question: QuestionUpdate): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update(question)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWithTags(id: string, question: QuestionUpdate, tagIds: string[]): Promise<Question> {
    // Update the question first
    const updatedQuestion = await this.update(id, question);

    // Delete existing tag relationships
    const { error: deleteError } = await supabase
      .from('question_tags')
      .delete()
      .eq('question_id', id);

    if (deleteError) throw deleteError;

    // Create new tag relationships
    if (tagIds.length > 0) {
      const tagRelations = tagIds.map(tagId => ({
        question_id: id,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase
        .from('question_tags')
        .insert(tagRelations);

      if (insertError) throw insertError;
    }

    return updatedQuestion;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async bulkDelete(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .in('id', ids);

    if (error) throw error;
  },

  async bulkUpdateDifficulty(ids: string[], difficulty: 'easy' | 'medium' | 'hard'): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .update({ difficulty })
      .in('id', ids);

    if (error) throw error;
  },

  async bulkAssignTags(ids: string[], tagIds: string[]): Promise<void> {
    // First, get existing question_tags for these questions
    const { data: existingTags, error: fetchError } = await supabase
      .from('question_tags')
      .select('question_id, tag_id')
      .in('question_id', ids);

    if (fetchError) throw fetchError;

    // Create a set of existing combinations
    const existingSet = new Set(
      existingTags?.map(t => `${t.question_id}-${t.tag_id}`) || []
    );

    // Prepare new tag assignments (avoid duplicates)
    const newAssignments = [];
    for (const questionId of ids) {
      for (const tagId of tagIds) {
        const key = `${questionId}-${tagId}`;
        if (!existingSet.has(key)) {
          newAssignments.push({ question_id: questionId, tag_id: tagId });
        }
      }
    }

    // Insert new assignments if any
    if (newAssignments.length > 0) {
      const { error: insertError } = await supabase
        .from('question_tags')
        .insert(newAssignments);

      if (insertError) throw insertError;
    }
  },

  async duplicate(id: string): Promise<Question> {
    const original = await this.getById(id);
    const { id: _, created_at, updated_at, topic, subtopic, comprehension_group, ...questionData } = original;
    
    // Extract first text block for the copy suffix
    const questionContent = questionData.question_content as any[];
    if (questionContent && questionContent.length > 0) {
      const firstTextBlock = questionContent.find((block: any) => block.type === 'text');
      if (firstTextBlock) {
        firstTextBlock.content = `${firstTextBlock.content} (Copy)`;
        firstTextBlock.content_hi = `${firstTextBlock.content_hi} (प्रतिलिपि)`;
      }
    }
    
    return this.create(questionData);
  },

  // Get question statistics
  async getStats(): Promise<{
    total: number;
    by_difficulty: { easy: number; medium: number; hard: number };
    by_pyq: { pyq: number; practice: number };
    with_images: number;
    with_comprehension: number;
  }> {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('difficulty, is_pyq, question_content, comprehension_group_id');

    if (error) throw error;

    const stats = {
      total: questions?.length || 0,
      by_difficulty: { easy: 0, medium: 0, hard: 0 },
      by_pyq: { pyq: 0, practice: 0 },
      with_images: 0,
      with_comprehension: 0,
    };

    questions?.forEach(q => {
      // Count by difficulty
      stats.by_difficulty[q.difficulty as 'easy' | 'medium' | 'hard']++;
      
      // Count by PYQ status
      if (q.is_pyq) {
        stats.by_pyq.pyq++;
      } else {
        stats.by_pyq.practice++;
      }

      // Count questions with images
      const content = q.question_content as any[];
      if (content?.some((block: any) => block.type === 'image')) {
        stats.with_images++;
      }

      // Count questions with comprehension
      if (q.comprehension_group_id) {
        stats.with_comprehension++;
      }
    });

    return stats;
  },
};

// Tag Types
type Tag = Database['public']['Tables']['tags']['Row'];
type TagInsert = Database['public']['Tables']['tags']['Insert'];

// Tag Service
export const tagService = {
  async getAll(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(tag: TagInsert): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Quiz Types
type Quiz = Database['public']['Tables']['quizzes']['Row'];
type QuizInsert = Database['public']['Tables']['quizzes']['Insert'];
type QuizUpdate = Database['public']['Tables']['quizzes']['Update'];

export interface QuizFilters {
  search?: string;
  exam_id?: string;
  type?: 'pyq' | 'practice' | 'daily';
  scope?: 'exam' | 'subject' | 'topic' | 'subtopic';
  is_published?: boolean;
  page?: number;
  limit?: number;
}

export interface QuizWithRelations extends Quiz {
  scope_name?: string;
  question_count?: number;
}

// Quiz Service
export const quizService = {
  async getAll(filters: QuizFilters = {}): Promise<{ data: QuizWithRelations[]; count: number }> {
    const {
      search,
      exam_id,
      type,
      scope,
      is_published,
      page = 1,
      limit = 50
    } = filters;

    let query = supabase
      .from('quizzes')
      .select('*', { count: 'exact' });

    // Search in title
    if (search) {
      query = query.or(`title.ilike.%${search}%,title_hi.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (scope) {
      query = query.eq('scope', scope);
    }

    if (is_published !== undefined) {
      query = query.eq('is_published', is_published);
    }

    // Filter by exam
    if (exam_id) {
      query = query.eq('exam_id', exam_id);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  async getById(id: string): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(quiz: QuizInsert): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .insert(quiz)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, quiz: QuizUpdate): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .update(quiz)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async togglePublish(id: string, isPublished: boolean): Promise<Quiz> {
    return this.update(id, { is_published: isPublished });
  },

  async duplicate(id: string): Promise<Quiz> {
    const original = await this.getById(id);
    const { id: _, created_at, updated_at, ...quizData } = original;
    
    return this.create({
      ...quizData,
      title: `${quizData.title} (Copy)`,
      title_hi: `${quizData.title_hi} (प्रतिलिपि)`,
      is_published: false,
    });
  },

  // Get quiz statistics
  async getStats(): Promise<{
    total: number;
    by_type: { pyq: number; practice: number; daily: number };
    by_scope: { exam: number; subject: number; topic: number; subtopic: number };
    published: number;
    unpublished: number;
  }> {
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('type, scope, is_published');

    if (error) throw error;

    const stats = {
      total: quizzes?.length || 0,
      by_type: { pyq: 0, practice: 0, daily: 0 },
      by_scope: { exam: 0, subject: 0, topic: 0, subtopic: 0 },
      published: 0,
      unpublished: 0,
    };

    quizzes?.forEach(q => {
      stats.by_type[q.type as 'pyq' | 'practice' | 'daily']++;
      stats.by_scope[q.scope as 'exam' | 'subject' | 'topic' | 'subtopic']++;
      
      if (q.is_published) {
        stats.published++;
      } else {
        stats.unpublished++;
      }
    });

    return stats;
  },

  // Validate quiz completeness
  async validateQuiz(id: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get quiz
    const quiz = await this.getById(id);

    // Check basic fields
    if (!quiz.title || !quiz.title_hi) {
      errors.push('Quiz must have both English and Hindi titles');
    }

    if (quiz.duration_minutes <= 0) {
      errors.push('Duration must be greater than 0');
    }

    if (quiz.total_marks <= 0) {
      errors.push('Total marks must be greater than 0');
    }

    // Check PYQ metadata
    if (quiz.is_pyq && !quiz.year) {
      errors.push('PYQ quizzes must have a year specified');
    }

    // Check questions
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', id);

    if (!questions || questions.length === 0) {
      errors.push('Quiz must have at least one question');
    } else {
      // Calculate total marks from questions
      const calculatedMarks = questions.reduce((sum, q) => sum + q.marks, 0);
      
      if (calculatedMarks !== quiz.total_marks) {
        warnings.push(
          `Total marks mismatch: Quiz total is ${quiz.total_marks} but questions add up to ${calculatedMarks}`
        );
      }

      // Check for duplicate display orders
      const orders = questions.map(q => q.display_order);
      const uniqueOrders = new Set(orders);
      if (orders.length !== uniqueOrders.size) {
        errors.push('Questions have duplicate display orders');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  // Export quiz to JSON
  async exportToJSON(id: string): Promise<any> {
    // Get quiz
    const quiz = await this.getById(id);

    // Get sections
    const { data: sections } = await supabase
      .from('quiz_sections')
      .select('*')
      .eq('quiz_id', id)
      .order('display_order', { ascending: true });

    // Get questions with full details
    const { data: quizQuestions } = await supabase
      .from('quiz_questions')
      .select(`
        *,
        question:questions(*)
      `)
      .eq('quiz_id', id)
      .order('display_order', { ascending: true });

    // Build export structure
    const exportData = {
      quiz: {
        title: quiz.title,
        title_hi: quiz.title_hi,
        description: quiz.description,
        description_hi: quiz.description_hi,
        type: quiz.type,
        scope: quiz.scope,
        is_pyq: quiz.is_pyq,
        year: quiz.year,
        tier: quiz.tier,
        shift: quiz.shift,
        duration_minutes: quiz.duration_minutes,
        total_marks: quiz.total_marks,
        marking_scheme: quiz.marking_scheme,
        negative_marking: quiz.negative_marking,
        is_published: quiz.is_published,
      },
      sections: sections || [],
      questions: quizQuestions?.map(qq => ({
        display_order: qq.display_order,
        marks: qq.marks,
        section_id: qq.section_id,
        question: qq.question,
      })) || [],
      metadata: {
        exported_at: new Date().toISOString(),
        question_count: quizQuestions?.length || 0,
        section_count: sections?.length || 0,
      },
    };

    return exportData;
  },

  // Download quiz as JSON file
  downloadAsJSON(quizData: any, filename: string): void {
    const json = JSON.stringify(quizData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};


// Quiz Section Types
type QuizSection = Database['public']['Tables']['quiz_sections']['Row'];
type QuizSectionInsert = Database['public']['Tables']['quiz_sections']['Insert'];
type QuizSectionUpdate = Database['public']['Tables']['quiz_sections']['Update'];

// Quiz Question Types
type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row'];
type QuizQuestionInsert = Database['public']['Tables']['quiz_questions']['Insert'];
type QuizQuestionUpdate = Database['public']['Tables']['quiz_questions']['Update'];

// Quiz Section Service
export const quizSectionService = {
  async getByQuiz(quizId: string): Promise<QuizSection[]> {
    const { data, error } = await supabase
      .from('quiz_sections')
      .select('*')
      .eq('quiz_id', quizId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(section: QuizSectionInsert): Promise<QuizSection> {
    const { data, error } = await supabase
      .from('quiz_sections')
      .insert(section)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, section: QuizSectionUpdate): Promise<QuizSection> {
    const { data, error } = await supabase
      .from('quiz_sections')
      .update(section)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quiz_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorder(quizId: string, sectionIds: string[]): Promise<void> {
    // Update display_order for all sections
    const updates = sectionIds.map((id, index) => ({
      id,
      display_order: index + 1,
    }));

    for (const update of updates) {
      await this.update(update.id, { display_order: update.display_order });
    }
  },
};

// Quiz Question Service
export const quizQuestionService = {
  async getByQuiz(quizId: string): Promise<QuizQuestion[]> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getByQuizWithDetails(quizId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select(`
        *,
        question:questions(*),
        section:quiz_sections(*)
      `)
      .eq('quiz_id', quizId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(quizQuestion: QuizQuestionInsert): Promise<QuizQuestion> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(quizQuestion)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async bulkCreate(quizQuestions: QuizQuestionInsert[]): Promise<QuizQuestion[]> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(quizQuestions)
      .select();

    if (error) throw error;
    return data || [];
  },

  async update(id: string, quizQuestion: QuizQuestionUpdate): Promise<QuizQuestion> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(quizQuestion)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteByQuiz(quizId: string): Promise<void> {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId);

    if (error) throw error;
  },

  async reorder(quizId: string, questionIds: string[]): Promise<void> {
    // Update display_order for all questions
    const updates = questionIds.map((id, index) => ({
      id,
      display_order: index + 1,
    }));

    for (const update of updates) {
      await this.update(update.id, { display_order: update.display_order });
    }
  },
};
