"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext"; // Import the `useAuth` hook

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Used for toggling the menu
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth(); // Use the `useAuth` hook here

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <div>
          <Link href="/">
            <h1 className="text-2xl font-bold">Kiddo News</h1>
          </Link>
        </div>

        {/* Menu toggle for small screens */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden bg-white text-blue-600 p-2 rounded"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>

        {/* Menu Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex space-x-4 items-center`}
        >
          <Link
            href="/"
            className={`hover:underline ${isActive("/") ? "font-bold" : ""}`}
          >
            Home
          </Link>
          <Link
            href="/articles"
            className={`hover:underline ${
              isActive("/articles") ? "font-bold" : ""
            }`}
          >
            Articles
          </Link>
          {isLoggedIn ? (
            <button
              onClick={logout}
              className="hover:underline bg-red-500 text-white p-2 rounded"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth"
              className={`hover:underline ${
                isActive("/auth") ? "font-bold" : ""
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
