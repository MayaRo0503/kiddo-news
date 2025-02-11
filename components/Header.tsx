"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "app/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, isVerified, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: "Saved Articles", path: "/saved-articles", protected: true },
    { name: "Liked Articles", path: "/liked-articles", protected: true },
    { name: "Notifications", path: "/notifications", protected: true },
    {
      name: "Verification Pending",
      path: "/verification-pending",
      protected: false,
      onlyUnverified: true,
    },
  ];

  return (
    <header className="bg-blue-500 text-white sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Kiddo News
        </Link>
        <div className="hidden md:flex space-x-4">
          {menuItems.map((item) =>
            (!item.protected || isLoggedIn) &&
            (!item.onlyUnverified || !isVerified) ? (
              <Link
                key={item.path}
                href={isLoggedIn || !item.protected ? item.path : "/"}
                className={`hover:text-blue-200 ${
                  isActive(item.path) ? "font-bold" : ""
                }`}
              >
                {item.name}
              </Link>
            ) : null
          )}
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-full hover:bg-yellow-300"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/"
              className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-full hover:bg-yellow-300"
            >
              Login
            </Link>
          )}
        </div>
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          Menu
        </button>
      </nav>
      {isMenuOpen && (
        <div className="md:hidden">
          {menuItems.map((item) =>
            (!item.protected || isLoggedIn) &&
            (!item.onlyUnverified || !isVerified) ? (
              <Link
                key={item.path}
                href={isLoggedIn || !item.protected ? item.path : "/"}
                className={`block px-4 py-2 hover:bg-blue-600 ${
                  isActive(item.path) ? "font-bold" : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ) : null
          )}
          {isLoggedIn ? (
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 bg-yellow-400 text-blue-900 hover:bg-yellow-300"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/"
              className="block w-full text-left px-4 py-2 bg-yellow-400 text-blue-900 hover:bg-yellow-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
