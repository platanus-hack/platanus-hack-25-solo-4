import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProductDetail } from "./ProductDetail";
import type { Id } from "../../convex/_generated/dataModel";

export function LatestListings() {
  const products = useQuery(api.products.getProducts, { limit: 5 });

  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | null>(null);

  if (products === undefined) {
    return <div className="h-20"></div>; 
  }

  // Filter out products that don't have the required fields
  const validProducts = products?.filter(p => 
    p.productName && 
    p.price && 
    (p.processedImageUrl || p.originalImageUrl)
  ) || [];

  if (validProducts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-6 py-12">
        <h3 className="text-center text-sm font-medium text-gray-400 mb-6 tracking-wide animate-in fade-in duration-1000">
          tus prendas podrían verse así
        </h3>
        
        <div className="flex flex-wrap justify-center gap-4">
          {validProducts.map((product, index) => (
            <div 
              key={product._id} 
              onClick={() => setSelectedProductId(product._id)}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              className={`bg-white overflow-hidden w-36 sm:w-40 animate-reveal cursor-pointer hover:opacity-80 transition-opacity ${
                index >= 4 ? 'hidden sm:block' : ''
              }`}
            >
              <div className="aspect-square relative bg-gray-100 overflow-hidden">
                <img 
                  src={product.processedImageUrl || product.originalImageUrl} 
                  alt={product.productName || "Product Image"}
                  className="object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              
              <div className="p-3 text-center">
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  {product.productName || "Item"}
                </h3>
                
                <div className="text-sm font-semibold text-gray-500 mt-0.5">
                  {product.price ? `$${product.price}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProductId && (
        <ProductDetail 
          productId={selectedProductId} 
          onClose={() => setSelectedProductId(null)} 
        />
      )}
    </>
  );
}
