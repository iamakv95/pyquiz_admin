import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { examService, subjectService } from '../../services/content.service';
import { storageService } from '../../services/storage.service';
import { supabase } from '../../services/supabase';
import type { Database } from '../../types/database.types';
import BilingualInput from './BilingualInput';
import ImageUpload from './ImageUpload';
import { toast } from '../../utils/toast';

type Exam = Database['public']['Tables']['exams']['Row'];
type ExamInsert = Database['public']['Tables']['exams']['Insert'];

interface ExamFormProps {
  exam?: Exam | null;
  onClose: () => void;
}

const ExamForm = ({ exam, onClose }: ExamFormProps) => {
  const queryClient = useQueryClient();
  
  // Fetch all exams to get unique categories
  const { data: allExams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getAll,
  });

  // Get unique categories from existing exams
  const existingCategories = Array.from(
    new Set(allExams.map((e) => e.category).filter(Boolean))
  ).sort();
  
  // Initialize form data based on exam prop
  const initialFormData = exam ? {
    name: { en: exam.name, hi: exam.name_hi },
    description: { en: exam.description || '', hi: exam.description_hi || '' },
    category: exam.category,
    icon_url: exam.icon_url || '',
    is_published: exam.is_published,
  } : {
    name: { en: '', hi: '' },
    description: { en: '', hi: '' },
    category: '',
    icon_url: '',
    is_published: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Store the original icon URL to delete it when updating
  const [originalIconUrl] = useState(exam?.icon_url || '');
  
  // Determine if using custom category
  const [isCustomCategory, setIsCustomCategory] = useState(
    exam ? !existingCategories.includes(exam.category) : false
  );
  const [customCategory, setCustomCategory] = useState(
    exam && !existingCategories.includes(exam.category) ? exam.category : ''
  );

  // Fetch all subjects
  const { data: allSubjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll,
  });

  // Fetch existing exam-subject relationships if editing
  const { data: existingExamSubjects } = useQuery({
    queryKey: ['exam-subjects', exam?.id],
    queryFn: async () => {
      if (!exam?.id) return [];
      const { data, error } = await supabase
        .from('exam_subjects')
        .select('subject_id')
        .eq('exam_id', exam.id);
      if (error) throw error;
      return data?.map(es => es.subject_id) || [];
    },
    enabled: !!exam?.id,
  });

  // Initialize selected subjects when data loads
  useEffect(() => {
    if (existingExamSubjects && existingExamSubjects.length > 0) {
      setSelectedSubjects(existingExamSubjects);
    }
  }, [existingExamSubjects]);

  const createMutation = useMutation({
    mutationFn: examService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create exam');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExamInsert }) =>
      examService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update exam');
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
    if (isCustomCategory) {
      if (!customCategory.trim()) {
        newErrors.category = 'Category is required';
      }
    } else {
      if (!formData.category) {
        newErrors.category = 'Category is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const examData: ExamInsert = {
      name: formData.name.en,
      name_hi: formData.name.hi,
      description: formData.description.en || null,
      description_hi: formData.description.hi || null,
      category: isCustomCategory ? customCategory : formData.category,
      icon_url: formData.icon_url || null,
      is_published: formData.is_published,
    };

    // If updating and icon changed, delete the old icon
    if (exam && originalIconUrl && formData.icon_url !== originalIconUrl) {
      try {
        await storageService.deleteImage(originalIconUrl, 'exam-icons');
      } catch (error) {
        console.error('Failed to delete old icon:', error);
        // Continue with update even if delete fails
      }
    }

    try {
      let examId: string;

      if (exam) {
        await updateMutation.mutateAsync({ id: exam.id, data: examData });
        examId = exam.id;
      } else {
        const newExam = await createMutation.mutateAsync(examData);
        examId = newExam.id;
      }

      // Update exam-subject relationships
      // 1. Delete existing relationships
      await supabase
        .from('exam_subjects')
        .delete()
        .eq('exam_id', examId);

      // 2. Insert new relationships
      if (selectedSubjects.length > 0) {
        const examSubjects = selectedSubjects.map((subjectId, index) => ({
          exam_id: examId,
          subject_id: subjectId,
          display_order: index + 1,
        }));

        const { error } = await supabase
          .from('exam_subjects')
          .insert(examSubjects);

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['exam-subjects'] });
      onClose();
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Failed to save exam. Please try again.');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {exam ? 'Edit Exam' : 'Create New Exam'}
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
          {/* Name */}
          <BilingualInput
            label="Exam Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
            error={{
              en: errors.name_en,
              hi: errors.name_hi,
            }}
          />

          {/* Description */}
          <BilingualInput
            label="Description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            type="textarea"
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            
            {/* Category Type Toggle */}
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isCustomCategory}
                  onChange={() => {
                    setIsCustomCategory(false);
                    setFormData({ ...formData, category: 'SSC' });
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Predefined</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isCustomCategory}
                  onChange={() => {
                    setIsCustomCategory(true);
                    setFormData({ ...formData, category: '' });
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Custom</span>
              </label>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category (e.g., UPSC, Railway)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            ) : (
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {existingCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            {!isCustomCategory && existingCategories.length === 0 && (
              <p className="mt-1 text-sm text-gray-500">
                No existing categories. Switch to "Custom" to create the first one.
              </p>
            )}
          </div>

          {/* Icon Upload */}
          <ImageUpload
            label="Exam Icon"
            value={formData.icon_url || null}
            onChange={(url) => setFormData({ ...formData, icon_url: url || '' })}
            bucket="exam-icons"
            maxSize={2}
          />

          {/* Subjects Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects <span className="text-gray-500 text-xs">(Select subjects for this exam)</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {allSubjects.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No subjects available. Create subjects first.
                </p>
              ) : (
                allSubjects.map((subject) => (
                  <label
                    key={subject.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubjects([...selectedSubjects, subject.id]);
                        } else {
                          setSelectedSubjects(selectedSubjects.filter(id => id !== subject.id));
                        }
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                      <p className="text-xs text-gray-500">{subject.name_hi}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {selectedSubjects.length} subject(s) selected
            </p>
          </div>

          {/* Published Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
              Publish immediately
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
              {isLoading ? 'Saving...' : exam ? 'Update Exam' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamForm;
