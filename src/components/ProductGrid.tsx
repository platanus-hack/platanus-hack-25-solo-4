import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ProductDetail } from "./ProductDetail";

interface ProductGridProps {
  handle?: string;
}

export function ProductGrid({ handle }: ProductGridProps = {}) {
  const products = useQuery(api.products.getProductsByHandle, handle ? { handle } : "skip");
  
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | null>(null);

  if (products === undefined) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        {handle 
          ? `No products found for @${handle}` 
          : "No products found yet. Try searching for a handle!"}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product._id} 
            onClick={() => setSelectedProductId(product._id)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer group"
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
