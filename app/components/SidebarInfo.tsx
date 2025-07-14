import { Card, Text, BlockStack } from '@shopify/polaris';

const SidebarInfo = () => {
  return (
    <BlockStack gap="400">
      {/* AI Platforms Supported */}
      <Card>
        <div style={{ padding: '16px' }}>
          <Text variant="headingMd" as="h3" fontWeight="semibold">
            AI Platforms Supported
          </Text>
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#50b83c', marginRight: '8px' }}></div>
              <Text variant="bodySm" as="span">ChatGPT & GPT models</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#50b83c', marginRight: '8px' }}></div>
              <Text variant="bodySm" as="span">Perplexity AI</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#50b83c', marginRight: '8px' }}></div>
              <Text variant="bodySm" as="span">Claude & Anthropic models</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#50b83c', marginRight: '8px' }}></div>
              <Text variant="bodySm" as="span">Google AI & Gemini</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Coming Soon */}
      <Card>
        <div style={{ padding: '16px' }}>
          <Text variant="headingMd" as="h3" fontWeight="semibold">
            Coming Soon
          </Text>
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffc453', marginRight: '8px' }}></div>
              <Text variant="bodySm" as="span">AI visibility analytics</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffc453', marginRight: '8px' }}></div>
              <Text variant="bodySm" as="span">Performance tracking</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffc453', marginRight: '8px' }}></div>
              <Text variant="bodySm" as="span">Conversation insights</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffc453', marginRight: '8px' }}></div>
              <Text variant="bodySm" as="span">Optimization recommendations</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Why llms.txt? */}
      <Card>
        <div style={{ padding: '16px' }}>
          <Text variant="headingMd" as="h3" fontWeight="semibold">
            Why llms.txt?
          </Text>
          <div style={{ marginTop: '12px' }}>
            <Text variant="bodySm" as="p">
              The llms.txt standard helps AI systems understand your content structure, 
              making your products more discoverable when users ask AI assistants for recommendations.
            </Text>
          </div>
        </div>
      </Card>
    </BlockStack>
  );
};

export default SidebarInfo;