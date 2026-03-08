import React from 'react';

interface PageLoaderProps {
  children: React.ReactNode;
}

const PageLoader: React.FC<PageLoaderProps> = ({ children }) => {
  return <>{children}</>;
};

export default PageLoader;
