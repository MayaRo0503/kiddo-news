"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { Search, Menu, X } from "lucide-react";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoggedIn, isParent, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
  };

  const publicMenuItems = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
  ];

  const parentMenuItems = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: "Profile", path: "/parent/profile" },
  ];

  const childMenuItems = [
    { name: "Home", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: "Saved Articles", path: "/saved-articles" },
    { name: "Liked Articles", path: "/liked-articles" },
    { name: "Notifications", path: "/notifications" },
    { name: "Profile", path: "/child/profile" },
  ];

  const menuItems = isLoggedIn
    ? isParent
      ? parentMenuItems
      : childMenuItems
    : publicMenuItems;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <span className="text-yellow-300">Kiddo</span>
            <span className="text-white">News</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="text-white hover:text-yellow-300 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}

            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 px-4 pr-10 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Search className="h-5 w-5 text-gray-500" />
              </button>
            </form>

            {isLoggedIn ? (
              <button
                onClick={logout}
                className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors duration-200 font-medium"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth"
                className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors duration-200 font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="block py-2 text-white hover:text-yellow-300 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <form onSubmit={handleSearch} className="py-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </form>
            {isLoggedIn ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-white hover:text-yellow-300 transition-colors duration-200"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth"
                className="block py-2 text-white hover:text-yellow-300 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
