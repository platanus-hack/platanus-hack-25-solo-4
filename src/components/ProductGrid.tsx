import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ProductDetail } from "./ProductDetail";

interface ProductGridProps {
  handle?: string;
}

type LoadingPhase = 'importing' | 'searching' | 'skeletons';

function SkeletonProduct() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 w-full h-full">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="flex justify-between items-center">
           <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
           <div className="h-4 bg-gray-200 rounded w-8 animate-pulse" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

function ImageWithPlaceholder({ src, alt }: { src: string, alt: string }) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-100">
       {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />}
       <img
         src={src}
         alt={alt}
         className={`object-cover w-full h-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
         onLoad={() => setLoaded(true)}
       />
    </div>
  );
}

export function ProductGrid({ handle }: ProductGridProps = {}) {
  const products = useQuery(api.products.getProductsByHandle, handle ? { handle } : "skip");
  const requestStatus = useQuery(api.requests.getRequestStatus, handle ? { handle } : "skip");
  
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('importing');

  useEffect(() => {
    setLoadingPhase('importing');
    const t1 = setTimeout(() => setLoadingPhase('searching'), 3000);
    const t2 = setTimeout(() => setLoadingPhase('skeletons'), 6000);
    
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [handle]);

  const isProductsLoading = products === undefined;
  const isStatusLoading = requestStatus === undefined;
  const isProcessing = requestStatus?.status === "pending" || requestStatus?.status === "processing";
  
  const isLoading = isProductsLoading || isStatusLoading || isProcessing;
  
  const productCount = products?.length || 0;
  
  // Calculate how many skeletons are needed to reach at least 3, but only if we are in a loading/processing state.
  // If we are done (not loading/processing), we show exactly what we have (even if 0 or 1).
  const skeletonCount = isLoading ? Math.max(0, 3 - productCount) : 0;
  
  // Only show the loading sequence if we are loading AND have no products yet AND haven't reached the skeleton phase.
  const showLoadingSequence = isLoading && productCount === 0 && loadingPhase !== 'skeletons';

  if (!isLoading && productCount === 0) {
    if (requestStatus?.status === "failed") {
         return (
            <div className="text-center py-10 text-red-500">
                Unable to process this profile. Please make sure it's public and try again.
            </div>
        );
    }

    return (
      <div className="text-center py-10 text-gray-500">
        {handle 
          ? `No products found for @${handle}` 
          : "No products found yet. Try searching for a handle!"}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {showLoadingSequence ? (
        <div className="w-full text-center py-20 animate-pulse text-gray-500 font-medium text-lg transition-opacity duration-500">
          {loadingPhase === 'importing' ? "importando tus posts..." : "buscando prendas disponibles..."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <div 
              key={product._id} 
              onClick={() => setSelectedProductId(product._id)}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition cursor-pointer group animate-in fade-in duration-500"
            >
              <div className="aspect-square relative bg-gray-100 overflow-hidden">
                <ImageWithPlaceholder 
                  src={product.processedImageUrl || product.originalImageUrl} 
                  alt={product.productName || "Product Image"}
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                  {product.productName || "Unknown Product"}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-gray-900">
                    {product.price ? `$${product.price}` : "N/A"}
                  </span>
                  {product.size && (
                     <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">
                       {product.size}
                     </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <SkeletonProduct key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {selectedProductId && (
        <ProductDetail 
          productId={selectedProductId} 
          onClose={() => setSelectedProductId(null)} 
        />
      )}
    </div>
  );
}
