import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../utils/axios';

const initials = (name) => (name || 'BB').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
const verified = (u) => u?.verificationStatus === 'verified' || u?.isVerified;

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
const [reportReason, setReportReason] = useState('Fake Profile');
  const [reportDetails, setReportDetails] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [{ data: userData }, sentRes, connRes] = await Promise.all([
          API.get(`/users/${id}`),
          API.get('/match/sent').catch(() => ({ data: [] })),
          API.get('/match/connections').catch(() => ({ data: [] })),
        ]);
        setProfile(userData.user || userData);
        const sentList = Array.isArray(sentRes.data) ? sentRes.data : sentRes.data.sent || sentRes.data.requests || [];
        const connList = Array.isArray(connRes.data) ? connRes.data : connRes.data.connections || [];
        setSent(sentList.some((r) => (r.receiver?._id || r.receiver || r.user?._id) === id));
        setConnected(connList.some((c) => (c.user?._id || c._id) === id));
      } catch {
        setProfile(null);
      } finally { setLoading(false); }
    }
    load();
  }, [id]);

  const requestConnect = async () => {
    try {
      await API.post('/match/request', { receiverId: id });
      setSent(true);
      setMessage('Professional connection request sent.');
    } catch (err) { setMessage(err.response?.data?.message || 'Connection request could not be sent.'); }
  };

  const blockUser = async () => {
    if (!window.confirm('Block this profile from contacting you?')) return;
    try { await API.post(`/blocks/${id}`); setMessage('Profile blocked.'); }
    catch (err) { setMessage(err.response?.data?.message || 'Could not block this profile.'); }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await API.post('/reports', { reportedUser: id, reason: reportReason, details: reportDetails });
      setReportOpen(false); setReportDetails(''); setMessage('Report submitted to Trust & Safety.');
    } catch (err) { setMessage(err.response?.data?.message || 'Report could not be submitted.'); }
  };

  if (loading) return <main className="page-wrapper container"><div className="spinner spinner-lg" style={{ marginTop: 80 }} /></main>;
  if (!profile) return <main className="page-wrapper container"><div className="empty-state card"><h1 className="heading-sm">Profile unavailable</h1><Link className="btn btn-primary" to="/search">Back to discovery</Link></div></main>;

  const skills = [...(profile.skills || []), ...(profile.expertiseAreas || []), ...(profile.interests || [])].filter(Boolean);
  const fit = typeof profile.compatibilityScore === 'number' ? profile.compatibilityScore : null;

  return (
    <main className="page-wrapper container animate-fade-up">
      {message && <div className="alert alert-warning" style={{ marginBottom: 20 }}>{message}</div>}

      <section className="card" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
          <div className="avatar avatar-2xl">{profile.photo ? <img src={profile.photo} alt={profile.name} /> : initials(profile.name)}</div>
          <div>
            <span className="section-label">Verified professional profile</span>
            <h1 className="heading-lg">{profile.name}</h1>
            <p className="body-md">{[profile.roleTitle || profile.profession || profile.occupation, profile.department, profile.organization, profile.location].filter(Boolean).join(' · ')}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {verified(profile) ? <span className="tag tag-verified">Verified identity</span> : <span className="tag tag-warning">Verification pending</span>}
              {profile.userType && <span className="tag tag-accent">{profile.userType}</span>}
              {profile.availabilityStatus && <span className="tag">{profile.availabilityStatus}</span>}
              {fit !== null && <span className="tag tag-accent">{fit}% collaboration fit</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexDirection: 'column', minWidth: 190 }}>
            {connected ? <button className="btn btn-primary" onClick={() => navigate(`/chat?with=${profile._id}`)}>Secure message</button> : sent ? <button className="btn btn-secondary" disabled>Request sent</button> : <button className="btn btn-primary" onClick={requestConnect}>Connect professionally</button>}
            <button className="btn btn-secondary" onClick={() => setReportOpen((v) => !v)}>Report concern</button>
            <button className="btn btn-danger" onClick={blockUser}>Block profile</button>
          </div>
        </div>
      </section>

      {reportOpen && (
        <form className="card" onSubmit={submitReport} style={{ padding: 24, marginBottom: 24 }}>
          <h2 className="heading-sm">Submit Trust & Safety report</h2>
          <p className="body-sm" style={{ marginBottom: 16 }}>Use this only for workplace communication, identity, or platform conduct concerns.</p>
          <div style={{ display: 'grid', gap: 12 }}>
<select
  value={reportReason}
  onChange={(e) => setReportReason(e.target.value)}
>
  <option value="Fake Profile">Fake Profile</option>
  <option value="Harassment">Harassment</option>
  <option value="Inappropriate Content">Inappropriate Content</option>
  <option value="Spam">Spam / Promotional Abuse</option>
  <option value="Scam or Fraud">Scam or Fraud</option>
  <option value="Professional conduct concern">
    Professional Conduct Concern
  </option>
  <option value="Identity verification concern">
    Identity Verification Concern
  </option>
  <option value="Unsafe communication">
    Unsafe Communication
  </option>
  <option value="Scammer">
    Scammer / Financial Manipulation
  </option>
  <option value="Other">Other</option>
</select>
            <textarea className="form-textarea" value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Add clear details for admin review." />
            <button className="btn btn-primary" type="submit">Submit report</button>
          </div>
        </form>
      )}

      <div className="grid-2">
        <InfoCard title="Professional summary"><p className="body-md">{profile.bio || 'No professional summary added yet.'}</p></InfoCard>
        <InfoCard title="Organization context">
          <Data label="Organization" value={profile.organization} /><Data label="Department" value={profile.department} /><Data label="Role" value={profile.roleTitle || profile.profession || profile.occupation} /><Data label="Work mode" value={profile.workMode} />
        </InfoCard>
        <InfoCard title="Skills & expertise"><TagList items={skills} empty="No skills listed." /></InfoCard>
        <InfoCard title="Collaboration goals"><TagList items={profile.collaborationGoals || []} empty="No collaboration goals listed." /></InfoCard>
        <InfoCard title="Communication preferences"><TagList items={profile.communicationPreferences || []} empty="No communication preference listed." /></InfoCard>
        <InfoCard title="Visibility & safety"><p className="body-sm">Contact details are controlled by BondBridge visibility settings and mutual professional connection approval.</p></InfoCard>
      </div>
    </main>
  );
}

function InfoCard({ title, children }) { return <section className="card" style={{ padding: 24 }}><h2 className="heading-sm" style={{ marginBottom: 14 }}>{title}</h2>{children}</section>; }
function Data({ label, value }) { return <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingBlock: 8, borderBottom: '1px solid var(--border)' }}><span className="body-sm">{label}</span><strong>{value || '—'}</strong></div>; }
function TagList({ items, empty }) { return items.length ? <div className="profile-card-tags">{items.map((x) => <span className="tag" key={x}>{x}</span>)}</div> : <p className="body-sm">{empty}</p>; }
