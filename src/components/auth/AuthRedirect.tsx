"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionAction } from "@/app/actions/auth";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const user = await getSessionAction();
      if (!cancelled && user) router.replace("/dashboard");
    }

    check();

    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) check();
    }
    function onPopState() {
      check();
    }

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
    };
  }, [router]);

  return null;
}