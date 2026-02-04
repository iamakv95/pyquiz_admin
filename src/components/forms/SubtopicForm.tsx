import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { subtopicService, topicService, subjectService, examService } from '../../services/content.service';
import type { Database } from '../../types/database.types';
import BilingualInput from './BilingualInput';
import { toast } from '../../utils/toast';

type Subtopic = Database['public']['Tables']['subtopics']['Row'];
type SubtopicInsert = Database['public']['Tables']['subtopics']['Insert'];

interface SubtopicFormProps {
  subtopic?: Subtopic | null;
  onClose: () => void;
}

const SubtopicForm = ({ subtopic, onClose }: SubtopicFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: { en: '', hi: '' },
    exam_id: '',
    subject_id: '',
    topic_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch exams, subjects and topics
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

  // Filter subjects by selected exam
  const filteredSubjects = formData.exam_id
    ? allSubjects.filter((s) => s.exam_id === formData.exam_id)
    : [];

  // Filter topics by selected subject
  const filteredTopics = formData.subject_id
    ? allTopics.filter((t) => t.subject_id === formData.subject_id)
    : [];

  // Initialize form data when subtopic changes
  useEffect(() => {
    if (subtopic && allTopics.length > 0 && allSubjects.length > 0) {
      const topic = allTopics.find((t) => t.id === subtopic.topic_id);
      const subject = topic ? allSubjects.find((s) => s.id === topic.subject_id) : null;
      setFormData({
        name: { en: subtopic.name, hi: subtopic.name_hi },
        exam_id: subject?.exam_id || '',
        subject_id: topic?.subject_id || '',
        topic_id: subtopic.topic_id,
      });
    } else if (!subtopic) {
      // Reset form when creating new subtopic
      setFormData({
        name: { en: '', hi: '' },
        exam_id: '',
        subject_id: '',
        topic_id: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtopic?.id, allTopics.length, allSubjects.length]);

  const createMutation = useMutation({
    mutationFn: subtopicService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtopics'] });
      toast.success('Subtopic created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create subtopic');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubtopicInsert }) =>
      subtopicService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtopics'] });
      toast.success('Subtopic updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update subtopic');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.en.trim()) {
      newErrors.name_en = 'English name is required';
    }
    if (!formData.name.hi.trim()) {
      newErrors.name_hi = 'Hindi name is required';
    }
    if (!formData.exam_id) {
      newErrors.exam_id = 'Exam is required';
    }
    if (!formData.subject_id) {
      newErrors.subject_id = 'Subject is required';
    }
    if (!formData.topic_id) {
      newErrors.topic_id = 'Topic is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const subtopicData: SubtopicInsert = {
      name: formData.name.en,
      name_hi: formData.name.hi,
      topic_id: formData.topic_id,
    };

    if (subtopic) {
      updateMutation.mutate({ id: subtopic.id, data: subtopicData });
    } else {
      createMutation.mutate(subtopicData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {subtopic ? 'Edit Subtopic' : 'Create New Subtopic'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Exam Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.exam_id}
              onChange={(e) => {
                setFormData({ ...formData, exam_id: e.target.value, subject_id: '', topic_id: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select an exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.name_hi})
                </option>
              ))}
            </select>
            {errors.exam_id && (
              <p className="mt-1 text-sm text-red-500">{errors.exam_id}</p>
            )}
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => {
                setFormData({ ...formData, subject_id: e.target.value, topic_id: '' });
              }}
              disabled={!formData.exam_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a subject</option>
              {filteredSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.name_hi})
                </option>
              ))}
            </select>
            {errors.subject_id && (
              <p className="mt-1 text-sm text-red-500">{errors.subject_id}</p>
            )}
            {!formData.exam_id && (
              <p className="mt-1 text-sm text-gray-500">Please select an exam first</p>
            )}
          </div>

          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic <span className="text-red-500">*</span>
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
            {errors.topic_id && <p className="mt-1 text-sm text-red-500">{errors.topic_id}</p>}
            {!formData.subject_id && (
              <p className="mt-1 text-sm text-gray-500">Please select a subject first</p>
            )}
          </div>

          {/* Name */}
          <BilingualInput
            label="Subtopic Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
            error={{
              en: errors.name_en,
              hi: errors.name_hi,
            }}
          />

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
              {isLoading ? 'Saving...' : subtopic ? 'Update Subtopic' : 'Create Subtopic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubtopicForm;
