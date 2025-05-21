import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../../../shared/components/forms/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Alert } from '../../../shared/components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, UserX } from 'lucide-react';

export const LoginPage = () => {
  const { t } = useTranslation('auth'); // Use the 'auth' namespace
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAnonymously } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the redirect path if user was redirected to login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Redirect to the page user was trying to access or home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle anonymous login
  const handleAnonymousLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      await loginAnonymously();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {t('auth.login.title')}
          </h2>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              type="email"
              label={t('auth.login.email_label')}
              icon={Mail}
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              type="password"
              label={t('auth.login.password_label')}
              icon={Lock}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                {t('auth.login.remember_me')}
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.login.forgot_password')}
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
          >
            {t('auth.login.sign_in_button')}
          </Button>

          {/* Anonymous Login Section */}
          <div className="text-center">
            <span className="text-sm text-gray-600">{t('auth.login.or_separator')}</span>
          </div>
          
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={handleAnonymousLogin}
            icon={UserX}
            disabled={loading}
          >
            {t('auth.login.continue_as_guest_button')}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              {t('auth.login.no_account_text')}{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('auth.login.sign_up_link')}
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
