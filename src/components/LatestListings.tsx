import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ProductDetail } from "./ProductDetail";

export function LatestListings() {
  const products = useQuery(api.products.getProducts, { limit: 5 });
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | null>(null);

  if (products === undefined) {
    return <div className="h-20"></div>; 
  }

  if (products.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto px-6 py-12">
        <div className="text-gray-500 text-center">No listings found yet.</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-wrap justify-center gap-6">
        {products.map((product, index) => (
          <div 
            key={product._id} 
            onClick={() => setSelectedProductId(product._id)}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer group w-full sm:w-72 md:w-56 ${
              index >= 3 ? 'hidden md:block' : ''
            }`}
          >
            <div className="aspect-square relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
              <img 
                src={product.processedImageUrl || product.originalImageUrl} 
                alt={product.productName || "Product Image"}
                className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
              />
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                {product.productName || "Unknown Product"}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {product.price ? `$${product.price}` : "N/A"}
                </span>
                {product.size && (
                   <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                     {product.size}
                   </span>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                via @{product.handle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProductId && (
        <ProductDetail 
          productId={selectedProductId} 
          onClose={() => setSelectedProductId(null)} 
        />
      )}
    </div>
  );
}

