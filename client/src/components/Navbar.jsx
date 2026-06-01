import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';
import logo from '../assets/logo.png';

const isVerifiedUser = (user) =>
  user?.verificationStatus === 'verified' || user?.isVerified;

// ── Icon components (inline SVG, no extra dep) ───────────────
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const active = (path) => pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Subtle shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = async () => {
      try {
        const { data } = await API.get('/notifications/unread-count');
        setUnreadCount(data.unreadCount || 0);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Public nav links
  const publicLinks = [
    ['#features',      'Features'],
    ['#verification',  'Verification'],
    ['#privacy',       'Visibility'],
    ['#collaboration', 'Collaboration'],
  ];

  // Authenticated nav links
  const authLinks = [
    ['/search',        'Directory'],
    ['/requests',      'Requests'],
    ['/connections',   'Connections'],
    ['/chat',          'Messages'],
  ];

  return (
    <nav
      className="navbar"
      style={{
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="navbar-brand">
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <img src={logo} alt="BondBridge" style={{ height: 64, width: 'auto' }} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span
              style={{
                fontFamily: 'var(--font)',
                fontWeight: 700,
                fontSize: 17,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              BondBridge
            </span>
            <span
              style={{
                fontSize: 9.5,
                color: 'var(--text-muted)',
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Workplace Communication Platform
            </span>
          </div>
        </Link>
      </div>

      {/* ── Nav Links ─────────────────────────────────────── */}
      {user ? (
        <>
          <div className="navbar-links hide-mobile">
            {authLinks.map(([path, label]) => (
              <Link
                key={path}
                to={path}
                className={`nav-link${active(path) ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}

            {user.isAdmin && (
              <Link
                to="/admin"
                className={`nav-link${active('/admin') ? ' active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ShieldIcon />
                Trust &amp; Safety
              </Link>
            )}
          </div>

          {/* ── Authenticated Actions ──────────────────────── */}
          <div className="navbar-actions">
            {/* Notification bell */}
            <Link
              to="/notifications"
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-xs)',
                background: active('/notifications') ? 'var(--surface-dark)' : 'transparent',
                color: active('/notifications') ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              title="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 99,
                    background: 'var(--danger)',
                    color: 'white',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '2px solid var(--bg-primary)',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile button */}
            <Link to="/profile">
              <button
                className="btn btn-ghost btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  paddingInline: 10,
                  height: 36,
                }}
              >
                {/* Avatar */}
                <div
                  className="avatar avatar-sm"
                  style={{
                    background: 'var(--surface-dark)',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {user.photo ? (
                    <img src={user.photo} alt="" />
                  ) : (
                    (user.name || '?').charAt(0).toUpperCase()
                  )}
                </div>

                <span
                  className="hide-mobile"
                  style={{
                    maxWidth: 90,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {user.name}
                </span>

                {isVerifiedUser(user) && (
                  <span className="verify-icon" title="Verified Identity">✓</span>
                )}

                <ChevronIcon />
              </button>
            </Link>

            {/* Logout */}
            <button
              className="btn btn-sm"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={handleLogout}
              title="Sign out"
            >
              <LogoutIcon />
              <span className="hide-mobile">Sign Out</span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* ── Public Nav Links ───────────────────────────── */}
          <div className="navbar-links hide-mobile">
            {publicLinks.map(([href, label]) => (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ))}
          </div>

          {/* ── Public Actions ─────────────────────────────── */}
          <div className="navbar-actions">
            <Link to="/login">
              <button
                className="btn btn-ghost btn-sm"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                Sign In
              </button>
            </Link>

            <Link to="/signup">
              <button
                className="btn btn-sm"
                style={{
                  background: 'var(--surface-dark)',
                  color: 'white',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                Get Started
              </button>
            </Link>
          </div>
        </>
      )}
    </nav>
  );
}