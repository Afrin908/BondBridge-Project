import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/axios';

// ── Icons ─────────────────────────────────────────────────────
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const getInitials = (name) =>
  (name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

function timeStr(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function Chat() {
  const { user } = useAuth();

  const [connections,  setConnections]  = useState([]);
  const [activeConn,   setActiveConn]   = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [newMsg,       setNewMsg]       = useState('');
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const [sending,      setSending]      = useState(false);

  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

// ── Fetch connections ─────────────────────────────────────
useEffect(() => {
  API.get('/match/connections')
    .then(({ data }) => {
      const rawConnections = Array.isArray(data) ? data : [];

      const userConnections = rawConnections
        .map((connection) => ({
          ...connection.user,
          matchId: connection.matchId,
          matchedAt: connection.matchedAt,
        }))
        .filter((connection) => connection?._id);

      setConnections(userConnections);

      const params = new URLSearchParams(window.location.search);
      const userIdFromUrl = params.get('with');

      if (userIdFromUrl) {
        const found = userConnections.find((conn) => conn._id === userIdFromUrl);
        if (found) setActiveConn(found);
      }
    })
    .catch((err) => {
      console.error('Failed to load connections:', err);
      setConnections([]);
    });
}, []);

  // ── Fetch messages for active conversation ────────────────
  const fetchMessages = async (connUser) => {
    if (!connUser) return;
    setLoadingMsgs(true);
    try {
      const { data } = await API.get(`/messages/${connUser._id}`);
      setMessages(Array.isArray(data) ? data : data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

useEffect(() => {
  if (!activeConn?._id) return;

  fetchMessages(activeConn);

  // Poll every 5s
  pollRef.current = setInterval(() => {
    fetchMessages(activeConn);
  }, 5000);

  return () => clearInterval(pollRef.current);
}, [activeConn?._id]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConn || sending) return;

    setSending(true);
    const content = newMsg.trim();
    setNewMsg('');

    // Optimistic
    setMessages((prev) => [
      ...prev,
      {
        _id: `temp-${Date.now()}`,
        content,
        sender: user._id,
        createdAt: new Date().toISOString(),
        _temp: true,
      },
    ]);

    try {
      await API.post('/messages/send', {
  receiverId: activeConn._id,
  content,
});
      await fetchMessages(activeConn);
    } catch {
      setMessages((prev) => prev.filter((m) => !m._temp));
    } finally {
      setSending(false);
    }
  };

  const selectConn = (conn) => {
    setActiveConn(conn);
    setMessages([]);
  };

  return (
    <div className="page-wrapper" style={{ padding: 0 }}>
      <div className="container" style={{ paddingBlock: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: 0,
            height: 'calc(100vh - var(--nav-h) - 48px)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            minHeight: 500,
          }}
        >
          {/* ── Sidebar: Connection list ───────────────────── */}
          <div
            style={{
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Sidebar header */}
            <div
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Secure Messages
              </span>
            </div>

            {/* Connection list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {connections.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}>
                  <div className="empty-state-icon" style={{ marginBottom: 8 }}>
                    <MessageIcon />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                    No connections yet. Accept a connection request to start messaging.
                  </p>
                </div>
              ) : (
                connections.map((conn) => {
                  const isActive = activeConn?._id === conn._id;
                  return (
                    <div
                      key={conn._id}
                      onClick={() => selectConn(conn)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '13px 16px',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        background: isActive ? 'var(--bg-subtle)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                        transition: 'background 0.12s',
                      }}
                    >
                      <div className="avatar avatar-md" style={{ background: 'var(--bg-subtle)', fontWeight: 600 }}>
                        {conn.photo
                          ? <img src={conn.photo} alt="" />
                          : getInitials(conn.name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conn.name || 'BondBridge User'}
                        </div>
                        {conn.location && (
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                            {conn.location}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Main conversation panel ────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!activeConn ? (
              /* Empty state */
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: 48,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    marginBottom: 4,
                  }}
                >
                  <MessageIcon />
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Select a conversation
                </p>
                <p className="body-sm" style={{ maxWidth: 280 }}>
                  Private communication is available only after mutual connection approval.
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    color: 'var(--text-muted)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 99,
                    padding: '4px 12px',
                    marginTop: 4,
                  }}
                >
                  <LockIcon />
                  End-to-end secured messaging
                </div>
              </div>
            ) : (
              <>
                {/* Conversation header */}
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar avatar-md" style={{ background: 'var(--bg-subtle)', fontWeight: 600 }}>
                      {activeConn.photo
                        ? <img src={activeConn.photo} alt="" />
                        : getInitials(activeConn.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {activeConn.name || 'BondBridge User'}
                      </div>
                      {activeConn.location && (
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {activeConn.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11.5,
                      color: 'var(--text-muted)',
                    }}
                  >
                    <LockIcon />
                    Secure channel
                  </div>
                </div>

                {/* Messages */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {loadingMsgs ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 32 }}>
                      <div className="spinner" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 32 }}>
                      <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
                        No messages yet. Send the first message.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender === user._id || msg.sender?._id === user._id;
                      return (
                        <div
                          key={msg._id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMine ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div className={`message-bubble ${isMine ? 'sent' : 'received'}`} style={{ opacity: msg._temp ? 0.65 : 1 }}>
                            {msg.content}
                          </div>
                          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4, paddingInline: 4 }}>
                            {timeStr(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSend}
                  style={{
                    padding: '14px 20px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <input
                    className="form-input"
                    style={{ flex: 1, height: 42, borderRadius: 'var(--radius-xs)' }}
                    placeholder="Write a message…"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    disabled={sending}
                    maxLength={2000}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={!newMsg.trim() || sending}
                    style={{
                      width: 42,
                      height: 42,
                      padding: 0,
                      borderRadius: 'var(--radius-xs)',
                      flexShrink: 0,
                    }}
                  >
                    {sending ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <SendIcon />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}