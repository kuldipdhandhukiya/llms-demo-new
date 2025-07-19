import { authenticate } from "~/shopify.server";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { sessionToken } = await authenticate.sessionToken(request);
  return json({ sessionToken });
};
