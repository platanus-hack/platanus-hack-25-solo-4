import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export function SellerOnboarding({ handle }: { handle: string }) {
  const getAuthUrl = useAction(api.mercadopago.getAuthUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await getAuthUrl({ handle });
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError("Failed to generate auth URL. check env vars.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-2">Sell on Vitrina</h3>
      <p className="text-sm mb-4 text-gray-600">
        Connect your Mercado Pago account to receive payments directly when users buy your items.
      </p>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleConnect}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Connect Mercado Pago"}
      </button>
    </div>
  );
}

