"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface SideScrollerProps {
  onScroll: (percentage: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function SideScroller({ onScroll, containerRef }: SideScrollerProps) {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const newPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollPercentage(newPercentage);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [containerRef]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = Number(e.target.value);
    setScrollPercentage(newPercentage);
    onScroll(newPercentage);
  };

  const handleButtonClick = (direction: "up" | "down") => {
    if (containerRef.current) {
      const { clientHeight, scrollTop, scrollHeight } = containerRef.current;
      const newScrollTop =
        direction === "up"
          ? Math.max(scrollTop - clientHeight, 0)
          : Math.min(scrollTop + clientHeight, scrollHeight - clientHeight);
      containerRef.current.scrollTop = newScrollTop;
    }
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 h-1/2 flex flex-col items-center justify-center space-y-4"></div>
  );
}
