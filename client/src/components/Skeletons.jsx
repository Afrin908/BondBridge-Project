export function ProfileCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton skeleton-line medium" />
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line long" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '1rem',
            padding: '0.75rem 0',
          }}
        >
          <div className="skeleton skeleton-line long" />
          <div className="skeleton skeleton-line medium" />
          <div className="skeleton skeleton-line medium" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="skeleton skeleton-line medium" style={{ height: 28, maxWidth: 360 }} />
      <div className="skeleton skeleton-line long" style={{ maxWidth: 520 }} />
    </div>
  );
}
