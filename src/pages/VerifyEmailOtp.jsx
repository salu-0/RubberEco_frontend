import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  Mail,
  RefreshCw,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { getApiBaseUrl } from '../utils/apiBaseUrl';

const VerifyEmailOtp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailFromQuery = useMemo(() => {
    const e = searchParams.get('email');
    return e ? String(e) : '';
  }, [searchParams]);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Keep UX clean when navigating back/forth.
    setError('');
    setStatus('');
    setOtp('');
  }, [emailFromQuery]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    const normalizedOtp = otp.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const verifyUrl = `${getApiBaseUrl()}/auth/verify-email?token=${encodeURIComponent(normalizedOtp)}`;
      const response = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message || 'Invalid or expired OTP. Please request a new OTP and try again.');
        return;
      }

      // Reuse existing success page (it auto-redirects to login).
      navigate('/verify-success');
    } catch (err) {
      setError(err?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!emailFromQuery) {
      setError('Missing email. Please go back to registration and try again.');
      return;
    }

    setError('');
    setStatus('');
    setResending(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailFromQuery })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message || 'Failed to resend OTP. Please try again.');
        return;
      }

      setStatus('OTP resent. Check your email.');
    } catch (err) {
      setError(err?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative">
      <Navbar />

      <div className="flex items-center justify-center p-4 relative z-10 min-h-screen pt-20">
        <motion.div
          className="relative w-full max-w-lg"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl blur-xl opacity-20 scale-105" />

          <motion.div
            className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 ring-1 ring-black/5"
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Verify Email
              </h1>
              <p className="text-gray-600">
                Enter the 6-digit OTP sent to your email.
              </p>
            </div>

            {emailFromQuery && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Email: <span className="font-mono">{emailFromQuery}</span>
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            {status && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 mt-0.5" />
                <div className="text-sm">{status}</div>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onBlur={() => setOtp((v) => v.replace(/\s+/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white/50"
                  disabled={loading || resending}
                  aria-invalid={error ? 'true' : 'false'}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Tip: the OTP may arrive slowly. If it expires, click “Resend OTP”.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || resending}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-gray-200 space-y-3">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending || loading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {resending ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Resending...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span>Resend OTP</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
                disabled={loading || resending}
              >
                Back to login
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmailOtp;

