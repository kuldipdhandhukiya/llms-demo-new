declare module "*.css";

declare module '@shopify/shopify-app-remix/server' {
  interface Session {
    productSyncProgress?: { fetched: number; total: number };
    productSyncError?: string | null;
  }
}
