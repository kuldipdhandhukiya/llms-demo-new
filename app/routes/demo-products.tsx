import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("[DEMO] demo-products loader hit");
    const { admin } = await authenticate.admin(request);
    const response = await admin.graphql(`
        #graphql
        query fetchProducts {
            products(first: 10) {
                edges {
                    node {
                        id
                        title   
                        handle
                        featuredImage {
                            url
                            altText
                        }
                    }
                }
            }
        }   
        `);
    const data = (await (await response).json()).data;
    console.log(data);
    console.log("[DEMO] Products API response:", JSON.stringify(data));
    return json({ 
        products: data.products.edges,
        ok: true, 
        count: data.products.edges.length ?? 0 
    });
};

export default function DemoProducts() {
    const { products } = useLoaderData<typeof loader>();
    console.log(products);
  return <div>Check your server console for the demo products API response.</div>;
}
