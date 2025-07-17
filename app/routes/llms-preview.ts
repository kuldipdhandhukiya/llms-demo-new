import type { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shopParam = url.searchParams.get('shop');
  if (!shopParam) {
    return new Response("Shop parameter is required", { status: 400 });
  }

  // Storefront API endpoint and token
  const STOREFRONT_API_TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN!;
  const STOREFRONT_API_URL = `https://${shopParam}/api/2023-10/graphql.json`;

  // Storefront API GraphQL query (fix MoneyV2 fields)
  const query = `
    {
      products(first: 25) {
        edges {
          node {
            title
            handle
            onlineStoreUrl
            vendor
            tags
            publishedAt
            updatedAt
            variants(first: 1) {
              edges {
                node {
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                }
              }
            }
          }
        }
      }
      collections(first: 25) {
        edges {
          node {
            title
            handle
            id
            updatedAt
          }
        }
      }
      pages(first: 25) {
        edges {
          node {
            title
            handle
            id
            updatedAt
          }
        }
      }
      blogs(first: 10) {
        edges {
          node {
            title
            handle
            id
            articles(first: 25) {
              edges {
                node {
                  title
                  handle
                  id
                  publishedAt
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(STOREFRONT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_API_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  if (!result.data) {
    return new Response(
      "Error: " + (result.errors ? JSON.stringify(result.errors) : "No data returned from Storefront API"),
      { status: 500 }
    );
  }

  // Helper to extract Shopify numeric ID from gid
  const extractId = (gid: string) => gid ? gid.split('/').pop() : '';

  // Transform data for llms.txt
  const products = result.data.products.edges.map((e: any) => e.node);
  const collections = result.data.collections.edges.map((e: any) => e.node);
  const pages = result.data.pages.edges.map((e: any) => e.node);
  const blogs = result.data.blogs.edges.map((e: any) => ({
    ...e.node,
    articles: e.node.articles.edges.map((a: any) => a.node),
  }));

  const lines: string[] = [
    `# ${shopParam} — AI Index`,
    ``,
    `## Products`,
    ...products.map((p: any) => {
      const variant = p.variants?.edges?.[0]?.node || {};
      const price = variant.price ? variant.price.amount : '';
      const compareAtPrice = variant.compareAtPrice ? variant.compareAtPrice.amount : '';
      return `- [${p.title}](${p.onlineStoreUrl || `https://${shopParam}/products/${p.handle}`}):` +
        ` | price ${price}` +
        (compareAtPrice ? ` | compare at price ${compareAtPrice}` : '') +
        (p.vendor ? ` | vendor ${p.vendor}` : '') +
        (p.tags && p.tags.length ? ` | tags ${p.tags.join(', ')}` : '') +
        ` | published ${p.publishedAt}` +
        ` | updated ${p.updatedAt}`;
    }),
    ``,
    `## Collections`,
    ...collections.map((c: any) =>
      `- [${c.title}](https://${shopParam}/collections/${c.handle}): | handle ${c.handle} | updated ${c.updatedAt}`
    ),
    ``,
    `## Pages`,
    ...pages.map((p: any) =>
      `- [${p.title}](https://${shopParam}/pages/${p.handle}): | updated ${p.updatedAt}`
    ),
    ``,
    `## Blogs`,
    ...blogs.map((b: any) => (
      `- [${b.title}](https://${shopParam}/blogs/${b.handle}): | handle ${extractId(b.handle)} | ${b.articles.length} articles` +
      (b.articles.length
        ? '\n' + b.articles.map((a: any) =>
            `  - [${a.title}](https://${shopParam}/blogs/${b.handle}/${a.handle}): | handle ${extractId(a.handle)} | published: ${a.publishedAt}`
          ).join('\n')
        : '')
    )),
    ``,
    `## Optional`,
    `- [robots.txt](https://${shopParam}/robots.txt)`,
    `- [sitemap.xml](https://${shopParam}/sitemap.xml)`,
  ];

  const content = lines.join('\n');
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    }
  });
};