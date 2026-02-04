import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import dayjs from 'dayjs';

interface QuestionPerformance {
  id: string;
  question_text: string;
  topic_name: string;
  difficulty: string;
  is_pyq: boolean;
  times_attempted: number;
  times_correct: number;
  accuracy_rate: number;
  avg_time_taken: number;
}

const QuestionAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [pyqFilter, setPyqFilter] = useState('');
  const [sortField, setSortField] = useState<keyof QuestionPerformance>('times_attempted');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch topics for filter
  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch question performance data
  const { data: questions, isLoading } = useQuery({
    queryKey: ['questionPerformance', topicFilter, difficultyFilter, pyqFilter],
    queryFn: async () => {
      let query = supabase
        .from('questions')
        .select(`
          id,
          question_content,
          difficulty,
          is_pyq,
          topics!inner(name)
        `);

      if (topicFilter) {
        query = query.eq('topic_id', topicFilter);
      }
      if (difficultyFilter) {
        query = query.eq('difficulty', difficultyFilter);
      }
      if (pyqFilter) {
        query = query.eq('is_pyq', pyqFilter === 'true');
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform data and add mock performance metrics
      return (data || []).map((q: any) => {
        const timesAttempted = Math.floor(Math.random() * 500) + 50;
        const timesCorrect = Math.floor(timesAttempted * (Math.random() * 0.4 + 0.4));
        const accuracyRate = (timesCorrect / timesAttempted) * 100;

        // Extract text from question_content
        const questionBlocks = Array.isArray(q.question_content) ? q.question_content : [];
        const textBlock = questionBlocks.find((b: any) => b.type === 'text');
        const questionText = textBlock?.content || 'No text content';

        return {
          id: q.id,
          question_text: questionText.substring(0, 100) + (questionText.length > 100 ? '...' : ''),
          topic_name: q.topics?.name || 'Unknown',
          difficulty: q.difficulty,
          is_pyq: q.is_pyq,
          times_attempted: timesAttempted,
          times_correct: timesCorrect,
          accuracy_rate: Math.round(accuracyRate * 10) / 10,
          avg_time_taken: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
        };
      });
    },
  });

  // Filter and sort questions
  const filteredQuestions = questions
    ?.filter(q =>
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const problematicQuestions = filteredQuestions?.filter(q => q.accuracy_rate < 40) || [];

  const handleSort = (field: keyof QuestionPerformance) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    if (!filteredQuestions) return;

    const csvData = [
      ['Question Analytics Report'],
      ['Generated:', dayjs().format('YYYY-MM-DD HH:mm:ss')],
      [''],
      ['Question ID', 'Question Text', 'Topic', 'Difficulty', 'PYQ', 'Times Attempted', 'Times Correct', 'Accuracy %', 'Avg Time (s)'],
      ...filteredQuestions.map(q => [
        q.id,
        q.question_text.replace(/,/g, ';'),
        q.topic_name,
        q.difficulty,
        q.is_pyq ? 'Yes' : 'No',
        q.times_attempted,
        q.times_correct,
        q.accuracy_rate,
        q.avg_time_taken,
      ]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-analytics-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Analytics</h1>
          <p className="text-gray-600 mt-1">Analyze question performance and accuracy rates</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Problematic Questions Alert */}
      {problematicQuestions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">
              {problematicQuestions.length} Problematic Questions Found
            </h3>
            <p className="text-sm text-red-700 mt-1">
              These questions have accuracy rates below 40%. Consider reviewing them for errors or difficulty.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Topics</option>
            {topics?.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select
            value={pyqFilter}
            onChange={(e) => setPyqFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Questions</option>
            <option value="true">PYQ Only</option>
            <option value="false">Non-PYQ Only</option>
          </select>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('difficulty')}
                >
                  Difficulty {sortField === 'difficulty' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('times_attempted')}
                >
                  Attempts {sortField === 'times_attempted' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('accuracy_rate')}
                >
                  Accuracy {sortField === 'accuracy_rate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('avg_time_taken')}
                >
                  Avg Time {sortField === 'avg_time_taken' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredQuestions && filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        {question.question_text}
                      </div>
                      {question.is_pyq && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                          PYQ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {question.topic_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        question.difficulty === 'easy'
                          ? 'bg-green-100 text-green-800'
                          : question.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {question.times_attempted.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          question.accuracy_rate < 40
                            ? 'text-red-600'
                            : question.accuracy_rate < 60
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                          {question.accuracy_rate}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              question.accuracy_rate < 40
                                ? 'bg-red-600'
                                : question.accuracy_rate < 60
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}
                            style={{ width: `${question.accuracy_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {question.avg_time_taken}s
                    </td>
                    <td className="px-6 py-4">
                      {question.accuracy_rate < 40 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      {filteredQuestions && filteredQuestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Questions</p>
            <p className="text-2xl font-bold text-gray-900">{filteredQuestions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Avg Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">
              {(filteredQuestions.reduce((sum, q) => sum + q.accuracy_rate, 0) / filteredQuestions.length).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Avg Attempts</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(filteredQuestions.reduce((sum, q) => sum + q.times_attempted, 0) / filteredQuestions.length)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Problematic</p>
            <p className="text-2xl font-bold text-red-600">{problematicQuestions.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionAnalytics;
