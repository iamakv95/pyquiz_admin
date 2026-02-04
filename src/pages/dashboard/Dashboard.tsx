import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileQuestion,
  BookOpen,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Calendar,
  Zap,
  BarChart3,
  Target,
} from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';
import { supabase } from '../../services/supabase';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../store/authStore';

dayjs.extend(relativeTime);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['platformStats'],
    queryFn: () => analyticsService.getPlatformStats(),
  });

  const { data: userGrowth } = useQuery({
    queryKey: ['userGrowth', 7],
    queryFn: () => analyticsService.getUserGrowth(7),
  });

  const { data: difficultyDist } = useQuery({
    queryKey: ['difficultyDistribution'],
    queryFn: () => analyticsService.getDifficultyDistribution(),
  });

  const { data: pendingItems } = useQuery({
    queryKey: ['pendingItems'],
    queryFn: () => analyticsService.getPendingItems(),
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => analyticsService.getRecentActivity(5),
  });

  const { data: recentQuestions } = useQuery({
    queryKey: ['recentQuestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id, question_content, difficulty, created_at, topics(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getQuestionText = (questionContent: any) => {
    if (!questionContent || !Array.isArray(questionContent)) return 'No content';
    const textBlock = questionContent.find((b: any) => b.type === 'text');
    return textBlock?.content?.substring(0, 80) || 'No text content';
  };

  const quickActions = [
    {
      title: 'Create Question',
      description: 'Add new question',
      icon: <FileQuestion className="w-5 h-5" />,
      path: '/content/questions/new',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Create Quiz',
      description: 'Build new quiz',
      icon: <BookOpen className="w-5 h-5" />,
      path: '/content/quizzes',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      title: 'View Reports',
      description: 'Check user reports',
      icon: <AlertCircle className="w-5 h-5" />,
      path: '/reports/questions',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      title: 'Analytics',
      description: 'View insights',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/analytics/platform',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name || 'Admin'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Welcome back to PyQuiz Admin Dashboard
            </p>
            <p className="text-blue-200 text-sm mt-1">
              {dayjs().format('dddd, MMMM D, YYYY')}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white rounded-lg p-4 flex items-center gap-3 transition-all hover:shadow-lg transform hover:-translate-y-1`}
            >
              <div className="p-2 bg-white/20 rounded-lg">{action.icon}</div>
              <div className="text-left">
                <p className="font-semibold">{action.title}</p>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                icon={<Users className="w-6 h-6" />}
                color="blue"
                trend={stats?.weekGrowth}
                subtitle={`+${stats?.todayNewUsers || 0} today`}
              />
              <MetricCard
                title="Total Questions"
                value={stats?.totalQuestions || 0}
                icon={<FileQuestion className="w-6 h-6" />}
                color="green"
                subtitle="In question bank"
              />
              <MetricCard
                title="Total Quizzes"
                value={stats?.totalQuizzes || 0}
                icon={<BookOpen className="w-6 h-6" />}
                color="purple"
                subtitle="Published & drafts"
              />
              <MetricCard
                title="Total Exams"
                value={stats?.totalExams || 0}
                icon={<GraduationCap className="w-6 h-6" />}
                color="orange"
                subtitle="Active categories"
              />
            </div>
          </div>

          {/* Today's Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActivityCard
                title="New Users"
                value={stats?.todayNewUsers || 0}
                icon={<Users className="w-5 h-5" />}
                color="blue"
              />
              <ActivityCard
                title="Quiz Attempts"
                value={stats?.todayQuizAttempts || 0}
                icon={<Activity className="w-5 h-5" />}
                color="green"
              />
              <ActivityCard
                title="Reports"
                value={stats?.todayReports || 0}
                icon={<AlertCircle className="w-5 h-5" />}
                color="orange"
              />
            </div>
          </div>

          {/* Pending Items Alert */}
          {pendingItems && (pendingItems.pendingReports > 0 || pendingItems.unpublishedQuizzes > 0 || pendingItems.pendingFeedback > 0) && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Action Required
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pendingItems.pendingReports > 0 && (
                      <button
                        onClick={() => navigate('/reports/questions')}
                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {pendingItems.pendingReports}
                          </p>
                          <p className="text-sm text-gray-600">Pending Reports</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                    {pendingItems.unpublishedQuizzes > 0 && (
                      <button
                        onClick={() => navigate('/content/quizzes')}
                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {pendingItems.unpublishedQuizzes}
                          </p>
                          <p className="text-sm text-gray-600">Draft Quizzes</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                    {pendingItems.pendingFeedback > 0 && (
                      <button
                        onClick={() => navigate('/reports/feedback')}
                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {pendingItems.pendingFeedback}
                          </p>
                          <p className="text-sm text-gray-600">Pending Feedback</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Growth (7 Days)</h3>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              {userGrowth && userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => dayjs(value).format('MMM DD')}
                      stroke="#9ca3af"
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      labelFormatter={(value) => dayjs(value).format('MMMM DD, YYYY')}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="New Users"
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Question Difficulty</h3>
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              {difficultyDist && difficultyDist.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={difficultyDist}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) =>
                        `${entry.difficulty}: ${((entry.percent || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {difficultyDist.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity & Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.admin_name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {activity.action} {activity.entity_type}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {dayjs(activity.created_at).fromNow()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No recent activity
                  </p>
                )}
              </div>
            </div>

            {/* Recent Questions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Questions</h3>
                <FileQuestion className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {recentQuestions && recentQuestions.length > 0 ? (
                  recentQuestions.map((question: any) => (
                    <button
                      key={question.id}
                      onClick={() => navigate(`/content/questions/${question.id}`)}
                      className="w-full flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          question.difficulty === 'easy'
                            ? 'bg-green-100'
                            : question.difficulty === 'medium'
                            ? 'bg-yellow-100'
                            : 'bg-red-100'
                        }`}
                      >
                        <FileQuestion
                          className={`w-4 h-4 ${
                            question.difficulty === 'easy'
                              ? 'text-green-600'
                              : question.difficulty === 'medium'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {getQuestionText(question.question_content)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              question.difficulty === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : question.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {question.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {question.topics?.name || 'No topic'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {dayjs(question.created_at).fromNow()}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No recent questions
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Platform Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HealthIndicator
                label="Content Quality"
                value={85}
                icon={<CheckCircle className="w-5 h-5" />}
                color="green"
              />
              <HealthIndicator
                label="User Engagement"
                value={72}
                icon={<Zap className="w-5 h-5" />}
                color="blue"
              />
              <HealthIndicator
                label="Response Time"
                value={95}
                icon={<Activity className="w-5 h-5" />}
                color="purple"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: number;
  subtitle?: string;
}

const MetricCard = ({ title, value, icon, color, trend, subtitle }: MetricCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

interface ActivityCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange';
}

const ActivityCard = ({ title, value, icon, color }: ActivityCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

interface HealthIndicatorProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple';
}

const HealthIndicator = ({ label, value, icon, color }: HealthIndicatorProps) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-600',
    blue: 'text-blue-600 bg-blue-600',
    purple: 'text-purple-600 bg-purple-600',
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className={colorClasses[color].split(' ')[0]}>{icon}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${colorClasses[color].split(' ')[1]}`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
        <span className="text-lg font-bold text-gray-900">{value}%</span>
      </div>
    </div>
  );
};

export default Dashboard;
