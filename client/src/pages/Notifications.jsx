import { useState, useEffect } from 'react';
import API from '../utils/axios';
import { TableSkeleton } from '../components/Skeletons';

// ── Icons ─────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const UserCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const typeConfig = {
  verification:       { icon: <UserCheckIcon />, color: 'var(--success)',  bg: 'var(--success-bg)',  label: 'Verification' },
  connection_request: { icon: <LinkIcon />,      color: 'var(--accent)',   bg: 'var(--accent-light)', label: 'Connection'   },
  message:            { icon: <MessageIcon />,   color: 'var(--text-muted)', bg: 'var(--bg-subtle)', label: 'Message'      },
  report:             { icon: <AlertIcon />,     color: 'var(--danger)',   bg: 'var(--danger-bg)',   label: 'Report'       },
  admin:              { icon: <ShieldIcon />,    color: 'var(--warning)',  bg: 'var(--warning-bg)', label: 'Admin'        },
  security:           { icon: <ShieldIcon />,    color: 'var(--danger)',   bg: 'var(--danger-bg)',   label: 'Security'     },
};

function getTypeConfig(type) {
  return typeConfig[type] || typeConfig.message;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupNotifications(list) {
  const today = new Date();
  const groups = { today: [], earlier: [], security: [] };

  for (const n of list) {
    if (n.type === 'security') {
      groups.security.push(n);
      continue;
    }
    const d = new Date(n.createdAt);
    const sameDay =
      d.getDate()     === today.getDate() &&
      d.getMonth()    === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    groups[sameDay ? 'today' : 'earlier'].push(n);
  }
  return groups;
}

function NotificationItem({ notification, onMarkRead }) {
  const cfg = getTypeConfig(notification.type);
  const unread = !notification.isRead;

  return (
    <div
      className={`notification-item${unread ? ' unread' : ''}`}
      onClick={() => unread && onMarkRead(notification._id)}
      style={{ cursor: unread ? 'pointer' : 'default' }}
    >
      {/* Type icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: cfg.bg,
          border: `1px solid ${cfg.color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: cfg.color,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: cfg.color,
                }}
              >
                {cfg.label}
              </span>
              {unread && (
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
            <p
              style={{
                fontSize: 13.5,
                color: unread ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: unread ? 500 : 400,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {notification.message || notification.content || 'New notification'}
            </p>
          </div>
          <span
            style={{
              fontSize: 11.5,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function GroupSection({ title, items, onMarkRead }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          padding: '10px 20px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {title}
      </div>
      {items.map((n) => (
        <NotificationItem key={n._id} notification={n} onMarkRead={onMarkRead} />
      ))}
    </div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [filter, setFilter]               = useState('all');

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const filtered =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const groups  = groupNotifications(filtered);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: 'var(--accent)',
                      color: 'white',
                      borderRadius: 99,
                      padding: '2px 9px',
                      fontSize: 11.5,
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
                Platform alerts, connection updates, and identity notifications.
              </p>
            </div>

            {unreadCount > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="tabs" style={{ marginBottom: 0, marginTop: 20 }}>
            {[['all', 'All'], ['unread', 'Unread']].map(([val, label]) => (
              <button
                key={val}
                className={`tab-btn${filter === val ? ' active' : ''}`}
                onClick={() => setFilter(val)}
              >
                {label}
                {val === 'unread' && unreadCount > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      background: 'var(--accent)',
                      color: 'white',
                      borderRadius: 99,
                      padding: '1px 6px',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ paddingBlock: 48, display: 'flex', justifyContent: 'center' }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BellIcon />
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="body-sm">
              {filter === 'unread'
                ? "You're all caught up."
                : 'Platform notifications will appear here.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <GroupSection title="Security Alerts"       items={groups.security} onMarkRead={markRead} />
            <GroupSection title="Today"                 items={groups.today}    onMarkRead={markRead} />
            <GroupSection title="Earlier"               items={groups.earlier}  onMarkRead={markRead} />
          </div>
        )}
      </div>
    </div>
  );
}