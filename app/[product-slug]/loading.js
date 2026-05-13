// Renders while the server component (page.js) is fetching the product.
// Shape mirrors the actual layout so CLS stays low.

export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <div className="h-10 sm:h-12 bg-gray-200 rounded-lg w-3/4 max-w-2xl mx-auto animate-pulse mb-4" />
          <div className="h-5 bg-gray-200 rounded w-2/3 max-w-xl mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 mb-16">
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square max-h-[600px] bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-full max-w-xl mt-6 flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded-md animate-pulse" />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-5">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="flex gap-4">
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-14 bg-gray-200 rounded-lg animate-pulse mt-6" />
          </div>
        </div>
      </main>
    </div>
  );
}
