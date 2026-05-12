import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
      }}
    >
      <h1
        style={{
          fontSize: '4rem',
          fontWeight: '800',
          color: '#1e293b',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#475569',
          marginBottom: '24px',
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: '#64748b',
          marginBottom: '32px',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '500',
          transition: 'background 0.2s',
        }}
      >
        Go Home
      </Link>
    </div>
  );
}