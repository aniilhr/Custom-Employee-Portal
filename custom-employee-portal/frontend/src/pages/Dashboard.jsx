import { useEffect, useState } from 'react';
import { zohoApi } from '../services/api';

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(null);

  useEffect(() => {
    zohoApi.getApps()
      .then(({ data }) => setApps(data.apps))
      .finally(() => setLoading(false));
  }, []);

  async function handleLaunch(appKey) {
    setLaunching(appKey);
    try {
      const { data } = await zohoApi.launch(appKey);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to launch application');
    } finally {
      setLaunching(null);
    }
  }

  return (
    <div className="page">
      <h2>Your applications</h2>
      <p style={{ color: '#94a3b8' }}>
        Only the Zoho applications assigned to your role are shown below. Clicking one signs you
        straight in — no separate Zoho username or password required.
      </p>

      {loading && <p>Loading…</p>}

      {!loading && apps.length === 0 && (
        <div className="empty-state">No Zoho applications are assigned to your role yet. Contact an admin.</div>
      )}

      <div className="app-grid">
        {apps.map((app) => (
          <div className="app-card" key={app.key}>
            <h3>{app.name}</h3>
            <p>{app.purpose}</p>
            <button className="btn" onClick={() => handleLaunch(app.key)} disabled={launching === app.key}>
              {launching === app.key ? 'Launching…' : `Open ${app.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
