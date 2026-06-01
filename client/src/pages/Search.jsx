import { useEffect, useState } from 'react';
import API from '../utils/axios';
import ProfileCard from '../components/ProfileCard';
import toast from 'react-hot-toast';
import { ProfileCardSkeleton } from '../components/Skeletons';

const defaultFilters = {
  q: '',
  organization: '',
  department: '',
  roleTitle: '',
  location: '',
  skill: '',
  verifiedOnly: false,
  sortBy: 'collaboration',
};

export default function Search() {
  const [filters, setFilters] = useState(defaultFilters);
  const [users, setUsers] = useState([]);
  const [sentIds, setSentIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const params = {
        search: filters.q || undefined,
        organization: filters.organization || undefined,
        department: filters.department || undefined,
        profession: filters.roleTitle || undefined,
        location: filters.location || undefined,
        interest: filters.skill || undefined,
        verifiedOnly: filters.verifiedOnly || undefined,
        sortBy: filters.sortBy,
      };
      const { data } = await API.get('/users/search', { params });
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setUsers([]);
      toast.error(err.response?.data?.message || 'Professional directory could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSent = async () => {
    try {
      const { data } = await API.get('/match/sent');
      const list = Array.isArray(data) ? data : data.sent || data.requests || [];
      setSentIds(new Set(list.map((r) => r.receiver?._id || r.receiver || r.user?._id).filter(Boolean)));
    } catch {}
  };

  useEffect(() => { fetchUsers(); fetchSent(); }, []);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const sendRequest = async (userId) => {
    try {
      await API.post('/match/request', { receiverId: userId });
      setSentIds((prev) => new Set(prev).add(userId));
      toast.success('Professional connection request sent.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection request could not be sent.');
    }
  };

  return (
    <main className="page-wrapper container animate-fade-up">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-end' }}>
        <div>
          <span className="section-label">Professional directory</span>
          <h1 className="heading-lg">Professional Discovery</h1>
          <p className="body-md" style={{ maxWidth: 720 }}>
            Find verified employees, clients, partners, and internal collaborators by role, department, organization, skills, and work context.
          </p>
        </div>
        <button className="btn btn-primary" onClick={fetchUsers}>Refresh directory</button>
      </header>



      <div className="layout-sidebar">
        <aside className="card" style={{ padding: 22, position: 'sticky', top: 88 }}>
          <h2 className="heading-sm" style={{ marginBottom: 16 }}>Discovery filters</h2>
          <div style={{ display: 'grid', gap: 14 }}>
            <input className="form-input" name="q" value={filters.q} onChange={update} placeholder="Search name, role, skill…" />
            <input className="form-input" name="organization" value={filters.organization} onChange={update} placeholder="Organization / company" />
            <input className="form-input" name="department" value={filters.department} onChange={update} placeholder="Department" />
            <input className="form-input" name="roleTitle" value={filters.roleTitle} onChange={update} placeholder="Role / title" />
            <input className="form-input" name="skill" value={filters.skill} onChange={update} placeholder="Skill or expertise" />
            <input className="form-input" name="location" value={filters.location} onChange={update} placeholder="Office location" />
            <select className="form-select" name="sortBy" value={filters.sortBy} onChange={update}>
              <option value="collaboration">Sort by collaboration fit</option>
              <option value="verified">Verified identities first</option>
              <option value="recent">Recently active</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span className="body-sm">Verified identities only</span>
              <span className="toggle"><input type="checkbox" name="verifiedOnly" checked={filters.verifiedOnly} onChange={update} /><span className="toggle-slider" /></span>
            </label>
            <button className="btn btn-primary" onClick={fetchUsers}>Apply filters</button>
            <button className="btn btn-secondary" onClick={() => setFilters(defaultFilters)}>Reset</button>
          </div>
        </aside>

        <section>
          {loading ? (
            <div className="grid-3">
              {Array.from({ length: 6 }).map((_, index) => <ProfileCardSkeleton key={index} />)}
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon">BB</div>
              <h2 className="heading-sm">No professional profiles found</h2>
              <p className="body-sm">Try removing one filter or searching by department, role, or expertise area.</p>
            </div>
          ) : (
            <div className="grid-3">
              {users.map((u) => (
                <ProfileCard
                  key={u._id}
                  user={u}
                  actionButton={sentIds.has(u._id) ? <button className="btn btn-secondary btn-sm" disabled>Request sent</button> : <button className="btn btn-primary btn-sm" onClick={() => sendRequest(u._id)}>Connect professionally</button>}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
