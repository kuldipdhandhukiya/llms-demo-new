// app/app._index.tsx
import { useSearchParams } from "@remix-run/react";
import Dashboard from "~/components/MainDashboard";

export default function AppIndex() {
  const [params] = useSearchParams();
  const shop = params.get("shop"); // no fallback, must be provided
  if (!shop) throw new Error('Missing shop parameter');

  return <Dashboard shop={shop} />;
}
