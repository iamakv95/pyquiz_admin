import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Filter, Search, CheckCircle, Download } from 'lucide-react';
import { supabase } from '../../services/supabase';
import dayjs from 'dayjs';

interface FeedbackItem {
  id: string;
  user_id: string;
  rating: number;
  message: string;
  status: 'pending' | 'reviewed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  users: { full_name: string; email: string } | null;
}

const Feedback = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback', statusFilter, ratingFilter],
    queryFn: async () => {
      let query = supabase
        .from('feedback')
        .select(`
          *,
          users!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter) query = query.eq('status', statusFilter);
      if (ratingFilter) query = query.eq('rating', parseInt(ratingFilter));

      const { data, error } = await query;
      if (error) throw error;
      return data as FeedbackItem[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('feedback')
        .update({
          status: 'reviewed',
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      setSelectedFeedback(null);
      setAdminNotes('');
    },
  });

  const filteredFeedback = feedback?.filter(f =>
    f.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkAsReviewed = (id: string, notes: string) => {
    updateStatusMutation.mutate({ id, notes });
  };

  const handleExport = () => {
    if (!filteredFeedback) return;

    const csvData = [
      ['Feedback Report'],
      ['Generated:', dayjs().format('YYYY-MM-DD HH:mm:ss')],
      [''],
      ['ID', 'User Name', 'Email', 'Rating', 'Message', 'Status', 'Admin Notes', 'Date'],
      ...filteredFeedback.map(f => [
        f.id,
        f.users?.full_name || '',
        f.users?.email || '',
        f.rating,
        f.message.replace(/,/g, ';'),
        f.status,
        f.admin_notes?.replace(/,/g, ';') || '',
        dayjs(f.created_at).format('YYYY-MM-DD HH:mm:ss'),
      ]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    return status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const avgRating = filteredFeedback
    ? (filteredFeedback.reduce((sum, f) => sum + f.rating, 0) / filteredFeedback.length).toFixed(1)
    : '0.0';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Feedback</h1>
          <p className="text-gray-600 mt-1">View and respond to user feedback submissions</p>
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

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredFeedback && filteredFeedback.length > 0 ? (
                filteredFeedback.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.users?.full_name}</div>
                      <div className="text-xs text-gray-500">{item.users?.email}</div>
                    </td>
                    <td className="px-6 py-4">{renderStars(item.rating)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">{item.message}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {dayjs(item.created_at).format('MMM DD, YYYY')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedFeedback(item);
                          setAdminNotes(item.admin_notes || '');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No feedback found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Feedback Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">User</label>
                <p className="text-gray-900">{selectedFeedback.users?.full_name}</p>
                <p className="text-sm text-gray-500">{selectedFeedback.users?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Rating</label>
                <div className="mt-1">{renderStars(selectedFeedback.rating)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Message</label>
                <p className="text-gray-900 mt-1">{selectedFeedback.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-1"
                  placeholder="Add notes about this feedback..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900 capitalize mt-1">{selectedFeedback.status}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setSelectedFeedback(null);
                  setAdminNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              {selectedFeedback.status !== 'reviewed' && (
                <button
                  onClick={() => handleMarkAsReviewed(selectedFeedback.id, adminNotes)}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Reviewed
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredFeedback && filteredFeedback.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Feedback</p>
            <p className="text-2xl font-bold text-gray-900">{filteredFeedback.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredFeedback.filter(f => f.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Reviewed</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredFeedback.filter(f => f.status === 'reviewed').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
