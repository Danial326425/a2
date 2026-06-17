import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// This route is mostly an internal hop for the Next.js image optimizer (which
// then re-encodes to WebP), plus a fallback for any <img> that points straight
// at /api/storage. We STREAM the upstream body instead of buffering the whole
// file into memory first — that shaves the optimizer's time-to-first-byte and
// keeps memory flat under many concurrent image requests.
export async function GET(request, { params }) {
  const { filename } = await params;
  const path = Array.isArray(filename) ? filename.join('/') : filename;
  const imageUrl = `${BACKEND_URL}/storage/${path}`;

  try {
    const response = await fetch(imageUrl, {
      // Let the platform cache the upstream fetch where possible.
      cache: 'force-cache',
    });
    if (!response.ok || !response.body) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const contentLength = response.headers.get('content-length');

    const headers = {
      'Content-Type': contentType,
      // Immutable: image filenames are content-addressed (never overwritten),
      // so browsers/CDN can keep them forever without revalidation.
      'Cache-Control': 'public, max-age=31536000, immutable',
    };
    if (contentLength) headers['Content-Length'] = contentLength;

    return new NextResponse(response.body, { status: 200, headers });
  } catch (error) {
    return new NextResponse('Image not found', { status: 404 });
  }
}