// Instant transition UI for the upsell route so the redirect from the order
// page feels immediate (paints the moment navigation starts, before the page
// chunk + upsell fetch resolve).
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="text-5xl mb-4">✅</div>
      <div className="w-10 h-10 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mb-4" />
      <h2 className="text-lg font-bold text-gray-800 mb-1">অর্ডার সম্পন্ন হচ্ছে…</h2>
      <p className="text-sm text-gray-500">একটু অপেক্ষা করুন।</p>
    </div>
  );
}
