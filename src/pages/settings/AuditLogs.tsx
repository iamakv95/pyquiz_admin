import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, Download, Eye } from 'lucide-react';
import { supabase } from '../../services/supabase';
import dayjs from 'dayjs';

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
  admin_users: { name: string; email: string } | null;
}

const AuditLogs = () => {
  const [actionFilter, setActionFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [dateRange, setDateRange] = useState(7);

  const { data: admins } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs', actionFilter, adminFilter, dateRange],
    queryFn: async () => {
      const startDate = dayjs().subtract(dateRange, 'days').toISOString();
      
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          admin_users!inner(name, email)
        `)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter) query = query.eq('action', actionFilter);
      if (adminFilter) query = query.eq('admin_id', adminFilter);

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const filteredLogs = logs?.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.admin_users?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (!filteredLogs) return;

    const csvData = [
      ['Audit Logs Report'],
      ['Generated:', dayjs().format('YYYY-MM-DD HH:mm:ss')],
      [''],
      ['Timestamp', 'Admin', 'Action', 'Entity Type', 'Entity ID', 'Details'],
      ...filteredLogs.map(log => [
        dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss'),
        log.admin_users?.name || '',
        log.action,
        log.entity_type,
        log.entity_id || '',
        JSON.stringify(log.details || {}).replace(/,/g, ';'),
      ]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800';
    if (action.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">View all admin actions and system events</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Admins</option>
            {admins?.map(admin => (
              <option key={admin.id} value={admin.id}>{admin.name}</option>
            ))}
          </select>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="publish">Publish</option>
            <option value="unpublish">Unpublish</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity ID</th>
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
              ) : filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {dayjs(log.created_at).format('MMM DD, YYYY HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{log.admin_users?.name}</div>
                      <div className="text-xs text-gray-500">{log.admin_users?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                      {log.entity_type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {log.entity_id ? log.entity_id.substring(0, 8) + '...' : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Audit Log Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Timestamp</label>
                <p className="text-gray-900">{dayjs(selectedLog.created_at).format('MMMM DD, YYYY HH:mm:ss')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Admin</label>
                <p className="text-gray-900">{selectedLog.admin_users?.name}</p>
                <p className="text-sm text-gray-500">{selectedLog.admin_users?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Action</label>
                <p className="text-gray-900">{selectedLog.action}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Entity Type</label>
                <p className="text-gray-900 capitalize">{selectedLog.entity_type.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Entity ID</label>
                <p className="text-gray-900 font-mono text-sm">{selectedLog.entity_id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Details</label>
                <pre className="mt-1 p-4 bg-gray-50 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredLogs && filteredLogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Creates</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredLogs.filter(l => l.action.includes('create')).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Updates</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredLogs.filter(l => l.action.includes('update')).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Deletes</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredLogs.filter(l => l.action.includes('delete')).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
