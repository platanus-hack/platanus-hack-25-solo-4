import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function SearchComponent() {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const createRequest = useMutation(api.requests.create);
  const scrapeInstagram = useAction(api.actions.scrapeInstagram);

  // We need to use useAction for the scraper, but wait, the spec says:
  // "Phase 1: ... mutation to save a new request."
  // "Phase 1: ... Integrate Apify SDK in a Convex Action..."
  // Usually we trigger the action AFTER the mutation or FROM the mutation if it's an internal mutation.
  // BUT, client-side we can call the mutation to create the ID, then call the action.
  // OR better: The mutation schedules the action? Convex mutations can't directly call actions.
  // The spec flow implies: User inputs handle -> System scrapes.
  
  // Let's follow a robust pattern:
  // 1. User submits handle -> Call Mutation `createRequest` -> Returns `requestId`.
  // 2. Client calls Action `scrapeInstagram` with `requestId` and `handle`.
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) return;

    setStatus("submitting");
    try {
      // 1. Create Request Record
      const requestId = await createRequest({ handle });
      
      // 2. Trigger Scraping Action
      // Note: In a real production app, we might want to trigger this via a scheduler or internal mutation 
      // to ensure reliability, but calling from client is fine for this scope.
      await scrapeInstagram({ requestId, handle });
      
      setStatus("success");
      setHandle("");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="handle" className="text-lg font-medium">
          Instagram Handle
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@nikestore"
            className="flex-1 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
            disabled={status === "submitting"}
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {status === "submitting" ? "..." : "Go"}
          </button>
        </div>
        {status === "success" && (
          <p className="text-green-600 text-sm">Request started! Watch for products below.</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  );
}

import { useAction } from "convex/react";

