import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Filter, Search, CheckCircle, XCircle, Edit, Eye } from 'lucide-react';
import { supabase } from '../../services/supabase';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

interface QuestionReport {
  id: string;
  question_id: string;
  user_id: string;
  report_type: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  users: { full_name: string; email: string } | null;
  questions: { question_content: any } | null;
}

const QuestionReports = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<QuestionReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['questionReports', statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('question_reports')
        .select(`
          *,
          users!inner(full_name, email),
          questions!inner(question_content)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter) query = query.eq('status', statusFilter);
      if (typeFilter) query = query.eq('report_type', typeFilter);

      const { data, error } = await query;
      if (error) throw error;
      return data as QuestionReport[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (notes) updateData.admin_notes = notes;

      const { error } = await supabase
        .from('question_reports')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionReports'] });
      setSelectedReport(null);
      setAdminNotes('');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase
        .from('question_reports')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionReports'] });
      setSelectedReports([]);
    },
  });

  const filteredReports = reports?.filter(r =>
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.users?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkAsReviewed = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'reviewed' });
  };

  const handleMarkAsResolved = (id: string, notes: string) => {
    updateStatusMutation.mutate({ id, status: 'resolved', notes });
  };

  const handleBulkAction = (status: string) => {
    if (selectedReports.length > 0) {
      bulkUpdateMutation.mutate({ ids: selectedReports, status });
    }
  };

  const toggleSelectReport = (id: string) => {
    setSelectedReports(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === filteredReports?.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports?.map(r => r.id) || []);
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      wrong_question: 'Wrong Question',
      wrong_answer: 'Wrong Answer',
      typo: 'Typo',
      image_issue: 'Image Issue',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionText = (questionContent: any) => {
    if (!questionContent || !Array.isArray(questionContent)) return 'No content';
    const textBlock = questionContent.find((b: any) => b.type === 'text');
    return textBlock?.content?.substring(0, 100) || 'No text content';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Reports</h1>
          <p className="text-gray-600 mt-1">Review and manage user-reported question issues</p>
        </div>
        {selectedReports.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('reviewed')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4" />
              Mark {selectedReports.length} as Reviewed
            </button>
            <button
              onClick={() => handleBulkAction('resolved')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              Mark {selectedReports.length} as Resolved
            </button>
          </div>
        )}
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
              placeholder="Search reports..."
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
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="wrong_question">Wrong Question</option>
            <option value="wrong_answer">Wrong Answer</option>
            <option value="typo">Typo</option>
            <option value="image_issue">Image Issue</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === filteredReports?.length && filteredReports.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredReports && filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => toggleSelectReport(report.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {getQuestionText(report.questions?.question_content)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{report.users?.full_name}</div>
                      <div className="text-xs text-gray-500">{report.users?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getReportTypeLabel(report.report_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{report.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {dayjs(report.created_at).format('MMM DD, YYYY')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/content/questions/${report.question_id}`)}
                          className="text-green-600 hover:text-green-800"
                          title="View Question"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {report.status === 'pending' && (
                          <button
                            onClick={() => handleMarkAsReviewed(report.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Mark as Reviewed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Reporter</label>
                <p className="text-gray-900">{selectedReport.users?.full_name}</p>
                <p className="text-sm text-gray-500">{selectedReport.users?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Report Type</label>
                <p className="text-gray-900">{getReportTypeLabel(selectedReport.report_type)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedReport.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Question Preview</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{getQuestionText(selectedReport.questions?.question_content)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                <textarea
                  value={adminNotes || selectedReport.admin_notes || ''}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this report..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="text-gray-900 capitalize">{selectedReport.status}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate(`/content/questions/${selectedReport.question_id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Question
              </button>
              {selectedReport.status !== 'resolved' && (
                <button
                  onClick={() => handleMarkAsResolved(selectedReport.id, adminNotes)}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredReports && filteredReports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{filteredReports.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredReports.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredReports.filter(r => r.status === 'resolved').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionReports;
