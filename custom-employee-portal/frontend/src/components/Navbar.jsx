import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearSession } from '../utils/auth';

export default function Navbar() {
  const user = getUser();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    clearSession();
    navigate('/login');
  }

  return (
    <div className="navbar">
      <div className="brand">🏢 Employee Portal</div>
      <div className="nav-links">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
        {user.roles?.includes('Admin') && (
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>
        )}
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          {user.name} · {user.roles?.join(', ')}
        </span>
        <button className="btn secondary" onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
}
