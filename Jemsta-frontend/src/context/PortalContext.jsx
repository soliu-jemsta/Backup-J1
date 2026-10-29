import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ Component, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const roleRedirects = {
      landlord: '/landlord',
      tenant: '/tenant',
      admin: '/admin/dashboard',
    };
    navigate(roleRedirects[user?.role] || '/');
    return null;
  }

  return <Component />;
};

export default PrivateRoute;
