import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to verify email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>
        <div className="mt-8">
          {status === 'loading' && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              Verifying your email...
            </div>
          )}
          {status === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-bold">Success!</p>
              <p>{message}</p>
              <Link
                to="/login"
                className="mt-4 inline-block text-green-800 underline hover:text-green-900"
              >
                Go to Login
              </Link>
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error</p>
              <p>{message}</p>
              <Link
                to="/login"
                className="mt-4 inline-block text-red-800 underline hover:text-red-900"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

