import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, GripVertical, Search, Eye, Save, Layers } from 'lucide-react';
import {
  questionService,
  quizSectionService,
  quizQuestionService,
  examService,
  subjectService,
  topicService,
  subtopicService,
  type QuestionWithRelations,
} from '../../services/content.service';
import { supabase } from '../../services/supabase';
import type { Database } from '../../types/database.types';

type Quiz = Database['public']['Tables']['quizzes']['Row'];
type QuizSection = Database['public']['Tables']['quiz_sections']['Row'];
type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row'];

interface QuizBuilderProps {
  quiz: Quiz;
  onClose: () => void;
}

interface SelectedQuestion extends QuestionWithRelations {
  tempId: string;
  marks: number;
  sectionId: string | null;
}

interface Section {
  id: string;
  name: string;
  name_hi: string;
  display_order: number;
  isNew: boolean;
}

const QuizBuilder = ({ quiz, onClose }: QuizBuilderProps) => {
  const queryClient = useQueryClient();

  // State
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [examFilter, setExamFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [subtopicFilter, setSubtopicFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isPyqFilter, setIsPyqFilter] = useState<boolean | null>(null);
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionFormData, setSectionFormData] = useState({ name: '', name_hi: '' });
  const [draggedQuestion, setDraggedQuestion] = useState<SelectedQuestion | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const itemsPerPage = 20;

  // Fetch existing sections and questions
  const { data: existingSections = [] } = useQuery({
    queryKey: ['quiz-sections', quiz.id],
    queryFn: () => quizSectionService.getByQuiz(quiz.id),
  });

  const { data: existingQuestions = [] } = useQuery({
    queryKey: ['quiz-questions', quiz.id],
    queryFn: () => quizQuestionService.getByQuizWithDetails(quiz.id),
  });

  // Fetch filter data
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getAll,
  });

  const { data: allSubjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll,
  });

  const { data: allTopics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: topicService.getAll,
  });

  const { data: allSubtopics = [] } = useQuery({
    queryKey: ['subtopics'],
    queryFn: subtopicService.getAll,
  });

  // Filter subjects by selected exam
  const filteredSubjects = examFilter === 'all'
    ? allSubjects
    : allSubjects.filter((s) => s.exam_id === examFilter);

  // Filter topics by selected subject
  const filteredTopics = subjectFilter === 'all'
    ? allTopics
    : allTopics.filter((t) => t.subject_id === subjectFilter);

  // Filter subtopics by selected topic
  const filteredSubtopics = topicFilter === 'all'
    ? allSubtopics
    : allSubtopics.filter((s) => s.topic_id === topicFilter);

  // Initialize sections and selected questions from existing data
  useEffect(() => {
    if (existingSections.length > 0) {
      setSections(
        existingSections.map((s) => ({
          id: s.id,
          name: s.name,
          name_hi: s.name_hi,
          display_order: s.display_order,
          isNew: false,
        }))
      );
    }
  }, [existingSections]);

  useEffect(() => {
    if (existingQuestions.length > 0) {
      setSelectedQuestions(
        existingQuestions.map((q: any, index: number) => ({
          ...q.question,
          tempId: `existing-${q.id}`,
          marks: q.marks,
          sectionId: q.section_id,
          topic: q.question.topic,
          subtopic: q.question.subtopic,
        }))
      );
    }
  }, [existingQuestions]);

  // Fetch available questions
  const { data: questionsData, isLoading: isLoadingQuestions } = useQuery({
    queryKey: [
      'available-questions',
      {
        search: searchTerm,
        exam_id: examFilter !== 'all' ? examFilter : undefined,
        subject_id: subjectFilter !== 'all' ? subjectFilter : undefined,
        topic_id: topicFilter !== 'all' ? topicFilter : undefined,
        subtopic_id: subtopicFilter !== 'all' ? subtopicFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        is_pyq: isPyqFilter,
        year: yearFilter !== 'all' ? parseInt(yearFilter) : undefined,
        tier: tierFilter !== 'all' ? tierFilter : undefined,
        shift: shiftFilter !== 'all' ? shiftFilter : undefined,
        page: currentPage,
        limit: itemsPerPage,
      },
    ],
    queryFn: () =>
      questionService.getAll({
        search: searchTerm || undefined,
        exam_id: examFilter !== 'all' ? examFilter : undefined,
        subject_id: subjectFilter !== 'all' ? subjectFilter : undefined,
        topic_id: topicFilter !== 'all' ? topicFilter : undefined,
        subtopic_id: subtopicFilter !== 'all' ? subtopicFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? (difficultyFilter as any) : undefined,
        is_pyq: isPyqFilter !== null ? isPyqFilter : undefined,
        year: yearFilter !== 'all' ? parseInt(yearFilter) : undefined,
        tier: tierFilter !== 'all' ? tierFilter : undefined,
        shift: shiftFilter !== 'all' ? shiftFilter : undefined,
        page: currentPage,
        limit: itemsPerPage,
      }),
  });

  const availableQuestions = questionsData?.data || [];
  const totalQuestions = questionsData?.count || 0;
  const totalPages = Math.ceil(totalQuestions / itemsPerPage);

  // Section management
  const handleAddSection = () => {
    setSectionFormData({ name: '', name_hi: '' });
    setEditingSection(null);
    setShowSectionForm(true);
  };

  const handleEditSection = (section: Section) => {
    setSectionFormData({ name: section.name, name_hi: section.name_hi });
    setEditingSection(section);
    setShowSectionForm(true);
  };

  const handleSaveSection = () => {
    if (!sectionFormData.name.trim() || !sectionFormData.name_hi.trim()) {
      alert('Please fill in both English and Hindi names');
      return;
    }

    if (editingSection) {
      // Update existing section
      setSections((prev) =>
        prev.map((s) =>
          s.id === editingSection.id
            ? { ...s, name: sectionFormData.name, name_hi: sectionFormData.name_hi }
            : s
        )
      );
    } else {
      // Add new section
      const newSection: Section = {
        id: `temp-${Date.now()}`,
        name: sectionFormData.name,
        name_hi: sectionFormData.name_hi,
        display_order: sections.length + 1,
        isNew: true,
      };
      setSections((prev) => [...prev, newSection]);
    }

    setShowSectionForm(false);
    setSectionFormData({ name: '', name_hi: '' });
    setEditingSection(null);
  };

  const handleCreateSectionsFromScope = async () => {
    if (!quiz.exam_id) {
      alert('Quiz must have an exam selected');
      return;
    }

    try {
      let scopeItems: any[] = [];
      
      if (quiz.scope === 'exam') {
        // Fetch all subjects for this exam
        const { data, error } = await supabase
          .from('subjects')
          .select('id, name, name_hi')
          .eq('exam_id', quiz.exam_id)
          .order('name');
        
        if (error) throw error;
        scopeItems = data || [];
      } else if (quiz.scope === 'subject' && quiz.scope_id) {
        // Fetch all topics for this subject
        const { data, error } = await supabase
          .from('topics')
          .select('id, name, name_hi')
          .eq('subject_id', quiz.scope_id)
          .order('name');
        
        if (error) throw error;
        scopeItems = data || [];
      } else if (quiz.scope === 'topic' && quiz.scope_id) {
        // Fetch all subtopics for this topic
        const { data, error } = await supabase
          .from('subtopics')
          .select('id, name, name_hi')
          .eq('topic_id', quiz.scope_id)
          .order('name');
        
        if (error) throw error;
        scopeItems = data || [];
      } else {
        alert('Cannot create sections for this quiz scope');
        return;
      }

      if (scopeItems.length === 0) {
        alert('No items found to create sections from');
        return;
      }

      // Create sections from scope items
      const newSections: Section[] = scopeItems.map((item, index) => ({
        id: `temp-${Date.now()}-${index}`,
        name: item.name,
        name_hi: item.name_hi,
        display_order: sections.length + index + 1,
        isNew: true,
      }));

      setSections((prev) => [...prev, ...newSections]);
      alert(`Created ${newSections.length} sections successfully!`);
    } catch (error) {
      console.error('Error creating sections:', error);
      alert('Failed to create sections. Please try again.');
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm('Delete this section? Questions in this section will become unsectioned.')) {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      // Move questions from deleted section to no section
      setSelectedQuestions((prev) =>
        prev.map((q) => (q.sectionId === sectionId ? { ...q, sectionId: null } : q))
      );
    }
  };

  // Question management
  const handleAddQuestion = (question: QuestionWithRelations) => {
    // Check if already added
    if (selectedQuestions.some((q) => q.id === question.id)) {
      alert('This question is already added to the quiz');
      return;
    }

    const newQuestion: SelectedQuestion = {
      ...question,
      tempId: `new-${Date.now()}-${question.id}`,
      marks: 1, // Default marks
      sectionId: null,
    };

    setSelectedQuestions((prev) => [...prev, newQuestion]);
  };

  const handleRemoveQuestion = (tempId: string) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.tempId !== tempId));
  };

  const handleUpdateMarks = (tempId: string, marks: number) => {
    setSelectedQuestions((prev) =>
      prev.map((q) => (q.tempId === tempId ? { ...q, marks: Math.max(1, marks) } : q))
    );
  };

  const handleAssignToSection = (tempId: string, sectionId: string | null) => {
    setSelectedQuestions((prev) =>
      prev.map((q) => (q.tempId === tempId ? { ...q, sectionId } : q))
    );
  };

  // Drag and drop
  const handleDragStart = (question: SelectedQuestion) => {
    setDraggedQuestion(question);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedQuestion) return;

    const currentIndex = selectedQuestions.findIndex((q) => q.tempId === draggedQuestion.tempId);
    if (currentIndex === targetIndex) return;

    const newQuestions = [...selectedQuestions];
    newQuestions.splice(currentIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedQuestion);

    setSelectedQuestions(newQuestions);
    setDraggedQuestion(null);
  };

  // Save quiz
  const handleSave = async () => {
    if (selectedQuestions.length === 0) {
      alert('Please add at least one question to the quiz');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Delete existing sections and questions
      await quizQuestionService.deleteByQuiz(quiz.id);
      for (const section of existingSections) {
        await quizSectionService.delete(section.id);
      }

      // 2. Create new sections
      const sectionIdMap: Record<string, string> = {};
      for (const section of sections) {
        const created = await quizSectionService.create({
          quiz_id: quiz.id,
          name: section.name,
          name_hi: section.name_hi,
          display_order: section.display_order,
        });
        sectionIdMap[section.id] = created.id;
      }

      // 3. Create quiz questions
      const quizQuestions = selectedQuestions.map((q, index) => ({
        quiz_id: quiz.id,
        section_id: q.sectionId ? sectionIdMap[q.sectionId] || null : null,
        question_id: q.id,
        display_order: index + 1,
        marks: q.marks,
      }));

      await quizQuestionService.bulkCreate(quizQuestions);

      // 4. Invalidate queries and close
      queryClient.invalidateQueries({ queryKey: ['quiz-sections'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });

      alert('Quiz saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions
  const extractTextFromBlocks = (content: any): string => {
    if (!content || !Array.isArray(content)) return '';
    return content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.content || '')
      .join(' ')
      .substring(0, 100);
  };

  const getQuestionsInSection = (sectionId: string | null) => {
    return selectedQuestions.filter((q) => q.sectionId === sectionId);
  };

  const getTotalMarks = () => {
    return selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quiz Builder</h2>
            <p className="text-sm text-gray-600 mt-1">
              {quiz.title} • {selectedQuestions.length} questions • {getTotalMarks()} marks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || selectedQuestions.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Quiz'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Question Search */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Questions</h3>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search questions..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Hierarchy Filters */}
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={examFilter}
                    onChange={(e) => {
                      setExamFilter(e.target.value);
                      setSubjectFilter('all');
                      setTopicFilter('all');
                      setSubtopicFilter('all');
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Exams</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={subjectFilter}
                    onChange={(e) => {
                      setSubjectFilter(e.target.value);
                      setTopicFilter('all');
                      setSubtopicFilter('all');
                      setCurrentPage(1);
                    }}
                    disabled={examFilter === 'all'}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Subjects</option>
                    {filteredSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={topicFilter}
                    onChange={(e) => {
                      setTopicFilter(e.target.value);
                      setSubtopicFilter('all');
                      setCurrentPage(1);
                    }}
                    disabled={subjectFilter === 'all'}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Topics</option>
                    {filteredTopics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={subtopicFilter}
                    onChange={(e) => {
                      setSubtopicFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={topicFilter === 'all'}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Subtopics</option>
                    {filteredSubtopics.map((subtopic) => (
                      <option key={subtopic.id} value={subtopic.id}>
                        {subtopic.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Other Filters */}
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={difficultyFilter}
                    onChange={(e) => {
                      setDifficultyFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <select
                    value={isPyqFilter === null ? 'all' : isPyqFilter ? 'pyq' : 'non-pyq'}
                    onChange={(e) => {
                      const value = e.target.value;
                      setIsPyqFilter(value === 'all' ? null : value === 'pyq');
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="pyq">PYQ Only</option>
                    <option value="non-pyq">Non-PYQ Only</option>
                  </select>
                </div>

                {/* PYQ Filters (conditional) */}
                {isPyqFilter && (
                  <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <select
                      value={yearFilter}
                      onChange={(e) => {
                        setYearFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Years</option>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={tierFilter}
                      onChange={(e) => {
                        setTierFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Tier (e.g., 1)"
                      className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />

                    <input
                      type="text"
                      value={shiftFilter}
                      onChange={(e) => {
                        setShiftFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Shift"
                      className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Question List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoadingQuestions ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : availableQuestions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No questions found</p>
              ) : (
                availableQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {extractTextFromBlocks(question.question_content)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                            {question.difficulty}
                          </span>
                          {question.is_pyq && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              PYQ {question.year}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddQuestion(question)}
                        className="flex-shrink-0 p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                        title="Add to quiz"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Selected Questions */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Selected Questions</h3>
                <div className="flex items-center gap-2">
                  {(quiz.scope === 'exam' || quiz.scope === 'subject' || quiz.scope === 'topic') && (
                    <button
                      onClick={handleCreateSectionsFromScope}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title={
                        quiz.scope === 'exam' 
                          ? 'Create sections from subjects' 
                          : quiz.scope === 'subject'
                          ? 'Create sections from topics'
                          : 'Create sections from subtopics'
                      }
                    >
                      <Layers className="w-4 h-4" />
                      Auto-Create Sections
                    </button>
                  )}
                  <button
                    onClick={handleAddSection}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                </div>
              </div>

              {/* Sections */}
              {sections.length > 0 && (
                <div className="space-y-2">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{section.name}</p>
                        <p className="text-xs text-gray-500">
                          {getQuestionsInSection(section.id).length} questions
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditSection(section)}
                          className="p-1 text-gray-600 hover:text-blue-600 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-1 text-gray-600 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Questions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {selectedQuestions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No questions added yet. Add questions from the left panel.
                </p>
              ) : (
                selectedQuestions.map((question, index) => (
                  <div
                    key={question.tempId}
                    draggable
                    onDragStart={() => handleDragStart(question)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 bg-white cursor-move"
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-900 line-clamp-2">
                            {index + 1}. {extractTextFromBlocks(question.question_content)}
                          </p>
                          <button
                            onClick={() => handleRemoveQuestion(question.tempId)}
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Marks:</label>
                            <input
                              type="number"
                              value={question.marks}
                              onChange={(e) =>
                                handleUpdateMarks(question.tempId, parseInt(e.target.value) || 1)
                              }
                              min="1"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                            />
                          </div>

                          {sections.length > 0 && (
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600">Section:</label>
                              <select
                                value={question.sectionId || ''}
                                onChange={(e) =>
                                  handleAssignToSection(
                                    question.tempId,
                                    e.target.value || null
                                  )
                                }
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                              >
                                <option value="">No Section</option>
                                {sections.map((section) => (
                                  <option key={section.id} value={section.id}>
                                    {section.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section Form Modal */}
        {showSectionForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingSection ? 'Edit Section' : 'Add Section'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Name (English)
                  </label>
                  <input
                    type="text"
                    value={sectionFormData.name}
                    onChange={(e) =>
                      setSectionFormData({ ...sectionFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Name (Hindi)
                  </label>
                  <input
                    type="text"
                    value={sectionFormData.name_hi}
                    onChange={(e) =>
                      setSectionFormData({ ...sectionFormData, name_hi: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSectionForm(false);
                    setSectionFormData({ name: '', name_hi: '' });
                    setEditingSection(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSection}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  {editingSection ? 'Update' : 'Add'} Section
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;
