import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Inline SVG Icons ──────────────────────────────────────────
const ShieldIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const UserCheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <polyline points="16 11 18 13 22 9"/>
  </svg>
);

const LockIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ZapIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const AlertOctagonIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const GitMergeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
    <path d="M6 21V9a9 9 0 0 0 9 9"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Mock Dashboard Visual ─────────────────────────────────────
function HeroDashboard() {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        maxWidth: 540,
        width: '100%',
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {['#FF5F57','#FEBC2E','#28C840'].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ marginLeft: 12, fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          bondbridge.app — Trust Center
        </span>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top row — stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'Verified Users',   value: '2,841',  up: true  },
            { label: 'Trust Score',      value: '94.2',   up: true  },
            { label: 'Active Reviews',   value: '17',     up: false },
          ].map(({ label, value, up }) => (
            <div
              key={label}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 12px',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              <div style={{
                marginTop: 6,
                fontSize: 9.5,
                fontWeight: 600,
                color: up ? 'var(--success)' : 'var(--warning)',
              }}>
                {up ? '▲ +3.2%' : '▼ –1.1%'}
              </div>
            </div>
          ))}
        </div>

        {/* Identity verification queue */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '10px 16px',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            Verification Queue
          </div>

          {[
            { name: 'R. Chowdhury', status: 'Pending',  color: 'var(--warning)',  bg: 'var(--warning-bg)' },
            { name: 'S. Ahmed',     status: 'Approved', color: 'var(--success)', bg: 'var(--success-bg)' },
            { name: 'T. Islam',     status: 'Pending',  color: 'var(--warning)',  bg: 'var(--warning-bg)' },
          ].map(({ name, status, color, bg }) => (
            <div
              key={name}
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)',
                fontSize: 12.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>
                  {name[0]}
                </div>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{name}</span>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 600, background: bg, color: color, padding: '3px 8px', borderRadius: 99 }}>
                {status}
              </span>
            </div>
          ))}
        </div>

        {/* Visibility controls row */}
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Visibility Controls
          </div>
          {[
            { label: 'Photo visible to connections only', on: true  },
            { label: 'Full name hidden from public',       on: true  },
            { label: 'Contact info — verified only',       on: false },
          ].map(({ label, on }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <div style={{
                width: 32,
                height: 18,
                borderRadius: 99,
                background: on ? 'var(--accent)' : 'var(--border)',
                position: 'relative',
                flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute',
                  top: 2,
                  left: on ? 14 : 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Feature sections data ─────────────────────────────────────
const features = [
  {
    id: 'verification',
    icon: <UserCheckIcon size={22} />,
    label: 'Identity Verification',
    title: 'Every profile, verified by a human.',
    body: 'BondBridge requires NID document submission and manual admin review before granting a verified badge. Fake profiles and synthetic identities are prevented at the platform layer — not by community reporting.',
    points: [
      'NID document submission',
      'Manual admin review queue',
      'Verified identity badge',
      'Fake profile prevention',
    ],
    align: 'left',
  },
  {
    id: 'privacy',
    icon: <LockIcon size={22} />,
    label: 'Visibility Infrastructure',
    title: 'Your data, on your terms.',
    body: 'Granular visibility controls let you decide exactly who sees your photo, contact details, or full name. Sensitive information can be gated to mutual connections or verified users only.',
    points: [
      'Photo visibility controls',
      'Contact info gating',
      'Full-name privacy toggle',
      'Verified-only access mode',
    ],
    align: 'right',
  },
  {
    id: 'collaboration',
    icon: <ZapIcon size={22} />,
    label: 'Collaboration Intelligence',
    title: 'Structured scoring. Not guesswork.',
    body: 'A professional discovery engine helps surface relevant employees, clients, and collaborators by role, skills, department, organization, visibility settings, and verification status.',
    points: [
      'Multi-factor scoring model',
      'Skills and expertise signals',
      'Education & location signals',
      'Verified status weighting',
    ],
    align: 'left',
  },
  {
    id: 'trust',
    icon: <AlertOctagonIcon size={22} />,
    label: 'Trust & Safety',
    title: 'A moderation layer built in.',
    body: 'Platform-native reporting, blocking, admin moderation, and user suspension tools give both users and administrators the controls needed to maintain a safe, trustworthy environment.',
    points: [
      'Structured reporting system',
      'User blocking & privacy',
      'Admin moderation workspace',
      'Suspension & review tools',
    ],
    align: 'right',
  },
];

// ── Workflow steps ────────────────────────────────────────────
const workflowSteps = [
  { n: '01', title: 'Create Account',          body: 'Register with your email and complete your identity profile.' },
  { n: '02', title: 'Submit Verification',     body: 'Upload your NID document for admin review and trust scoring.' },
  { n: '03', title: 'Discover Professionals',    body: 'Browse verified professional profiles using organization, department, role, and skills filters.' },
  { n: '04', title: 'Send Connection Request', body: 'Initiate a verified connection request to start the professional connection.' },
  { n: '05', title: 'Mutual Acceptance',       body: 'Both parties accept before private messaging is unlocked.' },
  { n: '06', title: 'Secure Messaging',        body: 'Communicate privately within the platform\'s secure message layer.' },
];

// ── FAQ ───────────────────────────────────────────────────────
const faqs = [
  {
    q: 'Is BondBridge a social or dating app?',
    a: 'No. BondBridge is a secure communication infrastructure platform focused on identity verification, visibility controls, and verified professional connections. It is designed for serious, trust-first professional discovery.',
  },
  {
    q: 'How does identity verification work?',
    a: 'Users submit an NID document which is reviewed by a platform administrator. Upon approval, a verified badge is issued. Profiles without verification are clearly distinguished.',
  },
  {
    q: 'Can I control who sees my information?',
    a: 'Yes. BondBridge provides per-field visibility controls — you can restrict your photo, contact information, and full name to connections only, verified users only, or keep them private.',
  },
  {
    q: 'When can I message someone?',
    a: 'Private messaging is unlocked only after both parties have mutually accepted a connection request. This prevents unsolicited contact.',
  },
  {
    q: 'What happens if I encounter an abusive user?',
    a: 'BondBridge has a built-in reporting and blocking system. Reports are reviewed by admin moderators who can suspend or remove accounts.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 16,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {q}
        </span>
        <div
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          +
        </div>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 20,
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

// ── useState import fix ───────────────────────────────────────
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* ════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border)',
          paddingBlock: '96px 80px',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
          }}
        >
          {/* Left */}
          <div className="animate-fade-up">
            <div className="section-label">Secure Professional Communication Infrastructure</div>

            <h1
              className="heading-xl"
              style={{ marginBottom: 24, maxWidth: 560 }}
            >
              Verified Professional Connections, Secured by Design.
            </h1>

            <p
              className="body-lg"
              style={{ marginBottom: 36, maxWidth: 460 }}
            >
              BondBridge combines identity verification, visibility controls,
              collaboration intelligence, and trust systems into one secure
              platform for meaningful verified connections.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {user ? (
                <Link to="/search">
                  <button className="btn btn-primary btn-lg">
                    Open Discovery
                    <ChevronRightIcon />
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <button className="btn btn-primary btn-lg">
                      Get Started
                      <ChevronRightIcon />
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="btn btn-secondary btn-lg">
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div
              style={{
                marginTop: 40,
                display: 'flex',
                gap: 28,
                flexWrap: 'wrap',
              }}
            >
              {[
                'Identity-verified profiles',
                'Encrypted messaging',
                'Admin-moderated platform',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 12.5,
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'var(--success-bg)',
                      border: '1px solid rgba(79,138,111,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--success)',
                    }}
                  >
                    <CheckIcon />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div
            className="animate-fade-up animate-delay-2 hide-mobile"
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <HeroDashboard />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TRUST OVERVIEW BAR
      ════════════════════════════════════════════════════ */}
      <section
        style={{
          background: 'var(--surface-dark)',
          padding: '28px 0',
          borderBottom: '1px solid var(--border-dark)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          {[
            { icon: <UserCheckIcon size={16} />, label: 'NID-verified identities' },
            { icon: <LockIcon size={16} />,      label: 'Granular visibility controls' },
            { icon: <ZapIcon size={16} />,       label: 'Collaboration intelligence' },
            { icon: <ShieldIcon size={16} />,    label: 'Admin trust & safety layer' },
            { icon: <GitMergeIcon size={16} />,  label: 'Mutual-only messaging' },
          ].map(({ icon, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: 'rgba(245,245,243,0.65)',
                fontWeight: 500,
              }}
            >
              <span style={{ color: 'var(--accent)', opacity: 0.9 }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURE SECTIONS
      ════════════════════════════════════════════════════ */}
      {features.map((f, i) => (
        <section
          key={f.id}
          id={f.id}
          className="section"
          style={{
            background: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            className="container"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 80,
              alignItems: 'center',
              direction: f.align === 'right' ? 'rtl' : 'ltr',
            }}
          >
            {/* Text */}
            <div style={{ direction: 'ltr' }} className="animate-fade-up">
              <div className="section-label">
                <span style={{ color: 'var(--accent)' }}>{f.icon}</span>
                {f.label}
              </div>
              <h2 className="heading-lg" style={{ marginBottom: 20, maxWidth: 400 }}>
                {f.title}
              </h2>
              <p className="body-md" style={{ marginBottom: 28, maxWidth: 420 }}>
                {f.body}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {f.points.map((pt) => (
                  <li
                    key={pt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 14,
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'var(--success-bg)',
                        border: '1px solid rgba(79,138,111,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--success)',
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

            {/* Visual panel */}
            <div style={{ direction: 'ltr' }}>
              <div
                style={{
                  background: i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 260,
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    background: 'var(--surface-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(245,245,243,0.6)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {/* Scaled icon */}
                  {f.id === 'verification'  && <UserCheckIcon size={36} />}
                  {f.id === 'privacy'       && <LockIcon size={36} />}
                  {f.id === 'collaboration' && <ZapIcon size={36} />}
                  {f.id === 'trust'         && <AlertOctagonIcon size={36} />}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ════════════════════════════════════════════════════
          WORKFLOW
      ════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--surface-dark)', borderBottom: '1px solid var(--border-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label" style={{ justifyContent: 'center', color: 'rgba(245,245,243,0.5)' }}>
              Platform Workflow
            </div>
            <h2 className="heading-lg" style={{ color: 'var(--text-inverse)', maxWidth: 480, margin: '0 auto' }}>
              From registration to secure connection.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 24,
            }}
          >
            {workflowSteps.map(({ n, title, body }, i) => (
              <div
                key={n}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div
                  style={{
                    background: 'var(--surface-soft)',
                    border: '1px solid var(--border-dark)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '28px 24px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--accent)',
                      letterSpacing: '0.08em',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: 12,
                    }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text-inverse)',
                      marginBottom: 8,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {title}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(245,245,243,0.55)', lineHeight: 1.6 }}>
                    {body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>FAQ</div>
            <h2 className="heading-lg">Common questions.</h2>
          </div>

          <div>
            {faqs.map((item) => (
              <FAQItem key={item.q} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════════════ */}
      {!user && (
        <section className="section" style={{ background: 'var(--bg-primary)' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: 560 }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Get started</div>
            <h2 className="heading-lg" style={{ marginBottom: 20 }}>
              Join the verified network.
            </h2>
            <p className="body-lg" style={{ marginBottom: 36 }}>
              Create your identity profile and gain access to verified
              connections, visibility controls, and the full BondBridge
              communication infrastructure.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup">
                <button className="btn btn-primary btn-xl">
                  Create Account
                  <ChevronRightIcon />
                </button>
              </Link>
              <Link to="/login">
                <button className="btn btn-secondary btn-xl">Sign In</button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <footer className="footer">
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}
            >
              BondBridge
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Secure Professional Communication Infrastructure Platform
            </span>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['Visibility Policy', 'Terms of Service', 'Trust & Safety', 'Contact'].map((item) => (
              <span
                key={item}
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {item}
              </span>
            ))}
          </div>

          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} BondBridge. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}