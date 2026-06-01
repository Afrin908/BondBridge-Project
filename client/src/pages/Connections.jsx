import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axios';
import { TableSkeleton } from '../components/Skeletons';

const initials = (name) => (name || 'BB').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/match/connections')
      .then(({ data }) => setConnections(Array.isArray(data) ? data : data.connections || []))
      .catch(() => setConnections([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-wrapper container animate-fade-up">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-end' }}>
        <div>
          <span className="section-label">Verified network</span>
          <h1 className="heading-lg">Professional Connections</h1>
          <p className="body-md">Manage accepted employee, client, partner, and organizational connections for secure communication.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/search')}>Professional Discovery</button>
      </header>

      {loading ? <TableSkeleton rows={5} /> : connections.length === 0 ? (
        <div className="empty-state card"><div className="empty-state-icon">BB</div><h2 className="heading-sm">No professional connections yet</h2><p className="body-sm">Accepted connection requests will appear here with profile review and secure message actions.</p><button className="btn btn-primary" onClick={() => navigate('/search')}>Start discovery</button></div>
      ) : (
        <section className="card" style={{ overflow: 'hidden' }}>
          {connections.map((connection) => {
            const user = connection.user || connection.receiver || connection.sender || connection;
            return (
              <div className="connection-row" key={connection.matchId || user._id}>
                <div className="avatar avatar-md">{user.photo ? <img src={user.photo} alt={user.name} /> : initials(user.name)}</div>
                <div style={{ flex: 1 }}>
                  <strong>{user.name}</strong>
                  <p className="body-sm">{[user.roleTitle || user.profession || user.occupation, user.department, user.organization].filter(Boolean).join(' · ') || 'Professional profile'}</p>
                </div>
                <span className={user.verificationStatus === 'verified' || user.isVerified ? 'tag tag-verified' : 'tag'}>{user.verificationStatus === 'verified' || user.isVerified ? 'Verified' : 'Pending'}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/user/${user._id}`)}>View profile</button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/chat?with=${user._id}`)}>Secure message</button>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
