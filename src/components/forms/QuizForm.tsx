import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import { quizService, examService, subjectService, topicService, subtopicService } from '../../services/content.service';
import type { Database } from '../../types/database.types';
import BilingualInput from './BilingualInput';
import { toast } from '../../utils/toast';

type Quiz = Database['public']['Tables']['quizzes']['Row'];
type QuizInsert = Database['public']['Tables']['quizzes']['Insert'];

interface QuizFormProps {
  quiz?: Quiz | null;
  onClose: () => void;
}

interface MarkingSchemeRule {
  correct: number;
  incorrect: number;
  unattempted: number;
}

const QuizForm = ({ quiz, onClose }: QuizFormProps) => {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: { en: '', hi: '' },
    type: 'practice' as 'pyq' | 'practice' | 'daily',
    scope: 'exam' as 'exam' | 'subject' | 'topic' | 'subtopic',
    exam_id: '',
    subject_id: '',
    topic_id: '',
    subtopic_id: '',
    scope_id: '',
    is_pyq: false,
    year: '',
    tier: '',
    shift: '',
    duration_minutes: 60,
    total_marks: 100,
    marking_scheme: {
      correct: 4,
      incorrect: -1,
      unattempted: 0,
    } as MarkingSchemeRule,
    negative_marking: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch data for dropdowns
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getAll,
  });

  const { data: subjects = [] } = useQuery({
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

  // Filter topics by selected subject
  const filteredTopics = formData.subject_id
    ? allTopics.filter((t) => t.subject_id === formData.subject_id)
    : [];

  // Filter subtopics by selected topic
  const filteredSubtopics = formData.topic_id
    ? allSubtopics.filter((s) => s.topic_id === formData.topic_id)
    : [];

  // Initialize form data when quiz changes
  useEffect(() => {
    if (quiz) {
      const markingScheme = (quiz.marking_scheme as MarkingSchemeRule) || {
        correct: 4,
        incorrect: -1,
        unattempted: 0,
      };
      
      setFormData({
        title: { en: quiz.title, hi: quiz.title_hi },
        type: quiz.type,
        scope: quiz.scope,
        exam_id: quiz.exam_id || (quiz.scope === 'exam' ? quiz.scope_id : ''),
        subject_id: quiz.scope === 'subject' ? quiz.scope_id : '',
        topic_id: quiz.scope === 'topic' ? quiz.scope_id : '',
        subtopic_id: quiz.scope === 'subtopic' ? quiz.scope_id : '',
        scope_id: quiz.scope_id,
        is_pyq: quiz.is_pyq,
        year: quiz.year?.toString() || '',
        tier: quiz.tier || '',
        shift: quiz.shift || '',
        duration_minutes: quiz.duration_minutes,
        total_marks: quiz.total_marks,
        marking_scheme: markingScheme,
        negative_marking: quiz.negative_marking,
      });
    }
  }, [quiz]);

  // Update scope_id when scope-specific selections change
  useEffect(() => {
    let newScopeId = '';
    let newExamId = formData.exam_id; // Keep existing exam_id by default
    
    switch (formData.scope) {
      case 'exam':
        newScopeId = formData.exam_id;
        newExamId = formData.exam_id; // For exam scope, exam_id = scope_id
        break;
      case 'subject':
        newScopeId = formData.subject_id;
        // Get exam_id from the selected subject
        if (formData.subject_id) {
          const subject = subjects.find(s => s.id === formData.subject_id);
          if (subject) {
            newExamId = subject.exam_id;
          }
        }
        break;
      case 'topic':
        newScopeId = formData.topic_id;
        // Get exam_id through subject from the selected topic
        if (formData.topic_id) {
          const topic = allTopics.find(t => t.id === formData.topic_id);
          if (topic) {
            const subject = subjects.find(s => s.id === topic.subject_id);
            if (subject) {
              newExamId = subject.exam_id;
            }
          }
        }
        break;
      case 'subtopic':
        newScopeId = formData.subtopic_id;
        // Get exam_id through topic and subject from the selected subtopic
        if (formData.subtopic_id) {
          const subtopic = allSubtopics.find(st => st.id === formData.subtopic_id);
          if (subtopic) {
            const topic = allTopics.find(t => t.id === subtopic.topic_id);
            if (topic) {
              const subject = subjects.find(s => s.id === topic.subject_id);
              if (subject) {
                newExamId = subject.exam_id;
              }
            }
          }
        }
        break;
    }
    
    if (newScopeId !== formData.scope_id || newExamId !== formData.exam_id) {
      setFormData((prev) => ({ ...prev, scope_id: newScopeId, exam_id: newExamId }));
    }
  }, [formData.scope, formData.exam_id, formData.subject_id, formData.topic_id, formData.subtopic_id, subjects, allTopics, allSubtopics]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: quizService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz created successfully!');
      onClose();
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      toast.error(error.message || 'Failed to create quiz');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuizInsert }) =>
      quizService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update quiz');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.en.trim()) {
      newErrors.title_en = 'English title is required';
    }
    if (!formData.title.hi.trim()) {
      newErrors.title_hi = 'Hindi title is required';
    }
    if (!formData.exam_id) {
      newErrors.exam_id = 'Exam selection is required';
    }
    if (!formData.scope_id) {
      newErrors.scope_id = 'Please select a scope target';
    }
    if (formData.duration_minutes <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    if (formData.total_marks <= 0) {
      newErrors.total_marks = 'Total marks must be greater than 0';
    }
    if (formData.is_pyq) {
      if (!formData.year) {
        newErrors.year = 'Year is required for PYQ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const quizData: QuizInsert = {
      exam_id: formData.exam_id,
      title: formData.title.en,
      title_hi: formData.title.hi,
      type: formData.type,
      scope: formData.scope,
      scope_id: formData.scope_id,
      is_pyq: formData.is_pyq,
      year: formData.is_pyq && formData.year ? parseInt(formData.year) : null,
      tier: formData.is_pyq && formData.tier ? formData.tier : null,
      shift: formData.is_pyq && formData.shift ? formData.shift : null,
      duration_minutes: formData.duration_minutes,
      total_marks: formData.total_marks,
      marking_scheme: formData.marking_scheme,
      negative_marking: formData.negative_marking,
      is_published: false,
    };

    if (quiz) {
      updateMutation.mutate({ id: quiz.id, data: quizData });
    } else {
      createMutation.mutate(quizData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {quiz ? 'Edit Quiz' : 'Create New Quiz'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Title */}
          <BilingualInput
            label="Quiz Title"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            required
            error={{
              en: errors.title_en,
              hi: errors.title_hi,
            }}
          />

          {/* Quiz Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="practice">Practice Quiz</option>
              <option value="pyq">Previous Year Question (PYQ)</option>
              <option value="daily">Daily Challenge</option>
            </select>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Scope <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.scope}
              onChange={(e) => {
                const newScope = e.target.value as any;
                setFormData({
                  ...formData,
                  scope: newScope,
                  exam_id: '',
                  subject_id: '',
                  topic_id: '',
                  subtopic_id: '',
                  scope_id: '',
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="exam">Exam-wide</option>
              <option value="subject">Subject-specific</option>
              <option value="topic">Topic-specific</option>
              <option value="subtopic">Subtopic-specific</option>
            </select>
          </div>

          {/* Cascading Scope Selectors */}
          {formData.scope === 'exam' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Exam <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.exam_id}
                onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select an exam</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.name_hi})
                  </option>
                ))}
              </select>
              {errors.scope_id && <p className="mt-1 text-sm text-red-500">{errors.scope_id}</p>}
            </div>
          )}

          {formData.scope === 'subject' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.name_hi})
                  </option>
                ))}
              </select>
              {errors.scope_id && <p className="mt-1 text-sm text-red-500">{errors.scope_id}</p>}
            </div>
          )}

          {formData.scope === 'topic' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => {
                    setFormData({ ...formData, subject_id: e.target.value, topic_id: '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.name_hi})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Topic <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.topic_id}
                  onChange={(e) => setFormData({ ...formData, topic_id: e.target.value })}
                  disabled={!formData.subject_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a topic</option>
                  {filteredTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name} ({topic.name_hi})
                    </option>
                  ))}
                </select>
                {errors.scope_id && <p className="mt-1 text-sm text-red-500">{errors.scope_id}</p>}
              </div>
            </>
          )}

          {formData.scope === 'subtopic' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => {
                    setFormData({ ...formData, subject_id: e.target.value, topic_id: '', subtopic_id: '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.name_hi})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Topic <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.topic_id}
                  onChange={(e) => setFormData({ ...formData, topic_id: e.target.value, subtopic_id: '' })}
                  disabled={!formData.subject_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a topic</option>
                  {filteredTopics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name} ({topic.name_hi})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subtopic <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subtopic_id}
                  onChange={(e) => setFormData({ ...formData, subtopic_id: e.target.value })}
                  disabled={!formData.topic_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a subtopic</option>
                  {filteredSubtopics.map((subtopic) => (
                    <option key={subtopic.id} value={subtopic.id}>
                      {subtopic.name} ({subtopic.name_hi})
                    </option>
                  ))}
                </select>
                {errors.scope_id && <p className="mt-1 text-sm text-red-500">{errors.scope_id}</p>}
              </div>
            </>
          )}

          {/* PYQ Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_pyq"
              checked={formData.is_pyq}
              onChange={(e) => setFormData({ ...formData, is_pyq: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_pyq" className="text-sm font-medium text-gray-700">
              This is a Previous Year Question (PYQ) paper
            </label>
          </div>

          {/* PYQ Metadata (conditional) */}
          {formData.is_pyq && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g., 2023"
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
                <input
                  type="text"
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  placeholder="e.g., Tier 1, Tier 2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                <input
                  type="text"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  placeholder="e.g., Morning, Evening"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Duration and Marks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.duration && <p className="mt-1 text-sm text-red-500">{errors.duration}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.total_marks}
                onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) || 0 })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.total_marks && <p className="mt-1 text-sm text-red-500">{errors.total_marks}</p>}
            </div>
          </div>

          {/* Marking Scheme */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900">Marking Scheme</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks for Correct Answer
                </label>
                <input
                  type="number"
                  value={formData.marking_scheme.correct}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marking_scheme: {
                        ...formData.marking_scheme,
                        correct: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  step="0.25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks for Incorrect Answer
                </label>
                <input
                  type="number"
                  value={formData.marking_scheme.incorrect}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marking_scheme: {
                        ...formData.marking_scheme,
                        incorrect: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  step="0.25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks for Unattempted
                </label>
                <input
                  type="number"
                  value={formData.marking_scheme.unattempted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marking_scheme: {
                        ...formData.marking_scheme,
                        unattempted: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  step="0.25"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Negative Marking Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="negative_marking"
              checked={formData.negative_marking}
              onChange={(e) => setFormData({ ...formData, negative_marking: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="negative_marking" className="text-sm font-medium text-gray-700">
              Enable negative marking for incorrect answers
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizForm;
