import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const leftPoints = [
  'Identity-verified profiles only',
  'End-to-end visibility controls',
  'Collaboration intelligence engine',
  'Admin-moderated trust & safety',
  'Mutual-acceptance messaging',
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/search');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Left dark panel ──────────────────────────────── */}
      <div className="auth-panel-left">
        {/* Subtle geometric decoration */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: -120,
              right: -120,
              width: 400,
              height: 400,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -60,
              right: -60,
              width: 240,
              height: 240,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: -80,
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.03)',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
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
            Secure Professional Communication Infrastructure
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
            A verified-identity platform designed for trust-first human connections.
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
                  fontWeight: 400,
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

        {/* Bottom tag */}
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
      <div className="auth-panel-right">
        <div style={{ width: '100%', maxWidth: 400 }} className="animate-fade-up">
          <div style={{ marginBottom: 36 }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              Sign in to BondBridge
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  color: 'var(--accent)',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Create one
              </Link>
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 24 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ height: 50, marginTop: 6, fontSize: 15, borderRadius: 'var(--radius-sm)' }}
            >
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Sign In'}
            </button>
          </form>

          <p
            style={{
              marginTop: 24,
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            By continuing, you agree to BondBridge's Terms of Service and Visibility Policy.
          </p>
        </div>
      </div>
    </div>
  );
}