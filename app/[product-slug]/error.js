'use client';

// Catches runtime errors in the product page subtree.
// Server-fetch failures end up here via notFound() → not-found.js; this handles client crashes.

import { useEffect } from 'react';

export default function ProductPageError({ error, reset }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[ProductPage] runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">কিছু একটা ভুল হয়েছে</h2>
        <p className="text-sm text-gray-600 mb-6">
          পেজটি লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            আবার চেষ্টা করুন
          </button>
          <a
            href="/"
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            হোম পেজে যান
          </a>
        </div>
      </div>
    </div>
  );
}
