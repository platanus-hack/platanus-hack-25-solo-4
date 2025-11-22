import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SellerOnboarding } from "../components/SellerOnboarding";

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
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      <header className="py-6 px-6 text-center relative">
        <div className="font-bold text-xl tracking-tight">
            vitrina
        </div>
        
        <button 
          onClick={() => setShowSeller(!showSeller)} 
          className="absolute top-6 right-6 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
        >
          {showSeller ? "Close" : "Sell"}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
        <div className="max-w-3xl text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight text-balance">
                tus fotos viven en instagram. <br className="hidden md:block" />
                <span className="text-gray-400 dark:text-gray-600">tu catálogo empieza aquí.</span>
            </h1>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto w-full flex gap-3 flex-col">
                <input 
                    type="text" 
                    placeholder="@usuario" 
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition text-lg"
                    disabled={isLoading}
                />
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 text-black dark:text-white font-medium hover:opacity-70 transition text-lg whitespace-nowrap mx-auto underline underline-offset-4 disabled:opacity-50"
                >
                    {isLoading ? "cargando..." : "empecemos \u2192"}
                </button>
            </form>
        </div>

        {showSeller && (
          <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-4">Connect Your Store</h2>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="@yourhandle" 
                value={sellerHandle}
                onChange={(e) => setSellerHandle(e.target.value)}
                className="flex-1 px-4 py-2 rounded border dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            {sellerHandle && <SellerOnboarding handle={sellerHandle} />}
          </div>
        )}
      </main>
    </div>
  );
}
