import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { examService } from '../../../services/content.service';
import type { Database } from '../../../types/database.types';
import ExamForm from '../../../components/forms/ExamForm';
import { toast } from '../../../utils/toast';

type Exam = Database['public']['Tables']['exams']['Row'];

const ExamsList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Fetch exams
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getAll,
  });

  // Get unique categories from all exams
  const uniqueCategories = Array.from(
    new Set(exams.map((exam) => exam.category).filter(Boolean))
  ).sort();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: examService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete exam');
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      examService.togglePublish(id, isPublished),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success(variables.isPublished ? 'Exam published successfully' : 'Exam unpublished successfully');
    },
    onError: () => {
      toast.error('Failed to update exam status');
    },
  });

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.name_hi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || exam.category === categoryFilter;
    const matchesPublished =
      publishedFilter === 'all' ||
      (publishedFilter === 'published' && exam.is_published) ||
      (publishedFilter === 'unpublished' && !exam.is_published);

    return matchesSearch && matchesCategory && matchesPublished;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePublish = (exam: Exam) => {
    togglePublishMutation.mutate({ id: exam.id, isPublished: !exam.is_published });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Modal */}
      {showForm && <ExamForm exam={editingExam} onClose={() => setShowForm(false)} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams Management</h1>
          <p className="text-gray-600 mt-1">Manage exams, categories, and configurations</p>
        </div>
        <button
          onClick={() => {
            setEditingExam(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Exam
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exams..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Published Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Exams</p>
          <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {exams.filter((e) => e.is_published).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Unpublished</p>
          <p className="text-2xl font-bold text-orange-600">
            {exams.filter((e) => !e.is_published).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-primary-600">{filteredExams.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No exams found. Click "Add Exam" to create one.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {exam.icon_url ? (
                        <img
                          src={exam.icon_url}
                          alt={exam.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Icon</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{exam.name}</p>
                        <p className="text-sm text-gray-500">{exam.name_hi}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {exam.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {exam.is_published ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Published</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Unpublished</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(exam)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title={exam.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {exam.is_published ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingExam(exam);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamsList;
