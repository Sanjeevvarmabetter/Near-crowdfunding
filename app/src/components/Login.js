import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';

export default function Login() {
  const { loginWithGoogle, loading, authError } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Please Login to continue
        </h2>

        {authError && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
            {authError}
          </div>
        )}

        <div className="space-y-4">
          <GoogleLoginButton 
            onClick={handleGoogleLogin}
            disabled={loading}
          />
          <p className="text-center text-gray-400 text-sm mt-4">
            Only authorized Google accounts can access this dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
