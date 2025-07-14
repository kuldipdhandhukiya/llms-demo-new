// app/routes/api.shopify-data.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import prisma from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Get authenticated session
    const { session } = await authenticate.admin(request);
    if (!session || !session.shop) {
      return redirect("/auth/login");
    }
    const shop = session.shop;
    // Fetch all resources from DB for this shop
    const products = await prisma.product.findMany({ where: { shop } });
    const collections = await prisma.collection.findMany({ where: { shop } });
    const pages = await prisma.page.findMany({ where: { shop } });
    const blogPosts = await prisma.blogPost.findMany({ where: { shop } });
    return json({ products, collections, pages, blogPosts });
  } catch (error: any) {
    // Improved error handling
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "object" && error !== null && "status" in error) {
      message = `HTTP error: ${(error as any).status}`;
      if ((error as any).status === 302 && (error as any).headers?.get("Location")) {
        message += ` (redirected to ${(error as any).headers.get("Location")})`;
      }
    } else if (typeof error === "string") {
      message = error;
    }
    console.error("API Error in /api/shopify-data:", error);
    return json({ error: "Failed to fetch Shopify data: " + message }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Get authenticated session
    const { admin, session } = await authenticate.admin(request);
    
    if (!session) {
      return json({ error: "No active session found" }, { status: 401 });
    }

    // Fetch products using GraphQL
    const response = await admin.graphql(`
      {
        products(first: 25) {
          nodes {
            id
            title
            handle
            variants(first: 1) {
              nodes {
                price
                compareAtPrice
              }
            }
            publishedAt
            updatedAt
          }
        }
        collections(first: 25) {
          nodes {
            id
            title
            handle
            productsCount {
              count
            }
            updatedAt
          }
        }
        pages(first: 25) {
          nodes {
            id
            title
            handle
            updatedAt
          }
        }
        blogs(first: 10) {
          nodes {
            id
            title
            handle
            articles(first: 25) {
              nodes {
                id
                title
                handle
                publishedAt
              }
            }
          }
        }
      }
    `);

    const result = await response.json();
    
    const products = result.data.products.nodes.map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      price: p.variants.nodes[0]?.price,
      compare_at_price: p.variants.nodes[0]?.compareAtPrice,
      published_at: p.publishedAt,
      updated_at: p.updatedAt,
    }));

    const collections = result.data.collections.nodes.map((c: any) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
      products_count: c.productsCount?.count,
      updated_at: c.updatedAt,
    }));

    const pages = result.data.pages.nodes.map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      updated_at: p.updatedAt,
    }));

    const blogs = result.data.blogs.nodes.map((b: any) => ({
      id: b.id,
      title: b.title,
      handle: b.handle,
      articles: b.articles.nodes.map((a: any) => ({
        id: a.id,
        title: a.title,
        handle: a.handle,
        published_at: a.publishedAt,
      })),
    }));

    return json({ products, collections, pages, blogs });
  } catch (error: any) {
    console.error("API Error in /api/shopify-data POST:", error);
    return json({ error: "Failed to fetch Shopify data: " + error.message }, { status: 500 });
  }
};
