import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session || !session.shop) {
    return json({ error: "No active session found" }, { status: 401 });
  }
  const progress = session.productSyncProgress || { fetched: 0, total: 0 };
  const error = session.productSyncError || null;
  return json({ progress, error });
}; 