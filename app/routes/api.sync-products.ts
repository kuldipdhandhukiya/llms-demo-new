import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate, sessionStorage } from "~/shopify.server";
import { syncAllShopifyData } from "~/lib/shopify-api.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session || !session.shop) {
    return json({ error: "No active session found" }, { status: 401 });
  }
  const shop = session.shop;
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const sessionAccessToken = session.accessToken;
  const sessionId = session.id;

  if (!accessToken) {
    return json({ error: "No Storefront access token found" }, { status: 401 });
  }
  if (!sessionAccessToken) {
    return json({ error: "No Admin access token found" }, { status: 401 });
  }

  // Reset progress and error
  session.productSyncProgress = { resource: 'products', fetched: 0, total: 0 };
  session.productSyncError = null;
  await sessionStorage.storeSession(session);

  // Start sync in background (fire and forget)
  (async () => {
    try {
      await syncAllShopifyData({
        shop,
        accessToken,
        sessionAccessToken,
        onProgress: async (progress) => {
          const s = await sessionStorage.loadSession(sessionId);
          if (s) {
            s.productSyncProgress = progress;
            s.productSyncError = null;
            await sessionStorage.storeSession(s);
          }
        },
        onError: async (error) => {
          const s = await sessionStorage.loadSession(sessionId);
          if (s) {
            s.productSyncError = error;
            await sessionStorage.storeSession(s);
          }
        },
      });
    } catch (error: any) {
      const s = await sessionStorage.loadSession(sessionId);
      if (s) {
        s.productSyncError = error?.message || 'Unknown sync error';
        await sessionStorage.storeSession(s);
      }
    }
  })();

  return json({ started: true }, { status: 202 });
}; 