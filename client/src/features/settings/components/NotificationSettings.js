import React, { useState, useEffect } from 'react';//correct
import { Card } from '../../../shared/components/ui/Card';//correct
import { Switch } from '../../../shared/components/forms/Switch';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Input } from '../../../shared/components/forms/Input';//correct
import { Alert } from '../../../shared/components/ui/Alert';//correct
import { useSettings } from '../hooks/useSettings';//correct
import { useToast } from '../../../shared/hooks/useToast';//correct
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Receipt, 
  PieChart, 
  AlertTriangle,
  Save
} from 'lucide-react';//correct

const NotificationSettings = () => {
  const { settings, updateSettings, loading, error } = useSettings();
  const { showToast } = useToast();
  const [localSettings, setLocalSettings] = useState({
    notifications: {
      email: true,
      push: false,
      receiptUploads: true,
      monthlyReports: true,
      budgetAlerts: true,
      threshold: 80
    }
  });

  // Initialize local settings from global settings
  useEffect(() => {
    if (settings?.notifications) {
      setLocalSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          ...settings.notifications
        }
      }));
    }
  }, [settings]);

  const handleToggle = (key) => {
    setLocalSettings(prev => ({
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleThresholdChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setLocalSettings(prev => ({
      notifications: {
        ...prev.notifications,
        threshold: Math.min(100, Math.max(0, value))
      }
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings, 'notifications');
      showToast('Notification settings updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update notification settings', 'error');
    }
  };

  const notificationTypes = [
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail
    },
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      icon: Bell
    },
    {
      id: 'receiptUploads',
      title: 'Receipt Processing',
      description: 'Get notified when receipts are processed',
      icon: Receipt
    },
    {
      id: 'monthlyReports',
      title: 'Monthly Reports',
      description: 'Receive monthly spending summaries',
      icon: PieChart
    },
    {
      id: 'budgetAlerts',
      title: 'Budget Alerts',
      description: 'Get alerts when approaching category budgets',
      icon: AlertTriangle
    }
  ];

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Notification Settings
            </h3>
            <p className="text-sm text-gray-500">
              Manage how you receive notifications
            </p>
          </div>
          <Button
            onClick={handleSave}
            loading={loading}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            className="mb-6"
          />
        )}

        <div className="space-y-6">
          {notificationTypes.map(({ id, title, description, icon: Icon }) => (
            <div key={id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-primary-50">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{title}</h4>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
              <Switch
                checked={localSettings.notifications[id]}
                onChange={() => handleToggle(id)}
                disabled={loading}
              />
            </div>
          ))}

          {/* Budget Alert Threshold */}
          {localSettings.notifications.budgetAlerts && (
            <div className="pt-4 border-t">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Budget Alert Threshold
                  </h4>
                  <p className="text-sm text-gray-500">
                    Get notified when category spending reaches this percentage of budget
                  </p>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={localSettings.notifications.threshold}
                    onChange={handleThresholdChange}
                    disabled={loading}
                    suffix="%"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Preferences */}
          {localSettings.notifications.email && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-4">
                Email Preferences
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Daily Digest</span>
                  <Switch
                    checked={localSettings.notifications.dailyDigest}
                    onChange={() => handleToggle('dailyDigest')}
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Weekly Summary</span>
                  <Switch
                    checked={localSettings.notifications.weeklySummary}
                    onChange={() => handleToggle('weeklySummary')}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NotificationSettings;