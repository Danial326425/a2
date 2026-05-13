// Renders when fetchProduct() returns null and page.js calls notFound().

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">পণ্যটি খুঁজে পাওয়া যায়নি</h1>
        <p className="text-sm text-gray-600 mb-6">
          এই পণ্যটি সরিয়ে নেওয়া হয়েছে অথবা লিংকটি ভুল।
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          হোম পেজে ফিরে যান
        </a>
      </div>
    </div>
  );
}
