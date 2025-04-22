import React, { useState } from 'react';//correct
import { Card } from '../../../shared/components/ui/Card';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Input } from '../../../shared/components/forms/Input';//correct
import { useAuth } from '../../../features/auth/hooks/useAuth';//correct
import { User, Mail, Camera } from 'lucide-react';//correct

export const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    avatar: user?.photoURL || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              {formData.avatar ? (
                <img 
                  src={formData.avatar} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <button 
              type="button"
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary-500 text-white hover:bg-primary-600"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Profile Photo</h3>
            <p className="text-sm text-gray-500">Update your profile picture</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={<User className="w-5 h-5 text-gray-400" />}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={<Mail className="w-5 h-5 text-gray-400" />}
              disabled
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};