import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OtpVerifyStep from './OtpStep';

const TenantLogin = () => {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step,         setStep]         = useState('credentials'); // 'credentials' | 'otp'
  const [otpToken,     setOtpToken]     = useState(null);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password, 'tenant');
      if (result.otpRequired) {
        setOtpToken(result.otpToken);
        setStep('otp');
      } else {
        navigate('/tenant');
      }
    } catch {
      // Error is displayed via the `error` value from context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
      flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tenant Portal</h1>
          <p className="text-slate-400">Manage your rental with us</p>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {step === 'otp' ? (
            <OtpVerifyStep
              email={email}
              otpToken={otpToken}
              accent="green"
              onVerified={() => navigate('/tenant')}
              onBack={() => setStep('credentials')}
            />
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg
                      text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg
                        text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600
                    text-white font-medium rounded-lg transition-colors mt-6"
                >
                  {loading ? 'Logging in…' : 'Login to Dashboard'}
                </button>
              </form>

              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-slate-600"></div>
                <span className="px-3 text-slate-400 text-sm">or</span>
                <div className="flex-1 border-t border-slate-600"></div>
              </div>

              <p className="text-center text-slate-400 text-sm">
                Are you a landlord?{' '}
                <a href="/login/landlord" className="text-green-400 hover:text-green-300 font-medium">
                  Login here
                </a>
              </p>
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-slate-400 hover:text-slate-200 text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default TenantLogin;