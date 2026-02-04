import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { topicService, subjectService, examService } from '../../services/content.service';
import type { Database } from '../../types/database.types';
import BilingualInput from './BilingualInput';
import { toast } from '../../utils/toast';

type Topic = Database['public']['Tables']['topics']['Row'];
type TopicInsert = Database['public']['Tables']['topics']['Insert'];

interface TopicFormProps {
  topic?: Topic | null;
  onClose: () => void;
}

const TopicForm = ({ topic, onClose }: TopicFormProps) => {
  const queryClient = useQueryClient();
  
  // Fetch exams
  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getAll,
  });

  // Fetch all subjects
  const { data: allSubjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll,
  });
  
  // Initialize form data based on topic prop
  const initialFormData = topic ? {
    exam_id: '',
    subject_id: topic.subject_id,
    name: { en: topic.name, hi: topic.name_hi },
  } : {
    exam_id: '',
    subject_id: '',
    name: { en: '', hi: '' },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter subjects by selected exam
  const subjects = allSubjects.filter(s => !formData.exam_id || (s as any).exam_id === formData.exam_id);

  const createMutation = useMutation({
    mutationFn: topicService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Topic created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create topic');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TopicInsert }) =>
      topicService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Topic updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update topic');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.exam_id) {
      newErrors.exam_id = 'Exam is required';
    }
    if (!formData.subject_id) {
      newErrors.subject_id = 'Subject is required';
    }
    if (!formData.name.en.trim()) {
      newErrors.name_en = 'English name is required';
    }
    if (!formData.name.hi.trim()) {
      newErrors.name_hi = 'Hindi name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const topicData: TopicInsert = {
      subject_id: formData.subject_id,
      name: formData.name.en,
      name_hi: formData.name.hi,
    };

    if (topic) {
      updateMutation.mutate({ id: topic.id, data: topicData });
    } else {
      createMutation.mutate(topicData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {topic ? 'Edit Topic' : 'Create New Topic'}
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
          {/* Exam Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.exam_id}
              onChange={(e) => setFormData({ ...formData, exam_id: e.target.value, subject_id: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={examsLoading}
            >
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
            {errors.exam_id && <p className="mt-1 text-sm text-red-500">{errors.exam_id}</p>}
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={!formData.exam_id}
              required
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.name_hi})
                </option>
              ))}
            </select>
            {!formData.exam_id && <p className="mt-1 text-xs text-gray-500">Select an exam first</p>}
            {errors.subject_id && <p className="mt-1 text-sm text-red-500">{errors.subject_id}</p>}
          </div>

          {/* Name */}
          <BilingualInput
            label="Topic Name"
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
              {isLoading ? 'Saving...' : topic ? 'Update Topic' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopicForm;
