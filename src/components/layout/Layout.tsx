// Update to src/components/layout/Layout.tsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from '../utils/CookieBanner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
};

export default Layout;
