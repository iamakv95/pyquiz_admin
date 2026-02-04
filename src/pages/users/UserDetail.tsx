import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  User,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  useUser,
  useUserStatistics,
  useUserActivity,
  useUserAttempts,
  useUserReports,
  useUserFeedback,
} from '../../hooks/useUsers';
import type { UserActivity, UserAttempt } from '../../services/user.service';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'attempts' | 'reports' | 'feedback'>('attempts');

  const { data: user, isLoading: userLoading } = useUser(id!);
  const { data: statistics, isLoading: statsLoading } = useUserStatistics(id!);
  const { data: activity, isLoading: activityLoading } = useUserActivity(id!);
  const { data: attempts, isLoading: attemptsLoading } = useUserAttempts(id!);
  const { data: reports, isLoading: reportsLoading } = useUserReports(id!);
  const { data: feedback, isLoading: feedbackLoading } = useUserFeedback(id!);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          User not found
        </div>
      </div>
    );
  }

  const handleResetPassword = () => {
    if (window.confirm(`Send password reset email to ${user.email}?`)) {
      // This would call Supabase auth to send reset email
      alert('Password reset email sent successfully');
    }
  };

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'quiz_attempt':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'flashcard_review':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'report_submitted':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Avatar and Basic Info */}
            <div className="text-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-24 h-24 rounded-full mx-auto object-cover mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {user.language === 'en' ? 'English' : 'Hindi'}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {user.theme}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Gender</span>
                <span className="text-sm font-medium text-gray-900">{user.gender || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Age</span>
                <span className="text-sm font-medium text-gray-900">{user.age || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <span className="text-sm font-medium text-gray-900">{user.category || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">State</span>
                <span className="text-sm font-medium text-gray-900">{user.state || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Selected Exam</span>
                <span className="text-sm font-medium text-gray-900">{user.exam?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Streak</span>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    user.streak > 7
                      ? 'text-green-600'
                      : user.streak > 3
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  {user.streak} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.last_activity
                    ? new Date(user.last_activity).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Joined</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-4 space-y-3">
              <button
                onClick={handleResetPassword}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Lock className="w-4 h-4" />
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* Statistics and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Target className="w-4 h-4" />
                <p className="text-sm">Quizzes</p>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.total_quizzes_attempted || 0}
                </p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FileText className="w-4 h-4" />
                <p className="text-sm">Questions</p>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.total_questions_attempted || 0}
                </p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <p className="text-sm">Accuracy</p>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {statistics?.average_accuracy.toFixed(1) || 0}%
                </p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <p className="text-sm">Time Spent</p>
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-blue-600">
                  {statistics?.total_time_spent_minutes || 0}m
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b last:border-b-0">
                    <div className="mt-1">{getActivityIcon(item.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      {item.details && (
                        <p className="text-sm text-gray-600 mt-1">
                          Score: {item.details.score}/{item.details.total_marks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            )}
          </div>

          {/* Tabbed Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('attempts')}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'attempts'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Quiz Attempts
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reports'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Reports ({reports?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'feedback'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Feedback ({feedback?.length || 0})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'attempts' && (
                <div className="overflow-x-auto">
                  {attemptsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : attempts && attempts.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Quiz
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Score
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Percentage
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Time
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {attempts.map((attempt: UserAttempt) => {
                          const percentage = (attempt.score / attempt.total_marks) * 100;
                          const minutes = Math.floor(attempt.time_taken_seconds / 60);
                          const seconds = attempt.time_taken_seconds % 60;
                          return (
                            <tr key={attempt.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {attempt.quiz_title}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {attempt.score} / {attempt.total_marks}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    percentage >= 75
                                      ? 'bg-green-100 text-green-800'
                                      : percentage >= 50
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {percentage.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {minutes}m {seconds}s
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(attempt.completed_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No quiz attempts yet</p>
                  )}
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="overflow-x-auto">
                  {reportsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : reports && reports.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reports.map((report: any) => (
                          <tr key={report.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                {report.report_type.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                              {report.description}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  report.status === 'resolved'
                                    ? 'bg-green-100 text-green-800'
                                    : report.status === 'reviewed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}
                              >
                                {report.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(report.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No reports submitted</p>
                  )}
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="overflow-x-auto">
                  {feedbackLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : feedback && feedback.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Rating
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Message
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {feedback.map((item: any) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  item.rating >= 4
                                    ? 'bg-green-100 text-green-800'
                                    : item.rating >= 3
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {item.rating}/5
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                              {item.message}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  item.status === 'reviewed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-orange-100 text-orange-800'
                                }`}
                              >
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(item.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No feedback submitted</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
