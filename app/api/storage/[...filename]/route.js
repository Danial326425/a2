import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request, { params }) {
  const { filename } = await params;
  const path = Array.isArray(filename) ? filename.join('/') : filename;
  const imageUrl = `${BACKEND_URL}/storage/${path}`;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return new NextResponse('Image not found', { status: 404 });
  }
}