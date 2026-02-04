import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileQuestion, 
  Layers, 
  Tags, 
  GraduationCap,
  FolderTree,
  ListTree,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '../../services/supabase';

interface ContentStats {
  exams: number;
  subjects: number;
  topics: number;
  subtopics: number;
  questions: number;
  quizzes: number;
  tags: number;
  publishedQuizzes: number;
  draftQuizzes: number;
  pyqQuestions: number;
  recentQuestions: number;
  recentQuizzes: number;
}

const ContentOverview = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['contentStats'],
    queryFn: async () => {
      const [
        examsCount,
        subjectsCount,
        topicsCount,
        subtopicsCount,
        questionsCount,
        quizzesCount,
        tagsCount,
        publishedQuizzesCount,
        pyqQuestionsCount,
        recentQuestionsCount,
        recentQuizzesCount,
      ] = await Promise.all([
        supabase.from('exams').select('*', { count: 'exact', head: true }),
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('topics').select('*', { count: 'exact', head: true }),
        supabase.from('subtopics').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
        supabase.from('tags').select('*', { count: 'exact', head: true }),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_pyq', true),
        supabase.from('questions').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('quizzes').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      return {
        exams: examsCount.count || 0,
        subjects: subjectsCount.count || 0,
        topics: topicsCount.count || 0,
        subtopics: subtopicsCount.count || 0,
        questions: questionsCount.count || 0,
        quizzes: quizzesCount.count || 0,
        tags: tagsCount.count || 0,
        publishedQuizzes: publishedQuizzesCount.count || 0,
        draftQuizzes: (quizzesCount.count || 0) - (publishedQuizzesCount.count || 0),
        pyqQuestions: pyqQuestionsCount.count || 0,
        recentQuestions: recentQuestionsCount.count || 0,
        recentQuizzes: recentQuizzesCount.count || 0,
      } as ContentStats;
    },
  });

  const contentSections = [
    {
      title: 'Exams',
      description: 'Manage exam categories and configurations',
      icon: <GraduationCap className="w-8 h-8" />,
      path: '/content/exams',
      color: 'blue',
      count: stats?.exams || 0,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Subjects',
      description: 'Organize subjects under exams',
      icon: <BookOpen className="w-8 h-8" />,
      path: '/content/subjects',
      color: 'green',
      count: stats?.subjects || 0,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      title: 'Topics',
      description: 'Manage topics within subjects',
      icon: <FolderTree className="w-8 h-8" />,
      path: '/content/topics',
      color: 'purple',
      count: stats?.topics || 0,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Subtopics',
      description: 'Organize subtopics under topics',
      icon: <ListTree className="w-8 h-8" />,
      path: '/content/subtopics',
      color: 'yellow',
      count: stats?.subtopics || 0,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      title: 'Questions',
      description: 'Create and manage question bank',
      icon: <FileQuestion className="w-8 h-8" />,
      path: '/content/questions',
      color: 'red',
      count: stats?.questions || 0,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    {
      title: 'Quizzes',
      description: 'Build and publish quizzes',
      icon: <Layers className="w-8 h-8" />,
      path: '/content/quizzes',
      color: 'indigo',
      count: stats?.quizzes || 0,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
    },
    {
      title: 'Tags',
      description: 'Manage question tags and categories',
      icon: <Tags className="w-8 h-8" />,
      path: '/content/tags',
      color: 'pink',
      count: stats?.tags || 0,
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      borderColor: 'border-pink-200',
    },
  ];

  const quickActions = [
    {
      title: 'Create Question',
      description: 'Add a new question to the bank',
      path: '/content/questions/new',
      icon: <FileQuestion className="w-5 h-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Create Quiz',
      description: 'Build a new quiz',
      path: '/content/quizzes',
      icon: <Layers className="w-5 h-5" />,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'Bulk Import',
      description: 'Import questions from CSV',
      path: '/content/questions/bulk-import',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-1">Overview of all content and quick access to management tools</p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Content Items</span>
                <Layers className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {(stats?.exams || 0) + (stats?.subjects || 0) + (stats?.topics || 0) + (stats?.subtopics || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Exams, Subjects, Topics, Subtopics</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Questions</span>
                <FileQuestion className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.questions || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.pyqQuestions || 0} PYQ questions
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Quizzes</span>
                <BookOpen className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats?.quizzes || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.publishedQuizzes || 0} published, {stats?.draftQuizzes || 0} drafts
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Recent Activity</span>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {(stats?.recentQuestions || 0) + (stats?.recentQuizzes || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Items added this week</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`${action.color} text-white rounded-lg p-4 flex items-center gap-3 transition-colors`}
                >
                  {action.icon}
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Published Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.publishedQuizzes || 0}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${stats?.quizzes ? (stats.publishedQuizzes / stats.quizzes) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats?.quizzes ? Math.round((stats.publishedQuizzes / stats.quizzes) * 100) : 0}% of total quizzes
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.draftQuizzes || 0}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{
                    width: `${stats?.quizzes ? (stats.draftQuizzes / stats.quizzes) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Pending publication</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileQuestion className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">PYQ Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pyqQuestions || 0}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${stats?.questions ? (stats.pyqQuestions / stats.questions) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats?.questions ? Math.round((stats.pyqQuestions / stats.questions) * 100) : 0}% of total questions
              </p>
            </div>
          </div>

          {/* Content Sections */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentSections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => navigate(section.path)}
                  className={`${section.bgColor} border ${section.borderColor} rounded-lg p-6 text-left hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-white rounded-lg ${section.iconColor}`}>
                      {section.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{section.count}</span>
                    <span className="text-xs text-gray-500">items</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Hierarchy */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Hierarchy</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Exams</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <BookOpen className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Subjects</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <FolderTree className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Topics</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <ListTree className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Subtopics</span>
              </div>
              <p className="text-sm text-gray-600 ml-3">
                Content is organized hierarchically. Questions are associated with topics/subtopics, and quizzes can be scoped to any level.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentOverview;
