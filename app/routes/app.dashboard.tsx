console.log('--- TOP OF app/routes/app.dashboard.tsx FILE ---');
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import MDash from '~/components/MainDashboard';
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    console.log('--- DASHBOARD LOADER STARTED ---');
    const { session } = await authenticate.admin(request);
    console.log('Session:', session);
    let productCount = 0;
    let collectionCount = 0;
    let pageCount = 0;
    let blogPostCount = 0;
    let isFetching = true;

    try {
      const shop = session.shop;
      const accessToken = session.accessToken;
      const apiVersion = "2023-10";

      console.log('About to fetch product count', { shop, accessToken, apiVersion });
      // Helper to fetch count from REST endpoint with logging
      async function fetchCount(endpoint: string) {
        console.log('Calling fetchCount for', endpoint);
        const url = `https://${shop}/admin/api/${apiVersion}/${endpoint}`;
        const res = await fetch(url, {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        console.log('Fetch', endpoint, 'response:', data);
        return data.count || 0;
      }

      productCount = await fetchCount("products/count.json");
      collectionCount = await fetchCount("custom_collections/count.json");
      pageCount = await fetchCount("pages/count.json");
      blogPostCount = await fetchCount("blogs/count.json");
      isFetching = false;
      // Log the final counts
      console.log({ productCount, collectionCount, pageCount, blogPostCount });
    } catch (e) {
      isFetching = false;
      console.log('Shopify API error:', e);
      productCount = 0;
      collectionCount = 0;
      pageCount = 0;
      blogPostCount = 0;
    }
    return json({
      shop: session.shop,
      productCount,
      collectionCount,
      pageCount,
      blogPostCount,
      isFetching
    });
  } catch (e) {
    console.log('LOADER TOP-LEVEL ERROR:', e);
    throw e;
  }
}

export default function DashboardRoute() {
  const { shop, productCount, collectionCount, pageCount, blogPostCount, isFetching } = useLoaderData<typeof loader>();
  return <MDash shop={shop} productCount={productCount} collectionCount={collectionCount} pageCount={pageCount} blogPostCount={blogPostCount} isFetching={isFetching} />;
}
