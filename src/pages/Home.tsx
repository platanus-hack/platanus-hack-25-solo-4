import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SellerOnboarding } from "../components/SellerOnboarding";

import { LatestListings } from "../components/LatestListings";

export function Home() {
  const [handle, setHandle] = useState("");
  const [showSeller, setShowSeller] = useState(false);
  const [sellerHandle, setSellerHandle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createRequest = useMutation(api.requests.create);
  const scrapeInstagram = useAction(api.actions.scrapeInstagram);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      const cleanHandle = handle.replace('@', '').trim();
      setIsLoading(true);
      
      try {
        // 1. Create Request Record
        const requestId = await createRequest({ handle: cleanHandle });
        
        // 2. Trigger Scraping Action
        // We don't await this full process to finish before navigating, 
        // or we can, depending on UX preference. 
        // For "instant" feel, we navigate and let it load in background.
        // But since the profile page depends on data, maybe we start it and navigate.
        scrapeInstagram({ requestId, handle: cleanHandle }).catch(console.error);
        
        navigate(`/${cleanHandle}`);
      } catch (error) {
        console.error("Failed to start ingestion:", error);
        // Navigate anyway so they see the empty state or previous results
        navigate(`/${cleanHandle}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 flex flex-col pt-20">
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
        <div className="max-w-4xl text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-none sm:leading-tight">
                tus fotos viven en instagram. <br className="hidden md:block" />
                <span className="italic">tu catálogo empieza aquí.</span>
            </h1>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto w-full flex gap-2 flex-col">
                <input 
                    type="text" 
                    placeholder="@usuario"  
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-transparent focus:ring-2 focus:ring-black outline-none transition text-lg"
                    disabled={isLoading}
                />
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 text-black font-semibold hover:opacity-70 transition text-xl whitespace-nowrap mx-auto underline underline-offset-4 disabled:opacity-50"
                >
                    {isLoading ? "cargando..." : "empecemos \u2192"}
                </button>
            </form>
        </div>

        <LatestListings />

        {showSeller && (
          <div className="mt-12 p-6 bg-gray-50 w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-4">Connect Your Store</h2>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="@yourhandle" 
                value={sellerHandle}
                onChange={(e) => setSellerHandle(e.target.value)}
                className="flex-1 px-4 py-2 rounded border"
              />
            </div>
            {sellerHandle && <SellerOnboarding handle={sellerHandle} />}
          </div>
        )}
      </main>
    </div>
  );
}
