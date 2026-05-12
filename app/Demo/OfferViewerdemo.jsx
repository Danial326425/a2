"use client";

import { useEffect, useState } from 'react';

export default function OfferViewer({ html, css, name, slug }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f8fafc',
        }}
      >
        <div
          style={{
            padding: '20px 40px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            color: '#64748b',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="offer-page-container"
      style={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <style>{css}</style>
      <div
        className="offer-page-content"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          width: '100%',
          minHeight: '100vh',
        }}
      />
    </div>
  );
}