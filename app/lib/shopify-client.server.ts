// Minimal Shopify Storefront API GraphQL client for Remix/TypeScript

export async function shopifyStorefrontApiClient(shop: string, accessToken?: string) {
  if (!shop) throw new Error('Shop is required');
  const token = accessToken || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!token) throw new Error('Shopify Storefront access token is required');

  return {
    async query({ data }: { data: string }) {
      const response = await fetch(`https://${shop}/api/2023-04/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({ query: data }),
      });
      if (!response.ok) {
        throw new Error(`Shopify Storefront API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    },
  };
}

// Minimal Shopify Admin API GraphQL client for Remix/TypeScript
export async function shopifyAdminApiClient(shop: string, accessToken: string) {
  if (!shop) throw new Error('Shop is required');
  if (!accessToken) throw new Error('Shopify Admin access token is required');

  return {
    async query({ data }: { data: string }) {
      const response = await fetch(`https://${shop}/admin/api/2023-04/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query: data }),
      });
      if (!response.ok) {
        throw new Error(`Shopify Admin API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    },
  };
} 