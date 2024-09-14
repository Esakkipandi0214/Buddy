// components/Layout.tsx
import React, { ReactNode } from 'react';
import Header from '../staticComponents/header'
interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className=" grid h-screen p-1">
        <Header/>
      <div className="flex-1 p-6 bg-gray-100">
        {children}
      </div>
    </div>
  );
};

export default Layout;
