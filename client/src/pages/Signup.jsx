import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const leftPoints = [
  'Identity-verified profiles only',
  'End-to-end visibility controls',
  'Collaboration intelligence engine',
  'Admin-moderated trust & safety',
  'Mutual-acceptance messaging',
];

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'employee',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.userType) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/profile');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Left dark panel ──────────────────────────────── */}
      <div className="auth-panel-left">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {[400, 240, 150].map((s, i) => (
            <div
              key={s}
              style={{
                position: 'absolute',
                bottom: -s / 3,
                right: -s / 3,
                width: s,
                height: s,
                borderRadius: '50%',
                border: `1px solid rgba(255,255,255,${0.03 + i * 0.01})`,
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <img src={logo} alt="BondBridge" style={{ height: 34, width: 'auto', filter: 'brightness(0) invert(1) opacity(0.9)' }} />
            <span
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: 'rgba(245,245,243,0.9)',
                letterSpacing: '-0.03em',
              }}
            >
              BondBridge
            </span>
          </div>

          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-inverse)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: 12,
            }}
          >
            Join the Verified Network
          </h2>

          <p
            style={{
              fontSize: 14,
              color: 'rgba(245,245,243,0.5)',
              lineHeight: 1.65,
              marginBottom: 40,
              maxWidth: 340,
            }}
          >
            Create your identity profile and access verified connections, visibility controls, and the full BondBridge platform.
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {leftPoints.map((pt) => (
              <li
                key={pt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13.5,
                  color: 'rgba(245,245,243,0.65)',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(92,141,137,0.25)',
                    border: '1px solid rgba(92,141,137,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    flexShrink: 0,
                  }}
                >
                  <CheckIcon />
                </div>
                {pt}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(245,245,243,0.3)',
            fontSize: 12,
          }}
        >
          <ShieldIcon />
          Identity-first. Trust-native. Visibility by design.
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="auth-panel-right" style={{ alignItems: 'flex-start', paddingTop: 80, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-fade-up">
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              Create your BondBridge account
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--accent)',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 24 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="userType">Profile Type</label>
              <select
                id="userType"
                name="userType"
                required
                className="form-select"
                value={form.userType}
                onChange={handleChange}
              >
                <option value="">Select profile type</option>
                <option value="employee">Employee</option>
                <option value="client">Client</option>
                <option value="vendor">Vendor</option>
                <option value="partner">Partner</option>
                <option value="external">External collaborator</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ height: 50, marginTop: 8, fontSize: 15, borderRadius: 'var(--radius-sm)' }}
            >
              {loading
                ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                : 'Create Account'}
            </button>
          </form>

          <p
            style={{
              marginTop: 20,
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            By creating an account, you agree to BondBridge's Terms of Service
            and Visibility Policy. Your identity data is handled securely.
          </p>
        </div>
      </div>
    </div>
  );
}