import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { subtopicService, topicService, subjectService, examService } from '../../../services/content.service';
import type { Database } from '../../../types/database.types';
import SubtopicForm from '../../../components/forms/SubtopicForm';
import { toast } from '../../../utils/toast';

type Subtopic = Database['public']['Tables']['subtopics']['Row'];

const SubtopicsList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [examFilter, setExamFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null);

  // Fetch data
  const { data: subtopics = [], isLoading } = useQuery({
    queryKey: ['subtopics'],
    queryFn: subtopicService.getAll,
  });

  const { data: topics = [] } = useQuery({
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

  // Filter topics by selected subject
  const filteredTopicsForDropdown = subjectFilter === 'all'
    ? topics
    : topics.filter((t) => t.subject_id === subjectFilter);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: subtopicService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtopics'] });
      toast.success('Subtopic deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete subtopic');
    },
  });

  // Filter subtopics
  const filteredSubtopics = subtopics.filter((subtopic) => {
    const topic = topics.find((t) => t.id === subtopic.topic_id);
    const subject = topic ? allSubjects.find((s) => s.id === topic.subject_id) : null;
    const matchesSearch =
      subtopic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subtopic.name_hi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = examFilter === 'all' || subject?.exam_id === examFilter;
    const matchesSubject = subjectFilter === 'all' || topic?.subject_id === subjectFilter;
    const matchesTopic = topicFilter === 'all' || subtopic.topic_id === topicFilter;
    return matchesSearch && matchesExam && matchesSubject && matchesTopic;
  });

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this subtopic? This will also delete all associated questions.'
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const getTopicName = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? topic.name : 'Unknown';
  };

  const getSubjectName = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return 'Unknown';
    const subject = allSubjects.find((s) => s.id === topic.subject_id);
    return subject ? subject.name : 'Unknown';
  };

  const getExamName = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return 'Unknown';
    const subject = allSubjects.find((s) => s.id === topic.subject_id);
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
      {showForm && <SubtopicForm subtopic={editingSubtopic} onClose={() => setShowForm(false)} />}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subtopics Management</h1>
          <p className="text-gray-600 mt-1">Manage subtopics under topics</p>
        </div>
        <button
          onClick={() => {
            setEditingSubtopic(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Subtopic
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subtopics..."
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
                setTopicFilter('all');
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
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setTopicFilter('all');
              }}
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

          {/* Topic Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Topics</option>
              {filteredTopicsForDropdown.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Subtopics</p>
          <p className="text-2xl font-bold text-gray-900">{subtopics.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-primary-600">{filteredSubtopics.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtopic Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
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
              {filteredSubtopics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No subtopics found. Click "Add Subtopic" to create one.
                  </td>
                </tr>
              ) : (
                filteredSubtopics.map((subtopic) => (
                  <tr key={subtopic.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{subtopic.name}</p>
                        <p className="text-sm text-gray-500">{subtopic.name_hi}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{getTopicName(subtopic.topic_id)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{getSubjectName(subtopic.topic_id)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{getExamName(subtopic.topic_id)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(subtopic.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingSubtopic(subtopic);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(subtopic.id)}
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

export default SubtopicsList;
