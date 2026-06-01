import { useNavigate } from 'react-router-dom';

const getInitials = (name) =>
  (name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const isVerifiedUser = (user) => user?.verificationStatus === 'verified' || user?.isVerified;

const scoreColor = (score) => {
  if (score >= 80) return { fg: 'var(--success)', bg: 'var(--success-bg)' };
  if (score >= 55) return { fg: 'var(--accent)', bg: 'var(--accent-light)' };
  return { fg: 'var(--text-muted)', bg: 'var(--bg-subtle)' };
};

export default function ProfileCard({ user, actionButton }) {
  const navigate = useNavigate();
  const collaborationScore = typeof user.compatibilityScore === 'number' ? user.compatibilityScore : null;
  const skills = [
    ...(Array.isArray(user.skills) ? user.skills : []),
    ...(Array.isArray(user.expertiseAreas) ? user.expertiseAreas : []),
    ...(Array.isArray(user.interests) ? user.interests : []),
  ].filter(Boolean).slice(0, 4);

  const displayName = user.name || user.fullName || 'BondBridge Member';
  const verified = isVerifiedUser(user);
  const colors = collaborationScore !== null ? scoreColor(collaborationScore) : null;
  const meta = [user.roleTitle || user.profession || user.occupation, user.department, user.organization, user.location]
    .filter(Boolean)
    .slice(0, 3)
    .join(' · ');

  return (
    <div className="profile-card animate-fade-up" onClick={() => navigate(`/user/${user._id}`)}>
      <div className="profile-card-avatar" style={{ aspectRatio: '16/10' }}>
        {user.photo ? <img src={user.photo} alt={displayName} /> : null}
        <span className="profile-card-avatar-initials" style={{ display: user.photo ? 'none' : 'flex' }}>
          {getInitials(displayName)}
        </span>

        {colors && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: colors.bg, color: colors.fg, border: `1px solid ${colors.fg}22`, borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>
            {collaborationScore}% fit
          </div>
        )}

        {verified && (
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(79,138,111,0.2)', borderRadius: 99, padding: '4px 8px', fontSize: 10.5, fontWeight: 600 }}>
            <span className="verify-icon" style={{ width: 13, height: 13, fontSize: 7 }}>✓</span>
            Verified identity
          </div>
        )}
      </div>

      <div className="profile-card-body">
        <div className="profile-card-name">{displayName}</div>
        {meta && <div className="profile-card-meta">{meta}</div>}

        <div className="profile-card-tags">
          {(user.userType || user.workMode) && <span className="tag tag-accent">{user.userType || user.workMode}</span>}
          {verified ? <span className="tag tag-verified">Verified</span> : <span className="tag">Identity pending</span>}
        </div>

        {skills.length > 0 && (
          <div className="profile-card-tags" style={{ marginTop: 8 }}>
            {skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}
          </div>
        )}

        {user.bio && <p className="body-sm" style={{ marginTop: 12 }}>{user.bio.slice(0, 120)}{user.bio.length > 120 ? '…' : ''}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }} onClick={(e) => e.stopPropagation()}>
          {actionButton || <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>View professional profile</button>}
        </div>
      </div>
    </div>
  );
}
