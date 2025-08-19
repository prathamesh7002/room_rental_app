import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OTPInput from '../components/OTPInput';
import { 
  ShieldCheckIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/outline';

const OTPVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();
  
  const { email, phone, verificationType } = location.state || {};

  useEffect(() => {
    if (!email && !phone) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, phone, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPComplete = async (otpValue) => {
    setLoading(true);
    setError('');

    try {
      const result = await verifyOTP({
        otp: otpValue,
        email,
        phone,
        type: verificationType
      });

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await resendOTP({ email, phone, type: verificationType });
      if (result.success) {
        setTimeLeft(300);
        setError('');
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Account
          </h2>
          <p className="text-gray-600">
            We've sent a verification code to
          </p>
          <p className="text-gray-900 font-semibold">
            {email || phone}
          </p>
        </div>

        {/* OTP Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center mb-6">
              <div className="h-5 w-5 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                Enter 6-digit verification code
              </label>
              <OTPInput 
                length={6} 
                onComplete={handleOTPComplete}
                loading={loading}
              />
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <div className="flex items-center justify-center text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Resend code in {formatTime(timeLeft)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Resend verification code'}
                </button>
              )}
            </div>

            {/* Back Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
