import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { topicService, subjectService, examService } from '../../../services/content.service';
import type { Database } from '../../../types/database.types';
import TopicForm from '../../../components/forms/TopicForm';
import { toast } from '../../../utils/toast';

type Topic = Database['public']['Tables']['topics']['Row'];

const TopicsList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [examFilter, setExamFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Fetch topics, subjects, and exams
  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: topicService.getAll,
  });

  const { data: allSubjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAll,
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getAll,
  });

  // Filter subjects by selected exam
  const filteredSubjectsForDropdown = examFilter === 'all'
    ? allSubjects
    : allSubjects.filter((s) => s.exam_id === examFilter);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: topicService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      toast.success('Topic deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete topic');
    },
  });

  // Filter topics
  const filteredTopics = topics.filter((topic) => {
    const subject = allSubjects.find((s) => s.id === topic.subject_id);
    const matchesSearch =
      topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.name_hi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = examFilter === 'all' || subject?.exam_id === examFilter;
    const matchesSubject = subjectFilter === 'all' || topic.subject_id === subjectFilter;
    return matchesSearch && matchesExam && matchesSubject;
  });

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this topic? This will also delete all associated subtopics and questions.'
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = allSubjects.find((s) => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  const getExamName = (subjectId: string) => {
    const subject = allSubjects.find((s) => s.id === subjectId);
    if (!subject) return 'Unknown';
    const exam = exams.find((e) => e.id === subject.exam_id);
    return exam ? exam.name : 'Unknown';
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
      {showForm && <TopicForm topic={editingTopic} onClose={() => setShowForm(false)} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topics Management</h1>
          <p className="text-gray-600 mt-1">Manage topics under subjects</p>
        </div>
        <button
          onClick={() => {
            setEditingTopic(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Topic
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topics..."
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
                setSubjectFilter('all');
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

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {filteredSubjectsForDropdown.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Topics</p>
          <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-primary-600">{filteredTopics.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
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
              {filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No topics found. Click "Add Topic" to create one.
                  </td>
                </tr>
              ) : (
                filteredTopics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{topic.name}</p>
                        <p className="text-sm text-gray-500">{topic.name_hi}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{getSubjectName(topic.subject_id)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{getExamName(topic.subject_id)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(topic.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTopic(topic);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
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

export default TopicsList;
