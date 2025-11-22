import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface ProductDetailProps {
  productId: Id<"products">;
  onClose: () => void;
}

export function ProductDetail({ productId, onClose }: ProductDetailProps) {
  const product = useQuery(api.products.getProduct, { id: productId });

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition z-10"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-900 relative">
             <img 
                src={product.processedImageUrl || product.originalImageUrl} 
                alt={product.productName || "Product"}
                className="object-contain w-full h-full"
              />
          </div>

          {/* Info Section */}
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.productName || "Untitled Product"}
            </h2>
            
            {product.size && (
              <div className="mb-6">
                 <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                   Size: {product.size}
                 </span>
              </div>
            )}

            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-8">
              ${product.price}
            </div>

            <div className="space-y-4">
               {product.mercadoPagoLink && (
                 <a 
                   href={product.mercadoPagoLink}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block w-full py-3 bg-blue-600 text-white text-center font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                 >
                   Buy with Mercado Pago
                 </a>
               )}

               <a 
                 href={product.igPostUrl}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block w-full py-3 bg-transparent border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
               >
                 View Original Post on Instagram
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

