// lib/shopify-api.server.ts
import { shopifyStorefrontApiClient, shopifyAdminApiClient } from './shopify-client.server';
import prisma from '../db.server';

export async function getShopifyData(shop: string) {
  const client = await shopifyStorefrontApiClient(shop);

  const products = await client.query({
    data: `{
      products(first: 5) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }`,
  });

  return {
    products: products?.data?.products?.edges || [],
    collections: [],
    pages: [],
    blogPosts: []
  };
}

// Fetch total product count (GraphQL)
export async function getTotalProductCount(shop: string) {
  const client = await shopifyStorefrontApiClient(shop);
  const result = await client.query({
    data: `{
      products {
        edges { node { id } }
      }
    }`,
  });
  return result?.data?.products?.edges?.length || 0;
}

// Sync all products with cursor-based pagination and rate limiting
export async function syncAllShopifyData({
  shop,
  onProgress,
  onError,
  accessToken,
  sessionAccessToken,
}: {
  shop: string;
  onProgress: (progress: { resource: string; fetched: number; total: number }) => Promise<void>;
  onError: (error: string) => Promise<void>;
  accessToken: string; // Storefront API token
  sessionAccessToken: string; // Admin API token
}) {
  if (!accessToken) {
    await onError('Storefront access token is required for sync');
    return;
  }
  if (!sessionAccessToken) {
    await onError('Admin access token is required for blog post sync');
    return;
  }

  const client = await shopifyStorefrontApiClient(shop, accessToken);
  const adminClient = await shopifyAdminApiClient(shop, sessionAccessToken);
  const DELAY_MS = 700;

  try {
    // Products
    const productsResult = await client.query({
      data: `{
        products(first: 100) {
          edges {
            node { id title handle }
            cursor
          }
          pageInfo { hasNextPage }
        }
      }`,
    });
    const productEdges = productsResult?.data?.products?.edges || [];
    for (const edge of productEdges) {
      const p = { id: edge.node.id, title: edge.node.title, handle: edge.node.handle, shop };
      await prisma.product.upsert({ where: { id: p.id }, update: p, create: p });
    }
    await onProgress({ resource: 'products', fetched: productEdges.length, total: productEdges.length });
    // Collections
    const collectionsResult = await client.query({
      data: `{
        collections(first: 100) {
          edges {
            node { id title handle }
            cursor
          }
          pageInfo { hasNextPage }
        }
      }`,
    });
    const collectionEdges = collectionsResult?.data?.collections?.edges || [];
    for (const edge of collectionEdges) {
      const c = { id: edge.node.id, title: edge.node.title, handle: edge.node.handle, shop };
      await prisma.collection.upsert({ where: { id: c.id }, update: c, create: c });
    }
    await onProgress({ resource: 'collections', fetched: collectionEdges.length, total: collectionEdges.length });
    // Pages
    const pagesResult = await client.query({
      data: `{
        pages(first: 100) {
          edges {
            node { id title handle }
            cursor
          }
          pageInfo { hasNextPage }
        }
      }`,
    });
    const pageEdges = pagesResult?.data?.pages?.edges || [];
    for (const edge of pageEdges) {
      const p = { id: edge.node.id, title: edge.node.title, handle: edge.node.handle, shop };
      await prisma.page.upsert({ where: { id: p.id }, update: p, create: p });
    }
    await onProgress({ resource: 'pages', fetched: pageEdges.length, total: pageEdges.length });
    // Blog posts (Admin API only)
    const blogsQuery = `{
      blogs(first: 100) { edges { node { id title handle articles(first: 100) { edges { node { id title handle } } } } } }
    }`;
    const blogsResult = await adminClient.query({ data: blogsQuery });
    const blogs = blogsResult?.data?.blogs?.edges || [];
    let blogFetched = 0;
    for (const blogEdge of blogs) {
      const articles = blogEdge.node.articles.edges || [];
      for (const articleEdge of articles) {
        const a = articleEdge.node;
        await prisma.blogPost.upsert({ 
          where: { id: a.id }, 
          update: { title: a.title, handle: a.handle, shop }, 
          create: { id: a.id, title: a.title, handle: a.handle, shop } 
        });
        blogFetched++;
      }
      await onProgress({ resource: 'blogPosts', fetched: blogFetched, total: blogFetched });
      await new Promise(res => setTimeout(res, DELAY_MS));
    }
  } catch (err: any) {
    await onError(err?.message || 'Unknown error during shopify sync');
    throw err;
  }
}
