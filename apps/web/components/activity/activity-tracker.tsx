"use client";

import { useEffect } from "react";

import { updateLastActiveAt } from "@/actions/activity-actions";

const ACTIVITY_INTERVAL = 60_000;

export function ActivityTracker() {
  useEffect(() => {
    let mounted = true;

    async function recordActivity() {
      if (!mounted || document.visibilityState !== "visible") {
        return;
      }

      await updateLastActiveAt();
    }

    void recordActivity();

    const interval = window.setInterval(() => {
      void recordActivity();
    }, ACTIVITY_INTERVAL);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void recordActivity();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
