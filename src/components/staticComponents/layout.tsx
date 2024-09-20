import React, { ReactNode } from 'react';
import Header from '../staticComponents/header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header section */}
      <Header  />
      
      {/* Main content section */}
      <div className="flex-1 mt-16 pt-8 px-1 bg-gray-100 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;
