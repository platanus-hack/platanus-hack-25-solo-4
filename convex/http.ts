import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/mercadopago/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // This is the handle

    if (!code || !state) {
      return new Response("Missing code or state", { status: 400 });
    }

    try {
      await ctx.runAction(internal.mercadopago.exchangeCode, {
        code,
        handle: state,
      });
      
      // Redirect to frontend success page
      // We assume the frontend is served from the same domain or we know the URL.
      // For now, we'll redirect to the root with a query param.
      // Adjust this URL if your frontend is hosted elsewhere (e.g. during dev).
      
      // In production (Convex hosting), the frontend might be separate (Vercel).
      // We should probably redirect to the REFERER or a known frontend URL.
      // But since we don't have the frontend URL in env, we'll try a relative redirect 
      // which works if served from same origin, or absolute if we knew it.
      
      // Ideally, passed in state or env var. 
      // For this implementation, I will assume a standard Vercel deployment or localhost.
      // Let's redirect to a simple HTML success page served by this action or a known URL.
      
      return new Response(null, {
        status: 302,
        headers: { Location: `/?connected=true&handle=${state}` },
      });

    } catch (e) {
      console.error(e);
      return new Response("Error exchanging code: " + String(e), { status: 500 });
    }
  }),
});

export default http;

