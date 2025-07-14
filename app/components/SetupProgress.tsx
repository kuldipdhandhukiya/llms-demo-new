import { Banner } from '@shopify/polaris';

interface SetupProgressProps {
  isSetupInProgress: boolean;
  isLoading: boolean;
}

const SetupProgress = ({ isSetupInProgress, isLoading }: SetupProgressProps) => {
  if (!isSetupInProgress && !isLoading) return null;

  return (
    <div style={{ marginBottom: '24px' }}>
      <Banner
        tone="info"
        title={isLoading ? 'Syncing Data' : 'Store Setup In Progress'}
      >
        <p>
          {isLoading 
            ? 'Fetching your store data. This may take a few moments...'
            : 'Store data is being synced. Please check back in a few minutes.'
          }
        </p>
      </Banner>
    </div>
  );
};

export default SetupProgress;