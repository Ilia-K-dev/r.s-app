import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/forms/Button';
import { Switch } from '../../../shared/components/forms/Switch';
import { Alert } from '../../../shared/components/ui/Alert';
import { useAuth } from '../../auth/hooks/useAuth';
import { useToast } from '../../../shared/hooks/useToast';
import { Save, Bell } from 'lucide-react';

export const NotificationSettings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [preferences, setPreferences] = useState({
    emailNotifications: false,
    pushNotifications: false,
    receiptProcessed: true,
    monthlyReports: true,
    lowStockAlerts: true
  });
  
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      // In a real app, fetch user preferences from the backend
      // For this example, we'll use dummy data
      setPreferences({
        emailNotifications: true,
        pushNotifications: false,
        receiptProcessed: true,
        monthlyReports: true,
        lowStockAlerts: true
      });
    };
    
    if (user) {
      fetchNotificationPreferences();
    }
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // In a real app, save preferences to the backend
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      showToast('Notification settings updated', 'success');
    } catch (err) {
      setError('Failed to update notification settings');
      showToast('Failed to update notification settings', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          className="mb-4" 
        />
      )}
      
      {success && (
        <Alert 
          type="success" 
          message="Notification settings updated successfully" 
          className="mb-4" 
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Channels</h3>
          
          <div className="space-y-3">
            <Switch
              label="Email Notifications"
              checked={preferences.emailNotifications}
              onChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
              description="Receive notifications via email"
            />
            
            <Switch
              label="Push Notifications"
              checked={preferences.pushNotifications}
              onChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
              description="Receive in-app notifications"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          
          <div className="space-y-3">
            <Switch
              label="Receipt Processed"
              checked={preferences.receiptProcessed}
              onChange={(checked) => setPreferences({ ...preferences, receiptProcessed: checked })}
              description="Notify when a receipt has been processed"
            />
            
            <Switch
              label="Monthly Reports"
              checked={preferences.monthlyReports}
              onChange={(checked) => setPreferences({ ...preferences, monthlyReports: checked })}
              description="Receive monthly spending reports"
            />
            
            <Switch
              label="Low Stock Alerts"
              checked={preferences.lowStockAlerts}
              onChange={(checked) => setPreferences({ ...preferences, lowStockAlerts: checked })}
              description="Get alerted when inventory items are running low"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            icon={Save}
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NotificationSettings;
