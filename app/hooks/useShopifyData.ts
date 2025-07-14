import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "./use-toast";

export function useShopifyData() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [pages, setPages] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSetupInProgress, setSetupInProgress] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const hasInitialized = useRef(false);

  // Fetch all resources from DB
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shopify-data`);
      if (!res.ok) {
        toast({ title: "Error fetching Shopify data", description: `Status: ${res.status}`, variant: "destructive" });
        setSetupInProgress(false);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      if (data.error) {
        toast({ title: "Error fetching Shopify data", description: data.error, variant: "destructive" });
        setSetupInProgress(false);
        setIsLoading(false);
        return;
      }
      setProducts(data.products || []);
      setCollections(data.collections || []);
      setPages(data.pages || []);
      setBlogPosts(data.blogPosts || []);
      setLastSyncDate(new Date());
      setSetupInProgress(false);
      localStorage.setItem('shopifyData', JSON.stringify({
        products: data.products || [],
        collections: data.collections || [],
        pages: data.pages || [],
        blogPosts: data.blogPosts || []
      }));
      localStorage.setItem('shopifyDataLastSync', new Date().toISOString());
      toast({ title: "Data Synced Successfully", description: `Fetched ${data.products?.length || 0} products, ${data.collections?.length || 0} collections, ${data.pages?.length || 0} pages, and ${data.blogPosts?.length || 0} blog posts.` });
    } catch (error) {
      toast({ title: "Error fetching Shopify data", description: error instanceof Error ? error.message : String(error), variant: "destructive" });
      setSetupInProgress(false);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Manual sync function (called by sync button)
  const syncData = useCallback(async () => {
    setSetupInProgress(true);
    await fetch('/api/sync-products', { method: 'POST', credentials: 'include' });
    let done = false;
    while (!done) {
      await new Promise(res => setTimeout(res, 1500));
      try {
        const res = await fetch('/api/sync-progress', { credentials: 'include' });
        if (!res.ok) {
          toast({ title: "Sync progress error", description: `Status: ${res.status}`, variant: "destructive" });
          break;
        }
        const data = await res.json();
        if (data.progress && data.progress.fetched === data.progress.total) {
          done = true;
        }
      } catch (err) {
        toast({ title: "Sync progress error", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
        break;
      }
    }
    await fetchData();
    setSetupInProgress(false);
  }, [fetchData]);

  // Initialize data only once on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    // Load cached data first
    const cachedData = localStorage.getItem('shopifyData');
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        setProducts(data.products || []);
        setCollections(data.collections || []);
        setPages(data.pages || []);
        setBlogPosts(data.blogPosts || []);
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    }
    // On first visit, if no products, trigger sync
    (async () => {
      const res = await fetch(`/api/shopify-data`);
      if (!res.ok) {
        toast({ title: "Error fetching Shopify data", description: `Status: ${res.status}`, variant: "destructive" });
        return;
      }
      const data = await res.json();
      if (!data.products || data.products.length === 0) {
        setSetupInProgress(true);
        await fetch('/api/sync-products', { method: 'POST', credentials: 'include' });
        let done = false;
        while (!done) {
          await new Promise(res => setTimeout(res, 1500));
          try {
            const progRes = await fetch('/api/sync-progress', { credentials: 'include' });
            if (!progRes.ok) {
              toast({ title: "Sync progress error", description: `Status: ${progRes.status}`, variant: "destructive" });
              break;
            }
            const progData = await progRes.json();
            if (progData.progress && progData.progress.fetched === progData.progress.total) {
              done = true;
            }
          } catch (err) {
            toast({ title: "Sync progress error", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
            break;
          }
        }
        await fetchData();
        setSetupInProgress(false);
      } else {
        setProducts(data.products || []);
        setCollections(data.collections || []);
        setPages(data.pages || []);
        setBlogPosts(data.blogPosts || []);
      }
    })();
  }, [fetchData]);

  return {
    products,
    collections,
    pages,
    blogPosts,
    isLoading,
    isSetupInProgress,
    lastSyncDate,
    refetch: syncData,
  };
}
