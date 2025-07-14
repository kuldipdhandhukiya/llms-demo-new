import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, Button, TextField, BlockStack, List } from "@shopify/polaris";

import { login } from "../../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <BlockStack gap="400">
                <div>
                  <Text variant="headingLg" as="h1">
                    A short heading about [your app]
                  </Text>
                  <Text variant="bodyMd" as="p">
                    A tagline about [your app] that describes your value proposition.
                  </Text>
                </div>
                
                {showForm && (
                  <Form method="post" action="/auth/login">
                    <BlockStack gap="300">
                      <TextField
                        label="Shop domain"
                        name="shop"
                        placeholder="e.g: my-shop-domain.myshopify.com"
                        autoComplete="off"
                      />
                      <Button submit variant="primary">
                        Log in
                      </Button>
                    </BlockStack>
                  </Form>
                )}
                
                <List type="bullet">
                  <List.Item>
                    <Text variant="bodyMd" as="span">
                      <strong>Product feature</strong>. Some detail about your feature and
                      its benefit to your customer.
                    </Text>
                  </List.Item>
                  <List.Item>
                    <Text variant="bodyMd" as="span">
                      <strong>Product feature</strong>. Some detail about your feature and
                      its benefit to your customer.
                    </Text>
                  </List.Item>
                  <List.Item>
                    <Text variant="bodyMd" as="span">
                      <strong>Product feature</strong>. Some detail about your feature and
                      its benefit to your customer.
                    </Text>
                  </List.Item>
                </List>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
