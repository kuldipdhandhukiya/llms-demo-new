import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import MDash from '~/components/MainDashboard';


import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
}

export default function DashboardRoute() {
  const { shop } = useLoaderData<typeof loader>();
  return <MDash shop={shop} />;
}
