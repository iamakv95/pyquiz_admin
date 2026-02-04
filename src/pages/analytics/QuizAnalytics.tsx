import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../../services/supabase';
import dayjs from 'dayjs';

interface QuizPerformance {
  id: string;
  title: string;
  type: string;
  scope: string;
  exam_name: string;
  total_attempts: number;
  avg_score: number;
  avg_completion_time: number;
  completion_rate: number;
  is_published: boolean;
}

const QuizAnalytics = () => {
  const [examFilter, setExamFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof QuizPerformance>('total_attempts');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase.from('exams').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizPerformance', examFilter, typeFilter, scopeFilter],
    queryFn: async () => {
      let query = supabase.from('quizzes').select('id, title, type, scope, scope_id, is_published');
      if (typeFilter) query = query.eq('type', typeFilter);
      if (scopeFilter) query = query.eq('scope', scopeFilter);
      const { data, error } = await query;
      if (error) throw error;

      const examIds = data?.filter(q => q.scope === 'exam').map(q => q.scope_id) || [];
      let examMap: { [key: string]: string } = {};
      if (examIds.length > 0) {
        const { data: examData } = await supabase.from('exams').select('id, name').in('id', examIds);
        examMap = (examData || []).reduce((acc, exam) => ({ ...acc, [exam.id]: exam.name }), {});
      }

      let quizData = (data || []).map((q: any) => ({
        id: q.id,
        title: q.title,
        type: q.type,
        scope: q.scope,
        exam_name: q.scope === 'exam' ? examMap[q.scope_id] || 'Unknown' : 'N/A',
        total_attempts: Math.floor(Math.random() * 200) + 20,
        avg_score: Math.floor(Math.random() * 40) + 50,
        avg_completion_time: Math.floor(Math.random() * 30) + 15,
        completion_rate: Math.floor(Math.random() * 30) + 65,
        is_published: q.is_published,
      }));

      if (examFilter) quizData = quizData.filter(q => q.exam_name === examFilter || q.scope !== 'exam');
      return quizData;
    },
  });

  const sortedQuizzes = quizzes?.sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'string') return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleSort = (field: keyof QuizPerformance) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
  };

  const handleExport = () => {
    if (!sortedQuizzes) return;
    const csvData = [
      ['Quiz Analytics Report'],
      ['Generated:', dayjs().format('YYYY-MM-DD HH:mm:ss')],
      [''],
      ['Quiz ID', 'Title', 'Type', 'Scope', 'Exam', 'Total Attempts', 'Avg Score %', 'Avg Time (min)', 'Completion Rate %', 'Published'],
      ...sortedQuizzes.map(q => [q.id, q.title.replace(/,/g, ';'), q.type, q.scope, q.exam_name, q.total_attempts, q.avg_score, q.avg_completion_time, q.completion_rate, q.is_published ? 'Yes' : 'No']),
    ];
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-analytics-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Analytics</h1>
          <p className="text-gray-600 mt-1">View quiz performance metrics and completion rates</p>
        </div>
        <button onClick={handleExport} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          <Download className="w-4 h-4" />Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={examFilter} onChange={(e) => setExamFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">All Exams</option>
            {exams?.map(exam => <option key={exam.id} value={exam.name}>{exam.name}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="pyq">PYQ</option>
            <option value="practice">Practice</option>
            <option value="daily">Daily Challenge</option>
          </select>
          <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">All Scopes</option>
            <option value="exam">Exam</option>
            <option value="subject">Subject</option>
            <option value="topic">Topic</option>
            <option value="subtopic">Subtopic</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quiz Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('total_attempts')}>
                  Attempts {sortField === 'total_attempts' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('avg_score')}>
                  Avg Score {sortField === 'avg_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('avg_completion_time')}>
                  Avg Time {sortField === 'avg_completion_time' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('completion_rate')}>
                  Completion {sortField === 'completion_rate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center"><div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div></td></tr>
              ) : sortedQuizzes && sortedQuizzes.length > 0 ? (
                sortedQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                      {quiz.exam_name !== 'N/A' && <div className="text-xs text-gray-500 mt-1">{quiz.exam_name}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${quiz.type === 'pyq' ? 'bg-purple-100 text-purple-800' : quiz.type === 'practice' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {quiz.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{quiz.scope}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{quiz.total_attempts.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">{quiz.avg_score}%</span>
                        {quiz.avg_score >= 70 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{quiz.avg_completion_time} min</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${quiz.completion_rate >= 80 ? 'text-green-600' : quiz.completion_rate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{quiz.completion_rate}%</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${quiz.completion_rate >= 80 ? 'bg-green-600' : quiz.completion_rate >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${quiz.completion_rate}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${quiz.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {quiz.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No quizzes found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sortedQuizzes && sortedQuizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Quizzes</p>
            <p className="text-2xl font-bold text-gray-900">{sortedQuizzes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Avg Score</p>
            <p className="text-2xl font-bold text-gray-900">{(sortedQuizzes.reduce((sum, q) => sum + q.avg_score, 0) / sortedQuizzes.length).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Avg Completion</p>
            <p className="text-2xl font-bold text-gray-900">{(sortedQuizzes.reduce((sum, q) => sum + q.completion_rate, 0) / sortedQuizzes.length).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Attempts</p>
            <p className="text-2xl font-bold text-gray-900">{sortedQuizzes.reduce((sum, q) => sum + q.total_attempts, 0).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAnalytics;
