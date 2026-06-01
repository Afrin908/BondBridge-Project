import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/Skeletons';

// ── Icons ─────────────────────────────────────────────────────
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const UserXIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <line x1="17" y1="11" x2="23" y2="17"/><line x1="23" y1="11" x2="17" y2="17"/>
  </svg>
);

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="stat-card-label">{label}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: accent ? `${accent}15` : 'var(--bg-subtle)',
            border: `1px solid ${accent ? accent + '30' : 'var(--border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent || 'var(--text-muted)',
          }}
        >
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value ?? '—'}</div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    verified:   { label: 'Verified',   color: 'var(--success)', bg: 'var(--success-bg)' },
    pending:    { label: 'Pending',    color: 'var(--warning)', bg: 'var(--warning-bg)' },
    rejected:   { label: 'Rejected',  color: 'var(--danger)',  bg: 'var(--danger-bg)'  },
    resolved:   { label: 'Resolved',  color: 'var(--success)', bg: 'var(--success-bg)' },
    suspended:  { label: 'Suspended', color: 'var(--danger)',  bg: 'var(--danger-bg)'  },
    active:     { label: 'Active',    color: 'var(--accent)',  bg: 'var(--accent-light)' },
  };
  const cfg = map[status?.toLowerCase()] || { label: status || '—', color: 'var(--text-muted)', bg: 'var(--bg-subtle)' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}22`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}


