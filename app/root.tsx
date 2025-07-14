// app/root.tsx

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";



export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  // ✅ Prevent SSR crash: only render QueryClientProvider on client
  const isClient = useRef(false);
  useEffect(() => {
    isClient.current = true;
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {isClient.current ? (
          <QueryClientProvider client={queryClient}>
            <Outlet />
          </QueryClientProvider>
        ) : (
          <Outlet /> // SSR-safe fallback
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
