import React, { ReactNode, useState, useEffect } from "react";
import Header from "../staticComponents/header";

// Loader component
const Loader = () => (
  <div className="fixed inset-0 flex justify-center items-center bg-white/80 z-50">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-t-4 border-pink-500 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
      <div className="absolute inset-4 border-4 border-t-4 border-indigo-500 border-t-transparent rounded-full animate-spin animation-delay-300"></div>
    </div>
  </div>
);

interface LayoutProps {
  children: ReactNode;
  loadDelay?: number; // optional delay in ms
}

const Layout: React.FC<LayoutProps> = ({ children, loadDelay = 1000 }) => {
  const [collapsed, setCollapsed] = useState(false); // sidebar state
  const [isOpen, setIsOpen] = useState(false); // mobile drawer state
  const [loading, setLoading] = useState(true); // show loader initially

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), loadDelay);
    return () => clearTimeout(timer);
  }, [loadDelay]);

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 relative">
      {/* Show loader above everything */}
     

      {/* Sidebar / Header */}
      <Header
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* Main content */}
        <main
          className={`
            flex-1 overflow-auto transition-all duration-300
            pt-20 px-1  lg:pt-6 lg:px-6
            bg-white/70 backdrop-blur-sm rounded-tl-3xl shadow-inner
            ${collapsed ? "lg:ml-20" : "lg:ml-60"} 
            ${isOpen ? "blur-sm pointer-events-none" : ""}
          `}
        >
          {loading ? <Loader /> : children}
        </main>
    </div>
  );
};

export default Layout;
