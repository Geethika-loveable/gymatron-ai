
import React from 'react';
import Header from './Header';
import PwaInstallButton from './PwaInstallButton';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  rightSection?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  title = 'GYMA',
  showBack = false,
  rightSection
}) => {
  return (
    <Header
      title={title}
      showBack={showBack}
      rightSection={rightSection || <PwaInstallButton />}
    />
  );
};

export default AppHeader;
