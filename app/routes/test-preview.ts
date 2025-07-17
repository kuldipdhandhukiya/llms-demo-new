import type { LoaderFunctionArgs } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log("test-preview route accessed");
    
    // Get the shop from URL parameter
    const url = new URL(request.url);
    const shopParam = url.searchParams.get('shop') || 'test-shop.myshopify.com';
    
    console.log("Using shop:", shopParam);
    
    const testContent = `# ${shopParam} — Test AI Index
Generated at ${new Date().toISOString()}

This is a test llms.txt file for ${shopParam}.

## Test Products
- [Test Product](https://${shopParam}/products/test-product.md): id test-123 | price 29.99 USD | published 2024-01-01 | updated 2024-01-01

## Test Collections
- [Test Collection](https://${shopParam}/collections/test-collection.md): id test-collection-123 | 5 products | updated 2024-01-01

## Optional
- [robots.txt](https://${shopParam}/robots.txt)
- [sitemap.xml](https://${shopParam}/sitemap.xml)`;

    return new Response(testContent, {
      headers: {
        'Content-Type': 'text/plain',
      }
    });
    
  } catch (error: any) {
    console.error("Error in test-preview:", error);
    return new Response(`Test failed: ${error.message}`, { status: 500 });
  }
}; 