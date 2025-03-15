
import React from 'react';
import Header from './Header';
import PwaInstallButton from './PwaInstallButton';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  rightSection?: React.ReactNode;
  onOpenAuthModal: () => void; // Adding this required prop
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  title = 'GYMA',
  showBack = false,
  rightSection,
  onOpenAuthModal
}) => {
  return (
    <Header
      title={title}
      showBack={showBack}
      rightSection={rightSection || <PwaInstallButton />}
      onOpenAuthModal={onOpenAuthModal} // Passing the required prop
    />
  );
};

export default AppHeader;
