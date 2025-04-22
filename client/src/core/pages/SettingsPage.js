import React from 'react';//correct
import { ProfileSettings } from '../../features/settings/components/ProfileSettings';//correct
import { CategorySettings } from '../../features/settings/components/CategorySettings';//correct
import { NotificationSettings } from '../../features/settings/components/NotificationSettings';//correct

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="grid gap-6">
        <ProfileSettings />
        <CategorySettings />
        <NotificationSettings />
      </div>
    </div>
  );
};