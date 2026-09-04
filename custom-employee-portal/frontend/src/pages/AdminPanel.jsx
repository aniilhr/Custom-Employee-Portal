import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';

export default function AdminPanel() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', roleIds: [] });
  const [formError, setFormError] = useState('');

  async function loadAll() {
    setLoading(true);
    const [u, r, l] = await Promise.all([
      adminApi.listUsers(),
      adminApi.listRoles(),
      adminApi.listAuditLogs(),
    ]);
    setUsers(u.data.users);
    setRoles(r.data.roles);
    setLogs(l.data.logs);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError('');
    try {
      await adminApi.createUser(form);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', roleIds: [] });
      loadAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    }
  }

  async function handleDeleteUser(id) {
    if (!confirm('Delete this user?')) return;
    await adminApi.deleteUser(id);
    loadAll();
  }

  async function handleToggleActive(user) {
    await adminApi.updateUser(user.id, { isActive: !user.isActive });
    loadAll();
  }

  return (
    <div className="page">
      <h2>Admin</h2>
      <div className="tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'roles' ? 'active' : ''} onClick={() => setTab('roles')}>Roles & Permissions</button>
        <button className={tab === 'logs' ? 'active' : ''} onClick={() => setTab('logs')}>Audit Logs</button>
      </div>

      {loading && <p>Loading…</p>}

      {!loading && tab === 'users' && (
        <>
          <button className="btn" onClick={() => setShowCreate(true)}>+ New User</button>
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.roles?.map((r) => <span className="tag" key={r.id}>{r.name}</span>)}</td>
                  <td>{u.isActive ? 'Active' : 'Disabled'}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn secondary" onClick={() => handleToggleActive(u)}>
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn danger" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {!loading && tab === 'roles' && (
        <table>
          <thead><tr><th>Role</th><th>Description</th><th>Permissions</th></tr></thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.description}</td>
                <td>{r.permissions?.map((p) => <span className="tag" key={p.id}>{p.name}</span>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && tab === 'logs' && (
        <table>
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td>{l.userEmail || '—'}</td>
                <td>{l.action}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New user</h3>
            {formError && <div className="error-banner">{formError}</div>}
            <form onSubmit={handleCreateUser}>
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="field">
                <label>Role</label>
                <select
                  value={form.roleIds[0] || ''}
                  onChange={(e) => setForm({ ...form, roleIds: e.target.value ? [e.target.value] : [] })}
                >
                  <option value="">— None —</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn" type="submit">Create</button>
                <button className="btn secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
