"use client";

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const LandingPageEditor = dynamic(() => import('../../dashboard/LandingPage/LandingPageEditor'), { ssr: false });

export default function EditorPage() {
  const params = useParams();
  const pageId = params.id;

  if (!pageId) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return <LandingPageEditor pageId={pageId} />;
}