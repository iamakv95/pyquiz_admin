import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Minus, Save, Eye, ArrowLeft } from 'lucide-react';
import BilingualInput from '../../../components/forms/BilingualInput';
import ImageUpload from '../../../components/forms/ImageUpload';
import { questionService, topicService, subtopicService } from '../../../services/content.service';
import type { Database } from '../../../types/database.types';

type QuestionInsert = Database['public']['Tables']['questions']['Insert'];

interface QuestionOption {
  text: string;
  text_hi: string;
  image_url?: string;
}

interface QuestionFormData {
  question_text: string;
  question_text_hi: string;
  question_image_url: string | null;
  options: QuestionOption[];
  correct_option: number;
  explanation: string;
  explanation_hi: string;
  explanation_image_url: string | null;
  topic_id: string;
  subtopic_id: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  is_pyq: boolean;
  year: number | null;
  tier: string | null;
  shift: string | null;
}

const QuestionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<QuestionFormData>({
    question_text: '',
    question_text_hi: '',
    question_image_url: null,
    options: [
      { text: '', text_hi: '', image_url: '' },
      { text: '', text_hi: '', image_url: '' },
      { text: '', text_hi: '', image_url: '' },
      { text: '', text_hi: '', image_url: '' },
    ],
    correct_option: 0,
    explanation: '',
    explanation_hi: '',
    explanation_image_url: null,
    topic_id: '',
    subtopic_id: null,
    difficulty: 'medium',
    is_pyq: false,
    year: null,
    tier: null,
    shift: null,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing question if editing
  const { data: existingQuestion } = useQuery({
    queryKey: ['question', id],
    queryFn: () => questionService.getById(id!),
    enabled: isEdit,
  });

  // Fetch topics
  const { data: topics = [] } = useQuery({
    queryKey: ['topics'],
    queryFn: () => topicService.getAll(),
  });

  // Fetch subtopics
  const { data: subtopics = [] } = useQuery({
    queryKey: ['subtopics', formData.topic_id],
    queryFn: () => subtopicService.getByTopic(formData.topic_id),
    enabled: !!formData.topic_id,
  });

  // Load existing question data
  useEffect(() => {
    if (existingQuestion) {
      setFormData({
        question_text: existingQuestion.question_text,
        question_text_hi: existingQuestion.question_text_hi,
        question_image_url: existingQuestion.question_image_url,
        options: existingQuestion.options as unknown as QuestionOption[],
        correct_option: existingQuestion.correct_option,
        explanation: existingQuestion.explanation,
        explanation_hi: existingQuestion.explanation_hi,
        explanation_image_url: existingQuestion.explanation_image_url,
        topic_id: existingQuestion.topic_id,
        subtopic_id: existingQuestion.subtopic_id,
        difficulty: existingQuestion.difficulty,
        is_pyq: existingQuestion.is_pyq,
        year: existingQuestion.year,
        tier: existingQuestion.tier,
        shift: existingQuestion.shift,
      });
    }
  }, [existingQuestion]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: QuestionInsert) => {
      if (isEdit) {
        return questionService.update(id!, data);
      } else {
        return questionService.create(data);
      }
    },
    onSuccess: () => {
      navigate('/content/questions');
    },
    onError: (error) => {
      console.error('Save error:', error);
      alert('Failed to save question');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'English question text is required';
    }
    if (!formData.question_text_hi.trim()) {
      newErrors.question_text_hi = 'Hindi question text is required';
    }
    if (!formData.topic_id) {
      newErrors.topic_id = 'Topic is required';
    }
    if (!formData.explanation.trim()) {
      newErrors.explanation = 'English explanation is required';
    }
    if (!formData.explanation_hi.trim()) {
      newErrors.explanation_hi = 'Hindi explanation is required';
    }

    // Validate options
    formData.options.forEach((option, index) => {
      if (!option.text.trim()) {
        newErrors[`option_${index}_text`] = `Option ${index + 1} English text is required`;
      }
      if (!option.text_hi.trim()) {
        newErrors[`option_${index}_text_hi`] = `Option ${index + 1} Hindi text is required`;
      }
    });

    // Validate PYQ fields
    if (formData.is_pyq) {
      if (!formData.year) {
        newErrors.year = 'Year is required for PYQ questions';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    saveMutation.mutate(formData as unknown as QuestionInsert);
  };

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', text_hi: '', image_url: '' }],
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      alert('A question must have at least 2 options');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
      correct_option: formData.correct_option >= index ? Math.max(0, formData.correct_option - 1) : formData.correct_option,
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/content/questions')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Questions
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Question' : 'Create New Question'}
            </h1>
            <p className="text-gray-600 mt-1">Fill in the details below to create a question</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye size={20} />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Question</h2>
          <div className="space-y-4">
            <BilingualInput
              label="Question Text"
              value={{ en: formData.question_text, hi: formData.question_text_hi }}
              onChange={(value) => setFormData({ ...formData, question_text: value.en, question_text_hi: value.hi })}
              type="textarea"
              required
              error={{
                en: errors.question_text,
                hi: errors.question_text_hi,
              }}
            />

            <ImageUpload
              label="Question Image (Optional)"
              value={formData.question_image_url}
              onChange={(url) => setFormData({ ...formData, question_image_url: url })}
            />
          </div>
        </div>

        {/* Options */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Options</h2>
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Option
            </button>
          </div>

          <div className="space-y-4">
            {formData.options.map((option, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_option"
                      checked={formData.correct_option === index}
                      onChange={() => setFormData({ ...formData, correct_option: index })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Option {index + 1} {formData.correct_option === index && '(Correct Answer)'}
                    </label>
                  </div>
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <BilingualInput
                    label={`Option ${index + 1} Text`}
                    value={{ en: option.text, hi: option.text_hi }}
                    onChange={(value) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = { 
                        ...newOptions[index], 
                        text: value.en, 
                        text_hi: value.hi 
                      };
                      setFormData({ ...formData, options: newOptions });
                    }}
                    required
                    error={{
                      en: errors[`option_${index}_text`],
                      hi: errors[`option_${index}_text_hi`],
                    }}
                  />

                  <ImageUpload
                    label={`Option ${index + 1} Image (Optional)`}
                    value={option.image_url || null}
                    onChange={(url) => handleOptionChange(index, 'image_url', url || '')}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Explanation</h2>
          <div className="space-y-4">
            <BilingualInput
              label="Explanation Text"
              value={{ en: formData.explanation, hi: formData.explanation_hi }}
              onChange={(value) => setFormData({ ...formData, explanation: value.en, explanation_hi: value.hi })}
              type="textarea"
              required
              error={{
                en: errors.explanation,
                hi: errors.explanation_hi,
              }}
            />

            <ImageUpload
              label="Explanation Image (Optional)"
              value={formData.explanation_image_url}
              onChange={(url) => setFormData({ ...formData, explanation_image_url: url })}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.topic_id}
                onChange={(e) => setFormData({ ...formData, topic_id: e.target.value, subtopic_id: null })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Topic</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
              {errors.topic_id && <p className="text-sm text-red-500 mt-1">{errors.topic_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtopic</label>
              <select
                value={formData.subtopic_id || ''}
                onChange={(e) => setFormData({ ...formData, subtopic_id: e.target.value || null })}
                disabled={!formData.topic_id}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Subtopic (Optional)</option>
                {subtopics.map(subtopic => (
                  <option key={subtopic.id} value={subtopic.id}>{subtopic.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is_pyq}
                  onChange={(e) => setFormData({ ...formData, is_pyq: e.target.checked })}
                  className="rounded border-gray-300"
                />
                This is a Previous Year Question (PYQ)
              </label>
            </div>
          </div>

          {/* PYQ Metadata */}
          {formData.is_pyq && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-semibold text-purple-900 mb-3">PYQ Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="e.g., 2023"
                    min="2000"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.year && <p className="text-sm text-red-500 mt-1">{errors.year}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier (Optional)</label>
                  <input
                    type="text"
                    value={formData.tier || ''}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value || null })}
                    placeholder="e.g., Tier 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift (Optional)</label>
                  <input
                    type="text"
                    value={formData.shift || ''}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value || null })}
                    placeholder="e.g., Morning"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/content/questions')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Question' : 'Create Question'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Question Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Question (English):</h3>
                <p className="text-gray-700">{formData.question_text || 'No question text'}</p>
                {formData.question_image_url && (
                  <img src={formData.question_image_url} alt="Question" className="mt-2 max-w-full rounded" />
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Options:</h3>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        formData.correct_option === index
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="text-gray-700">
                        {index + 1}. {option.text || 'No text'}
                        {formData.correct_option === index && ' ✓'}
                      </p>
                      {option.image_url && (
                        <img src={option.image_url} alt={`Option ${index + 1}`} className="mt-2 max-w-xs rounded" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Explanation (English):</h3>
                <p className="text-gray-700">{formData.explanation || 'No explanation'}</p>
                {formData.explanation_image_url && (
                  <img src={formData.explanation_image_url} alt="Explanation" className="mt-2 max-w-full rounded" />
                )}
              </div>

              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-gray-100 rounded">
                  Difficulty: {formData.difficulty}
                </span>
                {formData.is_pyq && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">
                    PYQ {formData.year}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
