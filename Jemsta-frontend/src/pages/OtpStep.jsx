import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Tailwind needs full class names present in the source to include them in
// the build — can't interpolate `bg-${accent}-600` at runtime, so each
// portal's color scheme is a static lookup instead.
const ACCENTS = {
  green: {
    button: 'bg-green-600 hover:bg-green-700',
    focusBorder: 'focus:border-green-500',
    link: 'text-green-400 hover:text-green-300',
  },
  blue: {
    button: 'bg-blue-600 hover:bg-blue-700',
    focusBorder: 'focus:border-blue-500',
    link: 'text-blue-400 hover:text-blue-300',
  },
};

/**
 * @param {string} email - shown as a reminder of where the code was sent
 * @param {string} otpToken - the otp_token returned by the password step
 * @param {'green'|'blue'} accent - matches the calling login page's theme
 * @param {(user: object) => void} onVerified - called with the logged-in user on success
 * @param {() => void} onBack - go back to the credentials step
 */
const OtpVerifyStep = ({ email, otpToken, accent = 'green', onVerified, onBack }) => {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { verifyOtp } = useAuth();
  const colors = ACCENTS[accent] || ACCENTS.green;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await verifyOtp(otpToken, code.trim());
      onVerified(user);
    } catch (err) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p className="text-slate-300 text-sm mb-5">
        We've sent a verification code to{' '}
        {email ? <span className="text-white font-medium">{email}</span> : 'your email'}.
        Enter it below to continue.
      </p>

      {error && (
        <div className="mb-5 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="AB12CD"
            required
            autoFocus
            maxLength={12}
            autoComplete="one-time-code"
            className={`w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg
              text-white placeholder-slate-400 text-center text-lg tracking-[0.3em] font-mono
              focus:outline-none ${colors.focusBorder}`}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !code.trim()}
          className={`w-full py-3 ${colors.button} disabled:bg-slate-600
            text-white font-medium rounded-lg transition-colors`}
        >
          {submitting ? 'Verifying…' : 'Verify & Continue'}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className={`block mx-auto mt-5 text-sm ${colors.link}`}
      >
        &larr; Back to login
      </button>
    </div>
  );
};

export default OtpVerifyStep;