import { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Tag as TagIcon } from 'lucide-react';
import type { ContentBlock, QuestionOption } from '../../types/content.types';
import { createTextBlock, createTextOption, validateContentBlocks, validateQuestionOptions } from '../../types/content.types';
import ContentBlockEditor from './ContentBlockEditor';
import OptionBuilder from './OptionBuilder';
import QuestionPreview from './QuestionPreview';
import { useTopics, useSubtopics } from '../../hooks/useTopics';
import { useComprehensionGroups } from '../../hooks/useQuestions';
import { useTags, useCreateTag } from '../../hooks/useTags';
import { useQuery } from '@tanstack/react-query';
import { examService, subjectService } from '../../services/content.service';

interface QuestionFormData {
  exam_id: string;
  subject_id: string;
  question_content: ContentBlock[];
  options: QuestionOption[];
  correct_option: number;
  explanation_content: ContentBlock[];
  topic_id: string;
  subtopic_id: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  is_pyq: boolean;
  year: number | null;
  tier: string | null;
  shift: string | null;
  tags: string[];
  comprehension_group_id: string | null;
}

interface QuestionFormProps {
  initialData?: Partial<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

const QuestionForm = ({
  initialData,
  onSubmit,
  onCancel,
  mode = 'create',
}: QuestionFormProps) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    exam_id: initialData?.exam_id || '',
    subject_id: initialData?.subject_id || '',
    question_content: initialData?.question_content || [createTextBlock()],
    options: initialData?.options || [createTextOption(), createTextOption(), createTextOption(), createTextOption()],
    correct_option: initialData?.correct_option || 0,
    explanation_content: initialData?.explanation_content || [], // Empty by default - optional
    topic_id: initialData?.topic_id || '',
    subtopic_id: initialData?.subtopic_id || null,
    difficulty: initialData?.difficulty || 'medium',
    is_pyq: initialData?.is_pyq || false,
    year: initialData?.year || null,
    tier: initialData?.tier || null,
    shift: initialData?.shift || null,
    tags: initialData?.tags || [],
    comprehension_group_id: initialData?.comprehension_group_id || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  // Track previous values to detect actual changes
  const prevExamId = useRef(formData.exam_id);
  const prevSubjectId = useRef(formData.subject_id);

  const DRAFT_KEY = `question_draft_${mode}`;

