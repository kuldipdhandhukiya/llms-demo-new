import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session || !session.shop) {
    return json({ error: "No active session found" }, { status: 401 });
  }

  const shop = session.shop;
  const accessToken = session.accessToken;
  const apiVersion = "2023-10"; // or your preferred version

  // Helper to fetch count from REST endpoint
  async function fetchCount(endpoint: string) {
    const url = `https://${shop}/admin/api/${apiVersion}/${endpoint}`;
    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data.count || 0;
  }

  const productCount = await fetchCount("products/count.json");
  const collectionCount = await fetchCount("custom_collections/count.json");
  const pageCount = await fetchCount("pages/count.json");
  const blogPostCount = await fetchCount("blogs/count.json");
  console.log("test", productCount);
  console.log({ productCount, collectionCount, pageCount, blogPostCount });

  return json({
    productCount,
    collectionCount,
    pageCount,
    blogPostCount,
  });
};