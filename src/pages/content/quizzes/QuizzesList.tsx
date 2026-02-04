import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Copy, CheckCircle, XCircle, Layers, Download, AlertCircle } from 'lucide-react';
import { quizService, examService } from '../../../services/content.service';
import type { Database } from '../../../types/database.types';
import QuizForm from '../../../components/forms/QuizForm';
import QuizBuilder from '../../../components/modals/QuizBuilder';
import QuizPreview from '../../../components/modals/QuizPreview';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { LoadingSpinner, EmptyState } from '../../../components/common';
import { toast } from '../../../utils/toast';

type Quiz = Database['public']['Tables']['quizzes']['Row'];

const QuizzesList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [examFilter, setExamFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [buildingQuiz, setBuildingQuiz] = useState<Quiz | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewingQuiz, setPreviewingQuiz] = useState<Quiz | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const itemsPerPage = 50;

  // Fetch quizzes (excluding daily quizzes)
  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ['quizzes', { 
      search: searchTerm, 
      type: typeFilter !== 'all' ? typeFilter : undefined,
      scope: scopeFilter !== 'all' ? scopeFilter : undefined,
      is_published: publishedFilter !== 'all' ? publishedFilter === 'published' : undefined,
      exam_id: examFilter !== 'all' ? examFilter : undefined,
      page: currentPage,
      limit: itemsPerPage,
      exclude_daily: true, // Exclude daily quizzes
    }],
    queryFn: () => quizService.getAll({
      search: searchTerm || undefined,
      type: typeFilter !== 'all' ? typeFilter as any : undefined,
      scope: scopeFilter !== 'all' ? scopeFilter as any : undefined,
      is_published: publishedFilter !== 'all' ? publishedFilter === 'published' : undefined,
      exam_id: examFilter !== 'all' ? examFilter : undefined,
      page: currentPage,
      limit: itemsPerPage,
    }).then(data => ({
      ...data,
      data: data.data.filter(quiz => quiz.type !== 'daily'), // Filter out daily quizzes
      count: data.data.filter(quiz => quiz.type !== 'daily').length,
    })),
  });

  // Fetch exams for filter
  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getAll,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: quizService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete quiz');
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      quizService.togglePublish(id, isPublished),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success(variables.isPublished ? 'Quiz published successfully' : 'Quiz unpublished successfully');
    },
    onError: () => {
      toast.error('Failed to update quiz status');
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: quizService.duplicate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz duplicated successfully');
    },
    onError: () => {
      toast.error('Failed to duplicate quiz');
    },
  });

  const quizzes = quizzesData?.data || [];
  const totalCount = quizzesData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleDelete = (id: string) => {
    setDeletingQuizId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingQuizId) {
      deleteMutation.mutate(deletingQuizId);
      setDeletingQuizId(null);
    }
  };

  const handleTogglePublish = (quiz: Quiz) => {
    togglePublishMutation.mutate({
      id: quiz.id,
      isPublished: !quiz.is_published,
    });
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };

  const handlePreview = (quiz: Quiz) => {
    setPreviewingQuiz(quiz);
    setShowPreview(true);
  };

  const handleValidate = async (quiz: Quiz) => {
    try {
      const validation = await quizService.validateQuiz(quiz.id);
      
      if (validation.isValid) {
        if (validation.warnings.length > 0) {
          toast.warning(`Quiz is valid but has ${validation.warnings.length} warning(s). Check console for details.`);
          console.warn('Quiz warnings:', validation.warnings);
        } else {
          toast.success('✓ Quiz is valid and ready to publish!');
        }
      } else {
        toast.error(`Quiz has ${validation.errors.length} error(s). Check console for details.`);
        console.error('Quiz errors:', validation.errors);
        if (validation.warnings.length > 0) {
          console.warn('Quiz warnings:', validation.warnings);
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Failed to validate quiz');
    }
  };

  const handleExport = async (quiz: Quiz) => {
    try {
      const exportData = await quizService.exportToJSON(quiz.id);
      const filename = `quiz-${quiz.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
      quizService.downloadAsJSON(exportData, filename);
      toast.success('Quiz exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export quiz');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pyq: 'PYQ',
      practice: 'Practice',
      daily: 'Daily Challenge',
    };
    return labels[type] || type;
  };

  const getScopeLabel = (scope: string) => {
    const labels: Record<string, string> = {
      exam: 'Exam',
      subject: 'Subject',
      topic: 'Topic',
      subtopic: 'Subtopic',
    };
    return labels[scope] || scope;
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
      {showForm && (
        <QuizForm
          quiz={editingQuiz}
          onClose={() => {
            setShowForm(false);
            setEditingQuiz(null);
          }}
        />
      )}

      {/* Quiz Builder Modal */}
      {showBuilder && buildingQuiz && (
        <QuizBuilder
          quiz={buildingQuiz}
          onClose={() => {
            setShowBuilder(false);
            setBuildingQuiz(null);
          }}
        />
      )}

      {/* Quiz Preview Modal */}
      {showPreview && previewingQuiz && (
        <QuizPreview
          quiz={previewingQuiz}
          onClose={() => {
            setShowPreview(false);
            setPreviewingQuiz(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Quiz?"
        message="Are you sure you want to delete this quiz? This action cannot be undone. All sections and questions will be removed."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingQuizId(null);
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes Management</h1>
          <p className="text-gray-600 mt-1">Build and manage practice and PYQ quizzes (Daily quizzes are auto-generated)</p>
        </div>
        <button
          onClick={() => {
            setEditingQuiz(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Quiz
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search quizzes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Exam Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
            <select
              value={examFilter}
              onChange={(e) => {
                setExamFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Exams</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="pyq">PYQ</option>
              <option value="practice">Practice</option>
            </select>
          </div>

          {/* Scope Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
            <select
              value={scopeFilter}
              onChange={(e) => {
                setScopeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Scopes</option>
              <option value="exam">Exam</option>
              <option value="subject">Subject</option>
              <option value="topic">Topic</option>
              <option value="subtopic">Subtopic</option>
            </select>
          </div>

          {/* Published Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={publishedFilter}
              onChange={(e) => {
                setPublishedFilter(e.target.value);
                setCurrentPage(1);
              }}
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
          <p className="text-sm text-gray-600">Total Quizzes</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Current Page</p>
          <p className="text-2xl font-bold text-primary-600">{quizzes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Page</p>
          <p className="text-2xl font-bold text-gray-900">{currentPage} / {totalPages || 1}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
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
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16">
                    <LoadingSpinner text="Loading quizzes..." />
                  </td>
                </tr>
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16">
                    <EmptyState
                      icon={<Layers className="w-16 h-16 text-gray-400" />}
                      title="No quizzes found"
                      description={
                        searchTerm || typeFilter !== 'all' || scopeFilter !== 'all' || publishedFilter !== 'all' || examFilter !== 'all'
                          ? 'No quizzes match your current filters. Try adjusting your search criteria.'
                          : 'Get started by creating your first quiz. You can add questions, organize them into sections, and publish when ready.'
                      }
                      actionLabel="Create Quiz"
                      onAction={() => {
                        setEditingQuiz(null);
                        setShowForm(true);
                      }}
                    />
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{quiz.title}</p>
                        <p className="text-sm text-gray-500">{quiz.title_hi}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTypeLabel(quiz.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{getScopeLabel(quiz.scope)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {quiz.duration_minutes} min
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {quiz.total_marks}
                    </td>
                    <td className="px-6 py-4">
                      {quiz.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setBuildingQuiz(quiz);
                            setShowBuilder(true);
                          }}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Build Quiz"
                        >
                          <Layers className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handlePreview(quiz)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleValidate(quiz)}
                          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Validate Quiz"
                        >
                          <AlertCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleExport(quiz)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Export to JSON"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingQuiz(quiz);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(quiz.id)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(quiz)}
                          className={`p-2 rounded-lg transition-colors ${
                            quiz.is_published
                              ? 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                              : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={quiz.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {quiz.is_published ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(quiz.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deleteMutation.isPending ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalCount)}
            </span>{' '}
            of <span className="font-medium">{totalCount}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesList;
