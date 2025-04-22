import React, { useState } from 'react';//correct
import { Link } from 'react-router-dom';//correct
import { Input } from '../../../shared/components/forms/Input';//correct
import { Button } from '../../../shared/components/forms/Button';//correct
import { Alert } from '../../../shared/components/ui/Alert';//correct
import { useAuth } from '../../auth/hooks/useAuth';//correct
import { Mail, ArrowLeft } from 'lucide-react';//correct

export const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <Alert type="error" message={error} />
        )}

        {success && (
          <Alert 
            type="success" 
            message="Password reset link has been sent to your email address. Please check your inbox."
          />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email address"
            icon={Mail}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />

          <div>
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={!email || loading}
            >
              Send reset link
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center font-medium text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};