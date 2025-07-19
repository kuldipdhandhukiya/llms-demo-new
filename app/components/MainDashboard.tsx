import { Page, Layout, Card, Text, Icon } from '@shopify/polaris';
import { RefreshIcon } from '@shopify/polaris-icons';
import { useShopifyData } from '~/hooks/useShopifyData';
import { useToast } from '~/hooks/use-toast';
import ContentSection from './ContentSection';
import SidebarInfo from './SidebarInfo';
// import SetupProgress from './SetupProgress';
import { useEffect, useState, useCallback } from 'react';

// Custom hook to poll sync progress
function useProductSyncProgress() {
  const [progress, setProgress] = useState({ fetched: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isMounted = true;

    async function poll() {
      try {
        const res = await fetch('/api/sync-progress');
        if (!res.ok) {
          setError(`Sync progress fetch failed: ${res.status}`);
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setProgress(data.progress);
          setError(data.error);
          setIsSyncing(data.progress.fetched > 0 && data.progress.fetched < data.progress.total);
        }
      } catch (err) {
        setError('Error fetching sync progress');
      }
    }

    poll();
    interval = setInterval(poll, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { progress, error, isSyncing };
}

interface DashboardProps {
  shop: string;
  productCount?: number;
  collectionCount?: number;
  pageCount?: number;
  blogPostCount?: number;
  isFetching?: boolean;
}

const MainDashboard = ({ shop, productCount, collectionCount, pageCount, blogPostCount, isFetching }: DashboardProps) => {
  console.log("testing", productCount);
  console.log(
    { 
      productCount, 
      collectionCount, 
      pageCount, 
      blogPostCount 
    });

  const {
    products,
    collections,
    pages,
    blogPosts,
    isLoading,
    isSetupInProgress,
    lastSyncDate
  } = useShopifyData();

  // Default to empty arrays if undefined
  const safeCollections = collections || [];
  const safePages = pages || [];
  const safeBlogPosts = blogPosts || [];

  const { toast } = useToast();
  const { progress, error, isSyncing } = useProductSyncProgress();
  const [syncing, setSyncing] = useState(false);

  // Trigger product sync
  const handleProductSync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync-products', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to start product sync');
      toast({ title: 'Sync started', description: 'Product sync has started.' });
    } catch (err: any) {
      toast({ title: 'Sync error', description: err.message, variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  }, [toast]);

  const handlePreviewLLMS = async () => {
    console.log("Button clicked!");

    if (isLoading || isSetupInProgress) {
      console.log("Sync in progress, skipping preview.");
      toast({ title: "Syncing Data", description: "Please wait...", });
      return;
    }

    if (
      products.length === 0 &&
      safeCollections.length === 0 &&
      safePages.length === 0 &&
      safeBlogPosts.length === 0
    ) {
      toast({
        title: "No Data Available",
        description: "Please sync your store data before generating the llms.txt file.",
        variant: "destructive"
      });
      return;
    }

    // ✅ Confirm this is reached
    console.log("Opening new tab...");

    window.open(`/llms-preview?shop=${shop}`, "_blank");

    toast({
      title: "Preview Generated",
      description: "The llms.txt file has been opened in a new tab.",
    });
  };

  // console.log({ isLoading, isSetupInProgress, products, collections: safeCollections, pages: safePages, blogPosts: safeBlogPosts });
  console.log({ isLoading, isSetupInProgress, productCount, collectionCount, pageCount, blogPostCount });
  return (
    <Page
      title="llms.txt Generator AI Search"
    >
      {/* Live Shopify Counts and Fetching Status */}
      {(typeof productCount === 'number' || typeof collectionCount === 'number' || typeof pageCount === 'number' || typeof blogPostCount === 'number') && (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          {typeof productCount === 'number' && (
            <Text variant="headingMd" as="span">
              Products: {productCount}
            </Text>
          )}
          {typeof collectionCount === 'number' && (
            <><span style={{ margin: '0 8px' }}></span><Text variant="headingMd" as="span">
              Collections: {collectionCount}
            </Text></>
          )}
          {typeof pageCount === 'number' && (
            <><span style={{ margin: '0 8px' }}></span><Text variant="headingMd" as="span">
              Pages: {pageCount}
            </Text></>
          )}
          {typeof blogPostCount === 'number' && (
            <><span style={{ margin: '0 8px' }}></span><Text variant="headingMd" as="span">
              Blog Posts: {blogPostCount}
            </Text></>
          )}
          {isFetching && (
            <span style={{ marginLeft: 12, color: '#888', fontSize: '14px' }}>
              (Fetching...)
            </span>
          )}
        </div>
      )}
      <Layout>
        {/* Generate llms.txt Button */}
        <Layout.Section>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <button
              style={{ background: '#027a48', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '13px' }}
              onClick={handlePreviewLLMS}
            >
              Generate llms.txt 👈
            </button>
          </div>
        </Layout.Section>

        {/* Sync/Update Frequency Block (single, unified) */}
        <Layout.Section>
          <Card>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Text variant="bodyMd" fontWeight="semibold" as="span">Sync/Update Frequency</Text>
                  <span style={{ background: '#d1fadf', color: '#027a48', fontWeight: 500, fontSize: '14px', padding: '2px 14px', borderRadius: '999px' }}>Daily</span>
                </div>
                <button
                  style={{ background: '#027a48', color: '#fff', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', height: '36px' }}
                  onClick={handleProductSync}
                  disabled={syncing || isSyncing}
                >
                  {syncing || isSyncing ? 'Syncing...' : 'Sync Now'}
                  <span style={{ marginLeft: 6, display: 'flex', alignItems: 'center' }}>
                    <Icon source={RefreshIcon} />
                  </span>
                </button>
              </div>
              {/* Progress Bar and Error for Product Sync */}
              {(isSyncing || progress.fetched > 0) && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text variant="bodySm" as="span">
                      Product Sync Progress: {progress.fetched} / {progress.total}
                    </Text>
                    <progress value={progress.fetched} max={progress.total} style={{ width: 200, height: 12 }} />
                  </div>
                  {error && (
                    <div style={{ color: 'red', marginTop: 4 }}>
                      <Text variant="bodySm" as="span">Error: {error}</Text>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '20px', paddingBottom: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Text variant="headingLg" as="h2">
                  Get your store discovered by AI
                </Text>
                <Text variant="bodyMd" as="p">
                  Generate an optimized llms.txt file to help AI assistants like ChatGPT, Perplexity,
                  and Copilot discover and recommend your products to millions of users.
                </Text>
              </div>

              <div>
                <Text variant="headingMd" as="h3">
                  Content for AI Indexing
                </Text>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px',
                  marginTop: '16px'
                }}>
                  <ContentSection
                    icon="products"
                    title="Products"
                    count={typeof productCount === 'number' ? productCount : products.length}
                    description={`${typeof productCount === 'number' ? productCount : products.length} products found and added`}
                  />
                  <ContentSection
                    icon="collections"
                    title="Collections"
                    count={typeof collectionCount === 'number' ? collectionCount : safeCollections.length}
                    description={`${typeof collectionCount === 'number' ? collectionCount : safeCollections.length} collections found and added`}
                  />
                  <ContentSection
                    icon="pages"
                    title="Pages"
                    count={typeof pageCount === 'number' ? pageCount : safePages.length}
                    description={`${typeof pageCount === 'number' ? pageCount : safePages.length} pages found and added`}
                  />
                  <ContentSection
                    icon="blog-posts"
                    title="Blog Posts"
                    count={typeof blogPostCount === 'number' ? blogPostCount : safeBlogPosts.length}
                    description={`${typeof blogPostCount === 'number' ? blogPostCount : safeBlogPosts.length} articles found and added`}
                  />
                </div>
              </div>

              {/* Last Sync Info */}
              {lastSyncDate && (
                <Text variant="bodySm" as="p">
                  Last synced: {lastSyncDate.toLocaleString()}
                </Text>
              )}
            </div>
          </Card>
        </Layout.Section>

        {/* Sidebar */}
        <Layout.Section variant="oneThird">
          <SidebarInfo />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default MainDashboard; 