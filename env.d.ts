/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

interface ImportMetaEnv {
  readonly SHOPIFY_API_KEY: string;
  readonly SHOPIFY_API_SECRET: string;
  readonly SHOPIFY_APP_URL: string;
  readonly SCOPES: string;
  readonly HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
