import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Copy, Eye, Upload, Download, Tag, Layers } from 'lucide-react';
import { useQuestions, useDeleteQuestion, useBulkDeleteQuestions, useDuplicateQuestion, useBulkUpdateDifficulty, useBulkAssignTags } from '../../../hooks/useQuestions';
import { useTopics, useSubtopics } from '../../../hooks/useTopics';
import { useTags } from '../../../hooks/useTags';
import { useQuery } from '@tanstack/react-query';
import { examService, subjectService } from '../../../services/content.service';
import { supabase } from '../../../services/supabase';
import { extractTextFromBlocks } from '../../../types/content.types';
import { exportQuestionsToCSV } from '../../../utils/csv';
import { LoadingSpinner, EmptyState } from '../../../components/common';
import type { QuestionFilters } from '../../../services/content.service';

const QuestionsList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    limit: 50,
  });
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkDifficultyModal, setShowBulkDifficultyModal] = useState(false);
  const [showBulkTagsModal, setShowBulkTagsModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch questions using hooks
  const { data: questionsData, isLoading } = useQuestions(filters);
  const { data: allTopics } = useTopics();
  const { data: subtopics } = useSubtopics(filters.topic_id);
  const { data: tags } = useTags();

  // Fetch exams and subjects
  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getAll,
  });

  const { data: allSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll,
  });

  // Filter subjects by selected exam (using exam_id directly on subjects)
  const subjects = filters.exam_id 
    ? allSubjects?.filter(s => (s as any).exam_id === filters.exam_id) || []
    : allSubjects || [];

  // Filter topics by selected subject
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const topics = selectedSubjectId
    ? allTopics?.filter(t => t.subject_id === selectedSubjectId) || []
    : allTopics || [];

  // Mutations
  const deleteQuestion = useDeleteQuestion();
  const bulkDeleteQuestions = useBulkDeleteQuestions();
  const duplicateQuestion = useDuplicateQuestion();
  const bulkUpdateDifficulty = useBulkUpdateDifficulty();
  const bulkAssignTags = useBulkAssignTags();

  const questions = questionsData?.data || [];
  const totalCount = questionsData?.count || 0;
  const totalPages = Math.ceil(totalCount / (filters.limit || 50));

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleFilterChange = (key: keyof QuestionFilters, value: any) => {
    const newFilters = { ...filters, page: 1 };
    if (value === undefined || value === '' || value === null) {
      delete (newFilters as any)[key];
    } else {
      (newFilters as any)[key] = value;
    }
    console.log('Filter change:', key, value, 'New filters:', newFilters);
    setFilters(newFilters);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedQuestions(questions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectQuestion = (id: string) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedQuestions.length} questions?`)) {
      try {
        await bulkDeleteQuestions.mutateAsync(selectedQuestions);
        setSelectedQuestions([]);
      } catch (error) {
        console.error('Error deleting questions:', error);
        alert('Failed to delete questions');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateQuestion.mutateAsync(id);
    } catch (error) {
      console.error('Error duplicating question:', error);
      alert('Failed to duplicate question');
    }
  };

  const handleExport = () => {
    if (questions.length === 0) {
      alert('No questions to export');
      return;
    }
    exportQuestionsToCSV(questions);
  };

  const handleBulkUpdateDifficulty = async () => {
    if (selectedQuestions.length === 0) return;
    
    try {
      await bulkUpdateDifficulty.mutateAsync({
        ids: selectedQuestions,
        difficulty: selectedDifficulty,
      });
      alert(`Successfully updated difficulty for ${selectedQuestions.length} question(s)`);
      setSelectedQuestions([]);
      setShowBulkDifficultyModal(false);
    } catch (error) {
      console.error('Error updating difficulty:', error);
      alert('Failed to update difficulty');
    }
  };

  const handleBulkAssignTags = async () => {
    if (selectedQuestions.length === 0 || selectedTags.length === 0) return;
    
    try {
      await bulkAssignTags.mutateAsync({
        ids: selectedQuestions,
        tagIds: selectedTags,
      });
      alert(`Successfully assigned ${selectedTags.length} tag(s) to ${selectedQuestions.length} question(s)`);
      setSelectedQuestions([]);
      setSelectedTags([]);
      setShowBulkTagsModal(false);
    } catch (error) {
      console.error('Error assigning tags:', error);
      alert('Failed to assign tags');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
            <p className="text-gray-600 mt-1">Manage questions with bilingual support</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download size={20} />
              Export
            </button>
            <button
              onClick={() => navigate('/content/questions/bulk-import')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload size={20} />
              Bulk Import
            </button>
            <button
              onClick={() => navigate('/content/questions/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Question
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search || ''}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
              <select
                value={filters.exam_id || ''}
                onChange={(e) => {
                  const examId = e.target.value;
                  // Batch all filter changes together
                  const newFilters: QuestionFilters = { page: 1, limit: 50 };
                  if (examId) {
                    newFilters.exam_id = examId;
                  }
                  console.log('Setting filters to:', newFilters);
                  setFilters(newFilters);
                  setSelectedSubjectId(''); // Reset subject
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Exams</option>
                {exams?.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  const subjectId = e.target.value;
                  setSelectedSubjectId(subjectId);
                  // Keep exam_id, reset topic and subtopic
                  const newFilters: QuestionFilters = { page: 1, limit: 50 };
                  if (filters.exam_id) {
                    newFilters.exam_id = filters.exam_id;
                  }
                  setFilters(newFilters);
                }}
                disabled={!filters.exam_id}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Subjects</option>
                {subjects?.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              {!filters.exam_id && <p className="mt-1 text-xs text-gray-500">Select an exam first</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={filters.topic_id || ''}
                onChange={(e) => {
                  const topicId = e.target.value;
                  // Keep exam_id, add topic_id, reset subtopic
                  const newFilters: QuestionFilters = { page: 1, limit: 50 };
                  if (filters.exam_id) {
                    newFilters.exam_id = filters.exam_id;
                  }
                  if (topicId) {
                    newFilters.topic_id = topicId;
                  }
                  setFilters(newFilters);
                }}
                disabled={!selectedSubjectId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Topics</option>
                {topics?.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
              {!selectedSubjectId && <p className="mt-1 text-xs text-gray-500">Select a subject first</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtopic</label>
              <select
                value={filters.subtopic_id || ''}
                onChange={(e) => {
                  const subtopicId = e.target.value;
                  // Keep exam_id and topic_id, add subtopic_id
                  const newFilters: QuestionFilters = { page: 1, limit: 50 };
                  if (filters.exam_id) {
                    newFilters.exam_id = filters.exam_id;
                  }
                  if (filters.topic_id) {
                    newFilters.topic_id = filters.topic_id;
                  }
                  if (subtopicId) {
                    newFilters.subtopic_id = subtopicId;
                  }
                  setFilters(newFilters);
                }}
                disabled={!filters.topic_id}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">All Subtopics</option>
                {subtopics?.map(subtopic => (
                  <option key={subtopic.id} value={subtopic.id}>{subtopic.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PYQ Status</label>
              <select
                value={filters.is_pyq === undefined ? '' : filters.is_pyq.toString()}
                onChange={(e) => handleFilterChange('is_pyq', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Questions</option>
                <option value="true">PYQ Only</option>
                <option value="false">Non-PYQ Only</option>
              </select>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedQuestions.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedQuestions.length} question(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkDifficultyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Layers size={18} />
                Update Difficulty
              </button>
              <button
                onClick={() => setShowBulkTagsModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Tag size={18} />
                Assign Tags
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedQuestions([])}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8"><LoadingSpinner text="Loading questions..." /></div>
        ) : questions.length === 0 ? (
          <EmptyState
            title="No questions found"
            description="Get started by creating your first question or adjust your filters."
            actionLabel="Create Question"
            onAction={() => navigate('/content/questions/new')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.length === questions.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PYQ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => {
                    const exam = exams?.find(e => e.id === question.exam_id);
                    const subject = allSubjects?.find(s => s.id === question.topic?.subject_id);
                    
                    return (
                    <tr key={question.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleSelectQuestion(question.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {extractTextFromBlocks(question.question_content as any[])}
                          </p>
                          {/* Hierarchy breadcrumb */}
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            {exam && <span>{exam.name}</span>}
                            {subject && (
                              <>
                                <span>→</span>
                                <span>{subject.name}</span>
                              </>
                            )}
                            {question.topic && (
                              <>
                                <span>→</span>
                                <span>{question.topic.name}</span>
                              </>
                            )}
                          </div>
                          {question.comprehension_group && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                              Comprehension
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900">
                          {exam?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{question.topic?.name}</p>
                          {question.subtopic && (
                            <p className="text-gray-500 text-xs">{question.subtopic.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {question.is_pyq ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            PYQ
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {question.year || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/content/questions/${question.id}`)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/content/questions/${question.id}/edit`)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(question.id)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                            title="Duplicate"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={(filters.page || 1) === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={(filters.page || 1) >= totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((filters.page || 1) - 1) * (filters.limit || 50) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min((filters.page || 1) * (filters.limit || 50), totalCount)}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                      disabled={(filters.page || 1) === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setFilters({ ...filters, page })}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            (filters.page || 1) === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                      disabled={(filters.page || 1) >= totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bulk Difficulty Update Modal */}
      {showBulkDifficultyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Difficulty for {selectedQuestions.length} Question(s)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowBulkDifficultyModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdateDifficulty}
                  disabled={bulkUpdateDifficulty.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {bulkUpdateDifficulty.isPending ? 'Updating...' : 'Update Difficulty'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Tags Assignment Modal */}
      {showBulkTagsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Tags to {selectedQuestions.length} Question(s)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tags
                </label>
                {tags && tags.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                    {tags.map((tag: { id: string; name: string }) => (
                      <label key={tag.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag.id]);
                            } else {
                              setSelectedTags(selectedTags.filter(id => id !== tag.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-900">{tag.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No tags available. Create tags first to assign them to questions.
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {selectedTags.length} tag(s) selected
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowBulkTagsModal(false);
                    setSelectedTags([]);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAssignTags}
                  disabled={bulkAssignTags.isPending || selectedTags.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {bulkAssignTags.isPending ? 'Assigning...' : 'Assign Tags'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
