import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../utils/auth';

// Wraps a route: requires a valid session, and optionally a specific role (e.g. Admin-only screens).
export default function ProtectedRoute({ children, requireRole }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && !user.roles?.includes(requireRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
