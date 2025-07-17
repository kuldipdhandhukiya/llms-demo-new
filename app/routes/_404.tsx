import { useLocation } from "@remix-run/react";
import { useEffect } from "react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text variant="headingXl" as="h1" fontWeight="bold">
                404
              </Text>
              <div style={{ marginBottom: '20px' }}>
                <Text variant="headingMd" as="p">
                  Oops! Page not found
                </Text>
              </div>
              <Button url="/" variant="primary">
                Return to Home
              </Button>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default NotFound;
