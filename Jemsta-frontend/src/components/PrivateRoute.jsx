import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ Component, requiredRole = null }) => {
  const { isAuthenticated, user, initializing } = useAuth();

  // On a hard reload, `user` starts out null for one tick while AuthContext
  // checks localStorage — redirecting immediately on that null would log
  // the person out even though their session is still valid. Wait for the
  // check to finish before deciding.
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const fallback =
      user?.role === 'landlord' ? '/landlord' :
      user?.role === 'tenant'   ? '/tenant'   : '/admin';
    return <Navigate to={fallback} replace />;
  }

  return <Component />;
};

export default PrivateRoute;