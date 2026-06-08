import Link from 'next/link';
import Image from 'next/image';
import { config } from "@/config/config";

export default function SearchResults({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-4">
        <p className="text-gray-500 text-center">No products found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={`/api/storage/${product.image}`}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 200px"
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-800 truncate group-hover:text-green-600">
                {product.name}
              </h3>
              {product.price && (
                <p className="text-green-600 font-semibold mt-1">
                  ৳{product.price}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}