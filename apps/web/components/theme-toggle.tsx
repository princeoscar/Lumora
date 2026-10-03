"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="h-9 w-[132px] rounded-lg border bg-background"
      />
    );
  }

  return (
    <div
      className="flex items-center gap-1 rounded-lg border bg-background p-1"
      aria-label="Theme selection"
    >
      <Button
        type="button"
        size="sm"
        variant={theme === "light" ? "secondary" : "ghost"}
        onClick={() => setTheme("light")}
        aria-label="Use light theme"
        title="Light"
        className="h-8 px-2.5"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light</span>
      </Button>

      <Button
        type="button"
        size="sm"
        variant={theme === "dark" ? "secondary" : "ghost"}
        onClick={() => setTheme("dark")}
        aria-label="Use dark theme"
        title="Dark"
        className="h-8 px-2.5"
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark</span>
      </Button>

      <Button
        type="button"
        size="sm"
        variant={theme === "system" ? "secondary" : "ghost"}
        onClick={() => setTheme("system")}
        aria-label="Use system theme"
        title="System"
        className="h-8 px-2.5"
      >
        <Monitor className="h-4 w-4" />
        <span className="sr-only">System</span>
      </Button>
    </div>
  );
}
