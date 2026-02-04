import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Settings } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface SystemConfigItem {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_at: string;
}

const SystemConfig = () => {
  const queryClient = useQueryClient();
  const [configs, setConfigs] = useState<{ [key: string]: any }>({
    daily_challenge_questions: 10,
    daily_challenge_time: '06:00',
    weak_area_min_attempts: 5,
    weak_area_accuracy_threshold: 60,
    negative_marking_default: true,
    session_timeout_minutes: 1440,
  });

  const { data: systemConfigs, isLoading } = useQuery({
    queryKey: ['systemConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*');
      if (error) throw error;
      
      const configMap: { [key: string]: any } = {};
      (data as SystemConfigItem[]).forEach(item => {
        configMap[item.key] = item.value;
      });
      
      setConfigs(prev => ({ ...prev, ...configMap }));
      return data as SystemConfigItem[];
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (configData: { [key: string]: any }) => {
      const updates = Object.entries(configData).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_config')
          .upsert(update, { onConflict: 'key' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemConfig'] });
      alert('Configuration saved successfully!');
    },
  });

  const handleSave = () => {
    saveConfigMutation.mutate(configs);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and parameters</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveConfigMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Daily Challenge Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions
                </label>
                <input
                  type="number"
                  value={configs.daily_challenge_questions}
                  onChange={(e) => setConfigs({ ...configs, daily_challenge_questions: parseInt(e.target.value) })}
                  min="5"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of questions in daily challenge (5-50)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generation Time
                </label>
                <input
                  type="time"
                  value={configs.daily_challenge_time}
                  onChange={(e) => setConfigs({ ...configs, daily_challenge_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Time when daily challenge is generated (24-hour format)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Weak Area Thresholds</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Attempts
                </label>
                <input
                  type="number"
                  value={configs.weak_area_min_attempts}
                  onChange={(e) => setConfigs({ ...configs, weak_area_min_attempts: parseInt(e.target.value) })}
                  min="3"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum attempts before marking as weak area</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accuracy Threshold (%)
                </label>
                <input
                  type="number"
                  value={configs.weak_area_accuracy_threshold}
                  onChange={(e) => setConfigs({ ...configs, weak_area_accuracy_threshold: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Accuracy below this marks topic as weak area</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Quiz Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Negative Marking Default
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Enable negative marking by default for new quizzes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configs.negative_marking_default}
                    onChange={(e) => setConfigs({ ...configs, negative_marking_default: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Session Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={configs.session_timeout_minutes}
                  onChange={(e) => setConfigs({ ...configs, session_timeout_minutes: parseInt(e.target.value) })}
                  min="30"
                  max="10080"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity (30 min - 7 days)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfig;
