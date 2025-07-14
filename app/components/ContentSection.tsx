import { Card, Text } from '@shopify/polaris';
import { Box, Package, FileText, BookText } from 'lucide-react';
import { ReactNode } from 'react';

type IconType = 'products' | 'collections' | 'pages' | 'blog-posts';

interface ContentSectionProps {
  icon: IconType;
  title: string;
  count: number;
  description: string;
}

const iconMap: Record<IconType, ReactNode> = {
  products: <Box style={{ width: '28px', height: '28px', color: '#6d7175' }} />,
  collections: <Package style={{ width: '28px', height: '28px', color: '#6d7175' }} />,
  pages: <FileText style={{ width: '28px', height: '28px', color: '#6d7175' }} />,
  'blog-posts': <BookText style={{ width: '28px', height: '28px', color: '#6d7175' }} />,
};

const ContentSection = ({ icon, title, count, description }: ContentSectionProps) => {
  return (
    <Card>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', minHeight: '110px' }}>
        <div style={{ marginRight: '16px', flexShrink: 0 }}>
          {iconMap[icon]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <Text variant="headingMd" as="span" fontWeight="bold">
              <span style={{ fontSize: '16px' }}>{title}</span>
            </Text>
            <Text variant="headingLg" as="span" fontWeight="bold">
              <span style={{ color: '#027a48' }}>{count}</span>
            </Text>
          </div>
          <Text variant="bodySm" as="p">
            <span style={{ fontSize: '14px' }}>{description}</span>
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ContentSection;