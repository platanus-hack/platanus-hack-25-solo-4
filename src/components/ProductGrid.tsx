import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ProductDetail } from "./ProductDetail";

interface ProductGridProps {
  handle?: string;
}

type LoadingPhase = 'search' | 'analyze' | 'reveal';

// Rotating messages component
function LoadingStatus({ phase }: { phase: LoadingPhase }) {
  const [messageIndex, setMessageIndex] = useState(0);

  const searchMessages = [
    "Buscando prendas disponibles...",
    "Escaneando tus últimos posts..."
  ];
  
  const analyzeMessages = [
    "Analizando descripciones...",
    "Detectando tallas y precios..."
  ];

  const messages = phase === 'search' ? searchMessages : analyzeMessages;

  useEffect(() => {
    // Reset index when phase changes
    setMessageIndex(0);
  }, [phase]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="w-full text-center animate-pulse">
      <p className="text-gray-500 font-medium text-lg transition-all duration-500">
        {messages[messageIndex]}
      </p>
    </div>
  );
}

// Enhanced Skeleton with phases
function MagicSkeleton({ phase }: { phase: LoadingPhase }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 w-full h-full relative">
       {/* Shimmer Effect Overlay */}
      <div className="absolute inset-0 z-10 animate-shimmer pointer-events-none" />
      
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
         {/* Optional: Icon for 'analyze' phase */}
         {phase === 'analyze' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
               <div className="w-12 h-12 bg-gray-400 rounded-full animate-pulse" />
            </div>
         )}
      </div>
      
      <div className="p-4 space-y-3">
        {/* Text lines with different pulse speeds based on phase */}
        <div className={`h-4 bg-gray-100 rounded w-3/4 ${phase === 'analyze' ? 'animate-pulse duration-700' : ''}`} />
        <div className="flex justify-between items-center">
           <div className={`h-5 bg-gray-100 rounded w-1/3 ${phase === 'analyze' ? 'animate-pulse duration-500' : ''}`} />
           <div className="h-4 bg-gray-100 rounded w-8" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

function TypewriterText({ text, delay = 0 }: { text: string, delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let timeoutId: any;
    let currentTextIndex = 0;

    const typeChar = () => {
        if (currentTextIndex < text.length) {
            currentTextIndex++;
            setDisplayedText(text.substring(0, currentTextIndex));
            
            // Add randomness to typing speed (30ms + 0-30ms random)
            const randomSpeed = 30 + Math.random() * 30;
            timeoutId = setTimeout(typeChar, randomSpeed);
        }
    };

    // Initial delay before starting
    const startTimeout = setTimeout(() => {
        typeChar();
    }, delay + 300);

    return () => {
        clearTimeout(startTimeout);
        clearTimeout(timeoutId);
    };
  }, [text, delay]);

  return (
    <span>
      {displayedText}
    </span>
  );
}

function ProductCard({ product, onClick, index = 0 }: { product: any, onClick: () => void, index?: number }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div 
            onClick={onClick}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition cursor-pointer group animate-reveal"
        >
            <div className="aspect-square relative bg-gray-50 overflow-hidden">
                <img
                    src={product.processedImageUrl || product.originalImageUrl}
                    alt={product.productName || "Product"}
                    className={`object-cover w-full h-full transition-all duration-700 ${imageLoaded ? 'image-blur-in opacity-100 scale-100' : 'opacity-0 scale-105 blur-xl'}`}
                    onLoad={() => setImageLoaded(true)}
                />
            </div>
            <div className="p-4 flex items-center justify-between">
                <div className="flex flex-col leading-tight items-start space-y-1 w-full">
                    <h3 className="text-gray-700 font-medium line-clamp-1 text-left text-sm h-5 w-full">
                        <TypewriterText text={product.productName || "Sin título"} delay={index * 100} />
                    </h3>
                    <span className="text-gray-900 font-semibold">
                        {product.price ? `$${product.price.toLocaleString()}` : "—"}
                    </span>
                </div>
                {product.size && (
                    <span className="text-xs font-medium bg-gray-50 px-2 py-1 rounded text-gray-600 border border-gray-100 shrink-0 ml-2">
                        {product.size}
                    </span>
                )}
            </div>
        </div>
    );
}

export function ProductGrid({ handle }: ProductGridProps = {}) {
  const products = useQuery(api.products.getProductsByHandle, handle ? { handle } : "skip");
  const requestStatus = useQuery(api.requests.getRequestStatus, handle ? { handle } : "skip");
  
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | null>(null);
  const [phase, setPhase] = useState<LoadingPhase>('search');
  const [showFallback, setShowFallback] = useState(false);

  // State Management
  useEffect(() => {
    // Reset if handle changes
    setPhase('search');
    setShowFallback(false);

    // Transition to 'analyze' after 3s
    const t1 = setTimeout(() => setPhase('analyze'), 3500);
    
    // Show fallback message after 12s if still loading
    const t2 = setTimeout(() => setShowFallback(true), 12000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [handle]);

  // Determine if we are effectively loading
  const isProductsLoading = products === undefined;
  const isProcessing = requestStatus?.status === "pending" || requestStatus?.status === "processing";
  const isLoading = isProductsLoading || (isProcessing && (products?.length || 0) === 0);
  
  // Switch to 'reveal' if we have products
  useEffect(() => {
      if (products && products.length > 0) {
          setPhase('reveal');
      }
  }, [products]);

  const productCount = products?.length || 0;
  
  // Minimum skeletons to keep the grid looking full during search/analyze
  // Once revealing, we show skeletons only if we expect more (processing)
  const skeletonCount = isLoading ? 8 : (isProcessing ? Math.max(0, 4 - productCount) : 0);

  if (!isLoading && productCount === 0 && !isProcessing) {
     if (requestStatus?.status === "failed") {
         return (
            <div className="text-center py-20 text-red-500 animate-in fade-in">
                <p>No pudimos procesar este perfil.</p>
                <p className="text-sm text-gray-500 mt-2">Asegúrate de que sea público.</p>
            </div>
        );
     }
    return (
      <div className="text-center py-20 text-gray-400 animate-in fade-in">
        {handle ? "No encontramos prendas en este perfil." : "Ingresa un usuario para comenzar."}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Status Area */}
      {(phase !== 'reveal' || isProcessing) && productCount === 0 && (
         <div className="flex flex-col items-center justify-center space-y-2 min-h-[40px]">
            {showFallback && phase !== 'reveal' ? (
                <p className="text-gray-500 animate-pulse text-center max-w-md">
                    Todavía falta un poco, estamos revisando tus publicaciones...
                </p>
            ) : (
                phase === 'reveal' ? (
                     <p className="text-gray-500 animate-pulse">Armando tu vitrina...</p>
                ) : (
                    <LoadingStatus phase={phase} />
                )
            )}
         </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.map((product, index) => (
          <ProductCard 
            key={product._id} 
            product={product} 
            index={index}
            onClick={() => setSelectedProductId(product._id)} 
          />
        ))}
        
        {/* Show skeletons if we are loading or still processing more items */}
        {(isLoading || isProcessing) && Array.from({ length: skeletonCount }).map((_, i) => (
          <MagicSkeleton key={`skel-${i}`} phase={phase} />
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
