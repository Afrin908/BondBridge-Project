import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axios';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/Skeletons';

const initials = (name) => (name || 'BB').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState('incoming');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [inRes, sentRes] = await Promise.all([API.get('/match/requests'), API.get('/match/sent')]);
      setIncoming(Array.isArray(inRes.data) ? inRes.data : inRes.data.requests || []);
      setSent(Array.isArray(sentRes.data) ? sentRes.data : sentRes.data.sent || sentRes.data.requests || []);
    } catch { toast.error('Connection requests could not be loaded.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const respond = async (matchId, status) => {
    try { await API.put(`/match/${matchId}/respond`, { status }); toast.success(`Request ${status}.`); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Request could not be updated.'); }
  };

  const list = tab === 'incoming' ? incoming : sent;

  return (
    <main className="page-wrapper container animate-fade-up">
      <header className="page-header">
        <span className="section-label">Network workflow</span>
        <h1 className="heading-lg">Professional Connection Requests</h1>
        <p className="body-md">Review incoming professional connection requests and track invitations you sent to employees, clients, and partners.</p>
      </header>
      
      <div className="tabs"><button className={`tab-btn ${tab === 'incoming' ? 'active' : ''}`} onClick={() => setTab('incoming')}>Incoming</button><button className={`tab-btn ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>Sent</button></div>
      {loading ? <TableSkeleton rows={5} /> : list.length === 0 ? (
        <div className="empty-state card"><div className="empty-state-icon">BB</div><h2 className="heading-sm">No {tab} requests</h2><p className="body-sm">Professional connection requests will appear here.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {list.map((req) => {
            const person = tab === 'incoming' ? req.sender : req.receiver;
            return (
              <div className="request-card" key={req._id || req.matchId}>
                <div className="avatar avatar-md">{person?.photo ? <img src={person.photo} alt={person.name} /> : initials(person?.name)}</div>
                <div style={{ flex: 1 }}>
                  <strong>{person?.name || 'BondBridge member'}</strong>
                  <p className="body-sm">{[person?.roleTitle || person?.profession || person?.occupation, person?.department, person?.organization].filter(Boolean).join(' · ') || 'Professional profile'}</p>
                </div>
                <span className={`tag ${req.status === 'accepted' ? 'tag-verified' : req.status === 'rejected' ? 'tag-danger' : 'tag-warning'}`}>{req.status || 'pending'}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/user/${person?._id}`)}>View</button>
                {tab === 'incoming' && (req.status || 'pending') === 'pending' && <><button className="btn btn-primary btn-sm" onClick={() => respond(req._id || req.matchId, 'accepted')}>Accept</button><button className="btn btn-danger btn-sm" onClick={() => respond(req._id || req.matchId, 'rejected')}>Reject</button></>}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
