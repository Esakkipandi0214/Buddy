"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Menu,
  X,
  Home,
  FileText,
  Calendar,
  // Wallet,
  ChevronLeft,
} from "lucide-react";

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  collapsed,
  setCollapsed,
  isOpen,
  setIsOpen,
}) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("userUid");
    router.push("/");
  };

  const navLinks = [
    { name: "Home", href: "/dashboardUser", icon: <Home className="w-5 h-5" /> },
    { name: "Files", href: "/fileuploader", icon: <FileText className="w-5 h-5" /> },
    { name: "Scheduler", href: "/scheduler", icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Sidebar for large screens */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 h-full ${
          collapsed ? "w-20" : "w-60"
        } bg-gradient-to-b from-indigo-900 via-purple-800 to-indigo-900 text-white flex-col justify-between shadow-2xl z-20 transition-all duration-300`}
      >
        <div className="p-4 flex flex-col gap-6">
          {/* Logo / Brand */}
          <div className="flex items-center justify-between">
            {!collapsed && (
              <span className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-pink-400 to-yellow-300 text-transparent bg-clip-text">
                Dashboard
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-300 hover:text-white p-2 rounded-lg transition"
            >
              <ChevronLeft
                className={`w-5 h-5 transform transition-transform ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm font-medium"
              >
                {link.icon}
                {!collapsed && <span>{link.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 transition text-sm font-semibold"
          >
            {!collapsed ? "Logout" : "🚪"}
          </button>
        </div>
      </aside>

      {/* Top header for mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 p-4 bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 text-white shadow-md z-20 flex justify-between items-center">
        <div className="flex items-center gap-2 text-lg font-bold">
          {/* <Home className="w-6 h-6" /> */}
           <span className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-pink-400 to-yellow-300 text-transparent bg-clip-text">
                Dashboard
              </span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-indigo-900 via-purple-800 to-indigo-900 text-white shadow-2xl z-30 flex flex-col justify-between transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden`}
      >
        <div className="p-3 space-y-6">
          <div className="flex items-center gap-2 text-2xl font-bold">
            {/* <Home className="w-6 h-6" /> */}
             <span className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-pink-400 to-yellow-300 text-transparent bg-clip-text">
                Dashboard
              </span>
          </div>
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition text-base font-medium"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className=" p-3 md:p-6">
          <button
            onClick={handleLogout}
            className=" w-full py-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 transition text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
