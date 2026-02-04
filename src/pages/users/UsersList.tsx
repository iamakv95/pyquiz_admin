import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Download,
  Eye,
  User,
  Filter,
  Trophy,
  Calendar,
  X,
} from 'lucide-react';
import { useUsers, useExportUsers } from '../../hooks/useUsers';
import { examService } from '../../services/content.service';
import { LoadingSpinner, EmptyState } from '../../components/common';
import type { UserFilters } from '../../services/user.service';
import type { Database } from '../../types/database.types';
import dayjs from 'dayjs';

type UserType = Database['public']['Tables']['users']['Row'];

// Indian states list
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];

const UsersList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 50,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useUsers(filters);
  const exportMutation = useExportUsers();
  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examService.getAll(),
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setSearchInput('');
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.exam_id ? 1 : 0) +
    (filters.state ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.date_from ? 1 : 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const totalPages = Math.ceil((data?.total || 0) / (filters.limit || 50));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">View and manage user accounts and activity</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {data?.users.filter((u) => u.last_activity).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">High Streak</p>
          <p className="text-2xl font-bold text-orange-600">
            {data?.users.filter((u) => u.streak > 7).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">New This Month</p>
          <p className="text-2xl font-bold text-primary-600">
            {data?.users.filter(
              (u) =>
                new Date(u.created_at) >
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length || 0}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Exam Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam
                </label>
                <select
                  value={filters.exam_id || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      exam_id: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Exams</option>
                  {exams?.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={filters.state || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      state: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.date_from ? dayjs(filters.date_from).format('YYYY-MM-DD') : ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date_from: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                        page: 1,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    date_from: dayjs().subtract(7, 'days').toISOString(),
                    date_to: dayjs().toISOString(),
                    page: 1,
                  }))
                }
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Last 7 Days
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    date_from: dayjs().subtract(30, 'days').toISOString(),
                    date_to: dayjs().toISOString(),
                    page: 1,
                  }))
                }
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Last 30 Days
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    date_from: dayjs().subtract(90, 'days').toISOString(),
                    date_to: dayjs().toISOString(),
                    page: 1,
                  }))
                }
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Last 90 Days
              </button>
              <button
                onClick={handleClearFilters}
                className="ml-auto px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                <X className="w-4 h-4 inline mr-1" />
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <LoadingSpinner text="Loading users..." />
                  </td>
                </tr>
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <EmptyState
                      icon={<User className="w-16 h-16 text-gray-400" />}
                      title="No users found"
                      description="No users match your current filters. Try adjusting your search criteria."
                    />
                  </td>
                </tr>
              ) : (
                data?.users.map((user: UserType) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(user as any).exam?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.state || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {user.category ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {user.category}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex items-center gap-1 text-sm ${
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
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.last_activity ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.last_activity).toLocaleDateString()}
                        </span>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((filters.page || 1) - 1) * (filters.limit || 50) + 1} to{' '}
              {Math.min((filters.page || 1) * (filters.limit || 50), data?.total || 0)} of{' '}
              {data?.total || 0} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange((filters.page || 1) - 1)}
                disabled={(filters.page || 1) === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded-lg ${
                      (filters.page || 1) === page
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange((filters.page || 1) + 1)}
                disabled={(filters.page || 1) === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
