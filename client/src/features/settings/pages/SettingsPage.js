import React from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { ProfileSettings } from '../components/ProfileSettings';
import { CategorySettings } from '../components/CategorySettings';
import { NotificationSettings } from '../components/NotificationSettings';
import { ExportSettings } from '../components/ExportSettings';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="grid gap-6">
        <ProfileSettings />
        <CategorySettings />
        <NotificationSettings />
        <ExportSettings />
      </div>
    </div>
  );
};

export default SettingsPage;
