"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { Menu, X, Home, BookOpen, Star, Heart, User } from "lucide-react";
import { AvatarPicker } from "./AvatarPicker";
import { useChildProfile } from "@/hooks/useChildProfile";

// interface Avatar {
// 	icon: string;
// 	color: string;
// }

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isAvatar?: boolean;
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const { isLoggedIn, isAdmin, isParent, logout } = useAuth();

  const homeRoute = !isLoggedIn
    ? "/"
    : isAdmin
    ? "/admin"
    : isParent
    ? "/parent/profile"
    : "/articles";

  const { childAvatar, child } = useChildProfile();

  const publicMenuItems: MenuItem[] = [
    { name: "Home", path: "/", icon: Home },
    { name: "Articles", path: "/articles", icon: BookOpen },
  ];

  const parentMenuItems: MenuItem[] = [
    { name: "Articles", path: "/articles", icon: BookOpen },
    { name: "Profile", path: "/parent/profile", icon: User },
  ];
  const childMenuItems: MenuItem[] = [
    { name: "Articles", path: "/articles", icon: BookOpen },
    { name: "Saved Articles", path: "/child/saved-articles", icon: Star },
    { name: "Liked Articles", path: "/child/liked-articles", icon: Heart },
    { name: "Profile", path: "/child/profile", icon: User },
    // The avatar item opens the AvatarPicker dialog.
    {
      name: "",
      path: "/child/AvatarPicker",
      icon: () => (
        <span
          style={{ backgroundColor: child?.favoriteColor || "rebeccapurple" }}
          className="text-xl inline-grid size-9 place-items-center rounded-full shadow-sm transition-colors"
        >
          <span className="drop-shadow text-normal">{childAvatar}</span>
        </span>
      ),
      isAvatar: true,
    },
  ];

  const menuItems = isLoggedIn
    ? isAdmin
      ? [
          { name: "Home", path: "/admin", icon: Home }, //Admin Panel
          { name: "Articles", path: "/articles", icon: BookOpen },
        ]
      : isParent
      ? parentMenuItems
      : childMenuItems
    : publicMenuItems;

  function handleAvatarSelect(icon: string, color: string): void {
    const newAvatar = { icon, color };
    localStorage.setItem("childAvatar", JSON.stringify(newAvatar));
    setIsAvatarPickerOpen(true);
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-400 to-purple-400 text-white sticky top-0 z-50 font-sans">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link
              href={homeRoute}
              className="text-2xl font-bold flex items-center"
            >
              <span className="text-yellow-300 animate-bounce">Kiddo</span>
              <span className="text-white">News</span>
              <span className="ml-2 text-3xl animate-spin">🎡</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) =>
                "isAvatar" in item && item.isAvatar ? (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => setIsAvatarPickerOpen(true)}
                    className="text-white hover:text-yellow-300 transition-colors duration-200 flex items-center space-x-1 group"
                  >
                    <item.icon />
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="text-white hover:text-yellow-300 transition-colors duration-200 flex items-center space-x-1 group"
                  >
                    <item.icon className="h-5 w-5 group-hover:animate-bounce" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              )}

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={logout}
                  className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/"
                  className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
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
            <div className="md:hidden py-4 bg-purple-500 rounded-b-lg shadow-lg">
              {menuItems.map((item) =>
                "isAvatar" in item && item.isAvatar ? (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => {
                      setIsAvatarPickerOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-purple-600 transition-colors duration-200"
                  >
                    <item.icon className="h-5 w-5" />
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-purple-600 transition-colors duration-200"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              )}
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-white hover:bg-purple-600 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-purple-600 transition-colors duration-200"
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
      {!!childAvatar && !!child?.favoriteColor && (
        <AvatarPicker
          open={isAvatarPickerOpen}
          onOpenChange={setIsAvatarPickerOpen}
          onSelect={handleAvatarSelect}
          currentIcon={childAvatar}
          currentColor={child.favoriteColor}
        />
      )}
    </>
  );
}
