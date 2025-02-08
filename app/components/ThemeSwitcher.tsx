"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Palette } from "lucide-react";

type Theme = "light" | "dark" | "colorful";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.className = newTheme;
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => changeTheme("light")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => changeTheme("dark")}>
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => changeTheme("colorful")}
      >
        <Palette className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    </div>
  );
}