function VerificationImagePreview({ label, src }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>{label}</div>
      {src ? (
        <img
          src={src}
          alt={label}
          style={{
            width: 120,
            height: 80,
            objectFit: 'cover',
            borderRadius: 10,
            border: '1px solid var(--border, #E2E2DF)',
          }}
        />
      ) : (
        <div
          style={{
            width: 120,
            height: 80,
            borderRadius: 10,
            border: '1px dashed var(--border, #E2E2DF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: 'var(--text-secondary)',
          }}
        >
          Missing
        </div>
      )}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────
const TABS = ['Overview', 'Users', 'Verification Queue', 'Reports', 'Suspended'];

export default function Admin() {
  const { user } = useAuth();

  const [tab,        setTab]        = useState('Overview');
  const [stats,      setStats]      = useState(null);
  const [users,      setUsers]      = useState([]);
  const [verQueue,   setVerQueue]   = useState([]);
  const [reports,    setReports]    = useState([]);
  const [suspended,  setSuspended]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [actionMsg,  setActionMsg]  = useState('');

  if (!user?.isAdmin) return <Navigate to="/" />;

  // ── Fetch helpers ────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes, verRes] = await Promise.all([
          API.get('/users/admin/stats').catch(() => ({ data: {} })),
          API.get('/users/all').catch(() => ({ data: [] })),
          API.get('/users/admin/verifications').catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        const userList = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || [];
        const verificationList = Array.isArray(verRes.data) ? verRes.data : verRes.data.users || [];
        setUsers(userList);
        setVerQueue(verificationList);
        setSuspended(userList.filter((u) => u.isActive === false || u.isSuspended || u.suspended));
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (tab === 'Reports') {
      API.get('/admin/reports')
        .then(({ data }) => setReports(Array.isArray(data) ? data : data.reports || []))
        .catch(() => setReports([]));
    }
  }, [tab]);

  const flash = (msg) => {
    toast(msg);
    setActionMsg('');
  };

  const approveVerification = async (userId) => {
    try {
      await API.put(`/users/admin/verifications/${userId}`, { status: 'verified' });
      setVerQueue((q) => q.filter((u) => u._id !== userId));
      flash('Identity verification approved.');
    } catch { flash('Action failed.'); }
  };

  const rejectVerification = async (userId) => {
    try {
      await API.put(`/users/admin/verifications/${userId}`, { status: 'rejected' });
      setVerQueue((q) => q.filter((u) => u._id !== userId));
      flash('Verification rejected.');
    } catch { flash('Action failed.'); }
  };

  const suspendUser = async (userId) => {
    try {
      await API.put(`/users/${userId}/suspend`);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isSuspended: true } : u));
      flash('User suspended.');
    } catch { flash('Action failed.'); }
  };

  const resolveReport = async (reportId) => {
    try {
      await API.patch(`/admin/reports/${reportId}/resolve`);
      setReports((r) => r.map((x) => x._id === reportId ? { ...x, status: 'resolved' } : x));
      flash('Report marked as resolved.');
    } catch { flash('Action failed.'); }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--surface-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(245,245,243,0.7)',
              }}
            >
              <ShieldIcon />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Trust &amp; Safety Workspace
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
            Identity verification, professional conduct reports, user access, and platform oversight.
          </p>
        </div>

        {/* Flash message */}
        {actionMsg && (
          <div className="alert alert-success" style={{ marginBottom: 24 }}>
            {actionMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab-btn${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
              {t === 'Verification Queue' && verQueue.length > 0 && (
                <span style={{ marginLeft: 6, background: 'var(--warning)', color: 'white', borderRadius: 99, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                  {verQueue.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <TableSkeleton rows={6} />
        ) : (
          <>
            {/* ── OVERVIEW ─────────────────────────────────── */}
            {tab === 'Overview' && (
              <div className="animate-fade-up">
                <div className="grid-4" style={{ marginBottom: 32 }}>
                  <StatCard label="Total Users"           value={stats?.totalUsers      ?? users.length}              icon={<UsersIcon />}  />
                  <StatCard label="Verified Identities"  value={stats?.verifiedUsers    ?? users.filter(u => u.verificationStatus === 'verified').length} icon={<ShieldIcon />} accent="var(--success)" />
                  <StatCard label="Pending Verifications" value={stats?.pendingVerifications ?? verQueue.length}       icon={<AlertIcon />}  accent="var(--warning)" />
                  <StatCard label="Open Reports"         value={stats?.openReports      ?? reports.filter(r => r.status !== 'resolved').length} icon={<AlertIcon />} accent="var(--danger)" />
                </div>

                {/* Quick summary table */}
                <div className="card" style={{ overflow: 'hidden', boxShadow: 'none' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                      Recent Users
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Verification</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 8).map((u) => (
                          <tr key={u._id}>
                            <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name || '—'}</td>
                            <td>{u.email}</td>
                            <td><StatusBadge status={u.verificationStatus || 'none'} /></td>
                            <td><StatusBadge status={u.isActive === false || u.isSuspended ? 'suspended' : 'active'} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS ────────────────────────────────────── */}
            {tab === 'Users' && (
              <div className="animate-fade-up">
                <div className="card" style={{ overflow: 'hidden', boxShadow: 'none' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Verification</th>
                          <th>Account</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id}>
                            <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name || '—'}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                            <td>{u.roleTitle || u.profession || u.occupation || '—'}</td>
                            <td><StatusBadge status={u.verificationStatus || 'none'} /></td>
                            <td><StatusBadge status={u.isActive === false || u.isSuspended ? 'suspended' : 'active'} /></td>
                            <td>
                              {u.isActive !== false && !u.isSuspended && !u.isAdmin && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => suspendUser(u._id)}
                                >
                                  Suspend
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── VERIFICATION QUEUE ───────────────────────── */}
            {tab === 'Verification Queue' && (
              <div className="animate-fade-up">
                {verQueue.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><ShieldIcon /></div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>Queue is clear</p>
                    <p className="body-sm">No pending identity verification submissions.</p>
                  </div>
                ) : (
                  <div className="card" style={{ overflow: 'hidden', boxShadow: 'none' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Submitted</th>
                            <th>Documents</th>
                            <th>Current Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verQueue.map((u) => (
                            <tr key={u._id}>
                              <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name || '—'}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                              <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                                {u.verificationSubmittedAt
                                  ? new Date(u.verificationSubmittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                  : '—'}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                  <VerificationImagePreview label="NID Front" src={u.verificationDocuments?.nidFront} />
                                  <VerificationImagePreview label="NID Back" src={u.verificationDocuments?.nidBack} />
                                  <VerificationImagePreview label="Selfie" src={u.verificationDocuments?.selfieWithNid} />
                                </div>
                              </td>
                              <td><StatusBadge status="pending" /></td>
                              <td>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(79,138,111,0.2)', display: 'flex', alignItems: 'center', gap: 5 }}
                                    onClick={() => approveVerification(u._id)}
                                  >
                                    <CheckIcon /> Approve
                                  </button>
                                  <button
                                    className="btn btn-sm"
                                    style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(164,74,74,0.2)', display: 'flex', alignItems: 'center', gap: 5 }}
                                    onClick={() => rejectVerification(u._id)}
                                  >
                                    <XIcon /> Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── REPORTS ──────────────────────────────────── */}
            {tab === 'Reports' && (
              <div className="animate-fade-up">
                {reports.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><AlertIcon /></div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>No reports</p>
                    <p className="body-sm">User reports will appear here for review.</p>
                  </div>
                ) : (
                  <div className="card" style={{ overflow: 'hidden', boxShadow: 'none' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Reported User</th>
                            <th>Reported By</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((r) => (
                            <tr key={r._id}>
                              <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                {r.reportedUser?.name || r.reportedUserId || '—'}
                              </td>
                              <td style={{ color: 'var(--text-muted)' }}>
                                {r.reportedBy?.name || r.reportedById || '—'}
                              </td>
                              <td style={{ maxWidth: 200 }}>
                                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                                  {r.reason || '—'}
                                </span>
                              </td>
                              <td><StatusBadge status={r.status || 'pending'} /></td>
                              <td>
                                {r.status !== 'resolved' && (
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => resolveReport(r._id)}
                                  >
                                    Resolve
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SUSPENDED ────────────────────────────────── */}
            {tab === 'Suspended' && (
              <div className="animate-fade-up">
                {suspended.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><UserXIcon /></div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>No suspended users</p>
                    <p className="body-sm">Suspended accounts will be listed here.</p>
                  </div>
                ) : (
                  <div className="card" style={{ overflow: 'hidden', boxShadow: 'none' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Verification</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {suspended.map((u) => (
                            <tr key={u._id}>
                              <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name || '—'}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                              <td><StatusBadge status={u.verificationStatus || 'none'} /></td>
                              <td><StatusBadge status="suspended" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}