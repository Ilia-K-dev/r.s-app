import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/forms/Input';
import { Button } from '../../../shared/components/forms/Button';
import { Alert } from '../../../shared/components/ui/Alert';
import { useAuth } from '../../auth/hooks/useAuth';
import { useToast } from '../../../shared/hooks/useToast';
import { User, Mail, Save } from 'lucide-react';

export const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    photoURL: ''
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || ''
      });
    }
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await updateProfile({
        displayName: formData.displayName,
        photoURL: formData.photoURL
      });
      
      setSuccess(true);
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      setError(err.message);
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
      
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
          message="Profile updated successfully" 
          className="mb-4" 
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Display Name"
          icon={User}
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
        />
        
        <Input
          label="Email"
          icon={Mail}
          type="email"
          value={formData.email}
          disabled
          helperText="Email address cannot be changed"
        />
        
        <Input
          label="Profile Picture URL"
          value={formData.photoURL}
          onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
          placeholder="https://example.com/profile-image.jpg"
        />
        
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileSettings;
