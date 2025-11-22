import { useParams, Link } from "react-router-dom";
import { ProductGrid } from "../components/ProductGrid";

export function Profile() {
  const { handle } = useParams<{ handle: string }>();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-tight">
            vitrina
          </Link>
          <div className="font-medium text-gray-600 dark:text-gray-400">
             @{handle}
          </div>
        </div>
      </header>

      <main>
        <ProductGrid handle={handle} />
      </main>
    </div>
  );
}