  // Load exams, subjects, topics and subtopics
  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getAll,
  });

  const { data: allSubjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll,
  });

  // Filter subjects by selected exam
  const subjects = allSubjects?.filter(s => s.exam_id === formData.exam_id) || [];

  // Filter topics by selected subject
  const { data: allTopics, isLoading: topicsLoading } = useTopics();
  const topics = allTopics?.filter(t => t.subject_id === formData.subject_id) || [];
  
  const { data: subtopics, isLoading: subtopicsLoading } = useSubtopics(formData.topic_id || undefined);
  const { data: comprehensionGroups, isLoading: comprehensionLoading } = useComprehensionGroups();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const createTag = useCreateTag();

  // Load draft from localStorage on mount (only for create mode)
  useEffect(() => {
    if (mode === 'create' && !draftLoaded && !initialData) {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          const shouldRestore = window.confirm(
            'A draft was found. Would you like to restore it?'
          );
          if (shouldRestore) {
            setFormData(draft.data);
            setLastSaved(new Date(draft.timestamp));
          } else {
            localStorage.removeItem(DRAFT_KEY);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          localStorage.removeItem(DRAFT_KEY);
        }
      }
      setDraftLoaded(true);
    }
  }, [mode, draftLoaded, initialData, DRAFT_KEY]);

  // Auto-save draft to localStorage (only for create mode)
  useEffect(() => {
    if (mode === 'create' && draftLoaded) {
      const timeoutId = setTimeout(() => {
        try {
          const draft = {
            data: formData,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
          setLastSaved(new Date());
        } catch (error) {
          console.error('Error saving draft:', error);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, mode, draftLoaded, DRAFT_KEY]);

  // Clear draft on successful submit
  const clearDraft = () => {
    if (mode === 'create') {
      localStorage.removeItem(DRAFT_KEY);
      setLastSaved(null);
    }
  };

  // Mark initial mount as complete after first render
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [isInitialMount]);

  // Reset dependent fields when exam changes (but not on initial load)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount) return;
    
    // Only reset if exam_id actually changed from previous value
    if (formData.exam_id !== prevExamId.current && prevExamId.current !== '') {
      setFormData(prev => ({
        ...prev,
        subject_id: '',
        topic_id: '',
        subtopic_id: null,
      }));
    }
    
    // Update ref for next comparison
    prevExamId.current = formData.exam_id;
  }, [formData.exam_id, isInitialMount]);

  // Reset topic and subtopic when subject changes (but not on initial load)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount) return;
    
    // Only reset if subject_id actually changed from previous value
    if (formData.subject_id !== prevSubjectId.current && prevSubjectId.current !== '') {
      setFormData(prev => ({
        ...prev,
        topic_id: '',
        subtopic_id: null,
      }));
    }
    
    // Update ref for next comparison
    prevSubjectId.current = formData.subject_id;
  }, [formData.subject_id, isInitialMount]);

  // Reset subtopic when topic changes
  useEffect(() => {
    if (formData.topic_id && formData.subtopic_id) {
      // Check if current subtopic belongs to selected topic
      const subtopic = subtopics?.find(s => s.id === formData.subtopic_id);
      if (subtopic && subtopic.topic_id !== formData.topic_id) {
        setFormData({ ...formData, subtopic_id: null });
      }
    }
  }, [formData.topic_id, subtopics]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      alert('Please enter a tag name');
      return;
    }

    try {
      const newTag = await createTag.mutateAsync({ 
        name: newTagName.trim(),
        name_hi: newTagName.trim(), // Use same name for Hindi if not provided
        type: 'concept' // Default to concept type
      });
      // Add the new tag to selected tags
      setFormData({ ...formData, tags: [...formData.tags, newTag.id] });
      setNewTagName('');
      setShowCreateTag(false);
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Failed to create tag');
    }
  };

  const toggleTag = (tagId: string) => {
    if (formData.tags.includes(tagId)) {
      setFormData({ ...formData, tags: formData.tags.filter(id => id !== tagId) });
    } else {
      setFormData({ ...formData, tags: [...formData.tags, tagId] });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate question content
    const contentErrors = validateContentBlocks(formData.question_content);
    if (contentErrors.length > 0) {
      newErrors.question_content = contentErrors.join(', ');
    }

    // Validate options
    const optionErrors = validateQuestionOptions(formData.options);
    if (optionErrors.length > 0) {
      newErrors.options = optionErrors.join(', ');
    }

    // Explanation is optional - no validation needed

    // Validate required fields
    if (!formData.exam_id) {
      newErrors.exam_id = 'Exam is required';
    }

    if (!formData.subject_id) {
      newErrors.subject_id = 'Subject is required';
    }

    if (!formData.topic_id) {
      newErrors.topic_id = 'Topic is required';
    }

    // Validate PYQ fields
    if (formData.is_pyq) {
      if (!formData.year) {
        newErrors.year = 'Year is required for PYQ questions';
      }
      // Tier and shift are optional
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fix the validation errors before submitting');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      clearDraft(); // Clear draft on successful submit
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Question' : 'Edit Question'}
          </h2>
          {mode === 'create' && lastSaved && (
            <p className="text-xs text-gray-500 mt-1">
              Draft auto-saved at {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <QuestionPreview
            questionContent={formData.question_content}
            options={formData.options}
            correctOption={formData.correct_option}
            explanationContent={formData.explanation_content}
          />
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} />
            {submitting ? 'Saving...' : mode === 'create' ? 'Create Question' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Question Metadata</h3>

        {/* Hierarchy Breadcrumb */}
        {(formData.exam_id || formData.subject_id || formData.topic_id) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
            <span className="font-medium text-blue-900">Hierarchy:</span>
            {formData.exam_id && exams && (
              <>
                <span className="text-blue-700">
                  {exams.find(e => e.id === formData.exam_id)?.name || 'Unknown Exam'}
                </span>
                {formData.subject_id && <span className="text-blue-400">→</span>}
              </>
            )}
            {formData.subject_id && subjects && (
              <>
                <span className="text-blue-700">
                  {subjects.find(s => s.id === formData.subject_id)?.name || 'Unknown Subject'}
                </span>
                {formData.topic_id && <span className="text-blue-400">→</span>}
              </>
            )}
            {formData.topic_id && topics && (
              <>
                <span className="text-blue-700">
                  {topics.find(t => t.id === formData.topic_id)?.name || 'Unknown Topic'}
                </span>
                {formData.subtopic_id && <span className="text-blue-400">→</span>}
              </>
            )}
            {formData.subtopic_id && subtopics && (
              <span className="text-blue-700">
                {subtopics.find(s => s.id === formData.subtopic_id)?.name || 'Unknown Subtopic'}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Exam */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.exam_id}
              onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={examsLoading}
            >
              <option value="">Select Exam</option>
              {exams?.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
            {errors.exam_id && <p className="text-sm text-red-500 mt-1">{errors.exam_id}</p>}
          </div>

          {/* Subject - Only show when exam is selected */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value, topic_id: '', subtopic_id: null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={!formData.exam_id || subjectsLoading}
            >
              <option value="">Select Subject</option>
              {subjects?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {!formData.exam_id && (
              <p className="text-xs text-gray-500 mt-1">Select an exam first</p>
            )}
            {errors.subject_id && <p className="text-sm text-red-500 mt-1">{errors.subject_id}</p>}
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.topic_id}
              onChange={(e) => setFormData({ ...formData, topic_id: e.target.value, subtopic_id: null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              disabled={!formData.subject_id || topicsLoading}
            >
              <option value="">Select Topic</option>
              {topics?.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
            {!formData.subject_id && (
              <p className="text-xs text-gray-500 mt-1">Select a subject first</p>
            )}
            {errors.topic_id && <p className="text-sm text-red-500 mt-1">{errors.topic_id}</p>}
          </div>

          {/* Subtopic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtopic (Optional)
            </label>
            <select
              value={formData.subtopic_id || ''}
              onChange={(e) => setFormData({ ...formData, subtopic_id: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!formData.topic_id || subtopicsLoading}
            >
              <option value="">Select Subtopic</option>
              {subtopics?.map((subtopic) => (
                <option key={subtopic.id} value={subtopic.id}>
                  {subtopic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* PYQ Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_pyq}
                onChange={(e) => setFormData({ ...formData, is_pyq: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                This is a Previous Year Question (PYQ)
              </span>
            </label>
          </div>

          {/* Comprehension Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprehension Group (Optional)
            </label>
            <select
              value={formData.comprehension_group_id || ''}
              onChange={(e) => setFormData({ ...formData, comprehension_group_id: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={comprehensionLoading}
            >
              <option value="">None (Standalone Question)</option>
              {comprehensionGroups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Link this question to a comprehension passage
            </p>
          </div>
        </div>

        {/* Tags Section */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Tags (Optional)
            </label>
            <button
              type="button"
              onClick={() => setShowCreateTag(!showCreateTag)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus size={16} />
              Create Tag
            </button>
          </div>

          {/* Create Tag Form */}
          {showCreateTag && (
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={createTag.isPending || !newTagName.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {createTag.isPending ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTag(false);
                    setNewTagName('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Tags List */}
          {tagsLoading ? (
            <p className="text-sm text-gray-500">Loading tags...</p>
          ) : tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: { id: string; name: string }) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.tags.includes(tag.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TagIcon size={14} />
                  {tag.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 border border-gray-200 rounded-lg">
              No tags available. Create your first tag to get started.
            </p>
          )}

          {formData.tags.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {formData.tags.length} tag(s) selected
            </p>
          )}
        </div>

        {/* PYQ Metadata (Conditional) */}
        {formData.is_pyq && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || null })}
                placeholder="2023"
                min="2000"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required={formData.is_pyq}
              />
              {errors.year && <p className="text-sm text-red-500 mt-1">{errors.year}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier (Optional)
              </label>
              <input
                type="text"
                value={formData.tier || ''}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value || null })}
                placeholder="Tier 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift (Optional)
              </label>
              <input
                type="text"
                value={formData.shift || ''}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value || null })}
                placeholder="Morning"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Question Content */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <ContentBlockEditor
          label="Question Content"
          blocks={formData.question_content}
          onChange={(blocks) => setFormData({ ...formData, question_content: blocks })}
          minBlocks={1}
        />
        {errors.question_content && (
          <p className="text-sm text-red-500 mt-2">{errors.question_content}</p>
        )}
      </div>

      {/* Options */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <OptionBuilder
          options={formData.options}
          correctOption={formData.correct_option}
          onChange={(options, correctOption) =>
            setFormData({ ...formData, options, correct_option: correctOption })
          }
          minOptions={2}
          maxOptions={6}
        />
        {errors.options && (
          <p className="text-sm text-red-500 mt-2">{errors.options}</p>
        )}
      </div>

      {/* Explanation (Optional) */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <ContentBlockEditor
          label="Explanation (Optional)"
          blocks={formData.explanation_content}
          onChange={(blocks) => setFormData({ ...formData, explanation_content: blocks })}
          minBlocks={0}
        />
        <p className="text-xs text-gray-500 mt-2">
          Add an explanation to help users understand the correct answer
        </p>
        {errors.explanation_content && (
          <p className="text-sm text-red-500 mt-2">{errors.explanation_content}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Create Question' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
