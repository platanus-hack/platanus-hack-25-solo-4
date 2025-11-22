import { useState } from 'react'
import { SearchComponent } from './components/SearchComponent'
import { ProductGrid } from './components/ProductGrid'
import { SellerOnboarding } from './components/SellerOnboarding'
import './App.css'

function App() {
  const [showSeller, setShowSeller] = useState(false);
  const [sellerHandle, setSellerHandle] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="py-12 px-6 text-center relative">
        <button 
          onClick={() => setShowSeller(!showSeller)} 
          className="absolute top-4 right-4 text-sm text-blue-600 hover:underline"
        >
          {showSeller ? "Close Seller Mode" : "For Sellers"}
        </button>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Vitrina
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Turn any Instagram feed into a shoppable catalog instantly.
        </p>

        {showSeller && (
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto border border-blue-100 dark:border-blue-900">
            <h2 className="text-xl font-semibold mb-4">Connect Your Store</h2>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="@yourhandle" 
                value={sellerHandle}
                onChange={(e) => setSellerHandle(e.target.value)}
                className="flex-1 px-4 py-2 rounded border dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            {sellerHandle && <SellerOnboarding handle={sellerHandle} />}
          </div>
        )}
      </header>

      <main className="container mx-auto pb-20">
        <section className="mb-12">
          <SearchComponent />
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold text-center mb-8">Recent Products</h2>
          <ProductGrid />
        </section>
      </main>

      <footer className="text-center py-8 text-sm text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800">
        <p>Built with Convex, Gemini 3 Pro, and Nano Banana.</p>
      </footer>
      </div>
  )
}

export default App
